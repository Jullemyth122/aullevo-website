/**
 * Free-plan ad unlocks: the rules and the bookkeeping, with no Firebase in here (unit-tested on its own).
 * api/rewards.ts stores the result in rewards/{uid}; the extension (src/services/rewards.ts in aullevo) and the
 * website (src/config/rewards.ts) show the same rules. Keep the three in sync when a rule changes.
 *
 * Free accounts get an allowance every day (UTC):
 *   ai        6 AI Smart Fills
 *   voice     3 voice sessions (up to 10 minutes each)
 *   paginate  2 hours of auto-pagination, from the first use
 *   typing    2 hours of Slow and custom typing speeds, from the first use
 *   json      4 JSON imports (counted by the extension)
 *   links     5 links in the Multi-link queue (a limit in the extension)
 *   profiles  3 active profiles (a limit in the extension)
 *
 * The pass: PASS_ADS short ads in a row (the second within PASS_PROGRESS_MS of the first) unlock EVERY feature for
 * PASS_HOURS, without limits, including what is otherwise Pro-only (document uploads, JSON export). It can be
 * watched any time, also while free uses are left, and passes stack (2 more ads add 5 more hours).
 * Pro accounts never need a pass.
 *
 * Accounts that watched an ad under the old per-feature rules keep that unlock until it ends (doc.unlocks).
 */
import { createHmac, timingSafeEqual } from 'node:crypto';

export type RewardFeature = 'ai' | 'profiles' | 'paginate' | 'typing' | 'json' | 'links' | 'voice';

export interface FreeRule {
  counted: boolean;   // spent one use at a time with consume() (the others are a time window or a limit)
  freeUses?: number;  // counted, kept here: free uses every day
  freeHours?: number; // time window, kept here: one free window a day from the first use
}

// json, links and profiles keep their free allowance in the extension (an import count and two limits)
export const FREE_RULES: Record<RewardFeature, FreeRule> = {
  ai: { counted: true, freeUses: 6 },
  voice: { counted: true, freeUses: 3 },
  json: { counted: true },
  paginate: { counted: false, freeHours: 2 },
  typing: { counted: false, freeHours: 2 },
  links: { counted: false },
  profiles: { counted: false },
};

export const REWARD_FEATURES = Object.keys(FREE_RULES) as RewardFeature[];
export const isRewardFeature = (value: unknown): value is RewardFeature =>
  typeof value === 'string' && Object.hasOwn(FREE_RULES, value);

export const isCounted = (feature: RewardFeature) => FREE_RULES[feature].counted;

const MIN_MS = 60 * 1000;
const HOUR_MS = 60 * MIN_MS;

// The pass: this many ads unlock everything for this many hours
export const PASS_ADS = 2;
export const PASS_HOURS = 5;
// The test ad's length (a real ad decides its own, at least MIN_LIVE_AD_SECONDS)
export const PASS_AD_SECONDS = 30;
// The ads of one pass are watched in a row: an ad toward a pass counts this long
export const PASS_PROGRESS_MS = 60 * MIN_MS;
// What old extensions (v0.6.5 and earlier) see as the uses left on a counted feature while a pass runs:
// they only know per-feature unlocks, and a pass has no limit
export const PASS_USES_FOR_OLD_EXTENSIONS = 999;

export const VOICE_SESSION_MS = 10 * MIN_MS;
// Safety net against bots farming ads (a person never gets near it); protects the ad account from abuse flags
export const DAILY_AD_LIMIT = 100;
// Real (Google) ads decide their own length; the server still refuses a reward claimed this fast
export const MIN_LIVE_AD_SECONDS = 15;
// A started ad must be finished within this time
export const PENDING_AD_MAX_MS = 15 * MIN_MS;

export interface Unlock {
  until: number;      // epoch ms
  remaining?: number; // counted unlocks only
  free?: boolean;     // the day's free window (time-window features), not an ad
}

export interface PendingAd {
  nonce: string;
  feature: RewardFeature | 'pass'; // a feature: started under the old per-feature rules
  startedAt: number;
}

export interface Pass {
  until: number; // epoch ms
}

// Stored in rewards/{uid}
export interface RewardsDoc {
  unlocks?: Partial<Record<RewardFeature, Unlock>>; // free windows, and per-feature unlocks from before the pass
  pass?: Pass | null;
  passProgress?: { ads: number; at: number } | null; // ads watched toward the next pass, the last one at `at`
  pending?: PendingAd | null;
  day?: string;      // UTC day of adsToday, "2026-10-15"
  adsToday?: number;
  totalAds?: number;
  free?: FreeDay;    // the day's free allowance used so far
}

export interface FreeDay {
  day: string;       // UTC day, "2026-10-15"
  used: Partial<Record<RewardFeature, number>>;
}

export interface PublicRewards {
  now: number;
  // Running unlocks. While a pass runs every feature shows as unlocked until it ends (what old extensions read).
  unlocks: Partial<Record<RewardFeature, Unlock>>;
  pass: Pass | null;
  passAds: number;       // ads already watched toward the next pass (0 .. PASS_ADS - 1)
  passAdsNeeded: number; // PASS_ADS
  passHours: number;     // PASS_HOURS
  adsToday: number;
  dailyLimit: number;
  free: Partial<Record<RewardFeature, number>>; // free uses (or free windows) left today
  freeResetsAt: number;                          // next UTC midnight
}

export class RewardError extends Error {
  readonly status: number;
  readonly code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const utcDay = (now: number) => new Date(now).toISOString().slice(0, 10);
const nextUtcMidnight = (now: number) => Date.parse(`${utcDay(now)}T00:00:00.000Z`) + 24 * HOUR_MS;

/** Free uses (counted) or free windows (time) a day; 0 = no daily allowance kept on the server. */
export const dailyFree = (feature: RewardFeature) => FREE_RULES[feature].freeUses ?? (FREE_RULES[feature].freeHours ? 1 : 0);
export const FREE_FEATURES = REWARD_FEATURES.filter(f => dailyFree(f) > 0);

export function freeLeft(doc: RewardsDoc, feature: RewardFeature, now: number): number {
  const used = doc.free?.day === utcDay(now) ? doc.free.used[feature] ?? 0 : 0;
  return Math.max(0, dailyFree(feature) - used);
}

function spendFree(doc: RewardsDoc, feature: RewardFeature, now: number): FreeDay {
  const day = utcDay(now);
  const used = doc.free?.day === day ? { ...doc.free.used } : {};
  used[feature] = (used[feature] ?? 0) + 1;
  return { day, used };
}

export const passActive = (doc: RewardsDoc, now: number): boolean => (doc.pass?.until ?? 0) > now;

/** Ads watched toward the next pass that still count (the next one must follow within PASS_PROGRESS_MS). */
export function passAdsWatched(doc: RewardsDoc, now: number): number {
  const p = doc.passProgress;
  return p && now - p.at < PASS_PROGRESS_MS ? Math.min(p.ads, PASS_ADS - 1) : 0;
}

/** A per-feature unlock that still gives something (from before the pass, or the day's free window). */
export function isActive(feature: RewardFeature, unlock: Unlock | undefined, now: number): boolean {
  if (!unlock || unlock.until <= now) return false;
  return !isCounted(feature) || unlock.free === true || (unlock.remaining ?? 0) > 0;
}

/** What the account may see: unlocks still running, the pass, and today's ad count. */
export function publicState(doc: RewardsDoc, now: number): PublicRewards {
  const pass = passActive(doc, now) ? { until: doc.pass!.until } : null;
  const unlocks: Partial<Record<RewardFeature, Unlock>> = {};
  for (const feature of REWARD_FEATURES) {
    const u = doc.unlocks?.[feature];
    if (u && u.until > now) {
      unlocks[feature] = isCounted(feature) && !u.free
        ? { until: u.until, remaining: Math.max(0, u.remaining ?? 0) }
        : { until: u.until, ...(u.free ? { free: true } : {}) };
    }
    if (pass) {
      const until = Math.max(pass.until, unlocks[feature]?.until ?? 0);
      unlocks[feature] = isCounted(feature) ? { until, remaining: PASS_USES_FOR_OLD_EXTENSIONS } : { until };
    }
  }
  const free: Partial<Record<RewardFeature, number>> = {};
  for (const feature of FREE_FEATURES) free[feature] = freeLeft(doc, feature, now);
  return {
    now, unlocks, pass,
    passAds: passAdsWatched(doc, now), passAdsNeeded: PASS_ADS, passHours: PASS_HOURS,
    adsToday: doc.day === utcDay(now) ? doc.adsToday ?? 0 : 0, dailyLimit: DAILY_AD_LIMIT,
    free, freeResetsAt: nextUtcMidnight(now),
  };
}

/** The rewards page starts an ad toward the pass. Allowed any time (also while free uses are left). */
export function startAd(doc: RewardsDoc, now: number, nonce: string): { doc: RewardsDoc; pending: PendingAd } {
  const adsToday = doc.day === utcDay(now) ? doc.adsToday ?? 0 : 0;
  if (adsToday >= DAILY_AD_LIMIT) {
    throw new RewardError(429, 'daily-limit', `You've watched the most ads allowed today (${DAILY_AD_LIMIT}). Come back tomorrow, or upgrade to Pro for unlimited use.`);
  }
  const pending: PendingAd = { nonce, feature: 'pass', startedAt: now };
  return { doc: { ...doc, pending }, pending };
}

export interface Granted {
  doc: RewardsDoc;
  passAds: number;         // ads toward the next pass after this one (0 when this ad completed a pass)
  completed: boolean;      // this ad completed a pass
  pass: Pass | null;       // the pass running now
}

/**
 * The ad finished. The PASS_ADS-th ad in a row opens the pass, or adds PASS_HOURS to the one running.
 * `live` = a real ad network served it (it decides the length); otherwise the test ad ran its full length.
 */
export function grantAd(doc: RewardsDoc, nonce: string, now: number, live: boolean): Granted {
  const pending = doc.pending;
  if (!pending || pending.nonce !== nonce) throw new RewardError(409, 'no-ad', 'This ad was not started here, or was already used. Start the ad again.');
  if (now - pending.startedAt > PENDING_AD_MAX_MS) throw new RewardError(409, 'ad-expired', 'This ad took too long to finish. Please watch it again.');
  const minSeconds = live ? MIN_LIVE_AD_SECONDS : PASS_AD_SECONDS - 1; // 1 s of slack for network delay
  if (now - pending.startedAt < minSeconds * 1000) throw new RewardError(409, 'too-early', 'The ad has not finished yet.');

  const today = utcDay(now);
  const ads = passAdsWatched(doc, now) + 1;
  const completed = ads >= PASS_ADS;
  const running = passActive(doc, now) ? doc.pass!.until : now;
  const pass = completed ? { until: running + PASS_HOURS * HOUR_MS } : passActive(doc, now) ? { until: doc.pass!.until } : null;
  return {
    passAds: completed ? 0 : ads,
    completed,
    pass,
    doc: {
      ...doc,
      pending: null,
      pass: completed ? pass : doc.pass ?? null,
      passProgress: completed ? null : { ads, at: now },
      day: today,
      adsToday: (doc.day === today ? doc.adsToday ?? 0 : 0) + 1,
      totalAds: (doc.totalAds ?? 0) + 1,
    },
  };
}

export interface Consumed {
  doc: RewardsDoc;
  source: 'ad' | 'free';
  sessionUntil?: number; // voice: when the session started now ends
}

const LOCKED_HINT = `Watch ${PASS_ADS} short ads to unlock everything for ${PASS_HOURS} hours, or upgrade to Pro.`;

/**
 * Uses one AI fill / JSON import / voice session, or checks auto-pagination / typing. A running pass allows
 * everything and spends nothing; then an old per-feature unlock; then the day's free allowance.
 */
export function consume(doc: RewardsDoc, feature: RewardFeature, now: number): Consumed {
  if (passActive(doc, now)) {
    return {
      doc,
      source: 'ad',
      ...(feature === 'voice' ? { sessionUntil: Math.min(now + VOICE_SESSION_MS, doc.pass!.until) } : {}),
    };
  }

  const rule = FREE_RULES[feature];
  const unlock = doc.unlocks?.[feature];
  const running = Boolean(unlock && unlock.until > now);

  if (!rule.counted) {
    if (unlock && running) return { doc, source: unlock.free ? 'free' : 'ad' };
    if (rule.freeHours && freeLeft(doc, feature, now) > 0) {
      const window: Unlock = { until: now + rule.freeHours * HOUR_MS, free: true };
      return { doc: { ...doc, unlocks: { ...doc.unlocks, [feature]: window }, free: spendFree(doc, feature, now) }, source: 'free' };
    }
    throw new RewardError(403, 'locked', rule.freeHours ? `Today's free ${rule.freeHours} hours are used. ${LOCKED_HINT}` : LOCKED_HINT);
  }

  // A per-feature unlock from before the pass: its uses first (they expire sooner)
  if (unlock && running && !unlock.free && (unlock.remaining ?? 0) > 0) {
    const next: Unlock = { until: unlock.until, remaining: (unlock.remaining ?? 0) - 1 };
    return {
      doc: { ...doc, unlocks: { ...doc.unlocks, [feature]: next } },
      source: 'ad',
      ...(feature === 'voice' ? { sessionUntil: Math.min(now + VOICE_SESSION_MS, unlock.until) } : {}),
    };
  }
  if (freeLeft(doc, feature, now) > 0) {
    return {
      doc: { ...doc, free: spendFree(doc, feature, now) },
      source: 'free',
      ...(feature === 'voice' ? { sessionUntil: now + VOICE_SESSION_MS } : {}),
    };
  }
  throw new RewardError(403, 'locked', rule.freeUses ? `Today's free uses are used. ${LOCKED_HINT}` : LOCKED_HINT);
}

/* ── Extension token: the extension's own long-lived sign-in for this API (Firebase ID tokens last 1 hour) ── */

const EXT_TOKEN_PREFIX = 'aext.';
export const EXT_TOKEN_MAX_AGE_MS = 180 * 24 * HOUR_MS;

const b64url = (data: string | Buffer) => Buffer.from(data).toString('base64url');

export function signExtToken(uid: string, secret: string, now: number): string {
  const payload = b64url(JSON.stringify({ uid, iat: now, v: 1 }));
  const sig = createHmac('sha256', secret).update(payload).digest('base64url');
  return `${EXT_TOKEN_PREFIX}${payload}.${sig}`;
}

export const isExtToken = (token: string) => token.startsWith(EXT_TOKEN_PREFIX);

/** The account (uid) of a valid extension token, or null. */
export function verifyExtToken(token: string, secret: string, now: number): string | null {
  if (!isExtToken(token)) return null;
  const [payload, sig] = token.slice(EXT_TOKEN_PREFIX.length).split('.');
  if (!payload || !sig) return null;
  const expected = createHmac('sha256', secret).update(payload).digest();
  let given: Buffer;
  try { given = Buffer.from(sig, 'base64url'); } catch { return null; }
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { uid?: unknown; iat?: unknown };
    if (typeof data.uid !== 'string' || !data.uid || typeof data.iat !== 'number') return null;
    if (data.iat > now + 60_000 || now - data.iat > EXT_TOKEN_MAX_AGE_MS) return null;
    return data.uid;
  } catch {
    return null;
  }
}

/**
 * Free-plan ad unlocks: the rules and the bookkeeping, with no Firebase in here (unit-tested on its own).
 * api/rewards.ts stores the result in rewards/{uid}; the extension (src/services/rewards.ts in aullevo) and the
 * website (src/config/rewards.ts) show the same rules. Keep the three in sync when a rule changes.
 *
 * Free accounts get a small allowance every day (UTC); once it is used, a short ad on aullevo-web/rewards gives
 * twice as much for a few hours. Ads are only offered once the day's free allowance is used.
 *             free every day                        one ad
 *   ai        3 AI Smart Fills                      6 AI Smart Fills for 2 hours (each AI-filled page counts as one)
 *   voice     1 voice session                       2 voice sessions for 2 hours (a session lasts up to 10 minutes)
 *   paginate  2 hours, from the first use           auto-pagination for 4 hours
 *   typing    2 hours, from the first use           Slow and custom typing speeds for 4 hours
 *   json      5 imports (counted by the extension)  10 JSON imports for 5 hours
 *   links     5 links (a queue size, extension)     up to 10 links in the Multi-link queue for 5 hours
 *   profiles  3 active (extension)                  up to 6 active profiles for 2 hours
 * Pro accounts never need an unlock.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';

export type RewardFeature = 'ai' | 'profiles' | 'paginate' | 'typing' | 'json' | 'links' | 'voice';

export interface RewardRule {
  adSeconds: number;  // length of the ad the user watches (the test ad lasts exactly this long)
  hours: number;      // how long the unlock lasts
  uses?: number;      // counted unlocks: how many uses one ad gives
  freeUses?: number;  // counted, kept here: free uses every day (half of what an ad gives)
  freeHours?: number; // time window, kept here: one free window a day from the first use (half an ad's)
}

// json, links and profiles keep their free allowance in the extension (an import count and two limits)
export const REWARD_RULES: Record<RewardFeature, RewardRule> = {
  ai: { adSeconds: 60, hours: 2, uses: 6, freeUses: 3 },
  profiles: { adSeconds: 30, hours: 2 },
  paginate: { adSeconds: 60, hours: 4, freeHours: 2 },
  typing: { adSeconds: 20, hours: 4, freeHours: 2 },
  json: { adSeconds: 60, hours: 5, uses: 10 },
  links: { adSeconds: 60, hours: 5 },
  voice: { adSeconds: 60, hours: 2, uses: 2, freeUses: 1 },
};

export const REWARD_FEATURES = Object.keys(REWARD_RULES) as RewardFeature[];
export const isRewardFeature = (value: unknown): value is RewardFeature =>
  typeof value === 'string' && Object.hasOwn(REWARD_RULES, value);

// Counted unlocks are spent with consume(); the others are a time window
export const isCounted = (feature: RewardFeature) => typeof REWARD_RULES[feature].uses === 'number';

export const VOICE_SESSION_MS = 10 * 60 * 1000;
// Most ads one account can watch in a day (protects the ad account from abuse flags)
export const DAILY_AD_LIMIT = 24;
// Real (Google) ads decide their own length; the server still refuses a reward claimed this fast
export const MIN_LIVE_AD_SECONDS = 10;
// A started ad must be finished within this time
export const PENDING_AD_MAX_MS = 15 * 60 * 1000;

const HOUR_MS = 60 * 60 * 1000;

export interface Unlock {
  until: number;      // epoch ms
  remaining?: number; // counted unlocks only
  free?: boolean;     // the day's free window (time-window features), not an ad
}

export interface PendingAd {
  nonce: string;
  feature: RewardFeature;
  startedAt: number;
}

// Stored in rewards/{uid}
export interface RewardsDoc {
  unlocks?: Partial<Record<RewardFeature, Unlock>>;
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
  unlocks: Partial<Record<RewardFeature, Unlock>>;
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
export const dailyFree = (feature: RewardFeature) => REWARD_RULES[feature].freeUses ?? (REWARD_RULES[feature].freeHours ? 1 : 0);
export const FREE_FEATURES = (Object.keys(REWARD_RULES) as RewardFeature[]).filter(f => dailyFree(f) > 0);

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

export function isActive(feature: RewardFeature, unlock: Unlock | undefined, now: number): boolean {
  if (!unlock || unlock.until <= now) return false;
  return !isCounted(feature) || (unlock.remaining ?? 0) > 0;
}

/** What the account may see: unlocks still running, and today's ad count. */
export function publicState(doc: RewardsDoc, now: number): PublicRewards {
  const unlocks: Partial<Record<RewardFeature, Unlock>> = {};
  for (const feature of REWARD_FEATURES) {
    const u = doc.unlocks?.[feature];
    if (u && u.until > now) unlocks[feature] = isCounted(feature) ? { until: u.until, remaining: Math.max(0, u.remaining ?? 0) } : { until: u.until, ...(u.free ? { free: true } : {}) };
  }
  const free: Partial<Record<RewardFeature, number>> = {};
  for (const feature of FREE_FEATURES) free[feature] = freeLeft(doc, feature, now);
  return {
    now, unlocks, adsToday: doc.day === utcDay(now) ? doc.adsToday ?? 0 : 0, dailyLimit: DAILY_AD_LIMIT,
    free, freeResetsAt: nextUtcMidnight(now),
  };
}

const FREE_NOUN: Partial<Record<RewardFeature, [string, string]>> = {
  ai: ['free AI Smart Fill', 'free AI Smart Fills'],
  voice: ['free voice session', 'free voice sessions'],
};

/** Why an ad can't be watched yet: the day's free allowance isn't used up. Null when an ad is allowed. */
export function freeStillAvailable(doc: RewardsDoc, feature: RewardFeature, now: number): string | null {
  const rule = REWARD_RULES[feature];
  const left = freeLeft(doc, feature, now);
  if (rule.freeUses && left > 0) {
    const [one, many] = FREE_NOUN[feature] ?? ['free use', 'free uses'];
    return `You still have ${left} ${left === 1 ? one : many} today. Use ${left === 1 ? 'it' : 'them'} first; an ad gives you more after that.`;
  }
  if (rule.freeHours) {
    const u = doc.unlocks?.[feature];
    if (u?.free && u.until > now) return `Your free ${rule.freeHours} hours for today are still running. You can watch an ad once they end.`;
    if (left > 0) return `Today's free ${rule.freeHours} hours haven't started yet: they start the first time you use it. You can watch an ad once they end.`;
  }
  return null;
}

/** The rewards page starts an ad: remembers which feature it is for and when it began. */
export function startAd(doc: RewardsDoc, feature: RewardFeature, now: number, nonce: string): { doc: RewardsDoc; pending: PendingAd } {
  const notYet = freeStillAvailable(doc, feature, now);
  if (notYet) throw new RewardError(409, 'free-left', notYet);
  const adsToday = doc.day === utcDay(now) ? doc.adsToday ?? 0 : 0;
  if (adsToday >= DAILY_AD_LIMIT) {
    throw new RewardError(429, 'daily-limit', `You've watched the most ads allowed today (${DAILY_AD_LIMIT}). Come back tomorrow, or upgrade to Pro for unlimited use.`);
  }
  const pending: PendingAd = { nonce, feature, startedAt: now };
  return { doc: { ...doc, pending }, pending };
}

/**
 * The ad finished: opens (or renews) the feature's unlock. `live` = a real ad network served it (it decides the
 * length); otherwise the test ad ran, and it must have lasted the rule's full length.
 */
export function grantAd(doc: RewardsDoc, nonce: string, now: number, live: boolean): { doc: RewardsDoc; feature: RewardFeature; unlock: Unlock } {
  const pending = doc.pending;
  if (!pending || pending.nonce !== nonce) throw new RewardError(409, 'no-ad', 'This ad was not started here, or was already used. Start the ad again.');
  if (now - pending.startedAt > PENDING_AD_MAX_MS) throw new RewardError(409, 'ad-expired', 'This ad took too long to finish. Please watch it again.');
  const rule = REWARD_RULES[pending.feature];
  const minSeconds = live ? MIN_LIVE_AD_SECONDS : rule.adSeconds - 1; // 1 s of slack for network delay
  if (now - pending.startedAt < minSeconds * 1000) throw new RewardError(409, 'too-early', 'The ad has not finished yet.');

  const today = utcDay(now);
  const unlock: Unlock = { until: now + rule.hours * HOUR_MS, ...(isCounted(pending.feature) ? { remaining: rule.uses } : {}) };
  return {
    feature: pending.feature,
    unlock,
    doc: {
      ...doc,
      pending: null,
      unlocks: { ...doc.unlocks, [pending.feature]: unlock },
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

/**
 * Uses one AI fill / JSON import / voice session: an ad's uses first (they expire sooner), then the day's free ones.
 * Time-window features: a running unlock is only checked; without one, the day's free window starts now.
 */
export function consume(doc: RewardsDoc, feature: RewardFeature, now: number): Consumed {
  const rule = REWARD_RULES[feature];
  const unlock = doc.unlocks?.[feature];
  const running = Boolean(unlock && unlock.until > now);

  if (!isCounted(feature)) {
    if (unlock && running) return { doc, source: unlock.free ? 'free' : 'ad' };
    if (rule.freeHours && freeLeft(doc, feature, now) > 0) {
      const window: Unlock = { until: now + rule.freeHours * HOUR_MS, free: true };
      return { doc: { ...doc, unlocks: { ...doc.unlocks, [feature]: window }, free: spendFree(doc, feature, now) }, source: 'free' };
    }
    throw new RewardError(403, 'locked', rule.freeHours
      ? `Today's free ${rule.freeHours} hours are used. Watch a short ad to keep going, or come back tomorrow.`
      : 'Watch a short ad to unlock this.');
  }

  if (unlock && running && (unlock.remaining ?? 0) > 0) {
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
  if (running) throw new RewardError(403, 'used-up', 'All uses from your last ad are used. Watch another short ad to continue.');
  throw new RewardError(403, 'locked', rule.freeUses
    ? "Today's free uses are used. Watch a short ad for more, or come back tomorrow."
    : 'Watch a short ad to unlock this.');
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

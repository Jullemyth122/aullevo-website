// Unit tests for the Free-plan rules: the daily free allowance and the ad unlocks (api/_rewards-core.ts).
// Run: npm run test:rewards
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  DAILY_AD_LIMIT, REWARD_RULES, RewardError, consume, freeLeft, grantAd, isActive, publicState, signExtToken, startAd, verifyExtToken,
  type RewardFeature, type RewardsDoc,
} from '../api/_rewards-core.ts';

const T0 = Date.UTC(2026, 9, 15, 8, 0, 0);
const MIN = 60_000, HOUR = 60 * MIN;

/** The day's free allowance used up before T0: free uses spent, the free window (if any) already over. */
function freeUsedUp(feature: RewardFeature, doc: RewardsDoc = {}): RewardsDoc {
  const rule = REWARD_RULES[feature];
  if (rule.freeHours) return consume(doc, feature, T0 - (rule.freeHours + 1) * HOUR).doc;
  for (let i = 0; i < (rule.freeUses ?? 0); i++) doc = consume(doc, feature, T0 - HOUR).doc;
  return doc;
}

function watch(doc: RewardsDoc, feature: RewardFeature, at = T0, live = false) {
  const started = startAd(doc, feature, at, `n-${feature}-${at}`);
  const seconds = live ? 12 : REWARD_RULES[feature].adSeconds;
  return grantAd(started.doc, started.pending.nonce, at + seconds * 1000, live);
}

const code = (fn: () => unknown) => {
  try { fn(); } catch (err) { if (err instanceof RewardError) return err.code; throw err; }
  return 'ok';
};

test('the rules match the plan: free every day, more per ad', () => {
  assert.deepEqual(REWARD_RULES, {
    ai: { adSeconds: 60, hours: 2, uses: 10, freeUses: 6 },
    profiles: { adSeconds: 30, hours: 2 },
    paginate: { adSeconds: 60, hours: 4, freeHours: 2 },
    typing: { adSeconds: 20, hours: 4, freeHours: 2 },
    json: { adSeconds: 60, hours: 5, uses: 10 },
    links: { adSeconds: 60, hours: 5 },
    voice: { adSeconds: 60, hours: 2, uses: 6, freeUses: 3 },
  });
});

test('every day: 6 free AI fills, then an ad is needed', () => {
  let doc: RewardsDoc = {};
  assert.deepEqual(publicState(doc, T0).free, { ai: 6, paginate: 1, typing: 1, voice: 3 });
  for (let left = 5; left >= 0; left--) {
    const r = consume(doc, 'ai', T0);
    assert.equal(r.source, 'free');
    doc = r.doc;
    assert.equal(freeLeft(doc, 'ai', T0), left);
  }
  assert.equal(code(() => consume(doc, 'ai', T0)), 'locked');
});

test('the free allowance comes back at UTC midnight', () => {
  const doc = freeUsedUp('ai');
  const state = publicState(doc, T0);
  assert.equal(state.free.ai, 0);
  assert.equal(state.freeResetsAt, Date.UTC(2026, 9, 16));
  assert.equal(freeLeft(doc, 'ai', Date.UTC(2026, 9, 16, 0, 0, 1)), 6);
});

test('no ad while free uses are left', () => {
  assert.equal(code(() => startAd({}, 'ai', T0, 'n')), 'free-left');
  assert.equal(code(() => startAd(consume({}, 'ai', T0).doc, 'ai', T0, 'n')), 'free-left');
  assert.equal(code(() => startAd(freeUsedUp('ai'), 'ai', T0, 'n')), 'ok');
  // Features with their allowance in the extension can always be unlocked
  for (const f of ['json', 'links', 'profiles'] as RewardFeature[]) assert.equal(code(() => startAd({}, f, T0, 'n')), 'ok', f);
});

test('one ad gives 10 AI fills for 2 hours, spent before the free ones', () => {
  const granted = watch(freeUsedUp('ai'), 'ai');
  const unlock = granted.unlock;
  let doc = granted.doc;
  assert.equal(unlock.remaining, 10);
  assert.equal(unlock.until, T0 + 60_000 + 2 * HOUR);
  for (let i = 9; i >= 0; i--) {
    const r = consume(doc, 'ai', T0 + 2 * MIN);
    doc = r.doc;
    assert.equal(r.source, 'ad');
    assert.equal(doc.unlocks?.ai?.remaining, i);
  }
  assert.equal(code(() => consume(doc, 'ai', T0 + 3 * MIN)), 'used-up');
  assert.equal(isActive('ai', doc.unlocks?.ai, T0 + 3 * MIN), false);
});

test('ad uses left on a new day are spent before that day\'s free ones', () => {
  const { doc } = watch(freeUsedUp('ai'), 'ai', Date.UTC(2026, 9, 15, 23, 0, 0));
  const r = consume(doc, 'ai', Date.UTC(2026, 9, 16, 0, 30, 0));
  assert.equal(r.source, 'ad');
  assert.equal(freeLeft(r.doc, 'ai', Date.UTC(2026, 9, 16, 0, 30, 0)), 6);
});

test('AI fills left over expire after 2 hours', () => {
  const { doc } = watch(freeUsedUp('ai'), 'ai');
  assert.equal(code(() => consume(doc, 'ai', T0 + 2 * HOUR + 2 * MIN)), 'locked');
});

test('auto-pagination and typing: 2 free hours a day from the first use, then an ad gives 4', () => {
  for (const feature of ['paginate', 'typing'] as RewardFeature[]) {
    const first = consume({}, feature, T0);
    assert.equal(first.source, 'free');
    assert.deepEqual(first.doc.unlocks?.[feature], { until: T0 + 2 * HOUR, free: true });
    assert.equal(consume(first.doc, feature, T0 + HOUR).doc, first.doc, `${feature}: a running window is only checked`);
    assert.equal(code(() => startAd(first.doc, feature, T0 + HOUR, 'n')), 'free-left', `${feature}: no ad while it runs`);
    assert.equal(code(() => consume(first.doc, feature, T0 + 2 * HOUR + 1)), 'locked', `${feature}: one free window a day`);
    const ad = watch(first.doc, feature, T0 + 2 * HOUR + 1);
    assert.equal(ad.unlock.until, T0 + 2 * HOUR + 1 + REWARD_RULES[feature].adSeconds * 1000 + 4 * HOUR);
    assert.equal(ad.unlock.free, undefined);
  }
});

test('profiles and links: an ad opens 2 / 5 hours, checked, not spent', () => {
  const cases: [RewardFeature, number][] = [['profiles', 2], ['links', 5]];
  for (const [feature, hours] of cases) {
    const { doc, unlock } = watch({}, feature);
    const end = T0 + REWARD_RULES[feature].adSeconds * 1000 + hours * HOUR;
    assert.equal(unlock.until, end, feature);
    assert.equal(consume(doc, feature, end - 1000).doc, doc, `${feature} is checked, not spent`);
    assert.equal(code(() => consume(doc, feature, end + 1)), 'locked', feature);
  }
});

test('voice: 3 free sessions a day, then 6 per ad, each up to 10 minutes', () => {
  let doc: RewardsDoc = {};
  for (let i = 0; i < 3; i++) {
    const free = consume(doc, 'voice', T0 + i * 15 * MIN);
    assert.equal(free.source, 'free');
    assert.equal(free.sessionUntil, T0 + i * 15 * MIN + 10 * MIN);
    doc = free.doc;
  }
  assert.equal(code(() => consume(doc, 'voice', T0 + HOUR)), 'locked');
  doc = watch(doc, 'voice', T0 + HOUR).doc;
  assert.equal(doc.unlocks?.voice?.remaining, 6);
  for (let i = 0; i < 6; i++) doc = consume(doc, 'voice', T0 + HOUR + 2 * MIN).doc;
  assert.equal(code(() => consume(doc, 'voice', T0 + HOUR + 3 * MIN)), 'used-up');
});

test('a session from an ad never outlives the unlock', () => {
  const { doc } = watch(freeUsedUp('voice'), 'voice');
  const until = doc.unlocks!.voice!.until;
  assert.equal(consume(doc, 'voice', until - MIN).sessionUntil, until);
});

test('JSON imports: 10 per ad (the free ones are counted by the extension)', () => {
  assert.equal(code(() => consume({}, 'json', T0)), 'locked');
  let { doc } = watch({}, 'json');
  for (let i = 0; i < 10; i++) doc = consume(doc, 'json', T0 + 2 * MIN).doc;
  assert.equal(code(() => consume(doc, 'json', T0 + 2 * MIN)), 'used-up');
});

test('watching again adds to the running unlock: uses and hours stack up', () => {
  let { doc } = watch(freeUsedUp('ai'), 'ai');
  doc = consume(doc, 'ai', T0 + 2 * MIN).doc;                    // 9 left, ends at T0 + 1 min + 2 h
  const again = watch(doc, 'ai', T0 + 30 * MIN);
  assert.equal(again.unlock.remaining, 19);
  assert.equal(again.unlock.until, T0 + MIN + 4 * HOUR);
  const third = watch(again.doc, 'ai', T0 + 40 * MIN);
  assert.equal(third.unlock.remaining, 29);
  assert.equal(third.unlock.until, T0 + MIN + 6 * HOUR);
  // Time windows stack too
  const pag = watch(watch(freeUsedUp('paginate'), 'paginate').doc, 'paginate', T0 + 10 * MIN);
  assert.equal(pag.unlock.until, T0 + MIN + 8 * HOUR);
});

test('an ad after it ran out starts fresh (old leftovers are gone)', () => {
  const { doc } = watch(freeUsedUp('ai'), 'ai');
  const later = watch(doc, 'ai', T0 + 3 * HOUR);
  assert.equal(later.unlock.remaining, 10);
  assert.equal(later.unlock.until, T0 + 3 * HOUR + MIN + 2 * HOUR);
});

test('the test ad must run its full length; a real ad at least 10 s', () => {
  const s = startAd({}, 'json', T0, 'n1');
  assert.equal(code(() => grantAd(s.doc, 'n1', T0 + 30_000, false)), 'too-early');
  assert.equal(code(() => grantAd(s.doc, 'n1', T0 + 5_000, true)), 'too-early');
  assert.equal(code(() => grantAd(s.doc, 'n1', T0 + 12_000, true)), 'ok');
});

test('an ad can be claimed once, only with its own id, and not after 15 minutes', () => {
  const s = startAd({}, 'links', T0, 'n1');
  assert.equal(code(() => grantAd(s.doc, 'other', T0 + 61_000, false)), 'no-ad');
  const g = grantAd(s.doc, 'n1', T0 + 61_000, false);
  assert.equal(code(() => grantAd(g.doc, 'n1', T0 + 62_000, false)), 'no-ad');
  assert.equal(code(() => grantAd(s.doc, 'n1', T0 + 16 * MIN, false)), 'ad-expired');
});

test(`at most ${DAILY_AD_LIMIT} ads a day (UTC), counter resets the next day`, () => {
  let doc: RewardsDoc = {};
  for (let i = 0; i < DAILY_AD_LIMIT; i++) doc = watch(doc, 'profiles', T0 + i * MIN).doc;
  assert.equal(publicState(doc, T0 + HOUR).adsToday, DAILY_AD_LIMIT);
  assert.equal(code(() => startAd(doc, 'profiles', T0 + HOUR, 'x')), 'daily-limit');
  assert.equal(code(() => startAd(doc, 'profiles', T0 + 24 * HOUR, 'y')), 'ok');
});

test('extension tokens: valid for their account, refused when forged or expired', () => {
  const secret = 'x'.repeat(40);
  const token = signExtToken('user-1', secret, T0);
  assert.equal(verifyExtToken(token, secret, T0 + HOUR), 'user-1');
  assert.equal(verifyExtToken(token, 'y'.repeat(40), T0), null);
  const [head, payload, sig] = [token.slice(0, 5), ...token.slice(5).split('.')];
  const forged = head + Buffer.from(JSON.stringify({ uid: 'admin', iat: T0, v: 1 })).toString('base64url') + '.' + sig;
  assert.equal(verifyExtToken(forged, secret, T0), null);
  assert.equal(verifyExtToken(head + payload, secret, T0), null);
  assert.equal(verifyExtToken(token, secret, T0 + 181 * 24 * HOUR), null);
});

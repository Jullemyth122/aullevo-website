// Unit tests for the Free-plan ad unlock rules (api/_rewards-core.ts). Run: npm run test:rewards
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  DAILY_AD_LIMIT, REWARD_RULES, RewardError, consume, grantAd, isActive, publicState, signExtToken, startAd, verifyExtToken,
  type RewardFeature, type RewardsDoc,
} from '../api/_rewards-core.ts';

const T0 = Date.UTC(2026, 9, 15, 8, 0, 0);
const MIN = 60_000, HOUR = 60 * MIN;

function watch(doc: RewardsDoc, feature: RewardFeature, at = T0, live = false) {
  const started = startAd(doc, feature, at, `n-${feature}-${at}`);
  const seconds = live ? 12 : REWARD_RULES[feature].adSeconds;
  return grantAd(started.doc, started.pending.nonce, at + seconds * 1000, live);
}

const code = (fn: () => unknown) => {
  try { fn(); } catch (err) { if (err instanceof RewardError) return err.code; throw err; }
  return 'ok';
};

test('the rules match the plan: ad length, hours and uses', () => {
  assert.deepEqual(REWARD_RULES, {
    ai: { adSeconds: 60, hours: 2, uses: 6 },
    profiles: { adSeconds: 30, hours: 2 },
    paginate: { adSeconds: 60, hours: 4 },
    typing: { adSeconds: 20, hours: 4 },
    json: { adSeconds: 60, hours: 5, uses: 10 },
    links: { adSeconds: 60, hours: 5 },
    voice: { adSeconds: 60, hours: 2, uses: 2 },
  });
});

test('nothing is unlocked without an ad', () => {
  assert.equal(code(() => consume({}, 'ai', T0)), 'locked');
  assert.equal(code(() => consume({}, 'paginate', T0)), 'locked');
  assert.deepEqual(publicState({}, T0).unlocks, {});
});

test('one ad gives 6 AI fills for 2 hours, then they are used up', () => {
  let { doc, unlock } = watch({}, 'ai');
  assert.equal(unlock.remaining, 6);
  assert.equal(unlock.until, T0 + 60_000 + 2 * HOUR);
  for (let i = 5; i >= 0; i--) {
    const r = consume(doc, 'ai', T0 + 2 * MIN);
    doc = r.doc;
    assert.equal(r.unlock.remaining, i);
  }
  assert.equal(code(() => consume(doc, 'ai', T0 + 3 * MIN)), 'used-up');
  assert.equal(isActive('ai', doc.unlocks?.ai, T0 + 3 * MIN), false);
});

test('AI fills left over expire after 2 hours', () => {
  const { doc } = watch({}, 'ai');
  assert.equal(code(() => consume(doc, 'ai', T0 + 2 * HOUR + 2 * MIN)), 'locked');
});

test('time-window unlocks last 2 / 4 / 5 hours and are not spent', () => {
  const cases: [RewardFeature, number][] = [['profiles', 2], ['paginate', 4], ['typing', 4], ['links', 5]];
  for (const [feature, hours] of cases) {
    const { doc, unlock } = watch({}, feature);
    const end = T0 + REWARD_RULES[feature].adSeconds * 1000 + hours * HOUR;
    assert.equal(unlock.until, end, feature);
    assert.equal(consume(doc, feature, end - 1000).doc, doc, `${feature} is checked, not spent`);
    assert.equal(code(() => consume(doc, feature, end + 1)), 'locked', feature);
  }
});

test('voice: 2 sessions of up to 10 minutes each', () => {
  let { doc } = watch({}, 'voice');
  const first = consume(doc, 'voice', T0 + 5 * MIN);
  assert.equal(first.sessionUntil, T0 + 15 * MIN);
  doc = consume(first.doc, 'voice', T0 + 20 * MIN).doc;
  assert.equal(code(() => consume(doc, 'voice', T0 + 30 * MIN)), 'used-up');
});

test('a session never outlives the unlock', () => {
  const { doc, unlock } = watch({}, 'voice');
  assert.equal(consume(doc, 'voice', unlock.until - MIN).sessionUntil, unlock.until);
});

test('JSON imports: 10 per ad', () => {
  let { doc } = watch({}, 'json');
  for (let i = 0; i < 10; i++) doc = consume(doc, 'json', T0 + 2 * MIN).doc;
  assert.equal(code(() => consume(doc, 'json', T0 + 2 * MIN)), 'used-up');
});

test('watching again renews the unlock to full uses', () => {
  let { doc } = watch({}, 'ai');
  doc = consume(doc, 'ai', T0 + 2 * MIN).doc;
  const again = watch(doc, 'ai', T0 + 30 * MIN);
  assert.equal(again.unlock.remaining, 6);
  assert.equal(again.unlock.until, T0 + 31 * MIN + 2 * HOUR);
});

test('the test ad must run its full length; a real ad at least 10 s', () => {
  const s = startAd({}, 'ai', T0, 'n1');
  assert.equal(code(() => grantAd(s.doc, 'n1', T0 + 30_000, false)), 'too-early');
  assert.equal(code(() => grantAd(s.doc, 'n1', T0 + 5_000, true)), 'too-early');
  assert.equal(code(() => grantAd(s.doc, 'n1', T0 + 12_000, true)), 'ok');
});

test('an ad can be claimed once, only with its own id, and not after 15 minutes', () => {
  const s = startAd({}, 'paginate', T0, 'n1');
  assert.equal(code(() => grantAd(s.doc, 'other', T0 + 61_000, false)), 'no-ad');
  const g = grantAd(s.doc, 'n1', T0 + 61_000, false);
  assert.equal(code(() => grantAd(g.doc, 'n1', T0 + 62_000, false)), 'no-ad');
  assert.equal(code(() => grantAd(s.doc, 'n1', T0 + 16 * MIN, false)), 'ad-expired');
});

test(`at most ${DAILY_AD_LIMIT} ads a day (UTC), counter resets the next day`, () => {
  let doc: RewardsDoc = {};
  for (let i = 0; i < DAILY_AD_LIMIT; i++) doc = watch(doc, 'typing', T0 + i * MIN).doc;
  assert.equal(publicState(doc, T0 + HOUR).adsToday, DAILY_AD_LIMIT);
  assert.equal(code(() => startAd(doc, 'typing', T0 + HOUR, 'x')), 'daily-limit');
  assert.equal(code(() => startAd(doc, 'typing', T0 + 24 * HOUR, 'y')), 'ok');
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

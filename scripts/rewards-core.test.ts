// Unit tests for the Free-plan rules: the daily free allowance and the 2-ad pass (api/_rewards-core.ts).
// Run: npm run test:rewards
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  DAILY_AD_LIMIT, FREE_RULES, PASS_AD_SECONDS, PASS_ADS, PASS_HOURS, PASS_USES_FOR_OLD_EXTENSIONS, RewardError, consume,
  freeLeft, grantAd, publicState, signExtToken, startAd, verifyExtToken,
  type RewardFeature, type RewardsDoc,
} from '../api/_rewards-core.ts';

const T0 = Date.UTC(2026, 9, 15, 8, 0, 0);
const MIN = 60_000, HOUR = 60 * MIN;
const AD = PASS_AD_SECONDS * 1000;

/** The day's free allowance used up before T0: free uses spent, the free window (if any) already over. */
function freeUsedUp(feature: RewardFeature, doc: RewardsDoc = {}): RewardsDoc {
  const rule = FREE_RULES[feature];
  if (rule.freeHours) return consume(doc, feature, T0 - (rule.freeHours + 1) * HOUR).doc;
  for (let i = 0; i < (rule.freeUses ?? 0); i++) doc = consume(doc, feature, T0 - HOUR).doc;
  return doc;
}

/** One ad, started at `at` and finished when its length is over. */
function watch(doc: RewardsDoc, at = T0, live = false) {
  const started = startAd(doc, at, `n-${at}`);
  return grantAd(started.doc, started.pending.nonce, at + (live ? 16_000 : AD), live);
}

/** A whole pass: PASS_ADS ads in a row from `at`. */
function watchPass(doc: RewardsDoc, at = T0) {
  let g = watch(doc, at);
  for (let i = 1; i < PASS_ADS; i++) g = watch(g.doc, at + i * (AD + 1000));
  return g;
}
const passEnd = (at = T0) => at + (PASS_ADS - 1) * (AD + 1000) + AD + PASS_HOURS * HOUR;

const code = (fn: () => unknown) => {
  try { fn(); } catch (err) { if (err instanceof RewardError) return err.code; throw err; }
  return 'ok';
};

test('the plan: 2 ads unlock everything for 5 hours; the free daily allowance stays', () => {
  assert.equal(PASS_ADS, 2);
  assert.equal(PASS_HOURS, 5);
  assert.deepEqual(FREE_RULES, {
    ai: { counted: true, freeUses: 6 },
    voice: { counted: true, freeUses: 3 },
    json: { counted: true },
    paginate: { counted: false, freeHours: 2 },
    typing: { counted: false, freeHours: 2 },
    links: { counted: false },
    profiles: { counted: false },
  });
});

test('every day: 6 free AI fills, then locked until a pass', () => {
  let doc: RewardsDoc = {};
  assert.deepEqual(publicState(doc, T0).free, { ai: 6, voice: 3, paginate: 1, typing: 1 });
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

test('an ad can be watched any time, also while free uses are left', () => {
  assert.equal(code(() => startAd({}, T0, 'n')), 'ok');
  assert.equal(code(() => startAd(consume({}, 'ai', T0).doc, T0, 'n')), 'ok');
  assert.equal(code(() => startAd(consume({}, 'paginate', T0).doc, T0 + HOUR, 'n')), 'ok');
});

test('one ad is half a pass; the second opens everything for 5 hours', () => {
  const first = watch({});
  assert.equal(first.completed, false);
  assert.equal(first.passAds, 1);
  assert.equal(first.pass, null);
  assert.equal(publicState(first.doc, T0 + AD).passAds, 1);
  assert.equal(code(() => consume(freeUsedUp('ai', first.doc), 'ai', T0 + AD)), 'locked', 'half a pass unlocks nothing');

  const second = watch(first.doc, T0 + AD + 1000);
  assert.equal(second.completed, true);
  assert.equal(second.passAds, 0);
  assert.equal(second.pass?.until, passEnd());
  assert.equal(publicState(second.doc, T0 + HOUR).passAds, 0);
  assert.deepEqual(publicState(second.doc, T0 + HOUR).pass, { until: passEnd() });
});

test('during a pass everything is unlimited and nothing is spent', () => {
  let doc = freeUsedUp('voice', freeUsedUp('ai', freeUsedUp('paginate', freeUsedUp('typing'))));
  doc = watchPass(doc).doc;
  const at = T0 + HOUR;
  for (let i = 0; i < 50; i++) {
    const r = consume(doc, 'ai', at);
    assert.equal(r.source, 'ad');
    assert.equal(r.doc, doc, 'a pass spends nothing');
  }
  for (const feature of ['json', 'paginate', 'typing', 'links', 'profiles'] as RewardFeature[]) {
    assert.equal(code(() => consume(doc, feature, at)), 'ok', feature);
  }
  // A voice session never outlives the pass
  assert.equal(consume(doc, 'voice', at).sessionUntil, at + 10 * MIN);
  assert.equal(consume(doc, 'voice', passEnd() - MIN).sessionUntil, passEnd());
});

test('the pass ends after 5 hours: back to the day\'s free allowance', () => {
  const doc = watchPass(freeUsedUp('ai')).doc;
  assert.equal(code(() => consume(doc, 'ai', passEnd() - 1)), 'ok');
  assert.equal(code(() => consume(doc, 'ai', passEnd() + 1)), 'locked');
  assert.equal(publicState(doc, passEnd() + 1).pass, null);
});

test('passes stack: 2 more ads add 5 more hours to the running one', () => {
  const first = watchPass({});
  const again = watchPass(first.doc, T0 + HOUR);
  assert.equal(again.pass?.until, passEnd() + PASS_HOURS * HOUR);
});

test('the second ad must follow within an hour, else it starts a new pass', () => {
  const first = watch({});
  const late = watch(first.doc, T0 + 2 * HOUR);
  assert.equal(late.completed, false, 'an hour later the first ad no longer counts');
  assert.equal(late.passAds, 1);
  assert.equal(publicState(first.doc, T0 + 2 * HOUR).passAds, 0);
});

test('old extensions see every feature unlocked while a pass runs', () => {
  const state = publicState(watchPass({}).doc, T0 + HOUR);
  for (const feature of ['ai', 'voice', 'json'] as RewardFeature[]) {
    assert.deepEqual(state.unlocks[feature], { until: passEnd(), remaining: PASS_USES_FOR_OLD_EXTENSIONS }, feature);
  }
  for (const feature of ['paginate', 'typing', 'links', 'profiles'] as RewardFeature[]) {
    assert.deepEqual(state.unlocks[feature], { until: passEnd() }, feature);
  }
});

test('an unlock watched under the old per-feature rules keeps working until it ends', () => {
  const old: RewardsDoc = { ...freeUsedUp('ai'), unlocks: { ai: { until: T0 + 2 * HOUR, remaining: 3 }, links: { until: T0 + 5 * HOUR } } };
  let doc = old;
  for (let i = 2; i >= 0; i--) {
    const r = consume(doc, 'ai', T0);
    assert.equal(r.source, 'ad');
    doc = r.doc;
    assert.equal(doc.unlocks?.ai?.remaining, i);
  }
  assert.equal(code(() => consume(doc, 'ai', T0)), 'locked');
  assert.equal(code(() => consume(old, 'links', T0 + 4 * HOUR)), 'ok');
  assert.deepEqual(publicState(old, T0).unlocks.ai, { until: T0 + 2 * HOUR, remaining: 3 });
});

test('auto-pagination and typing: 2 free hours a day from the first use', () => {
  for (const feature of ['paginate', 'typing'] as RewardFeature[]) {
    const first = consume({}, feature, T0);
    assert.equal(first.source, 'free');
    assert.deepEqual(first.doc.unlocks?.[feature], { until: T0 + 2 * HOUR, free: true });
    assert.equal(consume(first.doc, feature, T0 + HOUR).doc, first.doc, `${feature}: a running window is only checked`);
    assert.equal(code(() => consume(first.doc, feature, T0 + 2 * HOUR + 1)), 'locked', `${feature}: one free window a day`);
    assert.equal(publicState(first.doc, T0 + HOUR).unlocks[feature]?.free, true);
  }
});

test('voice: 3 free sessions a day, each up to 10 minutes', () => {
  let doc: RewardsDoc = {};
  for (let i = 0; i < 3; i++) {
    const free = consume(doc, 'voice', T0 + i * 15 * MIN);
    assert.equal(free.source, 'free');
    assert.equal(free.sessionUntil, T0 + i * 15 * MIN + 10 * MIN);
    doc = free.doc;
  }
  assert.equal(code(() => consume(doc, 'voice', T0 + HOUR)), 'locked');
});

test('JSON imports, links and profiles have no server allowance: only a pass opens them', () => {
  for (const feature of ['json', 'links', 'profiles'] as RewardFeature[]) {
    assert.equal(code(() => consume({}, feature, T0)), 'locked', feature);
  }
});

test('the test ad must run its full length; a real ad at least 15 s', () => {
  const s = startAd({}, T0, 'n1');
  assert.equal(code(() => grantAd(s.doc, 'n1', T0 + AD - 5_000, false)), 'too-early');
  assert.equal(code(() => grantAd(s.doc, 'n1', T0 + 5_000, true)), 'too-early');
  assert.equal(code(() => grantAd(s.doc, 'n1', T0 + 12_000, true)), 'too-early');
  assert.equal(code(() => grantAd(s.doc, 'n1', T0 + 16_000, true)), 'ok');
  assert.equal(code(() => grantAd(s.doc, 'n1', T0 + AD, false)), 'ok');
});

test('an ad can be claimed once, only with its own id, and not after 15 minutes', () => {
  const s = startAd({}, T0, 'n1');
  assert.equal(code(() => grantAd(s.doc, 'other', T0 + AD, false)), 'no-ad');
  const g = grantAd(s.doc, 'n1', T0 + AD, false);
  assert.equal(code(() => grantAd(g.doc, 'n1', T0 + AD + 1000, false)), 'no-ad');
  assert.equal(code(() => grantAd(s.doc, 'n1', T0 + 16 * MIN, false)), 'ad-expired');
});

test(`at most ${DAILY_AD_LIMIT} ads a day (UTC), counter resets the next day`, () => {
  let doc: RewardsDoc = {};
  for (let i = 0; i < DAILY_AD_LIMIT; i++) doc = watch(doc, T0 + i * MIN).doc;
  assert.equal(publicState(doc, T0 + 2 * HOUR).adsToday, DAILY_AD_LIMIT);
  assert.equal(code(() => startAd(doc, T0 + 2 * HOUR, 'x')), 'daily-limit');
  assert.equal(code(() => startAd(doc, T0 + 24 * HOUR, 'y')), 'ok');
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

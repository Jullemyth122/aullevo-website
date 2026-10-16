/**
 * Free-plan ad unlocks — Vercel Function. Rules and bookkeeping live in api/_rewards-core.ts.
 *
 *   POST /api/rewards?action=link     (Bearer Firebase ID token) → the extension's own long-lived token + status
 *   POST /api/rewards?action=status   (Bearer ID token or extension token) → Pro flag + running unlocks
 *   POST /api/rewards?action=start    (Bearer ID token) → starts an ad toward the pass on aullevo-web/rewards
 *   POST /api/rewards?action=grant    (Bearer ID token, body {nonce}) → the ad finished: the 2nd in a row opens
 *                                     the pass (everything for 5 hours)
 *   POST /api/rewards?action=consume  (Bearer ID token or extension token, body {feature}) → a running pass allows
 *                                     everything; else uses one AI fill, JSON import or voice session (the day's
 *                                     free ones); auto-pagination / typing: starts the day's free window
 *   GET  /api/rewards                 → health check (which env vars are set, never their values)
 *
 * Unlocks are written only here, with the Admin SDK (firestore.rules: rewards/{uid} is read-only for its owner),
 * so nobody can grant themselves an unlock from the browser or the extension.
 *
 * Env (Vercel):
 *   FIREBASE_SERVICE_ACCOUNT   service account JSON, raw or base64 (required; same as /api/paymongo)
 *   REWARDS_TOKEN_SECRET       long random string that signs extension tokens (required)
 *   VITE_REWARDED_AD_UNIT      Google Ad Manager rewarded ad unit path, e.g. /1234567/aullevo_rewarded.
 *                              Empty = test ads (a countdown that lasts the full ad length, earns nothing).
 */
import { randomUUID } from 'node:crypto';
import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import {
  PASS_AD_SECONDS, RewardError, consume, grantAd, isExtToken, isRewardFeature, publicState, signExtToken, startAd, verifyExtToken,
  type RewardsDoc,
} from './_rewards-core.js';

class HttpError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

/* ── Firebase Admin (same setup as api/paymongo.ts) ── */

function adminApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;
  if (process.env.VERCEL_ENV === 'production' && (process.env.FIREBASE_AUTH_EMULATOR_HOST || process.env.FIRESTORE_EMULATOR_HOST)) {
    throw new HttpError(500, 'Firebase emulator variables are set in production');
  }
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
  if (!raw) throw new HttpError(500, 'FIREBASE_SERVICE_ACCOUNT is not configured');
  const serviceAccount = JSON.parse(raw.startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8'));
  return initializeApp({
    credential: cert({
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: String(serviceAccount.private_key).replace(/\\n/g, '\n'),
    }),
  });
}

const db = (): Firestore => getFirestore(adminApp());

function tokenSecret(): string {
  const secret = process.env.REWARDS_TOKEN_SECRET?.trim();
  if (!secret || secret.length < 32) throw new HttpError(500, 'REWARDS_TOKEN_SECRET is not configured (32+ characters)');
  return secret;
}

// A real ad network is configured: it decides the ad length
const liveAds = () => Boolean(process.env.VITE_REWARDED_AD_UNIT?.trim());

/**
 * The signed-in account. The website sends its Firebase ID token; the extension sends the token /link gave it.
 * `websiteOnly`: starting and finishing an ad happens on aullevo-web only.
 */
async function requireUid(request: Request, websiteOnly = false): Promise<string> {
  const header = request.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) throw new HttpError(401, 'Sign in required');

  if (isExtToken(token)) {
    if (websiteOnly) throw new HttpError(403, 'Open aullevo-web to watch an ad');
    const uid = verifyExtToken(token, tokenSecret(), Date.now());
    if (!uid) throw new HttpError(401, 'Your extension sign-in expired. Connect your account again in Aullevo → Settings.');
    return uid;
  }

  try {
    const decoded = await getAuth(adminApp()).verifyIdToken(token);
    if (decoded.firebase.sign_in_provider === 'anonymous' || !decoded.email) throw new HttpError(403, 'Sign in with Google to use ads');
    return decoded.uid;
  } catch (err) {
    if (err instanceof HttpError) throw err;
    throw new HttpError(401, 'Your session expired. Please sign in again.');
  }
}

// Same rule as the extension and the website: Pro while isPro and not expired
async function isProAccount(uid: string): Promise<boolean> {
  const data = (await db().doc(`users/${uid}`).get()).data();
  if (!data?.isPro) return false;
  const exp = data.proExpiresAt ? new Date(data.proExpiresAt).getTime() : null;
  return exp === null || exp > Date.now();
}

/** Reads and rewrites rewards/{uid} in one transaction (two tabs can't spend the same use twice). */
async function withRewards<T>(uid: string, change: (doc: RewardsDoc, now: number) => { doc?: RewardsDoc; result: T }): Promise<T> {
  const ref = db().doc(`rewards/${uid}`);
  return db().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const { doc, result } = change((snap.data() as RewardsDoc | undefined) ?? {}, Date.now());
    if (doc) tx.set(ref, { ...doc, updatedAt: Date.now() });
    return result;
  });
}

async function readBody(request: Request): Promise<Record<string, unknown>> {
  try {
    const body = await request.json();
    return body && typeof body === 'object' ? body as Record<string, unknown> : {};
  } catch {
    return {};
  }
}

async function status(uid: string) {
  const [pro, doc] = await Promise.all([isProAccount(uid), db().doc(`rewards/${uid}`).get()]);
  return { pro, live: liveAds(), ...publicState((doc.data() as RewardsDoc | undefined) ?? {}, Date.now()) };
}

/* ── Actions ── */

async function handleLink(request: Request) {
  const uid = await requireUid(request, true);
  return json({ token: signExtToken(uid, tokenSecret(), Date.now()), ...(await status(uid)) });
}

async function handleStatus(request: Request) {
  return json(await status(await requireUid(request)));
}

// Every ad counts toward the pass (2 ads: everything for 5 hours); a `feature` in the body is only remembered
// for the reply (the extension opens /rewards?feature=ai where the user hit a limit)
async function handleStart(request: Request) {
  const uid = await requireUid(request, true);
  if (await isProAccount(uid)) throw new HttpError(400, 'Your Pro plan already unlocks everything.');
  const pending = await withRewards(uid, (doc, now) => {
    const started = startAd(doc, now, randomUUID());
    return { doc: started.doc, result: started.pending };
  });
  return json({ nonce: pending.nonce, adSeconds: PASS_AD_SECONDS, live: liveAds() });
}

async function handleGrant(request: Request) {
  const uid = await requireUid(request, true);
  const { nonce } = await readBody(request);
  if (typeof nonce !== 'string' || nonce.length > 100) throw new HttpError(400, 'Missing ad id');
  const granted = await withRewards(uid, (doc, now) => {
    const g = grantAd(doc, nonce, now, liveAds());
    return { doc: g.doc, result: { completed: g.completed, state: publicState(g.doc, now) } };
  });
  return json({ ok: true, completed: granted.completed, pro: false, live: liveAds(), ...granted.state });
}

async function handleConsume(request: Request) {
  const uid = await requireUid(request);
  const { feature } = await readBody(request);
  if (!isRewardFeature(feature)) throw new HttpError(400, 'Unknown feature');
  if (await isProAccount(uid)) return json({ ok: true, pro: true });
  const used = await withRewards(uid, (doc, now) => {
    const c = consume(doc, feature, now);
    return { doc: c.doc === doc ? undefined : c.doc, result: { source: c.source, sessionUntil: c.sessionUntil, state: publicState(c.doc, now) } };
  });
  return json({ ok: true, pro: false, live: liveAds(), feature, source: used.source, sessionUntil: used.sessionUntil, ...used.state });
}

export async function POST(request: Request): Promise<Response> {
  const action = new URL(request.url).searchParams.get('action');
  try {
    if (action === 'link') return await handleLink(request);
    if (action === 'status') return await handleStatus(request);
    if (action === 'start') return await handleStart(request);
    if (action === 'grant') return await handleGrant(request);
    if (action === 'consume') return await handleConsume(request);
    return json({ error: 'Unknown action' }, 404);
  } catch (err) {
    if (err instanceof RewardError) return json({ error: err.message, code: err.code }, err.status);
    console.error(`rewards ${action} failed:`, err);
    if (err instanceof HttpError) return json({ error: err.status >= 500 ? 'Ad unlocks are temporarily unavailable.' : err.message }, err.status);
    return json({ error: 'Ad unlocks are temporarily unavailable.' }, 500);
  }
}

export function GET(): Response {
  return json({
    ok: true,
    configured: {
      firebaseServiceAccount: Boolean(process.env.FIREBASE_SERVICE_ACCOUNT?.trim()),
      rewardsTokenSecret: (process.env.REWARDS_TOKEN_SECRET?.trim().length ?? 0) >= 32,
      rewardedAdUnit: liveAds(),
    },
  });
}

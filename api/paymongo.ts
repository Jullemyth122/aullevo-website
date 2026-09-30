/**
 * PayMongo (GCash / Maya / QR Ph) checkout for Aullevo Pro — Vercel Function.
 *
 *   POST /api/paymongo?action=checkout  (Bearer Firebase ID token) → per-user PayMongo Checkout Session
 *   POST /api/paymongo?action=verify    (Bearer Firebase ID token) → re-checks the user's session, grants Pro if paid
 *   POST /api/paymongo?action=webhook   (PayMongo "checkout_session.payment.paid" webhook)
 *   GET  /api/paymongo                  → health check (which env vars are set, never their values)
 *
 * Pro is only ever granted from data fetched from the PayMongo API with our secret key, never from
 * anything the browser sends. Each PayMongo payment id is written to payments/{pay_id} inside the same
 * transaction that extends Pro, so one payment can never activate Pro twice or on another account.
 *
 * Env (Vercel → Production):
 *   PAYMONGO_SECRET_KEY       sk_live_... (required)
 *   PAYMONGO_WEBHOOK_SECRET   whsk_...    (recommended; webhook signatures are checked when set)
 *   FIREBASE_SERVICE_ACCOUNT  service account JSON, raw or base64 (required)
 *   PAYMONGO_PAYMENT_METHODS  optional comma list, e.g. "qrph,gcash,paymaya"
 */
import { createHmac, timingSafeEqual } from 'node:crypto';
import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth, type DecodedIdToken } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

const PAYMONGO_API = 'https://api.paymongo.com/v1';
const PRICE_CENTAVOS = 15429; // ₱154.29
const CURRENCY = 'PHP';
const PRO_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;
// An unpaid checkout is handed back again for this long instead of creating a new one
const SESSION_REUSE_MS = 30 * 60 * 1000;
const SIGNATURE_TOLERANCE_S = 10 * 60;
// Tried in order until PayMongo accepts one (accounts differ in which methods are activated)
const FALLBACK_METHOD_SETS = [['qrph', 'gcash', 'paymaya'], ['qrph'], ['gcash', 'paymaya']];

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

class PaymongoError extends HttpError {}

interface PaymongoPayment {
  id: string;
  attributes: {
    amount: number;
    currency: string;
    status: string;
    livemode: boolean;
    paid_at?: number | null;
    source?: { type?: string } | null;
  };
}

interface CheckoutSession {
  id: string;
  attributes: {
    checkout_url: string;
    status: string;
    livemode: boolean;
    metadata?: Record<string, string> | null;
    payments?: PaymongoPayment[] | null;
    payment_method_used?: string | null;
  };
}

type FulfillResult = { status: 'paid'; proExpiresAt: string | null } | { status: 'unpaid' };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

/* ── Firebase Admin ── */

function adminApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;

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

async function requireUser(request: Request): Promise<DecodedIdToken> {
  const header = request.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) throw new HttpError(401, 'Sign in required');

  let decoded: DecodedIdToken;
  try {
    decoded = await getAuth(adminApp()).verifyIdToken(token);
  } catch (err) {
    if (err instanceof HttpError) throw err;
    throw new HttpError(401, 'Your session expired. Please sign in again.');
  }
  if (decoded.firebase.sign_in_provider === 'anonymous' || !decoded.email) {
    throw new HttpError(403, 'Sign in with Google to upgrade');
  }
  return decoded;
}

/* ── PayMongo API ── */

async function paymongo<T>(path: string, body?: unknown): Promise<T> {
  const key = process.env.PAYMONGO_SECRET_KEY?.trim();
  if (!key) throw new HttpError(500, 'PAYMONGO_SECRET_KEY is not configured');

  const res = await fetch(`${PAYMONGO_API}${path}`, {
    method: body ? 'POST' : 'GET',
    headers: {
      Authorization: `Basic ${Buffer.from(`${key}:`).toString('base64')}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = payload?.errors?.map((e: { detail?: string }) => e.detail).filter(Boolean).join('; ');
    throw new PaymongoError(res.status, detail || `PayMongo request failed (${res.status})`);
  }
  return payload as T;
}

const retrieveSession = async (id: string) =>
  (await paymongo<{ data: CheckoutSession }>(`/checkout_sessions/${encodeURIComponent(id)}`)).data;

async function createSession(user: DecodedIdToken, origin: string): Promise<CheckoutSession> {
  const configured = process.env.PAYMONGO_PAYMENT_METHODS?.split(',').map((m) => m.trim()).filter(Boolean);
  const methodSets = configured?.length ? [configured] : FALLBACK_METHOD_SETS;

  let lastError: unknown;
  for (const methods of methodSets) {
    try {
      const { data } = await paymongo<{ data: CheckoutSession }>('/checkout_sessions', {
        data: {
          attributes: {
            line_items: [{
              name: 'Aullevo Pro — 30 days',
              description: 'Unlimited AI Smart Fill, unlimited profiles, document uploads. No auto-renewal.',
              amount: PRICE_CENTAVOS,
              currency: CURRENCY,
              quantity: 1,
            }],
            payment_method_types: methods,
            description: `Aullevo Pro (30 days) for ${user.email}`,
            reference_number: `AUL-${user.uid.slice(0, 10)}-${Date.now().toString(36)}`.toUpperCase(),
            metadata: { uid: user.uid, email: user.email || '' },
            success_url: `${origin}/login?payment=paymongo`,
            cancel_url: `${origin}/login?payment=cancelled`,
            send_email_receipt: true,
            show_description: true,
            show_line_items: true,
          },
        },
      });
      return data;
    } catch (err) {
      lastError = err;
      // Only a rejected request (e.g. a payment method not activated) is worth retrying with fewer methods
      if (!(err instanceof PaymongoError) || err.status !== 400) break;
      console.warn(`PayMongo rejected methods [${methods.join(', ')}]:`, err.message);
    }
  }
  throw lastError;
}

function paidPayment(session: CheckoutSession): PaymongoPayment | undefined {
  return (session.attributes.payments || []).find(
    (p) => p.attributes.status === 'paid' && p.attributes.currency === CURRENCY && p.attributes.amount >= PRICE_CENTAVOS
  );
}

/* ── Granting Pro (idempotent) ── */

async function fulfill(session: CheckoutSession): Promise<FulfillResult> {
  const payment = paidPayment(session);
  if (!payment) return { status: 'unpaid' };

  const uid = session.attributes.metadata?.uid;
  if (!uid) throw new HttpError(422, `Checkout session ${session.id} has no uid`);

  const db = getFirestore(adminApp());
  const ledgerRef = db.doc(`payments/${payment.id}`);
  const userRef = db.doc(`users/${uid}`);
  const sessionRef = db.doc(`checkoutSessions/${uid}`);

  return db.runTransaction(async (tx) => {
    const [ledger, userSnap, sessionSnap] = await Promise.all([tx.get(ledgerRef), tx.get(userRef), tx.get(sessionRef)]);
    if (ledger.exists) return { status: 'paid', proExpiresAt: ledger.get('grantedUntil') ?? null };

    const now = Date.now();
    const isPro = Boolean(userSnap.get('isPro'));
    const currentExpiry = userSnap.get('proExpiresAt');
    // isPro with no expiry = lifetime/admin grant: record the payment but never shorten it
    const isLifetime = isPro && !currentExpiry;
    const currentMs = isPro && typeof currentExpiry === 'string' ? Date.parse(currentExpiry) : NaN;
    const base = Number.isFinite(currentMs) && currentMs > now ? currentMs : now;
    const proExpiresAt = isLifetime ? null : new Date(base + PRO_DAYS * DAY_MS).toISOString();

    tx.set(ledgerRef, {
      uid,
      provider: 'paymongo',
      checkoutSessionId: session.id,
      amount: payment.attributes.amount,
      currency: payment.attributes.currency,
      method: payment.attributes.source?.type || session.attributes.payment_method_used || null,
      livemode: payment.attributes.livemode,
      paidAt: payment.attributes.paid_at ? new Date(payment.attributes.paid_at * 1000).toISOString() : null,
      grantedUntil: proExpiresAt,
      createdAt: FieldValue.serverTimestamp(),
    });

    tx.set(userRef, {
      ...(userSnap.exists ? {} : { uid, email: session.attributes.metadata?.email || '', createdAt: FieldValue.serverTimestamp() }),
      isPro: true,
      ...(isLifetime ? {} : { proExpiresAt }),
      subscriptionPlan: 'pro',
      lastPaymentId: payment.id,
      lastPaymentProvider: 'paymongo',
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    if (sessionSnap.exists && sessionSnap.get('sessionId') === session.id) {
      tx.set(sessionRef, { status: 'paid', paymentId: payment.id }, { merge: true });
    }

    return { status: 'paid', proExpiresAt };
  });
}

/* ── Webhook signature: "Paymongo-Signature: t=<unix>,te=<test hmac>,li=<live hmac>" ── */

function verifySignature(rawBody: string, header: string | null) {
  const secret = process.env.PAYMONGO_WEBHOOK_SECRET?.trim();
  if (!secret) {
    // Still safe: the session is re-fetched from PayMongo below, so a forged event can't grant anything
    console.warn('PAYMONGO_WEBHOOK_SECRET is not set; skipping webhook signature check');
    return;
  }
  if (!header) throw new HttpError(401, 'Missing signature');

  const parts = Object.fromEntries(
    header.split(',').map((part) => {
      const i = part.indexOf('=');
      return [part.slice(0, i).trim(), part.slice(i + 1).trim()];
    })
  );
  const timestamp = Number(parts.t);
  if (!Number.isFinite(timestamp) || Math.abs(Date.now() / 1000 - timestamp) > SIGNATURE_TOLERANCE_S) {
    throw new HttpError(401, 'Stale signature');
  }

  const expected = Buffer.from(createHmac('sha256', secret).update(`${parts.t}.${rawBody}`).digest('hex'));
  const valid = [parts.li, parts.te].some((sig) => {
    if (!sig) return false;
    const given = Buffer.from(sig);
    return given.length === expected.length && timingSafeEqual(given, expected);
  });
  if (!valid) throw new HttpError(401, 'Invalid signature');
}

/* ── Actions ── */

async function handleCheckout(request: Request) {
  const user = await requireUser(request);
  const sessionRef = getFirestore(adminApp()).doc(`checkoutSessions/${user.uid}`);
  const existing = await sessionRef.get();

  // One open checkout per user: settle or reuse it before creating another
  if (existing.exists && existing.get('status') === 'open') {
    try {
      const previous = await retrieveSession(existing.get('sessionId'));
      const result = await fulfill(previous);
      if (result.status === 'paid') return json(result);
      const fresh = Date.now() - Number(existing.get('createdAtMs') || 0) < SESSION_REUSE_MS;
      if (fresh && previous.attributes.status === 'active') {
        return json({ checkoutUrl: previous.attributes.checkout_url });
      }
    } catch (err) {
      console.warn('Could not reuse previous checkout session:', err);
    }
  }

  const session = await createSession(user, new URL(request.url).origin);
  await sessionRef.set({
    sessionId: session.id,
    checkoutUrl: session.attributes.checkout_url,
    status: 'open',
    livemode: session.attributes.livemode,
    createdAtMs: Date.now(),
    createdAt: FieldValue.serverTimestamp(),
  });
  return json({ checkoutUrl: session.attributes.checkout_url });
}

async function handleVerify(request: Request) {
  const user = await requireUser(request);
  const snap = await getFirestore(adminApp()).doc(`checkoutSessions/${user.uid}`).get();
  if (!snap.exists) return json({ status: 'none' });
  return json(await fulfill(await retrieveSession(snap.get('sessionId'))));
}

async function handleWebhook(request: Request) {
  const rawBody = await request.text();
  verifySignature(rawBody, request.headers.get('paymongo-signature'));

  const event = JSON.parse(rawBody);
  const type = event?.data?.attributes?.type;
  if (type !== 'checkout_session.payment.paid') return json({ received: true, ignored: type ?? null });

  const sessionId = event.data.attributes.data?.id;
  if (typeof sessionId !== 'string' || !sessionId.startsWith('cs_')) throw new HttpError(400, 'No checkout session in event');

  let session: CheckoutSession;
  try {
    session = await retrieveSession(sessionId);
  } catch (err) {
    // e.g. a test-mode event while running live keys: acknowledge so PayMongo stops retrying
    if (err instanceof PaymongoError && err.status === 404) return json({ received: true, ignored: 'unknown session' });
    throw err;
  }
  const result = await fulfill(session);
  return json({ received: true, status: result.status });
}

export async function POST(request: Request): Promise<Response> {
  const action = new URL(request.url).searchParams.get('action');
  try {
    if (action === 'checkout') return await handleCheckout(request);
    if (action === 'verify') return await handleVerify(request);
    if (action === 'webhook') return await handleWebhook(request);
    return json({ error: 'Unknown action' }, 404);
  } catch (err) {
    console.error(`paymongo ${action} failed:`, err);
    if (err instanceof PaymongoError) return json({ error: 'The payment provider rejected the request. Please try again later.' }, 502);
    if (err instanceof HttpError) {
      // Config errors are for the logs, not for visitors
      return json({ error: err.status >= 500 ? 'Payments are temporarily unavailable.' : err.message }, err.status);
    }
    return json({ error: 'Payments are temporarily unavailable.' }, 500);
  }
}

export function GET(): Response {
  return json({
    ok: true,
    configured: {
      paymongoSecretKey: Boolean(process.env.PAYMONGO_SECRET_KEY?.trim()),
      paymongoLiveMode: Boolean(process.env.PAYMONGO_SECRET_KEY?.trim().startsWith('sk_live_')),
      paymongoWebhookSecret: Boolean(process.env.PAYMONGO_WEBHOOK_SECRET?.trim()),
      firebaseServiceAccount: Boolean(process.env.FIREBASE_SERVICE_ACCOUNT?.trim()),
    },
  });
}

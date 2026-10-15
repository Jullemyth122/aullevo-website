/**
 * PayMongo (GCash / Maya / QR Ph) checkout for Aullevo Pro — Vercel Function.
 *
 *   POST /api/paymongo?action=checkout  (Bearer Firebase ID token, body {plan}) → per-user PayMongo Checkout Session
 *   POST /api/paymongo?action=verify    (Bearer Firebase ID token) → re-checks the user's session, grants Pro if paid
 *   POST /api/paymongo?action=webhook   (PayMongo "checkout_session.payment.paid" webhook)
 *   POST /api/paymongo?action=admin-*   (Bearer ID token of an admin) → the /admin page: overview, approve, reject, recheck
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
 *   PAYPAL_CLIENT_SECRET      recommended; lets /admin verify PayPal payments with PayPal itself (live app secret)
 *   ADMIN_UIDS                optional comma list of Firebase uids allowed on /admin (default: the owner)
 */
import { createHmac, timingSafeEqual } from 'node:crypto';
import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth, type DecodedIdToken } from 'firebase-admin/auth';
import { FieldValue, getFirestore, type DocumentSnapshot } from 'firebase-admin/firestore';

const PAYMONGO_API = 'https://api.paymongo.com/v1';
const CURRENCY = 'PHP';
const DAY_MS = 24 * 60 * 60 * 1000;

// The only place prices are decided: the browser just names a plan. Keep in sync with src/config/plans.ts.
// Peso prices use the same rate as the original ₱154.29 = $2.50.
const PLANS = {
  monthly: { amount: 15429, usd: 2.5, days: 30, label: '30 days' },     // ₱154.29 ≈ $2.50
  yearly: { amount: 123432, usd: 20, days: 365, label: '1 year' },     // ₱1,234.32 ≈ $20
  lifetime: { amount: 308580, usd: 50, days: null, label: 'Lifetime' }, // ₱3,085.80 ≈ $50
} as const;
type PlanId = keyof typeof PLANS;

const isPlanId = (value: unknown): value is PlanId => typeof value === 'string' && Object.hasOwn(PLANS, value);
// Sessions created before plans existed carry no plan: they were all 30-day purchases
const sessionPlan = (session: CheckoutSession): PlanId => {
  const plan = session.attributes.metadata?.plan;
  return isPlanId(plan) ? plan : 'monthly';
};
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

type FulfillResult = { status: 'paid'; plan: PlanId; proExpiresAt: string | null } | { status: 'unpaid' };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

/* ── Firebase Admin ── */

function adminApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;

  // Emulator settings make the Admin SDK accept unsigned ID tokens: never allowed on the live site
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

// checkRevoked also refuses tokens of disabled accounts or after "sign out everywhere"
// (one extra Auth lookup, so it's used for admin calls only)
async function requireUser(request: Request, checkRevoked = false): Promise<DecodedIdToken> {
  const header = request.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) throw new HttpError(401, 'Sign in required');

  let decoded: DecodedIdToken;
  try {
    decoded = await getAuth(adminApp()).verifyIdToken(token, checkRevoked);
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

async function createSession(user: DecodedIdToken, origin: string, planId: PlanId): Promise<CheckoutSession> {
  const configured = process.env.PAYMONGO_PAYMENT_METHODS?.split(',').map((m) => m.trim()).filter(Boolean);
  const methodSets = configured?.length ? [configured] : FALLBACK_METHOD_SETS;
  const plan = PLANS[planId];

  let lastError: unknown;
  for (const methods of methodSets) {
    try {
      const { data } = await paymongo<{ data: CheckoutSession }>('/checkout_sessions', {
        data: {
          attributes: {
            line_items: [{
              name: `Aullevo Pro — ${plan.label}`,
              description: plan.days === null
                ? 'Unlimited AI Smart Fill, unlimited profiles, document uploads. One-time payment, Pro forever.'
                : 'Unlimited AI Smart Fill, unlimited profiles, document uploads. No auto-renewal.',
              amount: plan.amount,
              currency: CURRENCY,
              quantity: 1,
            }],
            payment_method_types: methods,
            description: `Aullevo Pro (${plan.label}) for ${user.email}`,
            reference_number: `AUL-${user.uid.slice(0, 10)}-${Date.now().toString(36)}`.toUpperCase(),
            metadata: { uid: user.uid, email: user.email || '', plan: planId },
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

function paidPayment(session: CheckoutSession, planId: PlanId): PaymongoPayment | undefined {
  return (session.attributes.payments || []).find(
    (p) => p.attributes.status === 'paid' && p.attributes.currency === CURRENCY && p.attributes.amount >= PLANS[planId].amount
  );
}

/* ── Granting Pro (idempotent) ── */

// The users/{uid} fields a paid plan sets. Days are added on top of any Pro time left.
// isPro with no expiry = lifetime/hand-made grant: never shortened, unless `replaceOpenFrom` is
// given (an admin turning an earlier no-expiry grant for this same payment into the real plan,
// counted from that time).
function grantFields(
  userSnap: DocumentSnapshot,
  planId: PlanId,
  payment: { id: string; provider: string },
  replaceOpenFrom?: number
) {
  const now = Date.now();
  const days = PLANS[planId].days;
  const isPro = Boolean(userSnap.get('isPro'));
  const currentExpiry = userSnap.get('proExpiresAt');
  const openGrant = isPro && !currentExpiry;
  const replacing = openGrant && replaceOpenFrom !== undefined && days !== null;
  const keepLifetime = openGrant && !replacing;
  const currentMs = isPro && typeof currentExpiry === 'string' ? Date.parse(currentExpiry) : NaN;
  const base = replacing ? replaceOpenFrom : Number.isFinite(currentMs) && currentMs > now ? currentMs : now;
  const proExpiresAt = keepLifetime || days === null ? null : new Date(base + days * DAY_MS).toISOString();

  return {
    proExpiresAt,
    fields: {
      isPro: true,
      // Lifetime = isPro with no proExpiresAt (what the site and the extension both check)
      proExpiresAt: proExpiresAt ?? FieldValue.delete(),
      ...(keepLifetime ? {} : { subscriptionPlan: planId }),
      lastPaymentId: payment.id,
      lastPaymentProvider: payment.provider,
      updatedAt: FieldValue.serverTimestamp(),
    },
  };
}

async function fulfill(session: CheckoutSession): Promise<FulfillResult> {
  const planId = sessionPlan(session);
  const payment = paidPayment(session, planId);
  if (!payment) return { status: 'unpaid' };

  const uid = session.attributes.metadata?.uid;
  if (!uid) throw new HttpError(422, `Checkout session ${session.id} has no uid`);

  const db = getFirestore(adminApp());
  const ledgerRef = db.doc(`payments/${payment.id}`);
  const userRef = db.doc(`users/${uid}`);
  const sessionRef = db.doc(`checkoutSessions/${uid}`);

  return db.runTransaction(async (tx) => {
    const [ledger, userSnap, sessionSnap] = await Promise.all([tx.get(ledgerRef), tx.get(userRef), tx.get(sessionRef)]);
    if (ledger.exists) return { status: 'paid', plan: planId, proExpiresAt: ledger.get('grantedUntil') ?? null };

    const { proExpiresAt, fields } = grantFields(userSnap, planId, { id: payment.id, provider: 'paymongo' });

    tx.set(ledgerRef, {
      uid,
      provider: 'paymongo',
      plan: planId,
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
      ...fields,
    }, { merge: true });

    if (sessionSnap.exists && sessionSnap.get('sessionId') === session.id) {
      tx.set(sessionRef, { status: 'paid', paymentId: payment.id }, { merge: true });
    }

    return { status: 'paid', plan: planId, proExpiresAt };
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
  const body = await request.json().catch(() => ({}));
  // No plan = an older page still open in someone's browser: that page only sold the 30-day plan
  const planId: unknown = body?.plan ?? 'monthly';
  if (!isPlanId(planId)) throw new HttpError(400, 'Unknown plan');

  const user = await requireUser(request);
  const db = getFirestore(adminApp());
  const sessionRef = db.doc(`checkoutSessions/${user.uid}`);
  const [existing, userSnap] = await Promise.all([sessionRef.get(), db.doc(`users/${user.uid}`).get()]);

  if (userSnap.get('isPro') && !userSnap.get('proExpiresAt')) {
    throw new HttpError(409, 'You already have lifetime Pro. There is nothing more to buy.');
  }

  // One open checkout per user: settle or reuse it before creating another
  if (existing.exists && existing.get('status') === 'open') {
    try {
      const previous = await retrieveSession(existing.get('sessionId'));
      const result = await fulfill(previous);
      if (result.status === 'paid') return json(result);
      const fresh = Date.now() - Number(existing.get('createdAtMs') || 0) < SESSION_REUSE_MS;
      if (fresh && previous.attributes.status === 'active' && sessionPlan(previous) === planId) {
        return json({ checkoutUrl: previous.attributes.checkout_url });
      }
    } catch (err) {
      console.warn('Could not reuse previous checkout session:', err);
    }
  }

  const session = await createSession(user, new URL(request.url).origin, planId);
  await sessionRef.set({
    sessionId: session.id,
    checkoutUrl: session.attributes.checkout_url,
    plan: planId,
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

/* ── Admin (the /admin page): review PayPal claims, see users and open checkouts ── */

// Admin = a Google sign-in whose uid is listed in ADMIN_UIDS (comma list), or the owner by default
const OWNER_UID = 'NC4SJVsA99MUubeEadaVnSHJ3k92';

async function requireAdmin(request: Request): Promise<DecodedIdToken> {
  const user = await requireUser(request, true);
  const admins =(process.env.ADMIN_UIDS || OWNER_UID).split(',').map((id) => id.trim()).filter(Boolean);
  if (user.firebase.sign_in_provider !== 'google.com' || !user.email_verified || !admins.includes(user.uid)) {
    throw new HttpError(403, 'This account is not an admin.');
  }
  return user;
}

/* ── PayPal: the server's own check of a claimed transaction (needs PAYPAL_CLIENT_SECRET) ── */

const PAYPAL_API = (process.env.PAYPAL_API_BASE?.trim() || 'https://api-m.paypal.com').replace(/\/+$/, '');

interface PaypalCapture {
  id: string;
  status: string;
  amount?: { value?: string; currency_code?: string };
  custom_id?: string;
  supplementary_data?: { related_ids?: { order_id?: string } };
}

interface PaypalOrder {
  id: string;
  purchase_units?: { custom_id?: string; payments?: { captures?: PaypalCapture[] } }[];
}

interface PaypalCheck {
  configured: boolean;
  ok: boolean; // a COMPLETED USD payment exists under this ID
  captureId?: string;
  orderId?: string;
  amount?: number;
  currency?: string;
  status?: string;
  plan?: string | null; // the plan the PayPal order was created for (custom_id)
  error?: string;
}

const paypalCredentials = () => {
  const id = (process.env.PAYPAL_CLIENT_ID || process.env.VITE_PAYPAL_CLIENT_ID)?.trim();
  const secret = process.env.PAYPAL_CLIENT_SECRET?.trim();
  return id && secret ? { id, secret } : null;
};

let paypalToken: { value: string; expiresAt: number } | null = null;

async function paypalGet<T>(path: string): Promise<T | null> {
  const creds = paypalCredentials();
  if (!creds) throw new Error('PayPal API is not configured');
  if (!paypalToken || paypalToken.expiresAt < Date.now() + 60_000) {
    const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${creds.id}:${creds.secret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.access_token) throw new Error(`PayPal sign-in failed (${res.status})`);
    paypalToken = { value: data.access_token, expiresAt: Date.now() + Number(data.expires_in || 0) * 1000 };
  }
  const res = await fetch(`${PAYPAL_API}${path}`, { headers: { Authorization: `Bearer ${paypalToken.value}`, Accept: 'application/json' } });
  if (res.status === 404) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `PayPal request failed (${res.status})`);
  return data as T;
}

// Takes a capture ID (what claims store) or an order ID and returns the payment as PayPal sees it.
// Orders carry custom_id "<plan>:<uid>" (older ones just "<plan>"); a payment made from another
// account than claimUid is refused, so nobody can claim someone else's transaction ID.
async function checkPaypal(id: string, claimUid: string): Promise<PaypalCheck> {
  if (!paypalCredentials()) return { configured: false, ok: false };
  if (!/^[A-Za-z0-9-]{5,64}$/.test(id)) return { configured: true, ok: false, error: 'Not a PayPal transaction ID' };
  try {
    let capture = await paypalGet<PaypalCapture>(`/v2/payments/captures/${id}`);
    let orderId = capture?.supplementary_data?.related_ids?.order_id;
    let customId = capture?.custom_id ?? null;
    if (!capture) {
      const order = await paypalGet<PaypalOrder>(`/v2/checkout/orders/${id}`);
      capture = order?.purchase_units?.[0]?.payments?.captures?.[0] ?? null;
      orderId = order?.id;
      customId = capture?.custom_id ?? order?.purchase_units?.[0]?.custom_id ?? null;
    }
    if (!capture) return { configured: true, ok: false, error: 'PayPal has no payment with this ID' };

    const [plan = null, buyerUid] = customId ? customId.split(':') : [];
    const amount = Number.parseFloat(capture.amount?.value ?? '');
    const currency = capture.amount?.currency_code;
    const error = capture.status !== 'COMPLETED' ? `PayPal status is ${capture.status}`
      : currency !== 'USD' || !Number.isFinite(amount) ? `Paid in ${currency}, expected USD`
      : buyerUid && buyerUid !== claimUid ? 'This payment was made from a different Aullevo account'
      : null;
    return {
      configured: true, ok: !error, captureId: capture.id, orderId, amount, currency, status: capture.status, plan,
      ...(error ? { error } : {}),
    };
  } catch (err) {
    return { configured: true, ok: false, error: err instanceof Error ? err.message : 'PayPal check failed' };
  }
}

// Every ID one PayPal payment is known by (capture ID, order ID, any letter case). Approving writes
// payments/paypal_<ID> for each, so the same payment can never be approved twice under another ID.
function paypalLedgerIds(claim: DocumentSnapshot, check: PaypalCheck): string[] {
  const ids = check.configured
    ? [claim.get('orderId'), check.captureId, check.orderId]
    : [claim.get('orderId'), /\border ([A-Za-z0-9-]{5,64})\b/.exec(String(claim.get('note') || ''))?.[1]];
  return [...new Set(ids.filter(Boolean).map((id) => `paypal_${String(id).toUpperCase()}`))];
}

const iso = (value: unknown): string | null => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof (value as { toDate?: unknown }).toDate === 'function') return (value as { toDate: () => Date }).toDate().toISOString();
  return null;
};

// Firestore document IDs as created by the site (no slashes, so no other paths can be named)
const isDocId = (value: unknown): value is string => typeof value === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(value);

async function handleAdminOverview(request: Request) {
  await requireAdmin(request);
  const db = getFirestore(adminApp());
  const [claims, users, sessions] = await Promise.all([
    db.collection('paymentClaims').orderBy('createdAt', 'desc').limit(300).get(),
    db.collection('users').limit(1000).get(),
    db.collection('checkoutSessions').where('status', '==', 'open').get(),
  ]);
  const emailOf = new Map(users.docs.map((d) => [d.id, String(d.get('email') || '')]));

  // Pending PayPal claims: what PayPal itself says, and whether that payment was already approved
  const review = new Map(await Promise.all(
    claims.docs
      .filter((d) => d.get('status') === 'pending' && d.get('provider') === 'paypal')
      .map(async (d) => {
        const paypal = await checkPaypal(String(d.get('orderId') || ''), String(d.get('uid') || ''));
        const ledger = await Promise.all(paypalLedgerIds(d, paypal).map((id) => db.doc(`payments/${id}`).get()));
        return [d.id, { paypal, alreadyUsed: ledger.some((s) => s.exists) }] as const;
      })
  ));

  return json({
    paypalApi: Boolean(paypalCredentials()),
    claims: claims.docs.map((d) => {
      const c = d.data();
      return {
        ...review.get(d.id),
        id: d.id, uid: c.uid, email: c.email || emailOf.get(c.uid) || '', provider: c.provider, orderId: c.orderId,
        payerEmail: c.payerEmail || '', amount: c.amount, currency: c.currency, note: c.note || '', status: c.status,
        plan: c.plan || null, grantedUntil: c.grantedUntil ?? null, reviewNote: c.reviewNote || '', reviewedBy: c.reviewedBy || '',
        createdAt: iso(c.createdAt), reviewedAt: iso(c.reviewedAt),
      };
    }),
    users: users.docs.map((d) => {
      const u = d.data();
      return {
        uid: d.id, email: u.email || '', displayName: u.displayName || '', isPro: Boolean(u.isPro),
        proExpiresAt: u.proExpiresAt || null, subscriptionPlan: u.subscriptionPlan || null,
        lastPaymentProvider: u.lastPaymentProvider || null, createdAt: iso(u.createdAt),
      };
    }),
    openCheckouts: sessions.docs.map((d) => ({
      uid: d.id, email: emailOf.get(d.id) || '', sessionId: d.get('sessionId'),
      plan: isPlanId(d.get('plan')) ? d.get('plan') : 'monthly', createdAt: iso(d.get('createdAt')),
    })),
  });
}

async function handleAdminApprove(request: Request) {
  const admin = await requireAdmin(request);
  const body = await request.json().catch(() => ({}));
  const { claimId, plan, replaceOpenGrant } = body ?? {};
  if (!isDocId(claimId)) throw new HttpError(400, 'Missing claim');
  if (!isPlanId(plan)) throw new HttpError(400, 'Unknown plan');

  const db = getFirestore(adminApp());
  const claimRef = db.doc(`paymentClaims/${claimId}`);
  const first = await claimRef.get();
  if (!first.exists) throw new HttpError(404, 'Claim not found');
  if (first.get('provider') !== 'paypal') throw new HttpError(400, 'Only PayPal claims are approved by hand');

  // The amount on a claim is typed by the buyer's browser. When the PayPal API is set up, the amount
  // PayPal actually received decides which plans can be given.
  const paypal = await checkPaypal(String(first.get('orderId') || ''), String(first.get('uid') || ''));
  if (paypal.configured) {
    if (!paypal.ok) throw new HttpError(409, `PayPal check failed: ${paypal.error || 'payment not completed'}`);
    if ((paypal.amount ?? 0) + 0.001 < PLANS[plan].usd) {
      throw new HttpError(409, `PayPal received $${paypal.amount}, less than the ${PLANS[plan].label} price ($${PLANS[plan].usd}).`);
    }
  }

  const result = await db.runTransaction(async (tx) => {
    const claim = await tx.get(claimRef);
    if (!claim.exists) throw new HttpError(404, 'Claim not found');
    if (claim.get('status') !== 'pending') throw new HttpError(409, 'This claim was already handled.');
    const ledgerRefs = paypalLedgerIds(claim, paypal).map((id) => db.doc(`payments/${id}`));
    const userRef = db.doc(`users/${claim.get('uid')}`);
    const [userSnap, ...ledger] = await Promise.all([tx.get(userRef), ...ledgerRefs.map((ref) => tx.get(ref))]);
    const used = ledger.find((s) => s.exists);
    if (used) throw new HttpError(409, `This PayPal payment was already used (claim ${used.get('claimId') || used.id}).`);

    const paidMs = claim.get('createdAt')?.toMillis?.() ?? Date.now();
    const { proExpiresAt, fields } = grantFields(
      userSnap,
      plan,
      { id: String(paypal.captureId || claim.get('orderId')), provider: 'paypal' },
      replaceOpenGrant === true ? paidMs : undefined
    );
    const reviewedBy = admin.email || admin.uid;
    for (const ref of ledgerRefs) {
      tx.set(ref, {
        uid: claim.get('uid'), provider: 'paypal', plan, claimId,
        amount: paypal.amount ?? claim.get('amount'), currency: paypal.currency ?? claim.get('currency'),
        verifiedWithPaypal: paypal.ok, captureId: paypal.captureId ?? null, orderId: paypal.orderId ?? null,
        grantedUntil: proExpiresAt, reviewedBy, createdAt: FieldValue.serverTimestamp(),
      });
    }
    tx.set(userRef, fields, { merge: true });
    tx.update(claimRef, {
      status: 'approved', plan, grantedUntil: proExpiresAt, verifiedWithPaypal: paypal.ok,
      reviewedBy, reviewedAt: FieldValue.serverTimestamp(),
    });
    return { proExpiresAt, verifiedWithPaypal: paypal.ok };
  });
  return json({ status: 'approved', plan, ...result });
}

async function handleAdminReject(request: Request) {
  const admin = await requireAdmin(request);
  const body = await request.json().catch(() => ({}));
  const { claimId, reason } = body ?? {};
  if (!isDocId(claimId)) throw new HttpError(400, 'Missing claim');

  const db = getFirestore(adminApp());
  const claimRef = db.doc(`paymentClaims/${claimId}`);
  await db.runTransaction(async (tx) => {
    const claim = await tx.get(claimRef);
    if (!claim.exists) throw new HttpError(404, 'Claim not found');
    if (claim.get('status') !== 'pending') throw new HttpError(409, 'This claim was already handled.');
    tx.update(claimRef, {
      status: 'rejected',
      ...(typeof reason === 'string' && reason.trim() ? { reviewNote: reason.trim().slice(0, 200) } : {}),
      reviewedBy: admin.email || admin.uid,
      reviewedAt: FieldValue.serverTimestamp(),
    });
  });
  return json({ status: 'rejected' });
}

// Asks PayMongo about a user's open checkout: grants Pro if it was paid, closes it if it expired
async function handleAdminRecheck(request: Request) {
  await requireAdmin(request);
  const body = await request.json().catch(() => ({}));
  if (!isDocId(body?.uid)) throw new HttpError(400, 'Missing user');

  const sessionRef = getFirestore(adminApp()).doc(`checkoutSessions/${body.uid}`);
  const snap = await sessionRef.get();
  if (!snap.exists) throw new HttpError(404, 'No checkout for this user');

  const session = await retrieveSession(snap.get('sessionId'));
  const result = await fulfill(session);
  if (result.status === 'paid') return json(result);
  if (session.attributes.status !== 'active') {
    await sessionRef.set({ status: session.attributes.status }, { merge: true });
  }
  return json({ status: 'unpaid', paymongoStatus: session.attributes.status });
}

export async function POST(request: Request): Promise<Response> {
  const action = new URL(request.url).searchParams.get('action');
  try {
    if (action === 'checkout') return await handleCheckout(request);
    if (action === 'verify') return await handleVerify(request);
    if (action === 'webhook') return await handleWebhook(request);
    if (action === 'admin-overview') return await handleAdminOverview(request);
    if (action === 'admin-approve') return await handleAdminApprove(request);
    if (action === 'admin-reject') return await handleAdminReject(request);
    if (action === 'admin-recheck') return await handleAdminRecheck(request);
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
      paypalApi: Boolean(paypalCredentials()),
      firebaseServiceAccount: Boolean(process.env.FIREBASE_SERVICE_ACCOUNT?.trim()),
    },
  });
}

#!/usr/bin/env node
/**
 * Review pending PayPal payment claims one by one and activate Pro for each.
 *
 *   npm run approve:payments            → go through every pending claim
 *   npm run approve:payments -- --list  → only list them (changes nothing)
 *
 * For each claim you check the transaction in PayPal (Activity), then choose:
 *   a = approve with the plan shown   m / y / l = approve as Monthly / Yearly / Lifetime instead
 *   r = reject   s = skip for now   q = quit
 *
 * Approving does, in one transaction: users/{uid} → isPro, proExpiresAt (or none for lifetime),
 * subscriptionPlan, lastPaymentId; and the claim → status "approved", plan, grantedUntil.
 * Days are added on top of any Pro time the account still has, same as the PayMongo server.
 *
 * Same safety rules as the /admin page: the amount on a claim comes from the buyer's browser, so you
 * type the amount PayPal shows as received and plans above it are refused; and payments/paypal_<ID>
 * is written for every ID of the payment, so one PayPal payment can never be approved twice.
 *
 * Needs the Firebase service account key: FIREBASE_SERVICE_ACCOUNT_FILE=<path>, a
 * *firebase-adminsdk*.json in this folder, or the path typed when asked.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { stdin, stdout, env, exit, argv } from 'node:process';
import { cert, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

const FIREBASE_PROJECT_ID = 'aullevo-data';
const DAY_MS = 24 * 60 * 60 * 1000;
// Keep in sync with src/config/plans.ts
const PLANS = {
  monthly: { name: 'Monthly', days: 30, usd: 2.5 },
  yearly: { name: 'Yearly', days: 365, usd: 20 },
  lifetime: { name: 'Lifetime', days: null, usd: 50 },
};
const LIST_ONLY = argv.includes('--list');

const bold = (s) => `\x1b[1m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;
const fail = (s) => {
  console.error(red(`\n✖ ${s}`));
  exit(1);
};

// Answers are queued as they arrive, so typed and piped input both work
const rl = createInterface({ input: stdin, terminal: false });
const typed = [];
const waiting = [];
rl.on('line', (line) => (waiting.length ? waiting.shift()(line) : typed.push(line)));
rl.on('close', () => waiting.splice(0).forEach((resolve) => resolve('')));
const ask = (q) => {
  stdout.write(q);
  if (typed.length) return Promise.resolve(typed.shift().trim());
  return new Promise((resolve) => waiting.push((line) => resolve(line.trim())));
};

const toDate = (v) => (v?.toDate ? v.toDate() : v ? new Date(v) : null);
const fmt = (d) => (d ? d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—');

// The plan the buyer picked: written at the start of the note since plans exist; older claims
// only have the amount
function guessPlan(claim) {
  const fromNote = /^(Monthly|Yearly|Lifetime) plan/i.exec(claim.note || '')?.[1]?.toLowerCase();
  if (fromNote) return fromNote;
  const amount = Number.parseFloat(claim.amount);
  if (claim.currency !== 'USD' || !Number.isFinite(amount)) return null;
  if (amount >= PLANS.lifetime.usd) return 'lifetime';
  if (amount >= PLANS.yearly.usd) return 'yearly';
  if (amount >= PLANS.monthly.usd) return 'monthly';
  return null;
}

// Every ID the payment is known by (transaction/capture ID + order ID from the note), as the
// payments/ ledger docs the /admin page also writes and checks
const ledgerIds = (claim) =>
  [...new Set([claim.orderId, /\border ([A-Za-z0-9-]{5,64})\b/.exec(claim.note || '')?.[1]]
    .filter(Boolean).map((id) => `paypal_${String(id).toUpperCase()}`))];

function describePro(user) {
  if (!user?.isPro) return 'Free';
  if (!user.proExpiresAt) return user.subscriptionPlan === 'lifetime' ? 'Pro · Lifetime' : yellow('Pro with NO expiry date (shows as Lifetime)');
  const exp = new Date(user.proExpiresAt);
  return exp > new Date() ? `Pro until ${fmt(exp)}` : `Pro expired ${fmt(exp)}`;
}

/* ── Firebase ── */

let saPath = env.FIREBASE_SERVICE_ACCOUNT_FILE || readdirSync('.').find((f) => f.includes('firebase-adminsdk') && f.endsWith('.json'));
if (!saPath) saPath = await ask('Path to the Firebase service account .json: ');
saPath = saPath.replace(/^["']|["']$/g, '');
if (!existsSync(saPath)) fail(`File not found: ${saPath}`);
const serviceAccount = JSON.parse(readFileSync(saPath, 'utf8'));
if (serviceAccount.project_id !== FIREBASE_PROJECT_ID) fail(`That key is for "${serviceAccount.project_id}", expected "${FIREBASE_PROJECT_ID}".`);
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

/* ── Review ── */

const pending = (await db.collection('paymentClaims').where('status', '==', 'pending').get()).docs
  .sort((a, b) => (toDate(a.get('createdAt'))?.getTime() ?? 0) - (toDate(b.get('createdAt'))?.getTime() ?? 0));

console.log(bold(`\n${pending.length} pending payment claim${pending.length === 1 ? '' : 's'}`));
let approved = 0, rejected = 0;

for (const [i, snap] of pending.entries()) {
  const claim = snap.data();
  const user = (await db.doc(`users/${claim.uid}`).get()).data();
  const guessed = guessPlan(claim);

  console.log(`\n${bold(`── ${i + 1}/${pending.length} · ${claim.email || claim.uid}`)}`);
  console.log(`  Paid          ${bold(`${claim.amount} ${claim.currency}`)} via ${claim.provider} on ${fmt(toDate(claim.createdAt))}`);
  console.log(`  Transaction   ${bold(claim.orderId)}  ${dim(`(PayPal → Activity → search this ID)`)}`);
  console.log(`  PayPal payer  ${claim.payerEmail || '—'}`);
  console.log(`  Note          ${claim.note || '—'}`);
  console.log(`  Account now   ${describePro(user)}`);
  console.log(`  Plan          ${guessed ? bold(PLANS[guessed].name) : red('unknown amount: pick one yourself')}`);
  console.log(dim(`  claim: paymentClaims/${snap.id} · user: users/${claim.uid}`));

  if (LIST_ONLY) continue;

  const choice = (await ask(`\n  ${guessed ? `[a]pprove ${PLANS[guessed].name} · ` : ''}approve as [m]onthly/[y]early/[l]ifetime · [r]eject · [s]kip · [q]uit: `)).toLowerCase();
  if (choice === 'q') break;
  if (choice === 's' || choice === '') continue;

  if (choice === 'r') {
    const reason = await ask('  Reason (optional): ');
    await snap.ref.update({ status: 'rejected', reviewedAt: FieldValue.serverTimestamp(), ...(reason ? { reviewNote: reason.slice(0, 200) } : {}) });
    console.log(`  ${red('✖')} Rejected. The account was not changed.`);
    rejected++;
    continue;
  }

  const planId = { a: guessed, m: 'monthly', y: 'yearly', l: 'lifetime' }[choice];
  if (!planId) {
    console.log(yellow('  Not a valid choice, skipped.'));
    continue;
  }
  const plan = PLANS[planId];

  const received = Number.parseFloat((await ask(`  Amount PayPal shows as received for ${claim.orderId} (USD): `)).replace(/[$,\s]/g, ''));
  if (!Number.isFinite(received) || received + 0.001 < plan.usd) {
    console.log(yellow(`  ${Number.isFinite(received) ? `$${received} doesn't cover ${plan.name} ($${plan.usd})` : 'No amount entered'}. Skipped.`));
    continue;
  }

  // Pro with no expiry that isn't a bought lifetime = an earlier hand-made grant for this same payment.
  // Replacing it counts the plan from the payment date, since the buyer already had Pro since then.
  let replaceOpenGrant = false;
  if (user?.isPro && !user.proExpiresAt && plan.days !== null) {
    if (user.subscriptionPlan === 'lifetime') {
      console.log(yellow('  This account already has lifetime Pro. Approving only marks the claim as done.'));
    } else {
      replaceOpenGrant = (await ask(`  It has Pro with no expiry (shows as Lifetime). Change it to ${plan.name}, counted from the payment date? [y/N] `)).toLowerCase() === 'y';
    }
  }

  const ledgerRefs = ledgerIds(claim).map((id) => db.doc(`payments/${id}`));
  // undefined = refused (null is a valid result: lifetime)
  const grantedUntil = await db.runTransaction(async (tx) => {
    const [fresh, userSnap, ...ledger] = await Promise.all([
      tx.get(snap.ref), tx.get(db.doc(`users/${claim.uid}`)), ...ledgerRefs.map((ref) => tx.get(ref)),
    ]);
    if (fresh.get('status') !== 'pending') throw new Error('This claim was already handled.');
    const used = ledger.find((s) => s.exists);
    if (used) throw new Error(`This PayPal payment was already used (claim ${used.get('claimId') || used.id}). Reject this claim.`);

    const now = Date.now();
    const isPro = Boolean(userSnap.get('isPro'));
    const currentExpiry = userSnap.get('proExpiresAt');
    const keepLifetime = isPro && !currentExpiry && !replaceOpenGrant;
    const becomesLifetime = keepLifetime || plan.days === null;

    let base = now;
    if (replaceOpenGrant) base = toDate(claim.createdAt)?.getTime() ?? now;
    else if (isPro && currentExpiry && Date.parse(currentExpiry) > now) base = Date.parse(currentExpiry);
    const until = becomesLifetime ? null : new Date(base + plan.days * DAY_MS).toISOString();

    tx.set(userSnap.ref, {
      isPro: true,
      proExpiresAt: becomesLifetime ? FieldValue.delete() : until,
      ...(keepLifetime ? {} : { subscriptionPlan: planId }),
      lastPaymentId: claim.orderId,
      lastPaymentProvider: claim.provider,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    for (const ref of ledgerRefs) {
      tx.set(ref, {
        uid: claim.uid, provider: 'paypal', plan: planId, claimId: snap.id, amount: String(received), currency: 'USD',
        verifiedWithPaypal: false, orderId: claim.orderId, grantedUntil: until, reviewedBy: 'terminal',
        createdAt: FieldValue.serverTimestamp(),
      });
    }
    tx.update(snap.ref, {
      status: 'approved', plan: planId, grantedUntil: until, verifiedWithPaypal: false,
      reviewedBy: 'terminal', reviewedAt: FieldValue.serverTimestamp(),
    });
    return until;
  }).catch((err) => {
    console.log(red(`  ✖ ${err.message}`));
    return undefined;
  });
  if (grantedUntil === undefined) continue;

  console.log(`  ${green('✓')} Approved ${plan.name}: ${grantedUntil ? `Pro until ${fmt(new Date(grantedUntil))}` : 'Pro with no expiry'}.`);
  approved++;
}

rl.close();
if (!LIST_ONLY) console.log(bold(`\nDone: ${approved} approved, ${rejected} rejected.`));
exit(0);

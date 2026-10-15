#!/usr/bin/env node
/**
 * One-time setup for automatic GCash / Maya / QR Ph activation (api/paymongo.ts).
 *
 *   node scripts/setup-payments.mjs [https://your-site.vercel.app]
 *
 * 1. Asks for your PayMongo secret key (hidden input) and checks it against PayMongo
 * 2. Registers (or reuses) the PayMongo webhook  → <site>/api/paymongo?action=webhook
 * 3. Asks for your Firebase service account JSON file
 * 4. Saves PAYMONGO_SECRET_KEY, PAYMONGO_WEBHOOK_SECRET and FIREBASE_SERVICE_ACCOUNT
 *    as Vercel *Production* environment variables (nothing is written to this repo)
 * 5. Optionally deploys the Firestore rules and the site to production
 */
import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout, env, exit, argv } from 'node:process';

const SITE = (argv[2] || 'https://aullevo.com').replace(/\/+$/, '');
const WEBHOOK_URL = `${SITE}/api/paymongo?action=webhook`;
const WEBHOOK_EVENTS = ['checkout_session.payment.paid'];
const FIREBASE_PROJECT_ID = 'aullevo-data';

const bold = (s) => `\x1b[1m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const step = (n, s) => console.log(`\n${bold(`[${n}/5]`)} ${s}`);
const fail = (s) => {
  console.error(red(`\n✖ ${s}`));
  exit(1);
};

async function ask(question, { hidden = false } = {}) {
  const rl = createInterface({ input: stdin, output: stdout, terminal: true });
  if (hidden) {
    // Echo the prompt, swallow what's typed/pasted
    rl._writeToOutput = (text) => {
      if (text.startsWith(question)) stdout.write(question);
    };
  }
  const answer = await rl.question(question);
  rl.close();
  if (hidden) stdout.write('\n');
  return answer.trim();
}

async function paymongo(key, path, body) {
  const res = await fetch(`https://api.paymongo.com/v1${path}`, {
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
    const detail = payload?.errors?.map((e) => e.detail).filter(Boolean).join('; ');
    throw new Error(`PayMongo ${res.status}: ${detail || res.statusText}`);
  }
  return payload;
}

// Windows needs a shell to resolve vercel.cmd / firebase.cmd
const run = (cmd, args, options = {}) =>
  spawnSync(cmd, args, { shell: process.platform === 'win32', encoding: 'utf8', ...options });

function setVercelEnv(name, value) {
  // Replace any previous value so re-running the script is safe
  run('vercel', ['env', 'rm', name, 'production', '--yes'], { stdio: 'ignore' });
  const result = run('vercel', ['env', 'add', name, 'production'], { input: value });
  if (result.status !== 0) {
    fail(`Could not save ${name} to Vercel:\n${result.stderr || result.stdout}`);
  }
  console.log(`  ${green('✓')} ${name}`);
}

/* ── 1. PayMongo secret key ── */
step(1, 'PayMongo secret key');
console.log('  PayMongo Dashboard → Developers → API Keys → Secret key (starts with sk_live_)');
const secretKey = env.PAYMONGO_SECRET_KEY?.trim() || (await ask('  Paste secret key (hidden): ', { hidden: true }));
if (!/^sk_(live|test)_[A-Za-z0-9]+$/.test(secretKey)) fail('That is not a PayMongo secret key (expected sk_live_… or sk_test_…).');
if (secretKey.startsWith('sk_test_')) console.log('  ⚠ Test key: payments will be test-mode only. Use sk_live_ for real payments.');

let webhooks;
try {
  webhooks = (await paymongo(secretKey, '/webhooks')).data || [];
} catch (err) {
  fail(`PayMongo rejected the key: ${err.message}`);
}
console.log(`  ${green('✓')} Key accepted by PayMongo (${secretKey.startsWith('sk_live_') ? 'live' : 'test'} mode)`);

/* ── 2. Webhook ── */
step(2, `PayMongo webhook → ${WEBHOOK_URL}`);
let webhook = webhooks.find((w) => w.attributes?.url === WEBHOOK_URL);
if (webhook) {
  console.log(`  ${green('✓')} Reusing existing webhook ${webhook.id}`);
  if (webhook.attributes.status !== 'enabled') {
    webhook = (await paymongo(secretKey, `/webhooks/${webhook.id}/enable`, {})).data;
    console.log(`  ${green('✓')} Re-enabled it`);
  }
} else {
  webhook = (await paymongo(secretKey, '/webhooks', {
    data: { attributes: { url: WEBHOOK_URL, events: WEBHOOK_EVENTS } },
  })).data;
  console.log(`  ${green('✓')} Created webhook ${webhook.id}`);
}
const webhookSecret =
  webhook.attributes?.secret_key || (await paymongo(secretKey, `/webhooks/${webhook.id}`)).data?.attributes?.secret_key;
if (!webhookSecret) fail('PayMongo did not return a webhook secret.');

/* ── 3. Firebase service account ── */
step(3, 'Firebase service account');
console.log(`  Firebase Console → Project settings → Service accounts → Generate new private key`);
console.log(`  (https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/settings/serviceaccounts/adminsdk)`);
const saPath = (env.FIREBASE_SERVICE_ACCOUNT_FILE || (await ask('  Path to the downloaded .json file: '))).replace(/^["']|["']$/g, '');
if (!existsSync(saPath)) fail(`File not found: ${saPath}`);
let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(saPath, 'utf8'));
} catch {
  fail('That file is not valid JSON.');
}
if (serviceAccount.type !== 'service_account' || !serviceAccount.private_key || !serviceAccount.client_email) {
  fail('That file is not a Firebase service account key.');
}
if (serviceAccount.project_id !== FIREBASE_PROJECT_ID) {
  fail(`That key is for project "${serviceAccount.project_id}", expected "${FIREBASE_PROJECT_ID}".`);
}
console.log(`  ${green('✓')} ${serviceAccount.client_email}`);

/* ── 4. Vercel env ── */
step(4, 'Saving Vercel Production environment variables');
setVercelEnv('PAYMONGO_SECRET_KEY', secretKey);
setVercelEnv('PAYMONGO_WEBHOOK_SECRET', webhookSecret);
setVercelEnv('FIREBASE_SERVICE_ACCOUNT', Buffer.from(JSON.stringify(serviceAccount)).toString('base64'));
console.log(`  You can now delete ${saPath} (Vercel keeps an encrypted copy).`);

/* ── 5. Deploy ── */
step(5, 'Deploy');
const deployNow = (await ask('  Deploy Firestore rules and the site to production now? [y/N] ')).toLowerCase() === 'y';
if (deployNow) {
  if (run('firebase', ['deploy', '--only', 'firestore:rules', '--project', FIREBASE_PROJECT_ID], { stdio: 'inherit' }).status !== 0) {
    fail('Firestore rules deploy failed.');
  }
  if (run('vercel', ['--prod'], { stdio: 'inherit' }).status !== 0) fail('Vercel deploy failed.');

  try {
    const health = await (await fetch(`${SITE}/api/paymongo`)).json();
    const missing = Object.entries(health.configured || {}).filter(([k, v]) => !v && k !== 'paymongoLiveMode');
    if (missing.length) fail(`Deployed, but these are missing: ${missing.map(([k]) => k).join(', ')}`);
    console.log(`  ${green('✓')} ${SITE}/api/paymongo reports everything configured`);
  } catch (err) {
    console.log(`  ⚠ Could not reach ${SITE}/api/paymongo yet (${err.message}). Open it in a browser to check.`);
  }
} else {
  console.log('  When ready, run:');
  console.log(`    firebase deploy --only firestore:rules --project ${FIREBASE_PROJECT_ID}`);
  console.log('    vercel --prod');
  console.log(`  Then open ${SITE}/api/paymongo — every "configured" value should be true.`);
}

console.log(green('\n✓ PayMongo setup complete.\n'));

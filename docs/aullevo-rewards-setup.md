# Free-plan ads: the 5-hour pass, setup and going live

Free accounts get a small allowance every day. On top of it, **2 short ads** on **aullevo.com/rewards** unlock
**everything for 5 hours**, without limits, including document uploads into forms and JSON export (otherwise Pro only).
The pass can be watched any time (also while free uses are left); the second ad must follow within an hour of the
first. Passes stack: 2 more ads add 5 more hours. Pro accounts never see ads. Until a Google ad unit is configured, the
page shows a **test ad** (a 30-second countdown that runs only while the tab is visible), so everything works end to
end but earns nothing.

| Feature | Free every day | During a pass (2 ads, 5 hours) |
|---|---|---|
| AI Smart Fill | 6 fills (server) | unlimited |
| Auto-pagination | 2 hours from the first use (server) | unlimited |
| Voice agent | 3 sessions of 10 minutes (server) | unlimited sessions |
| Typing speeds | Slow and custom: 2 hours from the first use (server) | unlimited |
| JSON imports | 4 (counted in the extension) | unlimited, plus JSON export |
| Multi-link queue | 5 links | unlimited |
| Active profiles | 3 | unlimited |
| Document uploads into forms | none (Pro) | yes |

The server's daily allowance resets at midnight UTC. A safety net of 100 ads per account per day stops bots. Unlocks
watched under the old per-feature ads (before 2026-10-16) keep working until they end, and while a pass runs the server
also reports every feature as unlocked, so older extensions (v0.6.5) keep working. When a pass ends nothing is deleted;
extra profiles and links are paused in the extension. The rules live in `api/_rewards-core.ts` (server, authoritative), `src/config/rewards.ts`
(website text) and the extension's `src/services/rewards.ts`; keep the three in sync.

## How it fits together

- `api/rewards.ts` (Vercel Function) — `link`, `status`, `start`, `grant` (the 2nd ad in a row opens the pass), `consume`. Passes and the daily allowance are stored in Firestore
  `rewards/{uid}`, written only by this function (Admin SDK). Tests: `npm run test:rewards`.
- `src/pages/Rewards.tsx` — the ad page. The extension opens `/rewards?feature=ai&source=extension`; after the second ad the page
  posts `AULLEVO_REWARD_GRANTED`, the extension refreshes its unlocks and closes the tab.
- The extension signs in to the API with its own token (180 days), issued when the account connects (`action=link`),
  because Firebase ID tokens expire after an hour.

## 1. Turn it on now (test ads)

1. **Vercel → Project → Settings → Environment Variables (Production):**
   - `REWARDS_TOKEN_SECRET` — a long random string. Generate one with:
     `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - `FIREBASE_SERVICE_ACCOUNT` — already set for PayMongo; nothing to do.
2. **Deploy the Firestore rules** (adds the read-only `rewards/{uid}` rule): `firebase deploy --only firestore:rules`
3. **Deploy the website** (push to the branch Vercel builds).
4. Check `https://aullevo.com/api/rewards` → `rewardsTokenSecret: true`, `firebaseServiceAccount: true`.
5. **Release the extension update.** Users connect their account once in Settings (existing users: sign in on the website
   again, or just open `/rewards`, which links the extension automatically).

## 2. Get real ads (Google Ad Manager rewarded ads)

Rewarded *video* ads on websites come from **Google Ad Manager** (free "Ad Manager for small businesses"), with demand from
Google AdSense / Ad Exchange. AdSense alone only shows display ads and has no "reward" callback.

1. **Use your own domain** (for example `aullevo.com`) and point it at Vercel. Google needs a site you own and an
   `ads.txt` file at its root; you can't add one to the root of `vercel.app`. Update the extension's `AULLEVO_WEB_URL`,
   `TRUSTED_WEB_ORIGINS` and `rewardsWebUrl()` to the new domain when you switch.
2. **AdSense:** sign up at adsense.google.com with that domain, add the verification snippet, and wait for approval.
   The site needs real content (it has: features, docs, about, legal pages).
3. **Ad Manager:** sign up at admanager.google.com and link it to your AdSense account (this turns on AdSense backfill,
   which supplies the ads). Note your **network code** (a number).
4. **Create the ad unit:** Inventory → Ad units → New ad unit, name it `aullevo_rewarded`, and make sure the
   **Rewarded** web format is allowed for it (Delivery → enable "Rewarded ads" for web if your network shows the option).
   The unit's path is `/NETWORK_CODE/aullevo_rewarded`.
5. **ads.txt:** create `public/ads.txt` with the line Google shows you, e.g.
   `google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0`
6. **Consent (EEA, UK, Switzerland):** in Ad Manager / AdSense → Privacy & messaging, create a GDPR consent message for
   the domain. Google serves it on the page automatically.
7. **Vercel env (Production):** `VITE_REWARDED_AD_UNIT=/NETWORK_CODE/aullevo_rewarded`, then **redeploy** (Vite bakes
   `VITE_` variables in at build time). The page switches from the test ad to real ads; the server then accepts a reward
   after Google's "granted" event (at least 15 seconds after the ad starts).
8. **Check:** open `/rewards` while signed in as a Free account and watch one ad. If Google has no ad to show, the page
   says so ("No ad is available right now"); new ad units often take a day or two to start filling.

Notes:
- Google decides the ad and its length (usually 15–30 seconds), not us. The 30-second length
  applies to the test ad.
- Never click or watch your own ads repeatedly, and don't ask users to click ads: Google can disable the account for
  invalid traffic. The 100-ads-a-day cap is only a bot safety net.
- Earnings depend heavily on where users are; rewarded video pays more than banners, but Pro subscriptions will
  usually earn more per user.

## 3. Limits of this design (worth knowing)

- The extension runs on the user's computer, so its checks (AI fills left, voice session running) can in principle be
  edited by a determined user with DevTools. What can't be faked from the browser: granting unlocks (server only),
  the ads-per-day cap, and Pro status.
- A web page can't prove to the server that a Google ad really played; the server checks the ad was started from the
  page, finished within 15 minutes, and took at least the minimum time.

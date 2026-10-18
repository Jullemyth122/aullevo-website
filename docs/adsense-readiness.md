# AdSense readiness changes — October 19, 2026

Production target: the existing Vercel `aullevo-web` project at https://aullevo.com. DNS remains with the existing setup.

## Website implementation

- The homepage retains its static AdSense script and adds an account verification meta tag. `public/ads.txt` keeps the same publisher ID, `pub-4867997588858944`.
- `npm run build` creates `/privacy`, `/terms`, `/contact`, and `/advertising` as complete HTML documents using the existing React page components. These documents contain no scripts or iframes, work without JavaScript, and use the normal site CSS. Vercel routes these URLs to the generated HTML before its SPA fallback.
- Footer links to these documents load a new document, so advertising scripts from the SPA do not follow the visitor onto policy pages.
- Privacy text describes website-wide advertising, account usage, optional rewards, and test promotions accurately. It does not claim an unverified consent banner is active.
- The privacy-choice link invokes Google's consent revocation callback if its CMP is available; otherwise it opens the cookie disclosure. This is not a replacement for a certified CMP.
- Reward demos have a visible test label, explain that they earn no Google ad revenue, and can be closed without a reward. Ordinary ad clicks do not earn rewards.
- Contact and advertising pages are in the sitemap. Login is no longer listed as public content. Placeholder social profile links and the unverified operational-status label were removed.
- Local environment files and unpacked temporary extension files are excluded from Vercel uploads. Production environment values come from the existing Vercel project.

## Account checks that a deployment cannot complete

1. In AdSense Home, confirm all required account setup tasks are complete, including payment information.
2. In Sites → aullevo.com, use **Check for updates** if available for ads.txt. Do not remove and re-add the site merely to refresh the status.
3. In Privacy & messaging, verify the certified European regulations message, link https://aullevo.com/privacy, and confirm the appropriate consent configuration before serving personalized ads to EEA, UK, or Swiss visitors. Publishing website policy text alone does not publish Google's message.
4. Keep the site available while Google's site review continues. A website deployment does not grant approval or guarantee its date.

Google references:
- https://support.google.com/adsense/answer/10961370 — policy disclosure pages must not host consent-dependent scripts or the Funding Choices tag.
- https://support.google.com/adsense/answer/10959060 — consent revocation callback.
- https://support.google.com/adsense/answer/12171612 — ads.txt and Check for updates.
- https://support.google.com/adsense/answer/12170222 — review status and account setup.

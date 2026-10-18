import type { MouseEvent } from 'react';

/** Use Google's published CMP when available; otherwise show the cookie disclosure. */
export default function PrivacyChoicesLink() {
    const openChoices = (event: MouseEvent<HTMLAnchorElement>) => {
        const googlefc = (window as Window & {
            googlefc?: { callbackQueue?: { push: (callback: () => void) => unknown }; showRevocationMessage?: () => void };
        }).googlefc;
        if (googlefc?.callbackQueue && typeof googlefc.showRevocationMessage === 'function') {
            event.preventDefault();
            googlefc.callbackQueue.push(googlefc.showRevocationMessage);
        }
    };

    return <a href="/privacy#cookies" onClick={openChoices}>Privacy &amp; cookie settings</a>;
}

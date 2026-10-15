// src/utils/analytics.ts
import { track } from "@vercel/analytics";

type EventParams = Record<string, string | number | boolean | null>;

export const logEvent = (eventName: string, params?: EventParams) => {
  if (typeof window === "undefined") return;

  // Vercel Web Analytics (custom events are only recorded on Vercel Pro/Enterprise)
  track(eventName, params);

  // Google Analytics: prefer gtag; fall back to a GTM dataLayer push.
  // Never both, since gtag also writes to dataLayer and that would double count.
  if ((window as any).gtag) {
    (window as any).gtag("event", eventName, params);
  } else if ((window as any).dataLayer) {
    (window as any).dataLayer.push({ event: eventName, ...params });
  } else {
    console.warn(`[Analytics] Neither gtag nor dataLayer loaded. Event: ${eventName}`, params);
  }
};

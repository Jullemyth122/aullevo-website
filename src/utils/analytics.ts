// src/utils/analytics.ts

export const logEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== "undefined") {
    let sent = false;

    // 1. Try Google Analytics (gtag)
    if ((window as any).gtag) {
      (window as any).gtag("event", eventName, params);
      sent = true;
    }

    // 2. Try Google Tag Manager (dataLayer)
    if ((window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: eventName,
        ...params
      });
      sent = true;
    }

    if (!sent) {
      console.warn(`[Analytics] Neither gtag nor dataLayer loaded. Event: ${eventName}`, params);
    }
  }
};


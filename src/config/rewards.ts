// The Free plan as shown on the site: an allowance every day, and the pass: 2 short ads unlock everything for
// 5 hours (passes stack). The server decides what is granted (api/_rewards-core.ts); keep these numbers in sync
// with FREE_RULES / PASS_* there and in the extension (src/services/rewards.ts).
export type RewardFeature = 'ai' | 'profiles' | 'paginate' | 'typing' | 'json' | 'links' | 'voice';

export const PASS_ADS = 2;
export const PASS_HOURS = 5;

export interface FreeInfo {
    id: RewardFeature;
    title: string;
    free: string;    // what Free gives every day: "6 AI Smart Fills every day"
}

// What Free gives every day; the pass lifts every limit for 5 hours
export const FREE_ALLOWANCE: FreeInfo[] = [
    { id: 'ai', title: 'AI Smart Fill', free: '6 AI Smart Fills every day' },
    { id: 'paginate', title: 'Auto-pagination', free: '2 hours every day, from the first use' },
    { id: 'voice', title: 'Voice agent', free: '3 voice sessions every day' },
    { id: 'profiles', title: 'Active profiles', free: '3 at once' },
    { id: 'links', title: 'Multi-link queue', free: '5 links' },
    { id: 'json', title: 'JSON imports', free: '4 every day' },
    { id: 'typing', title: 'Typing speeds', free: 'Slow and custom: 2 hours every day' },
];

// Only with Pro or a running pass
export const PASS_EXTRAS = ['Resume and document uploads into forms', 'JSON export'];

export const isRewardFeature = (value: unknown): value is RewardFeature =>
    typeof value === 'string' && FREE_ALLOWANCE.some(f => f.id === value);

// Google Ad Manager rewarded ad unit, e.g. "/1234567/aullevo_rewarded". Empty = test ads (no earnings).
export const REWARDED_AD_UNIT: string = (import.meta.env.VITE_REWARDED_AD_UNIT ?? '').trim();

// The server refuses a real ad's reward claimed sooner than this after the ad started (MIN_LIVE_AD_SECONDS in
// api/_rewards-core.ts); a shorter ad waits out the rest before claiming
export const MIN_LIVE_AD_MS = 15_000;

export interface Unlock { until: number; remaining?: number; free?: boolean }
export interface RewardsStatus {
    pro: boolean;
    live: boolean;
    now: number;
    unlocks: Partial<Record<RewardFeature, Unlock>>;
    pass: { until: number } | null;
    passAds: number;       // ads already watched toward the next pass
    passAdsNeeded: number;
    passHours: number;
    adsToday: number;
    dailyLimit: number;
    free: Partial<Record<RewardFeature, number>>; // free uses (or free windows) left today
    freeResetsAt: number;                          // next UTC midnight
}

/** Calls /api/rewards with the signed-in user's Firebase ID token. */
export async function rewardsApi<T>(action: 'status' | 'start' | 'grant', idToken: string, body?: unknown): Promise<T> {
    const res = await fetch(`/api/rewards?action=${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify(body ?? {})
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
    return data as T;
}

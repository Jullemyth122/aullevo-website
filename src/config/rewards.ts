// Free-plan ad unlocks as shown on the site. The server decides what is granted (api/_rewards-core.ts);
// keep these numbers in sync with REWARD_RULES there and in the extension (src/services/rewards.ts).
export type RewardFeature = 'ai' | 'profiles' | 'paginate' | 'typing' | 'json' | 'links' | 'voice';

export interface RewardInfo {
    id: RewardFeature;
    title: string;
    adSeconds: number;
    hours: number;
    uses?: number;
    gives: string;   // "6 AI Smart Fills for 2 hours"
    detail: string;
}

export const REWARDS: Record<RewardFeature, RewardInfo> = {
    ai: {
        id: 'ai', title: 'AI Smart Fill', adSeconds: 60, hours: 2, uses: 6,
        gives: '6 AI Smart Fills for 2 hours',
        detail: 'AI answers the questions keyword fill can’t. Each page the AI helps fill counts as one fill, also during auto-pagination.'
    },
    profiles: {
        id: 'profiles', title: 'More active profiles', adSeconds: 30, hours: 2,
        gives: 'more than 3 active profiles for 2 hours',
        detail: 'Free keeps 3 profiles ON at once. Turn on as many as you need for the next 2 hours.'
    },
    paginate: {
        id: 'paginate', title: 'Auto-pagination', adSeconds: 60, hours: 4,
        gives: 'auto-pagination for 4 hours',
        detail: 'Aullevo fills every page of multi-step forms and clicks Next for you.'
    },
    typing: {
        id: 'typing', title: 'Typing speeds', adSeconds: 20, hours: 4,
        gives: 'Slow and custom typing speeds for 4 hours',
        detail: 'Type answers more slowly, like a person would.'
    },
    json: {
        id: 'json', title: 'JSON imports', adSeconds: 60, hours: 5, uses: 10,
        gives: '10 JSON imports for 5 hours',
        detail: 'On top of the 3 free imports every 2 weeks.'
    },
    links: {
        id: 'links', title: 'Multi-link queue', adSeconds: 60, hours: 5,
        gives: 'up to 10 links in Multi-link for 5 hours',
        detail: 'Free holds 3 links. Queue up to 10 applications and fill them in one batch.'
    },
    voice: {
        id: 'voice', title: 'Voice agent', adSeconds: 60, hours: 2, uses: 2,
        gives: '2 voice sessions for 2 hours',
        detail: 'Talk to Aullevo to fill pages and answer questions. One session lasts up to 10 minutes.'
    }
};

export const REWARD_ORDER: RewardFeature[] = ['ai', 'paginate', 'voice', 'profiles', 'links', 'json', 'typing'];

export const isRewardFeature = (value: unknown): value is RewardFeature =>
    typeof value === 'string' && Object.prototype.hasOwnProperty.call(REWARDS, value);

// Google Ad Manager rewarded ad unit, e.g. "/1234567/aullevo_rewarded". Empty = test ads (no earnings).
export const REWARDED_AD_UNIT: string = (import.meta.env.VITE_REWARDED_AD_UNIT ?? '').trim();

// "1-minute", "30-second" (as in "a 1-minute ad")
export const adLength = (seconds: number) => seconds >= 60 && seconds % 60 === 0 ? `${seconds / 60}-minute` : `${seconds}-second`;

// "1 min", "30 s" (button labels)
export const adLengthShort = (seconds: number) => seconds >= 60 && seconds % 60 === 0 ? `${seconds / 60} min` : `${seconds} s`;

export interface Unlock { until: number; remaining?: number }
export interface RewardsStatus {
    pro: boolean;
    live: boolean;
    now: number;
    unlocks: Partial<Record<RewardFeature, Unlock>>;
    adsToday: number;
    dailyLimit: number;
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

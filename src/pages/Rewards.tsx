import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { onAuthStateChanged, signInWithPopup, type User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../config/firebase';
import SEO from '../components/SEO';
import { logEvent } from '../utils/analytics';
import {
    REWARDS, REWARD_ORDER, REWARDED_AD_UNIT, adLength, adLengthShort, isRewardFeature, rewardsApi,
    type RewardFeature, type RewardsStatus, type Unlock
} from '../config/rewards';

// The extension opens /rewards?feature=ai when a Free user needs an unlock. The user watches a short ad here,
// /api/rewards opens the unlock for their account, and the extension picks it up (AULLEVO_REWARD_GRANTED).

type Phase = 'idle' | 'starting' | 'playing' | 'granting' | 'done';
type AdOutcome = 'granted' | 'closed' | 'no-fill' | 'unsupported';

const timeOf = (ms: number) => new Date(ms).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

function unlockText(feature: RewardFeature, unlock: Unlock | undefined, now: number): string | null {
    if (!unlock || unlock.until <= now) return null;
    const info = REWARDS[feature];
    if (info.uses !== undefined) {
        const left = unlock.remaining ?? 0;
        return left > 0 ? `${left} left until ${timeOf(unlock.until)}` : `All used (unlock ends ${timeOf(unlock.until)})`;
    }
    return `Unlocked until ${timeOf(unlock.until)}`;
}

// Tells the Aullevo extension who is signed in (it links its own token from this) — same message as the Login page
async function sendSignInToExtension(user: User) {
    try {
        window.postMessage({ type: 'AULLEVO_WEB_AUTH', idToken: await user.getIdToken() }, window.location.origin);
    } catch { /* extension not installed */ }
}

/* ── Google Ad Manager rewarded ad (only when VITE_REWARDED_AD_UNIT is set) ── */

// The part of Google Publisher Tag (gpt.js) used here
interface GptSlot { addService(service: GptPubAds): GptSlot }
interface GptEvent { slot: GptSlot; isEmpty?: boolean; makeRewardedVisible?: () => void }
type GptListener = (event: GptEvent) => void;
interface GptPubAds {
    addEventListener(type: string, listener: GptListener): void;
    removeEventListener(type: string, listener: GptListener): void;
}
interface GoogleTag {
    apiReady?: boolean;
    cmd: { push(fn: () => void): void };
    enums: { OutOfPageFormat: { REWARDED: unknown } };
    defineOutOfPageSlot(adUnit: string, format: unknown): GptSlot | null;
    pubads(): GptPubAds;
    enableServices(): void;
    display(slot: GptSlot): void;
    destroySlots(slots: GptSlot[]): void;
}

declare global {
    interface Window { googletag?: GoogleTag }
}

let gptLoading: Promise<void> | null = null;
function loadGpt(): Promise<void> {
    if (window.googletag?.apiReady) return Promise.resolve();
    gptLoading ??= new Promise((resolve, reject) => {
        window.googletag = window.googletag || ({ cmd: [] } as unknown as GoogleTag);
        const s = document.createElement('script');
        s.src = 'https://securepubads.g.doubleclick.net/tag/js/gpt.js';
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => { gptLoading = null; reject(new Error('Ads are blocked in this browser (an ad blocker or privacy shield).')); };
        document.head.appendChild(s);
    });
    return gptLoading;
}

async function showRewardedAd(adUnit: string): Promise<AdOutcome> {
    await loadGpt();
    return new Promise((resolve) => {
        const googletag = window.googletag as GoogleTag;
        googletag.cmd.push(() => {
            const slot = googletag.defineOutOfPageSlot(adUnit, googletag.enums.OutOfPageFormat.REWARDED);
            if (!slot) return resolve('unsupported'); // this page or device can't show rewarded ads
            let granted = false;
            const pubads = googletag.pubads();
            const done = (outcome: AdOutcome) => {
                pubads.removeEventListener('rewardedSlotReady', onReady);
                pubads.removeEventListener('rewardedSlotGranted', onGranted);
                pubads.removeEventListener('rewardedSlotClosed', onClosed);
                pubads.removeEventListener('slotRenderEnded', onRendered);
                googletag.destroySlots([slot]);
                resolve(outcome);
            };
            const onReady: GptListener = (e) => { if (e.slot === slot) e.makeRewardedVisible?.(); };
            const onGranted: GptListener = (e) => { if (e.slot === slot) granted = true; };
            const onClosed: GptListener = (e) => { if (e.slot === slot) done(granted ? 'granted' : 'closed'); };
            const onRendered: GptListener = (e) => { if (e.slot === slot && e.isEmpty) done('no-fill'); };
            pubads.addEventListener('rewardedSlotReady', onReady);
            pubads.addEventListener('rewardedSlotGranted', onGranted);
            pubads.addEventListener('rewardedSlotClosed', onClosed);
            pubads.addEventListener('slotRenderEnded', onRendered);
            slot.addService(pubads);
            googletag.enableServices();
            googletag.display(slot);
        });
    });
}

/* ── Sponsor break: until Google video ads are connected, the countdown shows cards from public/sponsors.json ── */

interface SponsorCard {
    id: string;
    type: 'house' | 'affiliate' | 'sponsor';
    enabled?: boolean;
    weight?: number;
    title: string;
    text: string;
    cta: string;
    url: string;
    image?: string;
}

// Shown when sponsors.json can't be loaded
const FALLBACK_CARDS: SponsorCard[] = [{
    id: 'aullevo-pro', type: 'house', weight: 1, title: 'Skip the ads with Aullevo Pro',
    text: 'Unlimited AI Smart Fill, auto-pagination, the voice agent and automatic resume uploads.', cta: 'See Pro plans', url: '/login'
}];

const SPONSOR_LABEL: Record<SponsorCard['type'], string> = {
    house: 'From Aullevo',
    sponsor: 'Sponsored',
    affiliate: 'Sponsored · we may earn a commission'
};

// Weighted order: heavier cards come up more often, none twice in a row
function sponsorOrder(cards: SponsorCard[]): SponsorCard[] {
    const pool = cards.flatMap(c => Array.from({ length: Math.max(1, Math.min(10, Math.round(c.weight ?? 1))) }, () => c));
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.filter((c, i) => i === 0 || c.id !== pool[i - 1].id);
}

function useSponsors(): { cards: SponsorCard[]; rotateSeconds: number } {
    const [state, setState] = useState<{ cards: SponsorCard[]; rotateSeconds: number }>({ cards: FALLBACK_CARDS, rotateSeconds: 15 });
    useEffect(() => {
        let alive = true;
        fetch('/sponsors.json', { cache: 'no-cache' })
            .then(r => (r.ok ? r.json() : null))
            .then((data: { cards?: SponsorCard[]; rotateSeconds?: number } | null) => {
                const cards = (data?.cards ?? []).filter(c => c.enabled !== false && c.title && c.url && /^(https:\/\/|\/|mailto:)/.test(c.url));
                if (alive && cards.length) setState({ cards: sponsorOrder(cards), rotateSeconds: Math.max(5, data?.rotateSeconds ?? 15) });
            })
            .catch(() => { /* keep the fallback */ });
        return () => { alive = false; };
    }, []);
    return state;
}

/** The countdown before a reward; it only runs while this tab is visible. */
const SponsorBreak: React.FC<{ seconds: number; feature: RewardFeature; onFinished: () => void }> = ({ seconds, feature, onFinished }) => {
    const [left, setLeft] = useState(seconds);
    const finished = useRef(false);
    const { cards, rotateSeconds } = useSponsors();
    const elapsed = seconds - left;
    const card = cards[Math.floor(elapsed / rotateSeconds) % cards.length];

    // One view per card shown (Google Analytics / Vercel events: sponsor_view, sponsor_click)
    useEffect(() => {
        if (card) logEvent('sponsor_view', { sponsor: card.id, type: card.type, feature });
    }, [card, feature]);

    useEffect(() => {
        let last = performance.now(), remaining = seconds * 1000;
        const id = window.setInterval(() => {
            const now = performance.now();
            if (!document.hidden) remaining -= now - last; // a hidden tab doesn't count
            last = now;
            setLeft(Math.max(0, Math.ceil(remaining / 1000)));
            if (remaining <= 0 && !finished.current) {
                finished.current = true;
                window.clearInterval(id);
                onFinished();
            }
        }, 250);
        return () => window.clearInterval(id);
    }, [seconds, onFinished]);

    const progress = 1 - left / seconds;
    const external = card && !card.url.startsWith('/');
    return (
        <div className="rewards-ad" role="dialog" aria-modal="true" aria-label="Sponsor break">
            <div className="rewards-ad__frame">
                <span className="rewards-ad__tag">{card ? SPONSOR_LABEL[card.type] : 'Sponsor break'}</span>
                {card && (
                    <div className="rewards-ad__screen" key={card.id}>
                        <img src={card.image || '/logo.png'} alt="" className="rewards-ad__logo" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        <p className="rewards-ad__title">{card.title}</p>
                        <p className="rewards-ad__text">{card.text}</p>
                        <a className="rewards-ad__cta" href={card.url} target="_blank"
                            rel={card.type === 'house' && !external ? 'noopener' : 'sponsored noopener noreferrer'}
                            onClick={() => logEvent('sponsor_click', { sponsor: card.id, type: card.type, feature })}>
                            {card.cta} ↗
                        </a>
                    </div>
                )}
                <div className="rewards-ad__bar" aria-hidden="true"><i style={{ width: `${progress * 100}%` }} /></div>
                <p className="rewards-ad__count" aria-live="polite">{left > 0 ? `Reward in ${left}s` : 'Unlocking…'}</p>
                <p className="rewards-ad__note">Links open in a new tab; the timer pauses until you come back. These cards help keep Aullevo free.</p>
            </div>
        </div>
    );
};

const Rewards: React.FC = () => {
    const [params, setParams] = useSearchParams();
    const requested = params.get('feature');
    const [feature, setFeature] = useState<RewardFeature>(isRewardFeature(requested) ? requested : 'ai');
    const fromExtension = params.get('source') === 'extension';

    const [user, setUser] = useState<User | null>(null);
    const [authReady, setAuthReady] = useState(false);
    const [status, setStatus] = useState<RewardsStatus | null>(null);
    const [phase, setPhase] = useState<Phase>('idle');
    const [error, setError] = useState('');
    const [adSeconds, setAdSeconds] = useState(0);
    const nonceRef = useRef('');
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const id = window.setInterval(() => setNow(Date.now()), 15000);
        return () => window.clearInterval(id);
    }, []);

    const refresh = useCallback(async (u: User) => {
        try {
            setStatus(await rewardsApi<RewardsStatus>('status', await u.getIdToken()));
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        }
    }, []);

    // Sign-in state; first sign-in creates the Free account doc (same fields as the Login page)
    useEffect(() => onAuthStateChanged(auth, async (u) => {
        setUser(u && !u.isAnonymous ? u : null);
        setAuthReady(true);
        if (!u || u.isAnonymous) return;
        try {
            const ref = doc(db, 'users', u.uid);
            if (!(await getDoc(ref)).exists()) {
                await setDoc(ref, { uid: u.uid, email: u.email, displayName: u.displayName, photoURL: u.photoURL, isPro: false, createdAt: new Date() }, { merge: true });
            }
        } catch (err) {
            console.error('Could not create the account record:', err);
        }
        void sendSignInToExtension(u);
        void refresh(u);
    }), [refresh]);

    // The extension's content script loads after the page: send the sign-in again when it says it's ready
    useEffect(() => {
        const onMessage = (event: MessageEvent) => {
            if (event.source === window && event.data?.type === 'AULLEVO_EXTENSION_READY' && auth.currentUser) {
                void sendSignInToExtension(auth.currentUser);
            }
        };
        window.addEventListener('message', onMessage);
        return () => window.removeEventListener('message', onMessage);
    }, []);

    const choose = (f: RewardFeature) => {
        if (phase !== 'idle' && phase !== 'done') return;
        setFeature(f);
        setPhase('idle');
        setError('');
        const next = new URLSearchParams(params);
        next.set('feature', f);
        setParams(next, { replace: true });
    };

    const grant = useCallback(async () => {
        if (!auth.currentUser) return;
        setPhase('granting');
        try {
            const result = await rewardsApi<RewardsStatus & { feature: RewardFeature; unlock: Unlock }>('grant', await auth.currentUser.getIdToken(), { nonce: nonceRef.current });
            setStatus(result);
            setPhase('done');
            // The extension refreshes its unlocks (and closes this tab if it opened it)
            window.postMessage({ type: 'AULLEVO_REWARD_GRANTED', feature: result.feature, unlock: result.unlock }, window.location.origin);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
            setPhase('idle');
        }
    }, []);

    const watch = async () => {
        if (!user) return;
        setError('');
        setAdSeconds(0);
        setPhase('starting');
        try {
            const started = await rewardsApi<{ nonce: string; adSeconds: number; live: boolean }>('start', await user.getIdToken(), { feature });
            nonceRef.current = started.nonce;
            if (REWARDED_AD_UNIT && started.live) {
                setPhase('playing');
                const outcome = await showRewardedAd(REWARDED_AD_UNIT);
                if (outcome === 'granted') return void grant();
                setPhase('idle');
                setError(outcome === 'closed' ? 'The ad was closed before the end, so nothing was unlocked. Try again.'
                    : outcome === 'no-fill' ? 'No ad is available right now. Please try again in a few minutes.'
                        : 'This browser can’t show rewarded ads. Try Chrome or Edge without an ad blocker.');
                return;
            }
            setAdSeconds(started.adSeconds);
            setPhase('playing');
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
            setPhase('idle');
        }
    };

    const signIn = async () => {
        setError('');
        try { await signInWithPopup(auth, googleProvider); } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        }
    };

    const info = REWARDS[feature];
    const current = status ? unlockText(feature, status.unlocks[feature], Math.max(now, status.now)) : null;
    const outOfAds = Boolean(status && status.adsToday >= status.dailyLimit);

    return (
        <div className="rewards-page">
            <SEO title="Unlock with a short ad | Aullevo" description="Free Aullevo users can unlock AI Smart Fill, auto-pagination, voice and more by watching a short ad." canonicalPath="/rewards" />
            <header className="rewards-head">
                <span className="rewards-eyebrow">Aullevo Free</span>
                <h1>Unlock with a short ad</h1>
                <p>Watch one short ad and Aullevo unlocks a feature on your account for a few hours. Pro skips the ads and keeps everything unlocked.</p>
            </header>

            <div className="rewards-layout">
                <section className="rewards-main glass-card" aria-labelledby="rewards-feature">
                    <span className="rewards-label">You’re unlocking</span>
                    <h2 id="rewards-feature">{info.title}</h2>
                    <p className="rewards-gives">Watch a {adLength(info.adSeconds)} ad to get <strong>{info.gives}</strong>.</p>
                    <p className="rewards-detail">{info.detail}</p>

                    {!authReady ? <div className="spinner" aria-label="Loading" /> : !user ? (
                        <div className="rewards-actions">
                            <p className="rewards-note">Unlocks are saved to your Aullevo account, so sign in first (the same Google account you use in the extension).</p>
                            <button type="button" className="rewards-btn" onClick={signIn}>Sign in with Google</button>
                        </div>
                    ) : status?.pro ? (
                        <div className="rewards-done">
                            <strong>You’re on Pro.</strong> Everything is already unlocked, no ads needed.
                        </div>
                    ) : phase === 'done' ? (
                        <div className="rewards-done" role="status">
                            <strong>Unlocked!</strong> {unlockText(feature, status?.unlocks[feature], Math.max(now, status?.now ?? 0))}.{' '}
                            {fromExtension ? 'You can go back to Aullevo; it’s ready.' : 'Open Aullevo to use it.'}
                            <button type="button" className="rewards-btn rewards-btn--quiet" onClick={() => setPhase('idle')}>Watch another</button>
                        </div>
                    ) : (
                        <div className="rewards-actions">
                            {current && <p className="rewards-current">Currently: {current}. Watching again resets it.</p>}
                            <button type="button" className="rewards-btn" onClick={watch} disabled={phase !== 'idle' || outOfAds}>
                                {phase === 'starting' ? 'Starting…' : phase === 'granting' ? 'Unlocking…' : `▶ Watch ad (${adLengthShort(info.adSeconds)})`}
                            </button>
                            {status && <p className="rewards-note">Ads watched today: {status.adsToday} of {status.dailyLimit}.</p>}
                        </div>
                    )}
                    {error && <p className="rewards-error" role="alert">{error}</p>}
                    <p className="rewards-pro">Tired of ads? <Link to="/login">Upgrade to Pro</Link> for unlimited use of everything, including the voice agent.</p>
                </section>

                <aside className="rewards-list" aria-label="Everything you can unlock">
                    <h3>Everything you can unlock</h3>
                    <ul>
                        {REWARD_ORDER.map((f) => {
                            const r = REWARDS[f];
                            const active = status ? unlockText(f, status.unlocks[f], Math.max(now, status.now)) : null;
                            return (
                                <li key={f}>
                                    <button type="button" className={`rewards-item ${f === feature ? 'is-current' : ''}`} onClick={() => choose(f)} aria-pressed={f === feature}>
                                        <b>{r.title}</b>
                                        <span>{adLength(r.adSeconds)} ad → {r.gives}</span>
                                        {active && <em>{active}</em>}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                    <p className="rewards-note">Keyword fill, 3 active profiles, 3 Multi-link links and 3 JSON imports every 2 weeks stay free without ads. Document uploads need Pro.</p>
                </aside>
            </div>

            {phase === 'playing' && adSeconds > 0 && <SponsorBreak seconds={adSeconds} feature={feature} onFinished={grant} />}
        </div>
    );
};

export default Rewards;

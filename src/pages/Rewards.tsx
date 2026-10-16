import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { onAuthStateChanged, signInWithPopup, type User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../config/firebase';
import SEO from '../components/SEO';
import { logEvent } from '../utils/analytics';
import {
    FREE_ALLOWANCE, MIN_LIVE_AD_MS, PASS_ADS, PASS_EXTRAS, PASS_HOURS, REWARDED_AD_UNIT, isRewardFeature, rewardsApi,
    type RewardsStatus
} from '../config/rewards';

// The extension opens /rewards?feature=ai when a Free user hits a limit. The user watches 2 short ads here (the
// pass), /api/rewards unlocks everything on their account for 5 hours, and the extension picks it up
// (AULLEVO_REWARD_GRANTED). Ads can be watched any time; passes stack.

type Phase = 'idle' | 'starting' | 'playing' | 'granting' | 'done';
type AdOutcome = 'granted' | 'closed' | 'no-fill' | 'unsupported';

const timeOf = (ms: number) => new Date(ms).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

// "4h 12m" / "35m"
function hoursLeft(ms: number): string {
    const m = Math.max(0, Math.round(ms / 60000));
    return m >= 60 ? `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m` : `${m}m`;
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

/* ── Test ad: until Google rewarded video ads are connected (VITE_REWARDED_AD_UNIT), a countdown stands in ── */

/** The countdown before a reward; it only runs while this tab is visible. */
const TestAd: React.FC<{ seconds: number; feature: string; onFinished: () => void }> = ({ seconds, feature, onFinished }) => {
    const [left, setLeft] = useState(seconds);
    const finished = useRef(false);

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
    return (
        <div className="rewards-ad" role="dialog" aria-modal="true" aria-label="Ad break">
            <div className="rewards-ad__frame">
                <span className="rewards-ad__tag">Ad break</span>
                <div className="rewards-ad__screen">
                    <img src="/logo.png" alt="" className="rewards-ad__logo" />
                    <p className="rewards-ad__title">Skip the ads with Aullevo Pro</p>
                    <p className="rewards-ad__text">Unlimited AI Smart Fill, auto-pagination, the voice agent and automatic resume uploads. From ₱154.29 for 30 days, no auto-renewal.</p>
                    <a className="rewards-ad__cta" href="/login" target="_blank" rel="noopener"
                        onClick={() => logEvent('rewards_pro_click', { feature })}>
                        See Pro plans ↗
                    </a>
                </div>
                <div className="rewards-ad__bar" aria-hidden="true"><i style={{ width: `${progress * 100}%` }} /></div>
                <p className="rewards-ad__count" aria-live="polite">{left > 0 ? `Reward in ${left}s` : 'Unlocking…'}</p>
                <p className="rewards-ad__note">Keep this tab open: the timer pauses while you're away.</p>
            </div>
        </div>
    );
};

const Rewards: React.FC = () => {
    const [params] = useSearchParams();
    const requested = params.get('feature');
    // Where the user hit a limit in the extension (for analytics); the pass unlocks everything either way
    const feature = isRewardFeature(requested) ? requested : 'pass';
    const fromExtension = params.get('source') === 'extension';

    const [user, setUser] = useState<User | null>(null);
    const [authReady, setAuthReady] = useState(false);
    const [status, setStatus] = useState<RewardsStatus | null>(null);
    const [phase, setPhase] = useState<Phase>('idle');
    const [error, setError] = useState('');
    const [adSeconds, setAdSeconds] = useState(0);
    const nonceRef = useRef('');
    const startedAtRef = useRef(0);
    const [now, setNow] = useState(() => Date.now());
    // The free list starts open beside the pass on wide screens, folded under it on phones
    const [listOpen, setListOpen] = useState(() => typeof window === 'undefined' || window.matchMedia('(min-width: 861px)').matches);

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

    const grant = useCallback(async () => {
        if (!auth.currentUser) return;
        setPhase('granting');
        try {
            // A real ad shorter than the server's minimum: wait out the rest (with a margin) before claiming
            const wait = startedAtRef.current + MIN_LIVE_AD_MS + 1000 - Date.now();
            if (REWARDED_AD_UNIT && wait > 0) await new Promise(r => setTimeout(r, wait));
            const result = await rewardsApi<RewardsStatus & { completed: boolean }>('grant', await auth.currentUser.getIdToken(), { nonce: nonceRef.current });
            setStatus(result);
            if (!result.completed) {
                // Half a pass: the next ad completes it (it needs its own click: browsers only play ads after one)
                setPhase('idle');
                return;
            }
            setPhase('done');
            logEvent('rewards_pass_unlocked', { feature });
            // The extension refreshes its unlocks (and closes this tab if it opened it)
            window.postMessage({ type: 'AULLEVO_REWARD_GRANTED', feature: 'pass', unlock: result.pass }, window.location.origin);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
            setPhase('idle');
        }
    }, [feature]);

    const watch = async () => {
        if (!user) return;
        setError('');
        setAdSeconds(0);
        setPhase('starting');
        try {
            const started = await rewardsApi<{ nonce: string; adSeconds: number; live: boolean }>('start', await user.getIdToken());
            nonceRef.current = started.nonce;
            startedAtRef.current = Date.now();
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

    const at = Math.max(now, status?.now ?? 0);
    const pass = status?.pass && status.pass.until > at ? status.pass : null;
    const adsDone = status?.passAds ?? 0;
    const outOfAds = Boolean(status && status.adsToday >= status.dailyLimit);
    const nextAd = adsDone + 1;

    return (
        <div className="rewards-page">
            <SEO title="Unlock everything with 2 short ads | Aullevo" description={`Aullevo Free includes AI Smart Fill, auto-pagination, voice and more every day. Watch ${PASS_ADS} short ads to unlock everything for ${PASS_HOURS} hours.`} canonicalPath="/rewards" />
            <header className="rewards-head">
                <span className="rewards-eyebrow">Aullevo Free</span>
                <h1>{PASS_ADS} short ads, everything for {PASS_HOURS} hours</h1>
                <p>Aullevo Free gives you part of every feature each day. Watch {PASS_ADS} short ads any time to unlock every feature for {PASS_HOURS} hours, with no limits, resume uploads included. Watch {PASS_ADS} more to add another {PASS_HOURS} hours. The ads keep Aullevo running: thank you! Pro skips the ads.</p>
            </header>

            <div className="rewards-layout">
                <section className="rewards-main glass-card" aria-labelledby="rewards-pass">
                    <span className="rewards-label">The {PASS_HOURS}-hour pass</span>
                    <h2 id="rewards-pass">Everything unlocked for {PASS_HOURS} hours</h2>
                    <p className="rewards-gives">Watch <strong>{PASS_ADS} short ads</strong> in a row to get <strong>unlimited use of every feature for {PASS_HOURS} hours</strong>.</p>
                    <p className="rewards-detail">Unlimited AI Smart Fill, voice agent, auto-pagination, JSON imports, profiles and Multi-link, plus resume and document uploads into forms and JSON export.</p>

                    {!authReady ? <div className="spinner" aria-label="Loading" /> : !user ? (
                        <div className="rewards-actions">
                            <p className="rewards-note">The pass is saved to your Aullevo account, so sign in first (the same Google account you use in the extension).</p>
                            <button type="button" className="rewards-btn" onClick={signIn}>Sign in with Google</button>
                        </div>
                    ) : status?.pro ? (
                        <div className="rewards-done">
                            <strong>You’re on Pro.</strong> Everything is already unlocked, no ads needed.
                        </div>
                    ) : phase === 'done' && pass ? (
                        <div className="rewards-done" role="status">
                            <strong>Everything is unlocked until {timeOf(pass.until)}!</strong>{' '}
                            {fromExtension ? 'You can go back to Aullevo; it’s ready.' : 'Open Aullevo to use it.'}{' '}
                            Thank you for supporting Aullevo.
                            <button type="button" className="rewards-btn rewards-btn--quiet" onClick={() => setPhase('idle')}>Add {PASS_HOURS} more hours</button>
                        </div>
                    ) : (
                        <div className="rewards-actions">
                            {pass && <p className="rewards-current">Your pass runs until {timeOf(pass.until)} ({hoursLeft(pass.until - at)} left). {PASS_ADS} more ads add {PASS_HOURS} hours.</p>}
                            <div className="rewards-steps" aria-label={`Ad ${Math.min(nextAd, PASS_ADS)} of ${PASS_ADS}`}>
                                {Array.from({ length: PASS_ADS }, (_, i) => (
                                    <span key={i} className={`rewards-step ${i < adsDone ? 'is-done' : i === adsDone ? 'is-next' : ''}`}>
                                        {i < adsDone ? '✓' : i + 1}
                                    </span>
                                ))}
                            </div>
                            {adsDone > 0 && <p className="rewards-current">Ad {adsDone} of {PASS_ADS} done. One more unlocks everything (within the hour).</p>}
                            <button type="button" className="rewards-btn" onClick={watch} disabled={phase !== 'idle' || outOfAds}>
                                {phase === 'starting' ? 'Starting…' : phase === 'granting' ? 'Checking…' : `▶ Watch ad ${nextAd} of ${PASS_ADS}`}
                            </button>
                            {status && <p className="rewards-note">Ads watched today: {status.adsToday}.</p>}
                        </div>
                    )}
                    {error && <p className="rewards-error" role="alert">{error}</p>}
                    <p className="rewards-pro">Tired of ads? <Link to="/login">Upgrade to Pro</Link> for unlimited use of everything, no ads, no time limit.</p>
                </section>

                {/* Folds like the extension's Settings; open on wide screens, where it sits beside the pass */}
                <details className="rewards-list" open={listOpen} onToggle={(e) => setListOpen(e.currentTarget.open)}>
                    <summary>
                        <h3>Free every day, no ads</h3>
                        <span className="rewards-list__hint">{pass ? `Everything unlimited until ${timeOf(pass.until)}` : `${FREE_ALLOWANCE.length + 1} features`}</span>
                    </summary>
                    <ul>
                        {FREE_ALLOWANCE.map((f) => (
                            <li key={f.id}>
                                <div className="rewards-item">
                                    <b>{f.title}</b>
                                    <span>{f.free}</span>
                                    {pass && <em>Unlimited until {timeOf(pass.until)}</em>}
                                </div>
                            </li>
                        ))}
                        <li>
                            <div className="rewards-item">
                                <b>{PASS_EXTRAS.join(' · ')}</b>
                                <span>With the pass or Pro</span>
                                {pass && <em>Unlocked until {timeOf(pass.until)}</em>}
                            </div>
                        </li>
                    </ul>
                    <p className="rewards-note">Daily free uses reset at {status ? timeOf(status.freeResetsAt) : 'midnight UTC'}. Keyword fill is always free and unlimited.</p>
                </details>
            </div>

            {phase === 'playing' && adSeconds > 0 && <TestAd seconds={adSeconds} feature={feature} onFinished={grant} />}
        </div>
    );
};

export default Rewards;

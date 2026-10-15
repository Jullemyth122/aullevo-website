import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, googleProvider } from '../config/firebase';
import { signInWithPopup, onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, query, where } from 'firebase/firestore';
import DonateButton from './DonateButton';
import SEO from '../components/SEO';
import { PLANS, formatUsd, isPlanId, type PlanId } from '../config/plans';

const evaluateProStatus = (data: any): { isActive: boolean; expiresAt: string | null; isExpired: boolean } => {
    if (!data) return { isActive: false, expiresAt: null, isExpired: false };
    const hasProFlag = Boolean(data.isPro);
    const exp = data.proExpiresAt || null;
    if (!hasProFlag) {
        return { isActive: false, expiresAt: exp, isExpired: false };
    }
    if (exp) {
        const isStillValid = new Date(exp).getTime() > Date.now();
        return {
            isActive: isStillValid,
            expiresAt: exp,
            isExpired: !isStillValid
        };
    }
    // isPro is true with no expiration date (Lifetime, Admin Grant, or manual DB flag)
    return { isActive: true, expiresAt: null, isExpired: false };
};

// Which plan the last payment was for (older docs say 'pro' = the 30-day plan)
const readPlan = (data: { subscriptionPlan?: unknown } | undefined): PlanId =>
    (isPlanId(data?.subscriptionPlan) ? data.subscriptionPlan : 'monthly');

const DAY_MS = 24 * 60 * 60 * 1000;
const PRO_PRICE_SUMMARY = `${formatUsd(PLANS.monthly)} / 30 days, ${formatUsd(PLANS.yearly)} / year, or ${formatUsd(PLANS.lifetime)} once for lifetime`;

type PlanState = 'pro' | 'pending' | 'expired' | 'free';
// Where PayMongo sent the buyer back to (?payment=paymongo | cancelled)
type PaymongoReturn = 'checking' | 'paid' | 'waiting' | 'cancelled' | null;

const VERIFY_ATTEMPTS = 6;
const VERIFY_INTERVAL_MS = 4000;
type ExtensionStatus = 'not-detected' | 'detected' | 'connected' | 'error';

const PLAN_STATUS_LABELS: Record<PlanState, string> = {
    pro: 'Active',
    pending: 'Activating',
    expired: 'Expired',
    free: 'Free'
};

const EXTENSION_STATUS_LABELS: Record<ExtensionStatus, string> = {
    connected: 'Connected',
    detected: 'Connecting…',
    error: 'Error',
    'not-detected': 'Not detected'
};

const PRO_FEATURES = [
    { title: 'No ads, everything unlocked', description: 'Free users watch short ads to unlock features for a few hours. Pro never shows an ad.' },
    { title: 'Unlimited Voice mode', description: 'Talk to Aullevo to fill pages or single questions, dictate answers, and manage profiles hands-free (your ElevenLabs key). Free gets 2 sessions per ad.' },
    { title: 'Unlimited AI Smart Fill', description: 'No limit on AI answers (Gemini, ChatGPT, Claude, or your own server). Free gets 6 fills per ad.' },
    { title: 'Unlimited active profiles & links', description: 'Keep every profile on at once and queue as many Multi-link applications as you like. Free allows 3 of each.' },
    { title: 'Automatic document uploads', description: 'Your resume, cover letter, and IDs go to the right upload fields.' },
    { title: 'Every typing speed', description: 'Slow and custom typing speeds, any time.' },
    { title: 'Unlimited JSON imports & download', description: 'Import as often as you like (Free allows 3 every 2 weeks, plus 10 per ad) and download profiles as backup files.' },
    { title: 'Auto-Pagination', description: 'Fills every page of multi-step forms, clicks Next, and submits for you. Free gets 4 hours per ad.' }
];

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

// Sends auth state to the Aullevo extension's content script.
// idToken lets the extension verify the account and read isPro from Firestore itself
// (the extension does not trust the isPro value in this message).
const broadcastToExtension = async (currentUser: User, isActive: boolean, expiresAt: string | null) => {
    try {
        const idToken = await currentUser.getIdToken();
        window.postMessage({
            type: 'AULLEVO_WEB_AUTH',
            idToken,
            user: {
                uid: currentUser.uid,
                email: currentUser.email,
                displayName: currentUser.displayName,
                photoURL: currentUser.photoURL,
                isPro: isActive,
                proExpiresAt: expiresAt
            }
        }, window.location.origin);
    } catch (err) {
        console.warn('Could not broadcast auth to extension:', err);
    }
};

const Login: React.FC = () => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isPro, setIsPro] = useState(false);
    const [proExpiresAt, setProExpiresAt] = useState<string | null>(null);
    const [planId, setPlanId] = useState<PlanId>('monthly');
    // Real extension status, reported back by the Aullevo extension's content script
    const [extensionStatus, setExtensionStatus] = useState<ExtensionStatus>('not-detected');
    const [extensionError, setExtensionError] = useState<string | null>(null);
    // A PayPal/GCash payment waiting for manual activation
    const [hasPendingPayment, setHasPendingPayment] = useState(false);
    const [paymongoReturn, setPaymongoReturn] = useState<PaymongoReturn>(() => {
        const payment = new URLSearchParams(window.location.search).get('payment');
        return payment === 'paymongo' ? 'checking' : payment === 'cancelled' ? 'cancelled' : null;
    });
    const navigate = useNavigate();

    // Back from PayMongo checkout: ask the server to confirm the payment. The webhook usually
    // activates Pro first; this covers a slow or missing webhook.
    useEffect(() => {
        if (new URLSearchParams(window.location.search).has('payment')) {
            window.history.replaceState(window.history.state, '', window.location.pathname);
        }
        if (paymongoReturn !== 'checking' || !user?.uid) return;

        let cancelled = false;
        (async () => {
            for (let attempt = 0; attempt < VERIFY_ATTEMPTS && !cancelled; attempt++) {
                try {
                    const idToken = await auth.currentUser?.getIdToken();
                    const res = await fetch('/api/paymongo?action=verify', {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${idToken}` }
                    });
                    const data = await res.json().catch(() => ({}));
                    if (data.status === 'paid') {
                        if (!cancelled) setPaymongoReturn('paid');
                        return;
                    }
                } catch (err) {
                    console.warn('Could not confirm PayMongo payment yet:', err);
                }
                await new Promise((resolve) => setTimeout(resolve, VERIFY_INTERVAL_MS));
            }
            if (!cancelled) setPaymongoReturn('waiting');
        })();
        return () => { cancelled = true; };
    }, [paymongoReturn, user?.uid]);

    // Handshake with the extension:
    // - AULLEVO_EXTENSION_READY: extension just loaded on this page → re-send the sign-in token
    //   (covers the case where our first broadcast happened before the extension was listening)
    // - AULLEVO_EXTENSION_STATUS: extension verified the token against Firestore (or failed)
    useEffect(() => {
        const handleExtensionMessage = (event: MessageEvent) => {
            if (event.source !== window || event.origin !== window.location.origin) return;
            const data = event.data;
            if (data?.type === 'AULLEVO_EXTENSION_READY') {
                setExtensionStatus(prev => (prev === 'connected' ? prev : 'detected'));
                if (auth.currentUser) {
                    broadcastToExtension(auth.currentUser, isPro, proExpiresAt);
                }
            } else if (data?.type === 'AULLEVO_EXTENSION_STATUS') {
                setExtensionStatus(data.success ? 'connected' : 'error');
                setExtensionError(data.success ? null : (data.error || 'Could not verify account.'));
            }
        };
        window.addEventListener('message', handleExtensionMessage);
        return () => window.removeEventListener('message', handleExtensionMessage);
    }, [isPro, proExpiresAt]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setLoading(true);
            try {
                if (currentUser) {
                    setUser(currentUser);

                    // Initialize user document if not exists
                    const userRef = doc(db, 'users', currentUser.uid);
                    let userDocExists = false;

                    try {
                        const userSnap = await getDoc(userRef);
                        if (userSnap.exists()) {
                            const { isActive, expiresAt } = evaluateProStatus(userSnap.data());
                            setIsPro(isActive);
                            setProExpiresAt(expiresAt);
                            setPlanId(readPlan(userSnap.data()));
                            try {
                                localStorage.setItem('aullevo_is_pro', isActive ? 'true' : 'false');
                                if (expiresAt) localStorage.setItem('aullevo_pro_expires_at', expiresAt);
                                else localStorage.removeItem('aullevo_pro_expires_at');
                            } catch { }
                            userDocExists = true;

                            // Broadcast auth state + isPro for Chrome Extension content script sync
                            await broadcastToExtension(currentUser, isActive, expiresAt);
                        }
                    } catch (dbErr) {
                        console.error("Firestore read error:", dbErr);
                    }

                    if (!userDocExists) {
                        try {
                            await setDoc(userRef, {
                                uid: currentUser.uid,
                                email: currentUser.email,
                                displayName: currentUser.displayName,
                                photoURL: currentUser.photoURL,
                                isPro: false,
                                createdAt: new Date()
                            }, { merge: true });
                        } catch (dbWriteErr) {
                            console.error("Firestore write error:", dbWriteErr);
                        }
                        setIsPro(false);
                        setProExpiresAt(null);
                        try {
                            localStorage.setItem('aullevo_is_pro', 'false');
                            localStorage.removeItem('aullevo_pro_expires_at');
                        } catch { }
                    }

                    // Listen in real-time to Pro changes (e.g. if they pay)
                    const unsubSnap = onSnapshot(userRef, (docSnap) => {
                        if (docSnap.exists()) {
                            const { isActive, expiresAt } = evaluateProStatus(docSnap.data());
                            setIsPro(isActive);
                            setProExpiresAt(expiresAt);
                            setPlanId(readPlan(docSnap.data()));
                            try {
                                localStorage.setItem('aullevo_is_pro', isActive ? 'true' : 'false');
                                if (expiresAt) localStorage.setItem('aullevo_pro_expires_at', expiresAt);
                                else localStorage.removeItem('aullevo_pro_expires_at');
                            } catch { }

                            // Broadcast updated isPro to extension in real-time
                            broadcastToExtension(currentUser, isActive, expiresAt);
                        }
                    }, (snapErr) => {
                        console.error("Firestore snapshot listener error:", snapErr);
                    });

                    return () => unsubSnap();
                } else {
                    setUser(null);
                    setIsPro(false);
                    setProExpiresAt(null);
                }
            } catch (authErr) {
                console.error("Auth process error:", authErr);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    // Watch this user's pending payment claims (rules only allow reading your own)
    useEffect(() => {
        if (!user?.uid) {
            setHasPendingPayment(false);
            return;
        }
        const pendingQuery = query(
            collection(db, 'paymentClaims'),
            where('uid', '==', user.uid),
            where('status', '==', 'pending')
        );
        return onSnapshot(
            pendingQuery,
            (snap) => setHasPendingPayment(!snap.empty),
            (err) => console.warn('Could not load payment status:', err)
        );
    }, [user?.uid]);

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Error signing in with Google:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            setLoading(true);
            await signOut(auth);
            navigate('/');
        } catch (error) {
            console.error("Error signing out:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="login-page-container">
                <div className="login-card glass-card">
                    <div className="spinner"></div>
                    <p style={{ fontSize: '0.95rem' }}>Loading secure session...</p>
                </div>
            </div>
        );
    }

    const planState: PlanState = isPro ? 'pro' : hasPendingPayment ? 'pending' : proExpiresAt ? 'expired' : 'free';
    const daysLeft = proExpiresAt
        ? Math.max(0, Math.ceil((new Date(proExpiresAt).getTime() - Date.now()) / DAY_MS))
        : null;
    // Pro with no expiry = lifetime (bought, or granted by hand)
    const isLifetime = isPro && !proExpiresAt;
    const currentPlan = PLANS[isLifetime ? 'lifetime' : planId];
    const periodProgress = daysLeft === null ? 100 : Math.min(100, (daysLeft / (currentPlan.days ?? 30)) * 100);

    return (
        <div className="login-page-container">
            <SEO
                title="Login to Aullevo | AI-Powered Automation Dashboard"
                description="Sign in to Aullevo to upgrade to Pro, check your plan status, and connect your browser extension."
                keywords="login aullevo, aullevo account, aullevo pro, connect extension, autofill pro plan"
            />
            {user && !user.isAnonymous ? (
                /* ── AUTHENTICATED: ACCOUNT DASHBOARD ── */
                <div className="account-dashboard animate-fade-in">

                    {/* Identity header */}
                    <header className="account-header">
                        <div className="account-identity">
                            <div className="account-avatar">
                                {user.photoURL ? (
                                    <img src={user.photoURL} alt="" referrerPolicy="no-referrer" />
                                ) : (
                                    <span>{user.displayName?.charAt(0).toUpperCase() || 'U'}</span>
                                )}
                            </div>
                            <div className="account-identity-text">
                                <p className="account-eyebrow">Account</p>
                                <h1 className="account-name">{user.displayName || 'Your account'}</h1>
                                <p className="account-email">{user.email}</p>
                            </div>
                        </div>
                        <button className="account-signout" onClick={handleLogout} type="button">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            Sign out
                        </button>
                    </header>

                    <div className="account-grid">
                        <div className="account-main">

                            {/* Plan */}
                            <section className="account-card" aria-labelledby="plan-heading">
                                <div className="account-card-head">
                                    <h2 id="plan-heading">Plan</h2>
                                    <span className={`status-pill status-pill--${planState}`}>
                                        <span className="status-pill-dot" aria-hidden="true"></span>
                                        {PLAN_STATUS_LABELS[planState]}
                                    </span>
                                </div>

                                <div className="plan-summary">
                                    <div>
                                        <p className="plan-name">{isPro ? `Aullevo Pro · ${currentPlan.name}` : 'Aullevo Free'}</p>
                                        <p className="plan-price">
                                            {isLifetime
                                                ? 'Lifetime access · Paid once, never expires'
                                                : isPro
                                                    ? `${formatUsd(currentPlan)} ${currentPlan.period} · No auto-renewal`
                                                    : `Pro is ${PRO_PRICE_SUMMARY}`}
                                        </p>
                                    </div>
                                    {planState === 'pro' && !isLifetime && (
                                        <DonateButton className="account-cta account-cta--quiet" defaultPlan={planId}>Extend or upgrade</DonateButton>
                                    )}
                                    {(planState === 'free' || planState === 'expired') && (
                                        <DonateButton className="account-cta" defaultPlan={planState === 'expired' ? planId : undefined}>
                                            {planState === 'expired' ? 'Renew Pro' : 'Upgrade to Pro'}
                                        </DonateButton>
                                    )}
                                </div>

                                {isPro && (
                                    <div className="plan-period">
                                        <div className="plan-period-row">
                                            <span className="plan-period-days">
                                                {daysLeft === null ? 'No expiry' : `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left`}
                                            </span>
                                            <span>{proExpiresAt ? `Until ${formatDate(proExpiresAt)}` : 'Lifetime access'}</span>
                                        </div>
                                        <div className="plan-meter" role="presentation">
                                            <span style={{ width: `${periodProgress}%` }}></span>
                                        </div>
                                    </div>
                                )}

                                {paymongoReturn === 'checking' && (
                                    <p className="plan-note" role="status">
                                        Confirming your GCash / Maya / QR Ph payment with PayMongo…
                                    </p>
                                )}
                                {paymongoReturn === 'paid' && (
                                    <p className="plan-note" role="status">
                                        Payment confirmed. Pro is active on this account.
                                    </p>
                                )}
                                {paymongoReturn === 'waiting' && (
                                    <p className="plan-note plan-note--warn" role="status">
                                        PayMongo hasn&apos;t confirmed your payment yet. If you completed it, Pro turns on automatically within a few minutes. Refresh this page to check.
                                    </p>
                                )}
                                {paymongoReturn === 'cancelled' && (
                                    <p className="plan-note" role="status">
                                        Checkout was cancelled and nothing was charged. You can upgrade again anytime.
                                    </p>
                                )}
                                {planState === 'pending' && (
                                    <p className="plan-note">
                                        We&apos;ve received your payment. Pro turns on as soon as it&apos;s confirmed, so there&apos;s nothing else you need to do.
                                    </p>
                                )}
                                {planState === 'expired' && proExpiresAt && (
                                    <p className="plan-note plan-note--warn">
                                        Pro ended on {formatDate(proExpiresAt)}. Your profiles are still on your device; renew to unlock the Pro features again.
                                    </p>
                                )}
                            </section>

                            {/* Features */}
                            <section className="account-card" aria-labelledby="features-heading">
                                <div className="account-card-head">
                                    <h2 id="features-heading">{isPro ? 'Included in your plan' : 'What Pro unlocks'}</h2>
                                </div>
                                <ul className={`feature-checklist ${isPro ? 'is-unlocked' : ''}`}>
                                    {PRO_FEATURES.map((feature) => (
                                        <li key={feature.title}>
                                            <span className="feature-check" aria-hidden="true">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            </span>
                                            <div>
                                                <strong>{feature.title}</strong>
                                                <span>{feature.description}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        </div>

                        <aside className="account-side">

                            {/* Extension */}
                            <section className="account-card" aria-labelledby="extension-heading">
                                <div className="account-card-head">
                                    <h2 id="extension-heading">Extension</h2>
                                    <span className={`status-pill status-pill--ext-${extensionStatus}`}>
                                        <span className="status-pill-dot" aria-hidden="true"></span>
                                        {EXTENSION_STATUS_LABELS[extensionStatus]}
                                    </span>
                                </div>
                                <dl className="account-details">
                                    <div>
                                        <dt>Status</dt>
                                        <dd>
                                            {extensionStatus === 'connected' && 'Linked to this account'}
                                            {extensionStatus === 'detected' && 'Verifying your account…'}
                                            {extensionStatus === 'error' && (extensionError || 'Verification failed')}
                                            {extensionStatus === 'not-detected' && 'Not found in this browser'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt>License</dt>
                                        <dd>{isPro ? 'Pro' : planState === 'expired' ? 'Expired' : 'Free'}</dd>
                                    </div>
                                    <div>
                                        <dt>Profile storage</dt>
                                        <dd>On this device · AES-256</dd>
                                    </div>
                                </dl>
                            </section>

                            {/* Setup help */}
                            <section className="account-card account-card--muted" aria-labelledby="setup-heading">
                                <div className="account-card-head">
                                    <h2 id="setup-heading">
                                        {extensionStatus === 'connected' ? 'Connecting another browser' : 'Connect the extension'}
                                    </h2>
                                </div>
                                <ol className="setup-steps">
                                    <li>Install Aullevo in Chrome, Brave, or Edge.</li>
                                    <li>In the side panel, open <strong>Settings</strong> → <strong>Connect with Aullevo Web</strong>.</li>
                                    <li>Stay signed in here as <strong>{user.email}</strong>. The extension links automatically.</li>
                                </ol>
                                {extensionStatus === 'not-detected' && (
                                    <p className="setup-hint">Already installed? Reload the extension, then refresh this page.</p>
                                )}
                            </section>
                        </aside>
                    </div>
                </div>
            ) : (
                /* ── GUEST: BEAUTIFUL SPLIT DESIGN ── */
                <div className="login-split-layout animate-fade-in">

                    {/* Left Pane: Promotional Showcase */}
                    <div className="login-promo-panel">
                        <div className="promo-badge">Aullevo Pro</div>
                        <h3>Your entire form-filling engine, unlocked.</h3>
                        <p>Sign in to upgrade to Pro ({PRO_PRICE_SUMMARY}), check your plan, and connect the extension for unlimited AI fills, document uploads, and more.</p>

                        <div className="promo-feature-list">
                            <div className="promo-feature-item">
                                <div className="promo-icon-wrapper">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                                <div className="promo-feature-text">
                                    <strong>Instant Pro Verification</strong>
                                    <span>One-click Google authentication seamlessly validates your Pro subscription inside the extension.</span>
                                </div>
                            </div>

                            <div className="promo-feature-item">
                                <div className="promo-icon-wrapper">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                </div>
                                <div className="promo-feature-text">
                                    <strong>100% Local-First Privacy</strong>
                                    <span>Your private resumes and profile vaults remain stored safely on-device under AES-256 encryption.</span>
                                </div>
                            </div>

                            <div className="promo-feature-item">
                                <div className="promo-icon-wrapper">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                    </svg>
                                </div>
                                <div className="promo-feature-text">
                                    <strong>Monthly, Yearly, or Lifetime</strong>
                                    <span>{formatUsd(PLANS.monthly)} for 30 days, {formatUsd(PLANS.yearly)} for a year, or {formatUsd(PLANS.lifetime)} once for lifetime. Nothing renews automatically.</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Pane: Login Card */}
                    <div className="login-card glass-card">
                        <div className="login-prompt-view">
                            <div className="branding-dot"></div>
                            <h1>Access Your Space</h1>
                            <p>Authenticate securely using your primary Google account to access your account dashboard.</p>

                            <button className="btn btn-google-login" onClick={handleGoogleLogin}>
                                <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: '12px' }}>
                                    <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.58 15 0 12 0 7.35 0 3.4 2.67 1.51 6.56l3.86 3C6.27 6.82 8.9 5.04 12 5.04z" />
                                    <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.28 1.47-1.11 2.72-2.36 3.56l3.66 2.84c2.14-1.98 3.73-4.88 3.73-8.55z" />
                                    <path fill="#FBBC05" d="M5.37 14.56c-.24-.72-.37-1.49-.37-2.28s.13-1.56.37-2.28L1.51 7c-.78 1.56-1.23 3.32-1.23 5.17s.45 3.61 1.23 5.17l3.86-2.78z" />
                                    <path fill="#34A853" d="M12 24c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.01.68-2.31 1.09-3.9 1.09-3.1 0-5.73-1.78-6.67-4.52L1.87 17.6C3.76 21.33 7.7 24 12 24z" />
                                </svg>
                                Sign In with Google
                            </button>

                            <div className="login-security-notice">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '6px' }}>
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                                Secure connection & OAuth authenticated by Google
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default Login;

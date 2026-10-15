import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { auth, db, googleProvider } from '../config/firebase';
import { onAuthStateChanged, signInWithPopup, type User } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { PLANS, PLAN_ORDER, PAYPAL_ENABLED, formatUsd, type PlanId } from '../config/plans';
import { useProStatus } from '../hooks/useProStatus';

/* ── SVG Icons ── */

const HeartIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);

const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
    </svg>
);

const WalletIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
        <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
);

const PayPalIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M7 11.5 5.5 20H3.5L5 11.5h2Z" />
        <path d="M7 11.5c0-3 2-5.5 6-5.5s5.5 2.5 5 5.5c-.5 3-3 5-6 5H9.5L9 20H7l2-8.5Z" />
        <path d="M10 11.5c0-2 1-3.5 4-3.5s3.5 1.5 3 3.5c-.5 2-2 3-4 3" />
    </svg>
);

const LockIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

const CloseIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const CheckCircleIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <polyline points="9 12 11.5 14.5 15 9.5" />
    </svg>
);

const ArrowRightIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
    </svg>
);

/* ── Focus Trap Hook ── */

function useFocusTrap(isActive: boolean) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isActive || !containerRef.current) return;

        const container = containerRef.current;
        const focusable = container.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        first?.focus();

        const handleTab = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;
            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last?.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first?.focus();
                }
            }
        };

        container.addEventListener('keydown', handleTab);
        return () => container.removeEventListener('keydown', handleTab);
    }, [isActive]);

    return containerRef;
}

/* ── Component ── */

interface DonateButtonProps {
    className?: string;
    children?: React.ReactNode;
    defaultPlan?: PlanId;
}

const DonateButton: React.FC<DonateButtonProps> = ({ className = '', children, defaultPlan = 'yearly' }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [planId, setPlanId] = useState<PlanId>(defaultPlan);
    // PayPal's buttons are rendered once per open; they read the current plan from here when clicked
    const planRef = useRef<PlanId>(planId);
    const plan = PLANS[planId];
    // Lifetime Pro has nothing left to buy (the server refuses it too)
    const { isLifetime } = useProStatus();
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(false);
    const [paypalError, setPaypalError] = useState<string | null>(null);
    const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
    // GCash / Maya / QR Ph: a personal PayMongo checkout created by /api/paymongo (Pro activates automatically)
    const [paymongoStatus, setPaymongoStatus] = useState<'idle' | 'loading' | 'paid' | 'error'>('idle');
    const [paymongoError, setPaymongoError] = useState<string | null>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const dialogRef = useFocusTrap(isOpen);

    // Auth listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        planRef.current = planId;
    }, [planId]);

    // Body overflow lock
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    // Escape key handler & restore focus on close
    const closeModal = useCallback(() => {
        setIsOpen(false);
        triggerRef.current?.focus();
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeModal();
        };
        if (isOpen) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, closeModal]);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setPaypalError(null);
            setPaymentSuccess(false);
            setPaymongoStatus('idle');
            setPaymongoError(null);
        }
    }, [isOpen]);

    // PayPal SDK loader
    useEffect(() => {
        if (!PAYPAL_ENABLED || !isOpen || !user) return;

        let isMounted = true;

        const renderPaypalButtons = () => {
            if (!(window as any).paypal || !isMounted) return;

            const container = document.getElementById('paypal-button-container');
            if (container) container.innerHTML = '';

            // The plan the open PayPal order was created for (the picker may change before approval)
            let orderPlan: PlanId = planRef.current;

            try {
                const paypalButtons = (window as any).paypal.Buttons({
                    style: {
                        layout: 'vertical',
                        color: 'gold',
                        shape: 'pill',
                        label: 'paypal',
                        height: 45
                    },
                    createOrder: (_data: any, actions: any) => {
                        orderPlan = planRef.current;
                        const selected = PLANS[orderPlan];
                        return actions.order.create({
                            purchase_units: [{
                                amount: { value: selected.usd },
                                description: selected.days === null
                                    ? 'Aullevo Pro - Lifetime Access'
                                    : `Aullevo Pro ${selected.name} - ${selected.days} Days Access`,
                                // "<plan>:<uid>": the server refuses claims for this payment from any other account
                                custom_id: `${orderPlan}:${user.uid}`
                            }]
                        });
                    },
                    onApprove: async (_data: any, actions: any) => {
                        let details: any;
                        try {
                            setAuthLoading(true);
                            details = await actions.order.capture();
                        } catch (err: any) {
                            console.error("PayPal capture error", err);
                            // Card or funding source declined: reopen PayPal so the buyer can pick another one
                            if (String(err?.message || '').includes('INSTRUMENT_DECLINED')) return actions.restart();
                            if (isMounted) {
                                setPaypalError("PayPal couldn't complete the payment. Please try again or use another payment method.");
                                setAuthLoading(false);
                            }
                            return;
                        }
                        try {
                            if (isMounted) {
                                // Pro is NOT granted here: the browser can't be trusted to do that.
                                // Record a pending claim; the owner verifies it in PayPal and activates Pro
                                // from the Firebase console (Firestore rules block isPro writes from clients).
                                // Transaction ID = what PayPal's Activity page shows (capture id); order id kept in the note
                                const capture = details.purchase_units?.[0]?.payments?.captures?.[0];
                                const paidPlan = PLANS[orderPlan];
                                await recordPaymentClaim({
                                    provider: 'paypal',
                                    orderId: String(capture?.id || details.id || ''),
                                    payerEmail: String(details.payer?.email_address || ''),
                                    amount: String(capture?.amount?.value || paidPlan.usd),
                                    currency: 'USD',
                                    // Tells the reviewer what to grant: 30 days, 365 days, or lifetime (no expiry)
                                    note: `${paidPlan.name} plan · PayPal ${String(details.status || 'COMPLETED')} · order ${String(details.id || '')}`
                                });
                                setPaymentSuccess(true);
                            }
                        } catch (err: any) {
                            console.error("Payment claim error", err);
                            if (isMounted) {
                                setPaypalError("Payment went through, but we couldn't record it. Please contact support with your PayPal receipt.");
                            }
                        } finally {
                            if (isMounted) setAuthLoading(false);
                        }
                    },
                    onError: (err: any) => {
                        console.error("PayPal SDK error:", err);
                        if (isMounted) {
                            setPaypalError("An error occurred during PayPal checkout. Please try again.");
                        }
                    }
                });

                if (container && paypalButtons) {
                    paypalButtons.render('#paypal-button-container');
                }
            } catch (err: any) {
                console.error("Failed to render PayPal buttons:", err);
            }
        };

        const existingScript = document.getElementById('paypal-sdk-script');
        if ((window as any).paypal) {
            renderPaypalButtons();
        } else if (existingScript) {
            const loadHandler = () => renderPaypalButtons();
            existingScript.addEventListener('load', loadHandler);
            return () => existingScript.removeEventListener('load', loadHandler);
        } else {
            const script = document.createElement('script');
            script.id = 'paypal-sdk-script';
            const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'sb';
            script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
            script.async = true;
            script.addEventListener('load', () => {
                if (isMounted) renderPaypalButtons();
            });
            script.addEventListener('error', () => {
                if (isMounted) setPaypalError("Failed to load PayPal SDK. Please check your connection.");
            });
            document.head.appendChild(script);
        }

        return () => { isMounted = false; };
    }, [isOpen, user]);

    const handleGoogleLogin = async () => {
        try {
            setAuthLoading(true);
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Google sign in failed in checkout modal:", error);
        } finally {
            setAuthLoading(false);
        }
    };

    // Pending PayPal payment for manual review (see firestore.rules → paymentClaims).
    // The doc id is fixed per transaction, so the same PayPal id can't be claimed twice.
    const recordPaymentClaim = async (claim: { provider: 'paypal'; orderId: string; payerEmail?: string; amount: string; currency: string; note: string }) => {
        if (!user) return;
        await setDoc(doc(db, 'paymentClaims', `${claim.provider}_${claim.orderId}`), {
            uid: user.uid,
            email: user.email || '',
            provider: claim.provider,
            orderId: claim.orderId,
            payerEmail: claim.payerEmail || '',
            amount: claim.amount,
            currency: claim.currency,
            note: claim.note,
            status: 'pending',
            createdAt: serverTimestamp()
        });
    };

    // Asks our server for this account's own PayMongo checkout, then sends the buyer there.
    // PayMongo returns them to /login?payment=paymongo, and Pro is granted server-side once paid.
    const startPaymongoCheckout = async () => {
        if (!user || paymongoStatus === 'loading') return;
        setPaymongoStatus('loading');
        setPaymongoError(null);
        try {
            const res = await fetch('/api/paymongo?action=checkout', {
                method: 'POST',
                headers: { Authorization: `Bearer ${await user.getIdToken()}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan: planId })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || (!data.checkoutUrl && data.status !== 'paid')) {
                throw new Error(data.error || 'Could not start checkout. Please try again.');
            }
            if (data.status === 'paid') {
                setPaymongoStatus('paid');
                return;
            }
            window.location.assign(data.checkoutUrl);
        } catch (err) {
            console.error('PayMongo checkout failed:', err);
            setPaymongoError(err instanceof Error ? err.message : 'Could not start checkout. Please try again.');
            setPaymongoStatus('error');
        }
    };

    /* ── Render Modal ── */

    const modal = isOpen ? ReactDOM.createPortal(
        <div
            className="donate-overlay"
            onClick={closeModal}
            role="presentation"
        >
            <div
                ref={dialogRef}
                className="donate-dialog"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="donate-dialog-title"
                aria-describedby="donate-dialog-desc"
            >
                {/* Close Button */}
                <button
                    className="donate-close"
                    onClick={closeModal}
                    aria-label="Close checkout dialog"
                    type="button"
                >
                    <CloseIcon />
                </button>

                {/* Scrollable Content Area */}
                <div className="donate-scroll-area">

                    {/* Header */}
                    <header className="donate-head">
                        <div className="donate-shield" aria-hidden="true"><HeartIcon /></div>
                        <h2 id="donate-dialog-title">Upgrade to Aullevo Pro</h2>
                        <p id="donate-dialog-desc">
                            Voice mode, unlimited AI Smart Fill, unlimited active profiles, automatic document uploads,
                            Auto-Pagination, Slow &amp; custom typing speeds, unlimited JSON imports, and JSON download.
                        </p>

                        {!isLifetime && (<>
                        <fieldset className="donate-plans">
                            <legend>Choose a plan</legend>
                            {PLAN_ORDER.map((id) => {
                                const option = PLANS[id];
                                return (
                                    <label key={id} className={`donate-plan ${id === planId ? 'is-selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="aullevo-plan"
                                            value={id}
                                            checked={id === planId}
                                            onChange={() => {
                                                setPlanId(id);
                                                setPaymongoStatus('idle');
                                                setPaymongoError(null);
                                            }}
                                        />
                                        {option.badge && <span className="donate-plan-badge">{option.badge}</span>}
                                        <span className="donate-plan-name">{option.name}</span>
                                        <span className="donate-plan-price">{formatUsd(option)}</span>
                                        <span className="donate-plan-period">{option.period}</span>
                                    </label>
                                );
                            })}
                        </fieldset>
                        <p className="donate-plan-note" aria-live="polite">
                            {plan.days === null
                                ? `${formatUsd(plan)} once (₱${plan.php}). Pro forever, no renewals.`
                                : `${formatUsd(plan)} (₱${plan.php}) for ${plan.days} days of Pro. ${plan.note}.`}
                        </p>
                        </>)}
                    </header>

                    {/* Divider */}
                    <div className="donate-divider" aria-hidden="true" />

                    {/* Content */}
                    {!(user && !user.isAnonymous) ? (
                        /* ── Guest: Auth Prompt ── */
                        <div className="modal-auth-prompt">
                            <div className="donate-status-info" role="alert">
                                <span className="status-icon" aria-hidden="true">🔒</span>
                                <p>Please sign in first so your payment is linked to your Aullevo account.</p>
                            </div>
                            <button
                                className="btn-google-login"
                                onClick={handleGoogleLogin}
                                disabled={authLoading}
                                aria-busy={authLoading}
                                type="button"
                            >
                                <GoogleIcon />
                                <span>{authLoading ? 'Signing in…' : 'Sign In with Google'}</span>
                            </button>
                        </div>
                    ) : isLifetime ? (
                        /* ── Lifetime Pro: nothing to buy ── */
                        <div className="donate-ph-done" role="status">
                            <CheckCircleIcon />
                            <div>
                                <strong>You have lifetime Pro</strong>
                                <span>Every Pro feature is unlocked on {user.email} for good. There&apos;s nothing more to buy.</span>
                            </div>
                        </div>
                    ) : (
                        /* ── Authenticated: Payment Options ── */
                        <div className="donate-cards">
                            {/* Logged-in badge */}
                            <div className="donate-logged-in" role="status">
                                <span className="success-badge" aria-label="Authenticated">✓ Live Account</span>
                                <p>Logged in as: <strong>{user.email}</strong></p>
                            </div>

                            {/* How activation works: shown before the payment options so buyers know about the Payment ID */}
                            <ol className="donate-steps" aria-label="How Pro activation works">
                                <li>
                                    <span className="donate-step-num" aria-hidden="true">1</span>
                                    {PAYPAL_ENABLED
                                        ? <span>Pay with <strong>PayPal</strong>, <strong>card</strong>, <strong>GCash</strong>, or <strong>Maya</strong></span>
                                        : <span>Pay with <strong>GCash</strong>, <strong>Maya</strong>, or any <strong>QR Ph</strong> bank app</span>}
                                </li>
                                <li>
                                    <span className="donate-step-num" aria-hidden="true">2</span>
                                    <span><strong>GCash / Maya / QR Ph:</strong> Pro turns on <strong>automatically</strong> right after you pay</span>
                                </li>
                                {PAYPAL_ENABLED && (
                                    <li>
                                        <span className="donate-step-num" aria-hidden="true">3</span>
                                        <span><strong>PayPal / card:</strong> we verify your payment and activate Pro <strong>within 24 hours</strong></span>
                                    </li>
                                )}
                            </ol>

                            {/* Section label */}
                            <h3 className="donate-section-label">Choose a payment method</h3>

                            {PAYPAL_ENABLED && (<>
                            {/* PayPal SDK Checkout */}
                            <div className="paypal-checkout-section" aria-label="Pay with PayPal">
                                <div className="paypal-section-header">
                                    <div className="paypal-icon-wrapper" aria-hidden="true">
                                        <PayPalIcon />
                                    </div>
                                    <div className="paypal-section-title">
                                        <span>Pay with PayPal or Card</span>
                                        <small>{formatUsd(plan)} {plan.period} · activated within 24 hours</small>
                                    </div>
                                </div>

                                {paypalError && (
                                    <div className="paypal-error-banner" role="alert">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                        <span>{paypalError}</span>
                                    </div>
                                )}

                                {paymentSuccess ? (
                                    <div className="paypal-success-banner" role="status" aria-live="polite">
                                        <CheckCircleIcon />
                                        <h4>Payment Received!</h4>
                                        <p>Thank you! Your Pro plan will be activated within 24 hours after we confirm your payment. Your account page will show Pro once it's active.</p>
                                    </div>
                                ) : (
                                    <div id="paypal-button-container" className="paypal-btn-container" aria-label="PayPal checkout buttons"></div>
                                )}
                            </div>

                            {/* Philippines Local Methods Divider */}
                            <div className="donate-alt-divider" aria-hidden="true">
                                <span />
                                <small>Philippines Local Payments</small>
                                <span />
                            </div>
                            </>)}

                            {/* PayMongo: GCash, Maya & QR Ph — personal checkout, activated automatically */}
                            <div className="donate-ph-block">
                                <button
                                    type="button"
                                    onClick={startPaymongoCheckout}
                                    disabled={paymongoStatus === 'loading' || paymongoStatus === 'paid'}
                                    aria-busy={paymongoStatus === 'loading'}
                                    className="donate-option-card donate-option-card--ph"
                                    aria-label={`Pay ${plan.php} Philippine Pesos for ${plan.days === null ? 'lifetime Pro' : `${plan.days} days`} via GCash, Maya, or QR Ph`}
                                >
                                    <div className="donate-card-icon donate-card-icon--paymongo">
                                        <WalletIcon />
                                    </div>
                                    <div className="donate-card-text">
                                        <div className="donate-card-header-row">
                                            <h4>GCash, Maya & QR Ph</h4>
                                            <span className="donate-card-badge donate-card-badge--green">₱{plan.php} {plan.period}</span>
                                        </div>
                                        <p>
                                            {paymongoStatus === 'loading'
                                                ? 'Opening secure PayMongo checkout…'
                                                : 'Scan with GCash, Maya, GoTyme, BPI, or any QR Ph bank app'}
                                        </p>
                                        <div className="donate-wallet-tags" aria-hidden="true">
                                            <span className="tag-pill tag-gcash">GCash</span>
                                            <span className="tag-pill tag-maya">Maya</span>
                                            <span className="tag-pill tag-qrph">QR Ph</span>
                                            <span className="tag-pill tag-bank">Bank apps</span>
                                        </div>
                                    </div>
                                    <div className="donate-arrow">
                                        {paymongoStatus === 'loading' ? <span className="donate-ph-spinner" aria-hidden="true" /> : <ArrowRightIcon />}
                                    </div>
                                </button>

                                {paymongoStatus === 'paid' ? (
                                    <div className="donate-ph-done" role="status" aria-live="polite">
                                        <CheckCircleIcon />
                                        <div>
                                            <strong>Payment confirmed, Pro is active</strong>
                                            <span>Your account page and extension update automatically.</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="donate-ph-note">
                                        {paymongoStatus === 'error' ? (
                                            <small className="donate-ph-error" role="alert">{paymongoError}</small>
                                        ) : (
                                            <small className="donate-ph-hint">
                                                Checkout is linked to <strong>{user.email}</strong>. Pro activates automatically once PayMongo confirms your payment.
                                            </small>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer — always pinned */}
                <footer className="donate-foot">
                    <button
                        className="donate-btn-cancel"
                        onClick={closeModal}
                        type="button"
                    >
                        Maybe Later
                    </button>
                    <div className="donate-secure-text">
                        <LockIcon />
                        <span>256-bit encrypted · Secure checkout</span>
                    </div>
                </footer>
            </div>
        </div>,
        document.body
    ) : null;

    /* ── Trigger Button ── */

    return (
        <>
            <button
                ref={triggerRef}
                id="donate-button"
                className={`btn btn-donate ${className}`}
                onClick={() => {
                    setPlanId(defaultPlan);
                    setIsOpen(true);
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                aria-label="Upgrade to Aullevo Pro"
                aria-haspopup="dialog"
                type="button"
            >
                {children ? children : (
                    <>
                        <span className={`donate-icon ${isHovered ? 'donate-icon--beat' : ''}`}>
                            <HeartIcon />
                        </span>
                        <span>Upgrade to Pro</span>
                    </>
                )}
            </button>
            {modal}
        </>
    );
};

export default DonateButton;

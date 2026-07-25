import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { auth, db, googleProvider } from '../config/firebase';
import { onAuthStateChanged, signInWithPopup, type User } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const KOFI_GLOBAL_LINK = 'https://ko-fi.com/mythxenodo25333';
const PAYMONGO_LOCAL_LINK = 'https://pm.link/org-CkTB77gBCh4xvPkK6c3H6RPt/eZD45JF';

/* ─── SVG Icons ─── */

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

const KofiIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
        <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
        <line x1="6" y1="2" x2="6" y2="4" />
        <line x1="10" y1="2" x2="10" y2="4" />
        <line x1="14" y1="2" x2="14" y2="4" />
    </svg>
);

const WalletIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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

/* ─── Focus Trap Hook ─── */

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

/* ─── Component ─── */

interface DonateButtonProps {
    className?: string;
    children?: React.ReactNode;
}

const DonateButton: React.FC<DonateButtonProps> = ({ className = '', children }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(false);
    const [paypalError, setPaypalError] = useState<string | null>(null);
    const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const dialogRef = useFocusTrap(isOpen);

    // Auth listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

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
        }
    }, [isOpen]);

    // PayPal SDK loader
    useEffect(() => {
        if (!isOpen || !user) return;

        let isMounted = true;

        const renderPaypalButtons = () => {
            if (!(window as any).paypal || !isMounted) return;

            const container = document.getElementById('paypal-button-container');
            if (container) container.innerHTML = '';

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
                        return actions.order.create({
                            purchase_units: [{
                                amount: { value: '7.00' },
                                description: 'Aullevo Pro Lifetime Membership'
                            }]
                        });
                    },
                    onApprove: async (_data: any, actions: any) => {
                        try {
                            setAuthLoading(true);
                            const details = await actions.order.capture();
                            if (isMounted) {
                                const userRef = doc(db, 'users', user.uid);
                                await setDoc(userRef, {
                                    isPro: true,
                                    paymentDetails: {
                                        provider: 'paypal',
                                        orderId: details.id,
                                        payerEmail: details.payer?.email_address || '',
                                        status: details.status || 'COMPLETED',
                                        updatedAt: new Date()
                                    }
                                }, { merge: true });
                                setPaymentSuccess(true);
                            }
                        } catch (err: any) {
                            console.error("Firestore update error", err);
                            if (isMounted) {
                                setPaypalError(err.message || "Failed to update account status. Please contact support.");
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

    const getKofiCheckoutUrl = () => KOFI_GLOBAL_LINK;
    const getPaymongoCheckoutUrl = () => {
        if (!user) return PAYMONGO_LOCAL_LINK;
        return `${PAYMONGO_LOCAL_LINK}?email=${encodeURIComponent(user.email || '')}&uid=${user.uid}`;
    };

    /* ─── Render Modal ─── */

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
                            Unlock lifetime access to advanced AI form filling, unlimited profiles,
                            memories, autopilot links, and priority support.
                        </p>
                        <div className="donate-price-tag" aria-label="Price: $7 one-time payment">
                            <span className="donate-price">$7</span>
                            <span className="donate-price-label">One-time • Lifetime</span>
                        </div>
                    </header>

                    {/* Divider */}
                    <div className="donate-divider" aria-hidden="true" />

                    {/* Content */}
                    {!user ? (
                        /* ── Guest: Auth Prompt ── */
                        <div className="modal-auth-prompt">
                            <div className="donate-status-info" role="alert">
                                <span className="status-icon" aria-hidden="true">⚠️</span>
                                <p>Please sign in first so your payment can be automatically linked to your account.</p>
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
                    ) : (
                        /* ── Authenticated: Payment Options ── */
                        <div className="donate-cards">
                            {/* Logged-in badge */}
                            <div className="donate-logged-in" role="status">
                                <span className="success-badge" aria-label="Authenticated">✓ Live Account</span>
                                <p>Logged in as: <strong>{user.email}</strong></p>
                            </div>

                            {/* Section label */}
                            <h3 className="donate-section-label">Choose a payment method</h3>

                            {/* PayPal SDK Checkout */}
                            <div className="paypal-checkout-section" aria-label="Pay with PayPal">
                                <div className="paypal-section-header">
                                    <div className="paypal-icon-wrapper" aria-hidden="true">
                                        <PayPalIcon />
                                    </div>
                                    <div className="paypal-section-title">
                                        <span>Pay with PayPal</span>
                                        <small>PayPal, Debit or Credit Card — instant activation</small>
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
                                        <h4>Payment Successful!</h4>
                                        <p>Your account has been upgraded to Pro Lifetime. All premium features are now unlocked.</p>
                                    </div>
                                ) : (
                                    <div id="paypal-button-container" className="paypal-btn-container" aria-label="PayPal checkout buttons"></div>
                                )}
                            </div>

                            {/* Alternative Methods Divider */}
                            <div className="donate-alt-divider" aria-hidden="true">
                                <span />
                                <small>or use an alternative</small>
                                <span />
                            </div>

                            {/* Ko-fi */}
                            <a
                                href={getKofiCheckoutUrl()}
                                target="_blank"
                                rel="noreferrer"
                                className="donate-option-card"
                                aria-label="Pay $7 Lifetime via Ko-fi using PayPal or Card"
                            >
                                <div className="donate-card-icon donate-card-icon--kofi"><KofiIcon /></div>
                                <div className="donate-card-text">
                                    <h4>Ko-fi <span className="donate-card-badge">Global</span></h4>
                                    <p>Pay $7 Lifetime via PayPal or Card</p>
                                </div>
                                <div className="donate-arrow"><ArrowRightIcon /></div>
                            </a>

                            {/* Paymongo */}
                            <a
                                href={getPaymongoCheckoutUrl()}
                                target="_blank"
                                rel="noreferrer"
                                className="donate-option-card"
                                aria-label="Pay 390 Philippine Pesos Lifetime via GCash, Maya, or QR Ph"
                            >
                                <div className="donate-card-icon donate-card-icon--paymongo"><WalletIcon /></div>
                                <div className="donate-card-text">
                                    <h4>PayMongo <span className="donate-card-badge donate-card-badge--green">PH Local</span></h4>
                                    <p>Pay ₱390 Lifetime with GCash, Maya, QR Ph</p>
                                </div>
                                <div className="donate-arrow"><ArrowRightIcon /></div>
                            </a>
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
                        <span>256-bit encrypted • Secure checkout</span>
                    </div>
                </footer>
            </div>
        </div>,
        document.body
    ) : null;

    /* ─── Trigger Button ─── */

    return (
        <>
            <button
                ref={triggerRef}
                id="donate-button"
                className={`btn btn-donate ${className}`}
                onClick={() => setIsOpen(true)}
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
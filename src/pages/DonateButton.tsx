import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { auth, googleProvider } from '../config/firebase';
import { onAuthStateChanged, signInWithPopup, type User } from 'firebase/auth';

const KOFI_GLOBAL_LINK = 'https://ko-fi.com/mythxenodo25333';
const PAYMONGO_LOCAL_LINK = 'https://pm.link/org-CkTB77gBCh4xvPkK6c3H6RPt/oMCZpHE';

// SVG Icons
const HeartIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);

const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
    </svg>
);

const KofiIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
        <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
        <line x1="6" y1="2" x2="6" y2="4" />
        <line x1="10" y1="2" x2="10" y2="4" />
        <line x1="14" y1="2" x2="14" y2="4" />
    </svg>
);

const WalletIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
        <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
);

interface DonateButtonProps {
    className?: string;
    children?: React.ReactNode;
}

const DonateButton: React.FC<DonateButtonProps> = ({ className = '', children }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        if (isOpen) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

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

    const modal = isOpen ? ReactDOM.createPortal(
        <div className="donate-overlay" onClick={() => setIsOpen(false)}>
            <div className="donate-dialog glass-card" onClick={(e) => e.stopPropagation()}>
                <button className="donate-close" onClick={() => setIsOpen(false)} aria-label="Close">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                <div className="donate-head">
                    <div className="donate-shield"><HeartIcon /></div>
                    <h3>Upgrade to Aullevo Pro</h3>
                    <p>Unlock lifetime access to advanced AI form filling, memories, multiple profiles, and autopilot links.</p>
                </div>

                {!user ? (
                    <div className="modal-auth-prompt">
                        <div className="donate-status-info">
                            <span className="status-icon">⚠️</span>
                            <p>Please sign in first so your payment can be automatically linked to your account.</p>
                        </div>
                        <button className="btn-google-login" onClick={handleGoogleLogin} disabled={authLoading}>
                            <GoogleIcon />
                            <span>{authLoading ? 'Signing in...' : 'Sign In with Google'}</span>
                        </button>
                    </div>
                ) : (
                    <div className="donate-cards">
                        <div className="donate-logged-in">
                            <span className="success-badge">✓ Live Account</span>
                            <p>Logged in as: <strong>{user.email}</strong></p>
                        </div>

                        {/* Ko-fi */}
                        <a href={getKofiCheckoutUrl()} target="_blank" rel="noreferrer" className="donate-option-card">
                            <div className="donate-card-icon donate-card-icon--kofi"><KofiIcon /></div>
                            <div className="donate-card-text">
                                <h4>Ko-fi (Global)</h4>
                                <p>Pay $7.50 Lifetime via PayPal or Card</p>
                            </div>
                            <div className="donate-arrow">&rarr;</div>
                        </a>

                        {/* Paymongo */}
                        <a href={getPaymongoCheckoutUrl()} target="_blank" rel="noreferrer" className="donate-option-card">
                            <div className="donate-card-icon donate-card-icon--paymongo"><WalletIcon /></div>
                            <div className="donate-card-text">
                                <h4>PayMongo (Philippines Local)</h4>
                                <p>Pay ₱200 Lifetime with GCash, Maya, QR Ph</p>
                            </div>
                            <div className="donate-arrow">&rarr;</div>
                        </a>
                    </div>
                )}

                <div className="donate-foot">
                    <button className="donate-btn-cancel" onClick={() => setIsOpen(false)}>Maybe Later</button>
                    <div className="donate-secure-text">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <span>Secure checkout via external networks</span>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    ) : null;

    return (
        <>
            <button
                id="donate-button"
                className={`btn btn-donate ${className}`}
                onClick={() => setIsOpen(true)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                aria-label="Upgrade to Pro"
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
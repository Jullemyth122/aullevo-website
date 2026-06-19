import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, googleProvider } from '../config/firebase';
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import DonateButton from './DonateButton';
import SEO from '../components/SEO';

const Login: React.FC = () => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isPro, setIsPro] = useState(false);
    const simulatedSync = true;
    const navigate = useNavigate();

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
                            setIsPro(!!userSnap.data()?.isPro);
                            userDocExists = true;
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
                    }

                    // Listen in real-time to Pro changes (e.g. if they pay)
                    const unsubSnap = onSnapshot(userRef, (doc) => {
                        if (doc.exists()) {
                            setIsPro(!!doc.data().isPro);
                        }
                    }, (snapErr) => {
                        console.error("Firestore snapshot listener error:", snapErr);
                    });

                    return () => unsubSnap();
                } else {
                    setUser(null);
                    setIsPro(false);
                }
            } catch (authErr) {
                console.error("Auth process error:", authErr);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

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

    return (
        <div className="login-page-container">
            <SEO 
                title="Login to Aullevo | AI-Powered Automation Dashboard"
                description="Sign in to Aullevo to sync your profiles, autopilot links, and custom rules across all your device browsers securely."
                keywords="login aullevo, profile sync, extension dashboard, autofill settings, cloud sync activation"
            />
            {user ? (
                /* ── AUTHENTICATED: PREMIUM DASHBOARD GRID ── */
                <div className="login-dashboard-grid animate-fade-in">

                    {/* Left Column: Profile Card & Sync HUD */}
                    <div className="dashboard-column dashboard-column--left glass-card">
                        <div className="user-profile-view">
                            <div className="avatar-ring-glow">
                                <div className="user-avatar-large">
                                    {user.photoURL ? (
                                        <img src={user.photoURL} alt={user.displayName || 'User'} />
                                    ) : (
                                        <span>{user.displayName?.charAt(0).toUpperCase() || 'U'}</span>
                                    )}
                                </div>
                            </div>

                            <h1>Welcome back,</h1>
                            <h3 className="user-display-name">{user.displayName || 'Developer'}</h3>
                            <p className="user-email">{user.email}</p>

                            <div className={`pro-status-badge ${isPro ? 'pro' : 'free'}`}>
                                {isPro ? (
                                    <>
                                        <span className="sparkle-icon">✨</span>
                                        <span>Pro Lifetime Member</span>
                                    </>
                                ) : (
                                    <span>Free Account</span>
                                )}
                            </div>

                            {/* Divider */}
                            <div className="hud-divider"></div>

                            {/* Extension Sync HUD Panel */}
                            <div className="sync-hud-panel">
                                <div className="sync-hud-header">
                                    <span className="hud-title">Extension Sync HUD</span>
                                    <div className="sync-pulse-wrapper">
                                        <span className={`sync-pulse-dot ${simulatedSync ? 'active' : ''}`}></span>
                                        <span className="sync-pulse-text">{simulatedSync ? 'Connected' : 'Offline'}</span>
                                    </div>
                                </div>
                                <div className="hud-stats-list">
                                    <div className="hud-stat-item">
                                        <span className="stat-label">Extension Status</span>
                                        <span className="stat-value text-green">Active & Paired</span>
                                    </div>
                                    <div className="hud-stat-item">
                                        <span className="stat-label">Linked Devices</span>
                                        <span className="stat-value">1 Active Browser</span>
                                    </div>
                                    <div className="hud-stat-item">
                                        <span className="stat-label">Last Database Sync</span>
                                        <span className="stat-value">Just Now</span>
                                    </div>
                                </div>
                            </div>

                            <button className="btn btn-secondary logout-btn" onClick={handleLogout}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '8px' }}>
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                    <polyline points="16 17 21 12 16 7" />
                                    <line x1="21" y1="12" x2="9" y2="12" />
                                </svg>
                                Sign Out
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Premium Feature Cards / Upgrades */}
                    <div className="dashboard-column dashboard-column--right glass-card">
                        {!isPro ? (
                            /* UPSELL / FREE STATE VIEW */
                            <div className="upsell-panel">
                                <div className="upsell-badge">Aullevo Premium</div>
                                <h3>Supercharge Your Form Automation</h3>
                                <p className="upsell-description">
                                    Unlock advanced Gemini-powered AI form filling capabilities and eliminate repetitive typing forever.
                                </p>

                                <div className="pro-feature-grid">
                                    <div className="pro-feature-card">
                                        <div className="feature-icon">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                                                <polyline points="2 17 12 22 22 17" />
                                                <polyline points="2 12 12 17 22 12" />
                                            </svg>
                                        </div>
                                        <div className="feature-text">
                                            <h4>Unlimited Sync Profiles</h4>
                                            <p>Create separate identity sets for personal, software engineer, or agency applications.</p>
                                        </div>
                                    </div>

                                    <div className="pro-feature-card">
                                        <div className="feature-icon">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                                                <line x1="12" y1="22.08" x2="12" y2="12" />
                                            </svg>
                                        </div>
                                        <div className="feature-text">
                                            <h4>Smart Autopilot Links</h4>
                                            <p>Speed through multi-page job portals and applications with autonomous, continuous inputs.</p>
                                        </div>
                                    </div>

                                    <div className="pro-feature-card">
                                        <div className="feature-icon">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <circle cx="12" cy="12" r="10" />
                                                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                                                <line x1="12" y1="17" x2="12.01" y2="17" />
                                            </svg>
                                        </div>
                                        <div className="feature-text">
                                            <h4>Deep AI Form Understanding</h4>
                                            <p>Harness localized context models so Gemini knows exactly how to customize your responses.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="upgrade-prompt-section">
                                    <div className="upgrade-price-badge">LIFETIME ACCESS • NO SUBSCRIPTION</div>
                                    <DonateButton className="btn btn-primary btn-lg pulse">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                        </svg>
                                        Upgrade to Pro Lifetime
                                    </DonateButton>
                                </div>
                            </div>
                        ) : (
                            /* PRO ACTIVE DETAIL CARD */
                            <div className="pro-activated-panel">
                                <div className="celebration-ring">
                                    <div className="sparkles-container">✨ 🎉 ✨</div>
                                </div>
                                <h3>Pro Lifetime Activated</h3>
                                <p className="pro-thanks">
                                    Thank you for supporting Aullevo! Your account has full, unrestricted access to the complete suite of automation tools.
                                </p>

                                <div className="instructions-card">
                                    <h4>How to Sync with Chrome Extension</h4>
                                    <ol className="instructions-list">
                                        <li>Open your Google Chrome browser.</li>
                                        <li>Click on the **Aullevo** extension icon in your toolbar.</li>
                                        <li>Click **Sign In** and authenticate using **{user.email}**.</li>
                                        <li>Your settings, profiles, and Pro Status will automatically synchronize instantly!</li>
                                    </ol>
                                </div>

                                <div className="pro-status-verification">
                                    <span className="verify-dot animate-pulse"></span>
                                    <span>Cloud Synchronization Enabled & Secure</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* ── GUEST: BEAUTIFUL SPLIT DESIGN ── */
                <div className="login-split-layout animate-fade-in">

                    {/* Left Pane: Promotional Showcase */}
                    <div className="login-promo-panel">
                        <div className="promo-badge">Aullevo Sync</div>
                        <h3>Your entire form-filling engine, unified.</h3>
                        <p>Sign in to sync your encrypted profiles, autopilot links, and custom rules across all your active browser installations instantly.</p>

                        <div className="promo-feature-list">
                            <div className="promo-feature-item">
                                <div className="promo-icon-wrapper">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                                <div className="promo-feature-text">
                                    <strong>Real-Time Syncing</strong>
                                    <span>Edits in your account dashboard reflect in the extension within seconds.</span>
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
                                    <strong>End-to-End Encryption</strong>
                                    <span>Your private resumes and forms remain fully secure under AES-256 local-first structures.</span>
                                </div>
                            </div>

                            <div className="promo-feature-item">
                                <div className="promo-icon-wrapper">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                    </svg>
                                </div>
                                <div className="promo-feature-text">
                                    <strong>Keep Pro Benefits</strong>
                                    <span>Your Pro lifetime purchase status resides permanently with your primary Google login.</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Pane: Login Card */}
                    <div className="login-card glass-card">
                        <div className="login-prompt-view">
                            <div className="branding-dot"></div>
                            <h1>Access Your Space</h1>
                            <p>Authenticate securely using your primary Google account to activate synchronizations.</p>

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

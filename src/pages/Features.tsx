import React from 'react';
import SEO from '../components/SEO';

// SVG Icons
const BrainIcon = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 2A5.5 5.5 0 0 0 4 7.5c0 1.29.44 2.53 1.23 3.5H5a4.5 4.5 0 0 0-.32 8.92" />
        <path d="M14.5 2A5.5 5.5 0 0 1 20 7.5c0 1.29-.44 2.53-1.23 3.5h.23a4.5 4.5 0 0 1 .32 8.92" />
        <path d="M12 2v20" />
    </svg>
);

const ShieldLockIcon = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <rect x="9" y="10" width="6" height="5" rx="1" />
        <path d="M10 10V8a2 2 0 1 1 4 0v2" />
    </svg>
);

const LayersIcon = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
    </svg>
);

const MousePointerIcon = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
        <path d="M13 13l6 6" />
    </svg>
);

const FrameIcon = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
        <rect x="5" y="6" width="6" height="5" rx="1" strokeDasharray="2 1" />
    </svg>
);

const Features: React.FC = () => {

    return (
        <div className="features-page animate-fade-in">
            <SEO 
                title="Aullevo Features | AI Form Autofill Technology"
                description="Explore Aullevo's contextual AI mapping engine, AES-256 local storage vault, human-mimic input injection, and advanced iframe penetrator features."
                keywords="ai form filler features, local encryption vault, domestic iframe scan, autofill engineering, human-mimic form inject"
            />
            {/* Features Hero */}
            <section className="features-hero">
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-badge">Deep Engineering</div>
                        <h1 className="hero-title">Powered by Modern AI. <br /><span className="gradient-text">Engineered for the modern web.</span></h1>
                        <p className="hero-subtitle">
                            Every single web form is different. To accurately conquer iframes, Shadow DOMs, React custom inputs, and dynamic multi-step wizards requires more than a simple scripts.
                        </p>
                    </div>
                </div>
            </section>

            {/* Bento Grid Features */}
            <section className="features-bento-section">
                <div className="container">
                    <div className="bento-grid">

                        {/* Huge Feature 1: Semantic Engine */}
                        <div className="bento-item box-large glow-hover">
                            <div className="item-bg-gradient blue"></div>
                            <div className="bento-content">
                                <div className="bento-icon"><BrainIcon /></div>
                                <h2>Contextual AI Mapping Engine</h2>
                                <p>
                                    Gemini 2.5 Flash doesn't just match keywords. It identifies the semantic meaning of every field based on label, placeholder, ARIA tags, and surrounding visual context, ensuring accuracy for custom inputs like "How many years of React experience?".
                                </p>
                                <div className="bento-pill">Confidence ≥ 0.5 Filtering</div>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="bento-item box-medium glow-hover">
                            <div className="item-bg-gradient green"></div>
                            <div className="bento-content">
                                <div className="bento-icon"><ShieldLockIcon /></div>
                                <h3>AES-256 Storage Vault</h3>
                                <p>Zero-knowledge architecture. All profile data is encrypted locally on-device. Your keys never leave the browser.</p>
                                <div className="bento-pill">Encrypted IDB</div>
                            </div>
                        </div>

                        {/* Feature 3 */}
                        <div className="bento-item box-medium glow-hover">
                            <div className="item-bg-gradient purple"></div>
                            <div className="bento-content">
                                <div className="bento-icon"><MousePointerIcon /></div>
                                <h3>Human-Mimic Injection</h3>
                                <p>Bypasses React, Vue, and Angular virtual DOM by dispatching realistic focus/keydown/blur event chains seamlessly.</p>
                                <div className="bento-pill">Native Setters</div>
                            </div>
                        </div>

                        {/* Huge Feature 4: Form Nav */}
                        <div className="bento-item box-wide glow-hover">
                            <div className="item-bg-gradient red"></div>
                            <div className="bento-content row-layout">
                                <div className="text-panel">
                                    <div className="bento-icon"><LayersIcon /></div>
                                    <h2>Multi-Step Wizard Intelligence</h2>
                                    <p>
                                        Automatically detects "Next", "Continue", and "Submit" buttons. Aullevo fills up to 10 sequential sub-forms, auto-clicks "Add" buttons for repeating groups (like experience/education), and smoothly re-analyzes context after each step.
                                    </p>
                                </div>
                                <div className="visual-panel">
                                    <div className="wizard-mockup">
                                        <div className="step done">Step 1</div>
                                        <div className="step active">Step 2</div>
                                        <div className="step">Step 3</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Feature 5 */}
                        <div className="bento-item box-medium glow-hover">
                            <div className="bento-content">
                                <div className="bento-icon"><FrameIcon /></div>
                                <h3>Cross-Frame (iFrame) Auto-Fill</h3>
                                <p>Extracts fields deep inside cross-origin iframes via secure postMessage. Other tools silently skip these.</p>
                            </div>
                        </div>

                        {/* Feature 6 */}
                        <div className="bento-item box-medium glow-hover">
                            <div className="bento-content">
                                <div className="bento-icon">
                                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                        <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                                        <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                                    </svg>
                                </div>
                                <h3>SPA Route Observer</h3>
                                <p>Detects hidden soft-navigation route changes to intelligently re-scan react/angular application portals automatically.</p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
};

export default Features;

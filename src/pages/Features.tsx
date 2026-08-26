import React from 'react';
import SEO from '../components/SEO';

// Clean SVG Icons for All Features
const BrainIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 2A5.5 5.5 0 0 0 4 7.5c0 1.29.44 2.53 1.23 3.5H5a4.5 4.5 0 0 0-.32 8.92" />
        <path d="M14.5 2A5.5 5.5 0 0 1 20 7.5c0 1.29-.44 2.53-1.23 3.5h.23a4.5 4.5 0 0 1 .32 8.92" />
        <path d="M12 2v20" />
    </svg>
);

const TableIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18" />
        <path d="M3 15h18" />
        <path d="M9 3v18" />
        <path d="M15 3v18" />
    </svg>
);

const ZapIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
);

const ChatIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
);

const ShadowDomIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
    </svg>
);

const MousePointerIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
        <path d="M13 13l6 6" />
    </svg>
);

const ShieldLockIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <rect x="9" y="10" width="6" height="5" rx="1" />
        <path d="M10 10V8a2 2 0 1 1 4 0v2" />
    </svg>
);

const ShieldAlertIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
);

const FrameIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
);

const LayersIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
);

const RefreshIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" />
        <polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
);

const UserGroupIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const FileUploadIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="12" y1="18" x2="12" y2="12" />
        <polyline points="9 15 12 12 15 15" />
    </svg>
);

const RepeatIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M16 12l-4-4-4 4" />
        <path d="M12 16V8" />
    </svg>
);

const featuresList = [
    // Layer 1: Frontend & UI Engine
    {
        title: 'Open Shadow Root Encapsulation',
        badge: 'Layer 1: Frontend',
        color: 'blue',
        icon: <ShadowDomIcon />,
        desc: 'Attaches an Open Shadow Root with z-index: 2147483646. Ensures 100% CSS isolation so host page styling (Tailwind, Bootstrap, etc.) cannot disrupt or bleed into the UI.',
        pill: '100% CSS Isolation'
    },
    // Layer 2: Deep DOM & Content Scripts
    {
        title: 'Deep Shadow DOM Piercing',
        badge: 'Layer 2: Bridge',
        color: 'purple',
        icon: <ShadowDomIcon />,
        desc: 'Uses recursive shadow tree querySelectorAllDeep traversal to find and fill custom inputs nested deep within modern web components and microfrontends.',
        pill: 'Recursive DOM Scan'
    },
    {
        title: 'Hidden Tab Panel Revealer',
        badge: 'Layer 2: Bridge',
        color: 'purple',
        icon: <LayersIcon />,
        desc: 'Detects hidden tab panels ([role="tabpanel"]) and momentarily activates them behind the scenes to map and populate fields before user submission.',
        pill: 'Multi-Tab Revealer'
    },
    {
        title: 'Honeypot & Anti-CAPTCHA Shield',
        badge: 'Layer 2: Bridge',
        color: 'purple',
        icon: <ShieldAlertIcon />,
        desc: 'Identifies and skips hidden bot-traps (aria-hidden, 0-size, offscreen inputs) and alerts users when Turnstile, reCAPTCHA, or Arkose are present.',
        pill: 'Bot-Trap Immune'
    },
    {
        title: 'Human Input & ValueTracker Sync',
        badge: 'Layer 2: Bridge',
        color: 'purple',
        icon: <MousePointerIcon />,
        desc: 'Injects values using prototype property setters and triggers React\'s internal _valueTracker to ensure reactive form state and validation acknowledge inputs.',
        pill: 'React / Vue Reactive'
    },
    {
        title: 'Cross-Frame (iFrame) Auto-Fill',
        badge: 'Layer 2: Bridge',
        color: 'purple',
        icon: <FrameIcon />,
        desc: 'Extracts and fills inputs deep inside cross-origin iframes via secure content script bridges that standard autofillers silently skip.',
        pill: 'Cross-Origin Bridge'
    },
    {
        title: 'SPA Soft-Navigation Observer',
        badge: 'Layer 2: Bridge',
        color: 'purple',
        icon: <RefreshIcon />,
        desc: 'Tracks MutationObserver and History API events to detect single-page application route transitions and immediately re-evaluate new forms.',
        pill: 'SPA Auto-Detect'
    },
    // Layer 3: Hybrid AI & Matching Engine
    {
        title: 'Dual-Tier Gemini AI Engine',
        badge: 'Layer 3: AI & Hybrid',
        color: 'cyan',
        icon: <BrainIcon />,
        desc: 'Combines Google Gemini LLM visual-semantic analysis with instant deterministic heuristics for sub-millisecond accuracy without transmitting sensitive data.',
        pill: 'Gemini LLM + Heuristics'
    },
    {
        title: '2D Availability Matrix Optimizer',
        badge: 'Layer 3: AI & Hybrid',
        color: 'cyan',
        icon: <TableIcon />,
        desc: 'Directly resolves complex weekly availability tables (e.g. Mon - From, Tue - To) via deterministic heuristics, eliminating prompt bloat and token waste.',
        pill: 'Matrix Heuristics'
    },
    {
        title: 'Domain Session Cache',
        badge: 'Layer 3: AI & Hybrid',
        color: 'cyan',
        icon: <ZapIcon />,
        desc: 'Caches field signature mappings in chrome.storage.session for 15 minutes, making multi-page job portals and consecutive applications instantaneous.',
        pill: '15-Min Instant Cache'
    },
    {
        title: 'Contextual RAG & Chat Answers',
        badge: 'Layer 3: AI & Hybrid',
        color: 'cyan',
        icon: <ChatIcon />,
        desc: 'Retrieves your structured experiences and background notes to craft tailored, grounded answers to open-ended job questions ("Why this company?").',
        pill: 'Grounded RAG'
    },
    // Layer 4: Zero-Knowledge Data Vault
    {
        title: '100% Local AES-256 Vault',
        badge: 'Layer 4: Storage',
        color: 'green',
        icon: <ShieldLockIcon />,
        desc: 'All profile records, IDs, and custom fields are encrypted strictly on-device in chrome.storage.local. Zero cloud databases, zero telemetry.',
        pill: 'Zero Cloud Storage'
    },
    {
        title: 'Multi-Profile Namespace Partitioning',
        badge: 'Layer 4: Storage',
        color: 'green',
        icon: <UserGroupIcon />,
        desc: 'Dynamically isolates data keys for Personal, Work, Software Engineer, or Guest personas, allowing effortless one-click switching.',
        pill: 'Account Isolation'
    },
    {
        title: 'PDF & DOCX Resume Parser',
        badge: 'Layer 4: Storage',
        color: 'green',
        icon: <FileUploadIcon />,
        desc: 'Processes resumes client-side using pdfjs-dist and mammoth to instantly extract work experience, education, skills, and certifications.',
        pill: 'Client-Side Parsing'
    },
    {
        title: 'Virtual File Dispatcher',
        badge: 'Layer 4: Storage',
        color: 'green',
        icon: <FileUploadIcon />,
        desc: 'Reconstructs base64-stored resumes into native File and DataTransfer objects to automatically populate file upload buttons with zero drag-and-drop.',
        pill: 'Auto-Upload Attachments'
    },
    // Layer 5: Autonomous Autopilot Core
    {
        title: 'Multi-Page State Machine',
        badge: 'Layer 5: Orchestration',
        color: 'amber',
        icon: <RepeatIcon />,
        desc: 'Tracks multi-step form journeys across page navigations up to 30 continuous steps via chrome.tabs.onUpdated listeners.',
        pill: '30-Step Navigation'
    },
    {
        title: 'Dynamic Row Expansion',
        badge: 'Layer 5: Orchestration',
        color: 'amber',
        icon: <ZapIcon />,
        desc: 'Detects "+ Add Experience" buttons, triggers synthetic clicks, invalidates cache, and recursively fills newly exposed form rows.',
        pill: 'Auto "+ Add Row"'
    },
    {
        title: 'Anti-Loop Fingerprinting',
        badge: 'Layer 5: Orchestration',
        color: 'amber',
        icon: <ShieldAlertIcon />,
        desc: 'Calculates DOM field-value fingerprints to identify repeated cycles and safely abort automation if a form gets stuck in an infinite loop.',
        pill: 'Infinite-Loop Protection'
    }
];

const Features: React.FC = () => {
    return (
        <div className="features-page animate-fade-in">
            <SEO
                title="Aullevo Features | Deep Layer-by-Layer Automation Tech"
                description="Explore Aullevo's 18+ technical features: Shadow DOM piercing, zero-knowledge local vault, 2D matrix optimizer, virtual file dispatcher, and autonomous multi-step autopilot."
                keywords="ai form filler features, local encryption vault, shadow dom autofill, gemini form filling, multi step wizard automation"
            />
            
            {/* Features Hero */}
            <section className="features-hero">
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-badge">Full Architectural Feature Suite</div>
                        <h1 className="hero-title">
                            Powered by Modern AI. <br />
                            <span className="gradient-text">Engineered for the modern web.</span>
                        </h1>
                        <p className="hero-subtitle">
                            Every single web form is different. From Shadow DOMs and iframes to reactive state trackers and multi-page wizards, here is every technology engineered into Aullevo across all 5 layers.
                        </p>
                    </div>
                </div>
            </section>

            {/* Bento Grid Features */}
            <section className="features-bento-section">
                <div className="container">
                    <div className="features-grid">
                        {featuresList.map((feat, idx) => (
                            <div key={idx} className={`feature-card feature-card--${feat.color}`}>
                                <div className={`item-bg-gradient ${feat.color}`} />
                                <div className="feature-card-header">
                                    <div className="feature-icon">{feat.icon}</div>
                                    <span className={`feature-badge badge-${feat.color}`}>{feat.badge}</span>
                                </div>
                                <h3 className="feature-card-title">{feat.title}</h3>
                                <p className="feature-card-desc">{feat.desc}</p>
                                <div className="feature-card-footer">
                                    <span className="feature-pill">{feat.pill}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Features;

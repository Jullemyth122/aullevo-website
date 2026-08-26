import React, { useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import TrustDownloadButton from '../components/TrustDownloadButton';
import DemoAnimation from '../components/DemoAnimation';
import DonateButton from './DonateButton';
import Reviews from '../components/Reviews';
import SEO from '../components/SEO';

// Inline SVG icon components — no emojis
const ShieldIcon = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
    </svg>
);

const ZapIcon = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
);



const FolderIcon = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
);

const SlidersIcon = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="21" x2="4" y2="14" />
        <line x1="4" y1="10" x2="4" y2="3" />
        <line x1="12" y1="21" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12" y2="3" />
        <line x1="20" y1="21" x2="20" y2="16" />
        <line x1="20" y1="12" x2="20" y2="3" />
        <line x1="1" y1="14" x2="7" y2="14" />
        <line x1="9" y1="8" x2="15" y2="8" />
        <line x1="17" y1="16" x2="23" y2="16" />
    </svg>
);

const FolderUserIcon = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="2" />
        <path d="M8 18a4 4 0 0 1 8 0" />
    </svg>
);

const LinkIcon = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        <line x1="8" y1="16" x2="16" y2="8" />
    </svg>
);

const LightningIcon = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
);

const LockShieldIcon = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <rect x="9" y="11" width="6" height="4" rx="1" />
        <path d="M10 11V9a2 2 0 1 1 4 0v2" />
    </svg>
);

const Home: React.FC = () => {
    const cardsRef = useRef<HTMLDivElement>(null);
    const guidesRef = useRef<HTMLDivElement>(null);
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const cards = target.querySelectorAll('.glow-card') as NodeListOf<HTMLElement>;
        if (!cards) return;
        cards.forEach((card) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    }, []);

    const features = [
        {
            icon: <ZapIcon />,
            title: 'Dual-Engine Autofill',
            desc: 'Choose between instant local heuristics (under 0.1s) for standard fields, or advanced AI mapping (4-8s) to answer complex context-specific questions.',
            color: 'blue',
            metric: 'Instant or Deep AI modes'
        },
        {
            icon: <FolderIcon />,
            title: 'Intelligent File Library',
            desc: 'Drag & drop your files once. Aullevo automatically matches and attaches your resumes, portfolios, and cover letters to the right inputs.',
            color: 'green',
            metric: 'Multi-file capable'
        },
        {
            icon: <SlidersIcon />,
            title: 'Custom AI Context Rules',
            desc: 'Teach the AI exactly how you want to be represented. Add custom profiles for your salary expectations, notice period, or preferred pronouns.',
            color: 'purple',
            metric: 'Granular personalization'
        },
        {
            icon: <ShieldIcon />,
            title: 'Your Data securely processed locally',
            desc: 'Gemini AI only reads form structures—your sensitive profile details remain yours.',
            color: 'red',
            metric: 'Zero data sold'
        },
    ];

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        'name': 'Aullevo',
        'operatingSystem': 'Windows, macOS, Linux',
        'applicationCategory': 'BrowserExtension',
        'offers': {
            '@type': 'Offer',
            'price': '0.00',
            'priceCurrency': 'USD'
        },
        'description': 'Aullevo is an AI-powered form automation browser extension that instantly fills forms, applications, and repetitive data entries. It runs locally and encrypts data on-device.',
        'aggregateRating': {
            '@type': 'AggregateRating',
            'ratingValue': '4.9',
            'ratingCount': '100'
        }
    };

    return (
        <div className="home-page">
            <SEO
                title="Aullevo | AI-Powered Form Automation & Auto-Fill Extension"
                description="Automate form filling with Aullevo. The secure, local AI autofill extension powered by Gemini. Fill Workday job applications, surveys, and forms in 3 seconds."
                keywords="ai form filler, autofill browser extension, workday autofill, job application automator, gemini form filler, secure local autofill, form automation"
            />
            <script type="application/ld+json">
                {JSON.stringify(jsonLd)}
            </script>

            {/* Animated Mesh Background */}
            <div className="mesh-gradient">
                <div className="mesh-blob mesh-blob--1"></div>
                <div className="mesh-blob mesh-blob--2"></div>
                <div className="mesh-blob mesh-blob--3"></div>
            </div>

            {/* Hero Section */}
            <section className="section hero">
                <div className="container hero-grid">
                    <div className="hero-text animate-fade-in">
                        <div className="hero-badge">
                            <span className="hero-badge-dot"></span>
                            Advanced Automation with AI
                        </div>
                        <h1>
                            Automate Repetitive Task. <br />
                            <span className="gradient-text">Reclaim Your Time.</span>
                        </h1>
                        <p className="hero-subtitle">
                            The Automation that instantly fill forms, repetitive data entries and so much task manually, also can be used with AI.
                        </p>
                        <div className="hero-ctas">
                            <TrustDownloadButton className="btn btn-primary btn-lg">
                                Download Extension (ZIP)
                            </TrustDownloadButton>
                            <Link to="/docs" className="btn btn-secondary btn-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                                </svg>
                                Guides & Docs
                            </Link>
                            <DonateButton className="btn-lg" />
                        </div>

                        <div className="trust-bar">
                            <span>TRUSTED BY 50+ USERS</span>
                            {/* <div className="trust-logos">
                                <strong>Google</strong>
                                <strong>Amazon</strong>
                                <strong>Shopify</strong>
                            </div> */}
                        </div>
                    </div>

                    <div className="hero-visual animate-fade-in delay-2">
                        <div style={{ position: 'relative', width: '100%' }}>
                            <DemoAnimation />

                            {/* Floating Badges — positioned to not overlap sidebar */}
                            <div className="floating-badge floating-badge--top">
                                <div className="badge-icon">
                                    <ZapIcon />
                                </div>
                                <div>
                                    <div className="badge-label">Speed</div>
                                    <div className="badge-value">2x faster</div>
                                </div>
                            </div>

                            <div className="floating-badge floating-badge--bottom">
                                <div className="badge-icon badge-icon--green">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="badge-label">Time Saved Today</div>
                                    <div className="badge-value">1h 42m</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Grid — Why You Should Use Aullevo */}
            <section className="section home-features-bg">
                <div className="container">
                    <div className="section-title">Why You Should Use Aullevo</div>
                    <p className="section-description">
                        Lightweight, private, and built to cut hours off your daily workflow.
                    </p>

                    <div className="grid grid-2" ref={cardsRef} onMouseMove={handleMouseMove}>
                        {features.map((card, i) => (
                            <div key={i} className={`glass-card glow-card glow-card--${card.color} animate-fade-in delay-${i + 1}`}>
                                <div className="glow-card-border"></div>
                                <div className="glow-card-content" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                                    <div className={`feature-icon-box feature-icon-box--${card.color}`} style={{ flexShrink: 0, margin: 0 }}>
                                        {card.icon}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)' }}>{card.title}</h3>
                                        <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>{card.desc}</p>
                                        <span className="feature-metric" style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>{card.metric}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Quick Guides & Basics */}
            <section className="section home-quick-docs" style={{ borderTop: '1px solid var(--border-glass)', padding: '6rem 0' }}>
                <div className="container">
                    <div className="section-title">Guides & Basics at a Glance</div>
                    <p className="section-description">
                        No complex jargon. Here is how Aullevo makes form filling simple and secure.
                    </p>

                    <div className="grid grid-2" ref={guidesRef} onMouseMove={handleMouseMove} style={{ marginBottom: '3rem' }}>
                        <div className="glass-card glow-card glow-card--green animate-fade-in delay-1">
                            <div className="glow-card-border"></div>
                            <div className="glow-card-content" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                                <div className="feature-icon-box feature-icon-box--green" style={{ flexShrink: 0, margin: 0 }}>
                                    <FolderUserIcon />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)' }}>Save Form Profiles</h3>
                                    <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                                        Build specialized profiles for Job Applications, School Surveys, or Government forms. Switch between different sets of answers in a single click.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card glow-card glow-card--blue animate-fade-in delay-2">
                            <div className="glow-card-border"></div>
                            <div className="glow-card-content" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                                <div className="feature-icon-box feature-icon-box--blue" style={{ flexShrink: 0, margin: 0 }}>
                                    <LinkIcon />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)' }}>Public Link Support</h3>
                                    <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                                        Works seamlessly on open public forms. There is no need to create accounts or log in on the form site — Aullevo works directly on any link.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card glow-card glow-card--purple animate-fade-in delay-3">
                            <div className="glow-card-border"></div>
                            <div className="glow-card-content" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                                <div className="feature-icon-box feature-icon-box--purple" style={{ flexShrink: 0, margin: 0 }}>
                                    <LightningIcon />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)' }}>Dual-Engine Speeds</h3>
                                    <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                                        Heuristics map standard fields instantly (under 0.1s). AI Mode takes 4-8s to process context, allowing it to write custom essay answers.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card glow-card glow-card--red animate-fade-in delay-4">
                            <div className="glow-card-border"></div>
                            <div className="glow-card-content" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                                <div className="feature-icon-box feature-icon-box--red" style={{ flexShrink: 0, margin: 0 }}>
                                    <LockShieldIcon />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)' }}>Zero-Knowledge Privacy</h3>
                                    <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                                        Your personal data is encrypted on your machine. Gemini AI only scans the blank form questions so your real info is never exposed.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Pros and Cons */}
                    <div style={{ marginTop: '4rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div className="section-title" style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Pros & Cons Overview</div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                            <div style={{ background: 'var(--card-gradient-pos)', border: '1px solid rgba(16, 185, 129, 0.15)', padding: '2rem', borderRadius: '16px' }}>
                                <h4 style={{ color: 'var(--accent-pop)', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 1rem 0', fontSize: '1.2rem' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                                    Pros (Advantages)
                                </h4>
                                <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <li style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}><strong>Massive Time Savings:</strong> Fills forms in seconds.</li>
                                    <li style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}><strong>Local Encryption:</strong> Bank-grade AES-256 security on-device.</li>
                                    <li style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}><strong>Dual matching options:</strong> Choose between instant keywords or deep AI mode.</li>
                                    <li style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}><strong>Unauthenticated forms:</strong> Works on forms without signing up.</li>
                                </ul>
                            </div>

                            <div style={{ background: 'var(--card-gradient-neg)', border: '1px solid rgba(239, 68, 68, 0.15)', padding: '2rem', borderRadius: '16px' }}>
                                <h4 style={{ color: 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 1rem 0', fontSize: '1.2rem' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                    Cons (Limitations)
                                </h4>
                                <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <li style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}><strong>AI Speed Trade-off:</strong> AI mode takes 4-8 seconds to process.</li>
                                    <li style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}><strong>Developer Mode Required:</strong> Needs to be loaded unpacked in Chrome.</li>
                                    <li style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}><strong>Manual CAPTCHAs:</strong> Auto-pauses so you can solve puzzles manually.</li>
                                    <li style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}><strong>Highly Custom Inputs:</strong> Shadow DOMs may require manual custom fields.</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
                        <Link to="/docs" className="btn btn-secondary btn-lg" style={{ textDecoration: 'none' }}>
                            View Full Guides & Docs
                        </Link>
                    </div>
                </div>
            </section>

            {/* Community Reviews Section */}
            <Reviews />

            {/* Roadmap — What We're Working On */}
            <section className="section roadmap-section">
                <div className="container">
                    <div className="section-title">What's Coming Next</div>
                    <p className="section-description">
                        We're constantly improving Aullevo. Here's a look at what's on the horizon.
                    </p>

                    <div className="roadmap-grid">
                        <div className="roadmap-card roadmap-card--completed">
                            <div className="roadmap-status">
                                <span className="roadmap-status-dot roadmap-status-dot--done"></span>
                                Completed
                            </div>
                            <div className="roadmap-icon" style={{ background: 'var(--bg-badge-live)', color: 'var(--accent-pop)' }}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                            </div>
                            <h3>Multiple Profile Types</h3>
                            <p>
                                Create, edit, and switch between specialized profile categories on the fly
                                (Job Applications, Medical Forms, Surveys, and more). Full local storage with AES-256-GCM encryption.
                            </p>
                        </div>

                        <div className="roadmap-card roadmap-card--completed">
                            <div className="roadmap-status">
                                <span className="roadmap-status-dot roadmap-status-dot--done"></span>
                                Completed
                            </div>
                            <div className="roadmap-icon" style={{ background: 'var(--bg-badge-live)', color: 'var(--accent-pop)' }}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
                                </svg>
                            </div>
                            <h3>Gemini AI Integration</h3>
                            <p>
                                Powered by Google's Gemini models for intelligent form analysis, context matching,
                                and automated Q&A answering. Private and secure.
                            </p>
                        </div>

                        <div className="roadmap-card roadmap-card--completed">
                            <div className="roadmap-status">
                                <span className="roadmap-status-dot roadmap-status-dot--done"></span>
                                Completed
                            </div>
                            <div className="roadmap-icon" style={{ background: 'var(--bg-badge-live)', color: 'var(--accent-pop)' }}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                    <path d="M9 3v18M3 9h18" />
                                </svg>
                            </div>
                            <h3>Advanced DOM & iFrame Filler</h3>
                            <p>
                                Deep DOM scanning, field detection, and automation filler that works on complex
                                nested elements, web components, and cross-origin iFrames.
                            </p>
                        </div>

                        <div className="roadmap-card roadmap-card--completed">
                            <div className="roadmap-status">
                                <span className="roadmap-status-dot roadmap-status-dot--done"></span>
                                Completed
                            </div>
                            <div className="roadmap-icon" style={{ background: 'var(--bg-badge-live)', color: 'var(--accent-pop)' }}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="16" y1="13" x2="8" y2="13" />
                                    <line x1="16" y1="17" x2="8" y2="17" />
                                </svg>
                            </div>
                            <h3>PDF & Docx Scan Extraction</h3>
                            <p>
                                Upload your PDF/DOCX resumes or documents directly, and have our parsing system automatically extract them into your locally saved profiles.
                            </p>
                        </div>

                        <div className="roadmap-card">
                            <div className="roadmap-status">
                                <span className="roadmap-status-dot roadmap-status-dot--planned"></span>
                                Planned
                            </div>
                            <div className="roadmap-icon">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                                    <line x1="8" y1="21" x2="16" y2="21" />
                                    <line x1="12" y1="17" x2="12" y2="21" />
                                </svg>
                            </div>
                            <h3>Local-AI Only Mode</h3>
                            <p>
                                We're planning a fully local-AI mode running on-device models directly in your browser.
                                Complete privacy with zero external API/cloud calls.
                            </p>
                        </div>

                        <div className="roadmap-card">
                            <div className="roadmap-status">
                                <span className="roadmap-status-dot roadmap-status-dot--planned"></span>
                                Planned
                            </div>
                            <div className="roadmap-icon">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="16" y1="13" x2="8" y2="13" />
                                    <line x1="16" y1="17" x2="8" y2="17" />
                                </svg>
                            </div>
                            <h3>AI Cover Letter Generator</h3>
                            <p>
                                Automatically generate tailored cover letters within the extension's sidebar using
                                your active profile info and the job description.
                            </p>
                        </div>

                        <div className="roadmap-card">
                            <div className="roadmap-status">
                                <span className="roadmap-status-dot roadmap-status-dot--progress"></span>
                                In Development (Soon)
                            </div>
                            <div className="roadmap-icon">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                                    <path d="M2 12h20" />
                                    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                                </svg>
                            </div>
                            <h3>Firefox & Edge Support</h3>
                            <p>
                                Expanding beyond Chrome so everyone can benefit from
                                AI-powered form automation, no matter their browser.
                            </p>
                        </div>
                    </div>
                </div>
            </section>


        </div>
    );
};

export default Home;

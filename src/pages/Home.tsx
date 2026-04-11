import React, { useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import TrustDownloadButton from '../components/TrustDownloadButton';
import DemoAnimation from '../components/DemoAnimation';
import DonateButton from './DonateButton';
import Reviews from '../components/Reviews';

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

const Home: React.FC = () => {
    const cardsRef = useRef<HTMLDivElement>(null);
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const cards = cardsRef.current?.querySelectorAll('.glow-card') as NodeListOf<HTMLElement>;
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
            title: 'Fill Any Form in Under 3 Seconds',
            desc: 'From complex Workday applications to simple contact forms — Aullevo detects every field type and fills them instantly with context-aware AI.',
            color: 'blue',
            metric: '2x faster than manual entry'
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

    return (
        <div className="home-page">

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
                            AI-Powered Form Automation
                        </div>
                        <h1>
                            Automate Work. <br />
                            <span className="gradient-text">Reclaim Your Time.</span>
                        </h1>
                        <p className="hero-subtitle">
                            The AI-powered assistant that instantly fills forms, applications, and repetitive data entries. Looks human, works at lightspeed.
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
                                Read Documentation
                            </Link>
                            <DonateButton className="btn-lg" />
                        </div>

                        <div className="trust-bar">
                            <span>TRUSTED BY 100+ USERS</span>
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

                    <div className="grid grid-4" ref={cardsRef} onMouseMove={handleMouseMove}>
                        {features.map((card, i) => (
                            <div key={i} className={`glass-card glow-card animate-fade-in delay-${i + 1}`}>
                                <div className="glow-card-border"></div>
                                <div className="glow-card-content">
                                    <div className={`feature-icon-box feature-icon-box--${card.color}`}>
                                        {card.icon}
                                    </div>
                                    <h3>{card.title}</h3>
                                    <p>{card.desc}</p>
                                    <span className="feature-metric">{card.metric}</span>
                                </div>
                            </div>
                        ))}
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
                        <div className="roadmap-card roadmap-card--active">
                            <div className="roadmap-status">
                                <span className="roadmap-status-dot roadmap-status-dot--progress"></span>
                                In Progress
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
                                We're currently working on a fully local-AI mode — no cloud calls at all.
                                It requires a bit more setup on your extension, but your data never leaves your machine.
                            </p>
                        </div>

                        <div className="roadmap-card roadmap-card--completed">
                            <div className="roadmap-status">
                                <span className="roadmap-status-dot roadmap-status-dot--done"></span>
                                Completed
                            </div>
                            <div className="roadmap-icon" style={{ background: 'rgba(16, 185, 129, 0.08)', color: '#10B981' }}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                            </div>
                            <h3>Multi-Resume Profiles</h3>
                            <p>
                                Create, edit, delete, and switch between multiple encrypted profiles on the fly.
                                Full import/export support with AES-256-GCM encryption. Now live in the Options page.
                            </p>
                        </div>

                        <div className="roadmap-card roadmap-card--active">
                            <div className="roadmap-status">
                                <span className="roadmap-status-dot roadmap-status-dot--progress"></span>
                                In Progress
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
                                Generate tailored cover letters from your profile data and the job description.
                                The AI engine is built — sidebar integration is coming soon.
                            </p>
                        </div>

                        <div className="roadmap-card">
                            <div className="roadmap-status">
                                <span className="roadmap-status-dot roadmap-status-dot--planned"></span>
                                Planned
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

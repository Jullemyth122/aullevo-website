import React, { useRef, useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import TrustDownloadButton from '../components/TrustDownloadButton';
import DemoAnimation from '../components/DemoAnimation';
import HeroEmblem from '../components/HeroEmblem';
import HeroSpotlight from '../components/HeroSpotlight';
import HeroShortcut from '../components/HeroShortcut';
import DonateButton from './DonateButton';
import Reviews from '../components/Reviews';
import SEO from '../components/SEO';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useProStatus } from '../hooks/useProStatus';
import { CHROME_WEB_STORE_URL } from '../config/store';
import { logEvent } from '../utils/analytics';

// Bump this whenever a new extension ZIP is uploaded to /public
const EXTENSION_VERSION = 'v0.6.4';

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
    const proStatus = useProStatus();
    const heroRef = useRef<HTMLElement>(null);
    const demoRef = useRef<HTMLDivElement>(null);
    const demoTriggerRef = useRef<(() => void) | null>(null);
    const emblemFireRef = useRef<(() => void) | null>(null);

    // The demo is the heaviest part of the page (big DOM, shader). It mounts once the hero
    // intro has played and the browser is idle — or immediately if the visitor scrolls to it
    // or presses the shortcut — so its render/layout never competes with the intro.
    const [demoMounted, setDemoMounted] = useState(false);
    const pendingDemoRun = useRef(false);
    useEffect(() => {
        if (demoMounted) return;
        const el = demoRef.current;
        if (!el) return;
        const idle = window as Window & {
            requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
            cancelIdleCallback?: (id: number) => void;
        };
        const mount = () => setDemoMounted(true);
        let idleId = 0;
        const timer = window.setTimeout(() => {
            idleId = idle.requestIdleCallback ? idle.requestIdleCallback(mount, { timeout: 800 }) : window.setTimeout(mount, 0);
        }, 1700);
        const io = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && window.scrollY > 0) mount();
        });
        io.observe(el);
        return () => {
            window.clearTimeout(timer);
            window.clearTimeout(idleId);
            idle.cancelIdleCallback?.(idleId);
            io.disconnect();
        };
    }, [demoMounted]);

    // A shortcut press that arrived before the demo mounted runs as soon as it's ready
    useEffect(() => {
        if (demoMounted && pendingDemoRun.current) {
            pendingDemoRun.current = false;
            demoTriggerRef.current?.();
        }
    }, [demoMounted]);

    // Shortcut → fire the emblem, then glide to the real demo below and run it
    const runHeroDemo = useCallback(() => {
        emblemFireRef.current?.();
        if (demoTriggerRef.current) demoTriggerRef.current();
        else {
            pendingDemoRun.current = true;
            setDemoMounted(true);
        }
        const demo = demoRef.current;
        if (demo && demo.getBoundingClientRect().top > window.innerHeight * 0.55) {
            // Let the emblem burst play before leaving it
            window.setTimeout(() => demo.scrollIntoView({ behavior: 'smooth', block: 'center' }), 850);
        }
    }, []);

    // Hero intro: fully CSS-driven (compositor transforms/opacity, see `_home.scss`), so it
    // can't stutter while the main thread is busy mounting the page. Everything is hidden
    // until `data-intro="play"` is set, which waits for webfonts (capped) to avoid a font swap mid-reveal.
    useEffect(() => {
        const hero = heroRef.current;
        if (!hero) return;
        let raf = 0;
        let started = false;
        const play = () => {
            if (started) return;
            started = true;
            raf = requestAnimationFrame(() => {
                hero.dataset.intro = 'play';
            });
        };
        const cap = window.setTimeout(play, 700);
        document.fonts?.ready.then(play);
        return () => {
            window.clearTimeout(cap);
            cancelAnimationFrame(raf);
            started = true;
        };
    }, []);

    const pageRef = useRef<HTMLDivElement>(null);
    useScrollReveal(pageRef);

    const cardsRef = useRef<HTMLDivElement>(null);
    const guidesRef = useRef<HTMLDivElement>(null);
    // Cursor glow on cards: one rAF per frame, all rect reads before any style writes
    const glowFrame = useRef(0);
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const { clientX, clientY } = e;
        if (glowFrame.current) return;
        glowFrame.current = requestAnimationFrame(() => {
            glowFrame.current = 0;
            const cards = Array.from(target.querySelectorAll<HTMLElement>('.glow-card, .guide-context-card'));
            const rects = cards.map((card) => card.getBoundingClientRect());
            cards.forEach((card, i) => {
                card.style.setProperty('--mouse-x', `${clientX - rects[i].left}px`);
                card.style.setProperty('--mouse-y', `${clientY - rects[i].top}px`);
            });
        });
    }, []);
    useEffect(() => () => cancelAnimationFrame(glowFrame.current), []);

    const features = [
        {
            icon: <ZapIcon />,
            title: 'Two Engines, One Shortcut',
            desc: 'Offline keyword matching fills standard fields instantly. Turn on AI Smart Fill (Gemini, ChatGPT, Claude, or your own server) for multiple-choice picks and open-ended questions, with keywords filling anything the AI skips.',
            color: 'blue',
            metric: 'Keywords + your choice of AI'
        },
        {
            icon: <FolderIcon />,
            title: 'Documents Attached for You',
            desc: 'Save your resume, cover letter, portfolio, and IDs once. Aullevo reads each upload field\'s label and attaches the right document automatically.',
            color: 'yellow',
            metric: 'Pro feature'
        },
        {
            icon: <SlidersIcon />,
            title: 'Custom Fields with Context',
            desc: 'Add your own questions and answers, such as salary expectations, notice period, or preferred pronouns, with a context hint that helps matching and AI understand what each one means.',
            color: 'blue',
            metric: 'Fully personalized'
        },
        {
            icon: <ShieldIcon />,
            title: 'Private by Design',
            desc: 'Your profiles are encrypted on your device with your own passphrase. Mark any field SENSITIVE and its value never reaches the AI. We never sell or collect your profile data.',
            color: 'yellow',
            metric: 'Encrypted on device'
        },
    ];

    return (
        <div className="home-page" ref={pageRef}>
            <SEO
                title="Aullevo | AI Form Filler & Autofill Extension for Chrome"
                description="Aullevo fills job applications, surveys, and web forms for you. Save your details once, press one shortcut, and let smart matching and optional AI (Gemini, ChatGPT, or Claude) do the typing. Encrypted on your device. Get it on the Chrome Web Store or as a ZIP."
                keywords="ai form filler, autofill browser extension, workday autofill, job application automator, gemini form filler, chatgpt form filler, claude autofill, aullevo chrome web store, secure local autofill, form automation"
            />

            {/* Animated Mesh Background */}
            <div className="mesh-gradient">
            </div>

            {/* Hero Section */}
            <section className="section hero" ref={heroRef} data-anim-scope>
                <HeroSpotlight />
                <div className="container hero-grid">
                    <div className="hero-text">
                        <div className="hero-version" role="note">
                            <span className="hero-version__tag">{EXTENSION_VERSION}</span>
                            <span className="hero-version__text">
                                Every download is the latest build. We update the extension manually with each new version.
                            </span>
                        </div>
                        <HeroEmblem playRef={emblemFireRef} />
                        <div className="hero-badge">
                            <span className="hero-badge-dot"></span>
                            Advanced Automation with AI
                        </div>
                        <h1 className="hero-headline">
                            <span className="hero-line hero-line--main"><span className="hero-line__inner">Automate Repetitive Forms.</span></span>{' '}
                            <span className="hero-line hero-line--accent"><span className="hero-line__inner">Reclaim Your Time.</span></span>
                        </h1>
                        <p className="hero-subtitle">
                            Aullevo fills job applications, surveys, and school or government forms for you. Save your details once, press one shortcut, and let smart matching and optional AI do the typing.
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
                            {/* Pro users manage (or extend) their plan on the Account page instead */}
                            {proStatus.isPro ? (
                                <Link to="/login" className="btn btn-secondary btn-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    {proStatus.isLifetime ? 'Pro · Lifetime' : 'Pro Active'}
                                </Link>
                            ) : !proStatus.loading && (
                                <DonateButton className="btn-lg" />
                            )}
                        </div>

                        <p className="hero-store-note">
                            Rather not download a ZIP? Install it from the{' '}
                            <a
                                href={CHROME_WEB_STORE_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => logEvent('open_chrome_web_store', { method: 'home_hero' })}
                            >Chrome Web Store</a>
                            : just search <strong>Aullevo</strong>.
                        </p>

                        <HeroShortcut onTrigger={runHeroDemo} />

                        <div className="trust-bar">
                            <span className="trust-bar__item">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                                Trusted by 50+ users
                            </span>
                            <span className="trust-bar__sep" aria-hidden="true" />
                            <span className="trust-bar__item">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="4" y="11" width="16" height="10" rx="2" />
                                    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                                </svg>
                                Encrypted on your device
                            </span>
                            <span className="trust-bar__sep" aria-hidden="true" />
                            <span className="trust-bar__item">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="2" y1="12" x2="22" y2="12" />
                                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                </svg>
                                34 languages
                            </span>
                            <span className="trust-bar__sep" aria-hidden="true" />
                            <span className="trust-bar__item">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <circle cx="12" cy="12" r="4" />
                                    <path d="M21.17 8H12M3.95 6.06 8.54 14M10.88 21.94 15.46 14" />
                                </svg>
                                Chrome extension
                            </span>
                        </div>
                    </div>

                    <div className="hero-visual" ref={demoRef} data-ready={demoMounted || undefined}>
                        {demoMounted ? (
                        <div style={{ position: 'relative', width: '100%' }}>
                            <DemoAnimation triggerRef={demoTriggerRef} />

                            {/* Floating Badges */}
                            <div className="floating-badge floating-badge--top">
                                <div className="badge-icon">
                                    <ZapIcon />
                                </div>
                                <div>
                                    <div className="badge-label">One Shortcut</div>
                                    <div className="badge-value">Alt+Shift+L</div>
                                </div>
                            </div>

                            <div className="floating-badge floating-badge--bottom">
                                <div className="badge-icon badge-icon--green">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="badge-label">Your Data</div>
                                    <div className="badge-value">Encrypted locally</div>
                                </div>
                            </div>
                        </div>
                        ) : (
                            // Holds the demo's space so nothing below shifts when it mounts
                            <div className="hero-visual__placeholder" aria-hidden="true" />
                        )}
                    </div>
                </div>
            </section>

            {/* Feature Grid — Why You Should Use Aullevo */}
            <section className="section home-features-bg" data-anim-scope>
                <div className="container">
                    <div data-reveal className="section-title">Why You Should Use Aullevo</div>
                    <p data-reveal className="section-description">
                        Lightweight, private, and built to cut hours off your daily workflow.
                    </p>

                    <div className="grid grid-2" ref={cardsRef} onMouseMove={handleMouseMove}>
                        {features.map((card, i) => (
                            <div key={i} className={`glass-card glow-card glow-card--${card.color}`} data-reveal>
                                {/* High-Tech Grid Matrix Layer */}
                                <div className="glow-card-grid-layer"></div>
                                {/* Geometric Clip-Path Tech Overlay */}
                                <div className="glow-card-clip-overlay"></div>
                                {/* Tech Geometry SVG Watermark */}
                                <div className="glow-card-svg-watermark">
                                    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="36" cy="36" r="30" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
                                        <circle cx="36" cy="36" r="15" stroke="currentColor" strokeWidth="1" opacity="0.3" />
                                        <path d="M36 6V66M6 36H66" stroke="currentColor" strokeWidth="1" opacity="0.4" />
                                        <rect x="31" y="31" width="10" height="10" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.7" />
                                    </svg>
                                </div>
                                <span className="glow-card-coord-tag">0{i + 1}</span>

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
            <section data-anim-scope className="section home-quick-docs" style={{ borderTop: '1px solid var(--border-glass)', padding: '4rem 0 2.5rem' }}>
                <div className="container">
                    <div data-reveal className="section-title">Guides & Basics at a Glance</div>
                    <p data-reveal className="section-description">
                        No jargon. Here is how Aullevo makes form filling fast, simple, and private.
                    </p>

                    <div className="grid grid-2" ref={guidesRef} onMouseMove={handleMouseMove} style={{ marginBottom: '3rem' }}>
                        {/* Guide Card 1: Save Form Profiles — Form Documents Stack & ID Badges */}
                        <div className="glass-card guide-context-card guide-context-card--profiles guide-context-card--blue" data-reveal>
                            {/* Document Fold & Technical Chamfer Clip-Path Overlay */}
                            <div className="guide-card-clip guide-card-clip--profiles"></div>

                            {/* Stacked Classified Agent Profile Books & Dossier Volumes SVG */}
                            <div className="guide-context-svg guide-context-svg--profiles">
                                <svg viewBox="0 0 440 220" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        <linearGradient id="book-cover-1" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.9" />
                                            <stop offset="50%" stopColor="#1e40af" stopOpacity="0.7" />
                                            <stop offset="100%" stopColor="#030712" stopOpacity="0.85" />
                                        </linearGradient>
                                        <linearGradient id="book-cover-top" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                                            <stop offset="50%" stopColor="#2563eb" stopOpacity="0.6" />
                                            <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.4" />
                                        </linearGradient>
                                        <linearGradient id="pages-edge" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.5" />
                                            <stop offset="50%" stopColor="#dbeafe" stopOpacity="0.85" />
                                            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.4" />
                                        </linearGradient>
                                    </defs>

                                    {/* ── 1. Bottom Hardcover Dossier Book (Volume I) ── */}
                                    <g className="book-volume-bottom" transform="translate(305, 142) rotate(6)">
                                        {/* Hardcover Outer Binding Base */}
                                        <rect x="-95" y="-12" width="190" height="26" rx="5" fill="url(#book-cover-1)" stroke="#3b82f6" strokeWidth="1.6" />
                                        {/* Book Page Block Rim (White/Silver Page Edges) */}
                                        <rect x="-90" y="-8" width="180" height="18" rx="2" fill="url(#pages-edge)" stroke="#60a5fa" strokeWidth="0.8" />
                                        {/* Spine Embossed Ribs */}
                                        <line x1="-92" y1="-10" x2="-92" y2="12" stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round" />
                                        <line x1="-86" y1="-10" x2="-86" y2="12" stroke="#60a5fa" strokeWidth="1.5" />
                                        <text x="35" y="5" fill="#93c5fd" fontSize="8" fontFamily="monospace" opacity="0.65" fontWeight="700">VOL. I // CORE</text>
                                    </g>

                                    {/* ── 2. Middle Hardcover Dossier Book (Volume II) with Ribbon Bookmark ── */}
                                    <g className="book-volume-middle" transform="translate(300, 114) rotate(-3)">
                                        {/* Hardcover Binding Base */}
                                        <rect x="-92" y="-12" width="184" height="24" rx="5" fill="url(#book-cover-1)" stroke="#60a5fa" strokeWidth="1.6" />
                                        {/* Book Pages Edge */}
                                        <rect x="-87" y="-8" width="174" height="16" rx="2" fill="url(#pages-edge)" stroke="#93c5fd" strokeWidth="0.8" />
                                        {/* Spine Ribs */}
                                        <line x1="-89" y1="-10" x2="-89" y2="10" stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round" />
                                        <line x1="-83" y1="-10" x2="-83" y2="10" stroke="#60a5fa" strokeWidth="1.5" />
                                        <text x="25" y="4" fill="#93c5fd" fontSize="8" fontFamily="monospace" opacity="0.65" fontWeight="700">VOL. II // IDENTITY</text>

                                        {/* Dangling Silk Ribbon Bookmark */}
                                        <path d="M45 -12 Q 52 15 50 35 L 56 42 L 62 35 Q 60 15 52 -12 Z" fill="#60a5fa" fillOpacity="0.85" stroke="#93c5fd" strokeWidth="1" className="ribbon-bookmark-sway" />
                                    </g>

                                    {/* ── 3. Top Active Dossier Volume with Classified Agent Profile ── */}
                                    <g className="book-volume-top" transform="translate(290, 62)">
                                        {/* Hardcover Binder Base */}
                                        <rect x="-85" y="-45" width="170" height="92" rx="8" fill="url(#book-cover-top)" stroke="#93c5fd" strokeWidth="2" />
                                        {/* Hardcover Corner Metal Reinforcement Brackets */}
                                        <path d="M-85 -25 L-85 -45 L-65 -45 Z" fill="#93c5fd" fillOpacity="0.6" stroke="#bfdbfe" strokeWidth="1" />
                                        <path d="M85 -25 L85 -45 L65 -45 Z" fill="#93c5fd" fillOpacity="0.6" stroke="#bfdbfe" strokeWidth="1" />

                                        {/* Internal Classified Agent Dossier Card Inset */}
                                        <rect x="-76" y="-36" width="152" height="74" rx="6" fill="#030712" fillOpacity="0.88" stroke="#3b82f6" strokeWidth="1.4" />

                                        {/* Agent Biometric Photo Frame with Silhouette */}
                                        <g transform="translate(-48, 1)">
                                            <rect x="-18" y="-26" width="36" height="42" rx="4" fill="#1e3a8a" fillOpacity="0.5" stroke="#60a5fa" strokeWidth="1.4" />
                                            {/* Agent Head & Shoulders Silhouette */}
                                            <circle cx="0" cy="-11" r="7.5" fill="#93c5fd" />
                                            <path d="M-12 12 C -12 2, -6 0, 0 0 C 6 0, 12 2, 12 12 Z" fill="#93c5fd" />
                                            {/* Biometric Scanning Crosshair Reticle */}
                                            <circle cx="0" cy="-8" r="13" stroke="#60a5fa" strokeWidth="1" strokeDasharray="3 2" opacity="0.8" className="agent-reticle-spin" />
                                            <rect x="-18" y="10" width="36" height="5" rx="1.5" fill="#3b82f6" fillOpacity="0.6" />
                                            <text x="-14" y="14" fill="#dbeafe" fontSize="4.5" fontFamily="monospace" fontWeight="700">AGENT #01</text>
                                        </g>

                                        {/* Agent Form Profile Data Fields */}
                                        <g transform="translate(-18, -26)">
                                            {/* Name / Title Tag */}
                                            <rect x="0" y="4" width="78" height="8" rx="2" fill="#1e40af" fillOpacity="0.4" stroke="#60a5fa" strokeWidth="1" />
                                            <text x="6" y="10.5" fill="#93c5fd" fontSize="6.5" fontFamily="monospace" fontWeight="700">PRIMARY_DOSSIER // VERIFIED</text>

                                            {/* Field 1: Form Credentials */}
                                            <line x1="0" y1="20" x2="80" y2="20" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.75" />
                                            {/* Field 2: Auto-Fill Data Slot */}
                                            <line x1="0" y1="30" x2="62" y2="30" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.55" />
                                            {/* Field 3: Encryption Token Slot */}
                                            <line x1="0" y1="40" x2="72" y2="40" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.4" />

                                            {/* Top-Secret Clearance Hologram Seal Badge */}
                                            <g transform="translate(64, 46)">
                                                <circle cx="0" cy="0" r="10" fill="#1e3a8a" fillOpacity="0.6" stroke="#93c5fd" strokeWidth="1.2" strokeDasharray="3 2" />
                                                <polygon points="0,-6 5,4 -5,4" fill="#60a5fa" fillOpacity="0.8" />
                                                <circle cx="0" cy="0" r="2.5" fill="#fef08a" />
                                            </g>
                                        </g>
                                    </g>
                                </svg>
                            </div>
                            <span className="guide-context-tag"> 01</span>

                            <div className="guide-context-border"></div>
                            <div className="glow-card-content" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                                <div className="feature-icon-box feature-icon-box--blue" style={{ flexShrink: 0, margin: 0 }}>
                                    <FolderUserIcon />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)' }}>Save Form Profiles</h3>
                                    <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                                        Start from ready-made Job, Academic, Government, Medical, Survey, and Financial profiles, or create your own. Switch between sets of answers in one click.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Guide Card 2: Public Link Support — Spinning 3D Wireframe Globe & Orbital Rings */}
                        <div className="glass-card guide-context-card guide-context-card--globe guide-context-card--yellow" data-reveal>
                            {/* Tech Radar Arc Corner Clip-Path Overlay */}
                            <div className="guide-card-clip guide-card-clip--globe"></div>

                            {/* 3D Point-and-Edge Geodesic Sphere & Real Jupiter Planetary Ring System SVG */}
                            <div className="guide-context-svg guide-context-svg--globe">
                                <svg viewBox="0 0 440 220" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        <radialGradient id="ring-front-grad" cx="50%" cy="50%" r="50%">
                                            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.95" />
                                            <stop offset="60%" stopColor="#fbbf24" stopOpacity="0.7" />
                                            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.1" />
                                        </radialGradient>
                                    </defs>

                                    <g transform="translate(305, 110) rotate(-22)">
                                        {/* ── 1. Jupiter Ring: Back Semi-Arc (Passes Behind Planet) ── */}
                                        <g className="jupiter-ring-back">
                                            {/* Outer Ring Back Arc */}
                                            <path d="M -118 0 A 118 28 0 0 1 118 0" stroke="#fbbf24" strokeWidth="1.2" strokeDasharray="5 3" strokeOpacity="0.35" />
                                            {/* Mid Ring Back Arc */}
                                            <path d="M -102 0 A 102 24 0 0 1 102 0" stroke="#f59e0b" strokeWidth="2" strokeOpacity="0.25" />
                                            {/* Inner Ring Back Arc */}
                                            <path d="M -85 0 A 85 20 0 0 1 85 0" stroke="#fbbf24" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.2" />
                                            {/* Orbiting Back Particles */}
                                            <circle cx="-60" cy="-22" r="1.8" fill="#fbbf24" opacity="0.4" />
                                            <circle cx="50" cy="-24" r="2" fill="#fbbf24" opacity="0.45" />
                                        </g>

                                        {/* ── 2. Pure Point-and-Edge Geodesic Wireframe Sphere ── */}
                                        <g className="geodesic-sphere">
                                            {/* Latitude Circle Edges */}
                                            <ellipse cx="0" cy="-28" rx="36" ry="10" stroke="#fbbf24" strokeWidth="0.8" strokeDasharray="2 2" strokeOpacity="0.35" />
                                            <ellipse cx="0" cy="0" rx="46" ry="12" stroke="#fbbf24" strokeWidth="1" strokeOpacity="0.5" />
                                            <ellipse cx="0" cy="28" rx="36" ry="10" stroke="#fbbf24" strokeWidth="0.8" strokeDasharray="2 2" strokeOpacity="0.35" />

                                            {/* Longitudinal Meridian Edges */}
                                            <ellipse cx="0" cy="0" rx="46" ry="46" stroke="#fbbf24" strokeWidth="1.2" strokeOpacity="0.6" />
                                            <ellipse cx="0" cy="0" rx="30" ry="46" stroke="#fbbf24" strokeWidth="0.9" strokeOpacity="0.4" />
                                            <ellipse cx="0" cy="0" rx="14" ry="46" stroke="#fbbf24" strokeWidth="0.9" strokeOpacity="0.35" />
                                            <line x1="0" y1="-46" x2="0" y2="46" stroke="#fbbf24" strokeWidth="1" strokeOpacity="0.45" />

                                            {/* Geodesic Triangulation Edges (Connecting Nodes) */}
                                            <line x1="0" y1="-46" x2="-26" y2="-28" stroke="#fbbf24" strokeWidth="0.9" strokeOpacity="0.5" />
                                            <line x1="0" y1="-46" x2="0" y2="-28" stroke="#fbbf24" strokeWidth="0.9" strokeOpacity="0.5" />
                                            <line x1="0" y1="-46" x2="26" y2="-28" stroke="#fbbf24" strokeWidth="0.9" strokeOpacity="0.5" />

                                            <line x1="-26" y1="-28" x2="-38" y2="0" stroke="#fbbf24" strokeWidth="0.9" strokeOpacity="0.5" />
                                            <line x1="-26" y1="-28" x2="-14" y2="0" stroke="#fbbf24" strokeWidth="0.9" strokeOpacity="0.5" />
                                            <line x1="0" y1="-28" x2="-14" y2="0" stroke="#fbbf24" strokeWidth="0.9" strokeOpacity="0.5" />
                                            <line x1="0" y1="-28" x2="14" y2="0" stroke="#fbbf24" strokeWidth="0.9" strokeOpacity="0.5" />
                                            <line x1="26" y1="-28" x2="14" y2="0" stroke="#fbbf24" strokeWidth="0.9" strokeOpacity="0.5" />
                                            <line x1="26" y1="-28" x2="38" y2="0" stroke="#fbbf24" strokeWidth="0.9" strokeOpacity="0.5" />

                                            <line x1="-38" y1="0" x2="-26" y2="28" stroke="#fbbf24" strokeWidth="0.9" strokeOpacity="0.5" />
                                            <line x1="-14" y1="0" x2="-26" y2="28" stroke="#fbbf24" strokeWidth="0.9" strokeOpacity="0.5" />
                                            <line x1="-14" y1="0" x2="0" y2="28" stroke="#fbbf24" strokeWidth="0.9" strokeOpacity="0.5" />
                                            <line x1="14" y1="0" x2="0" y2="28" stroke="#fbbf24" strokeWidth="0.9" strokeOpacity="0.5" />
                                            <line x1="14" y1="0" x2="26" y2="28" stroke="#fbbf24" strokeWidth="0.9" strokeOpacity="0.5" />
                                            <line x1="38" y1="0" x2="26" y2="28" stroke="#fbbf24" strokeWidth="0.9" strokeOpacity="0.5" />

                                            <line x1="-26" y1="28" x2="0" y2="46" stroke="#fbbf24" strokeWidth="0.9" strokeOpacity="0.5" />
                                            <line x1="0" y1="28" x2="0" y2="46" stroke="#fbbf24" strokeWidth="0.9" strokeOpacity="0.5" />
                                            <line x1="26" y1="28" x2="0" y2="46" stroke="#fbbf24" strokeWidth="0.9" strokeOpacity="0.5" />

                                            {/* Geodesic Point Vertices (Glowing Nodes) */}
                                            {/* Top Pole Node */}
                                            <circle cx="0" cy="-46" r="2.8" fill="#fef08a" />
                                            {/* Upper Tier Nodes */}
                                            <circle cx="-34" cy="-28" r="2.2" fill="#fbbf24" />
                                            <circle cx="-18" cy="-28" r="2.4" fill="#fef08a" />
                                            <circle cx="0" cy="-28" r="2.8" fill="#fef08a" />
                                            <circle cx="18" cy="-28" r="2.4" fill="#fef08a" />
                                            <circle cx="34" cy="-28" r="2.2" fill="#fbbf24" />
                                            {/* Equatorial Nodes */}
                                            <circle cx="-46" cy="0" r="2.6" fill="#fbbf24" />
                                            <circle cx="-38" cy="0" r="2.2" fill="#fef08a" />
                                            <circle cx="-14" cy="0" r="2.8" fill="#fef08a" />
                                            <circle cx="0" cy="0" r="3.2" fill="#fef08a" />
                                            <circle cx="14" cy="0" r="2.8" fill="#fef08a" />
                                            <circle cx="38" cy="0" r="2.2" fill="#fef08a" />
                                            <circle cx="46" cy="0" r="2.6" fill="#fbbf24" />
                                            {/* Lower Tier Nodes */}
                                            <circle cx="-34" cy="28" r="2.2" fill="#fbbf24" />
                                            <circle cx="-18" cy="28" r="2.4" fill="#fef08a" />
                                            <circle cx="0" cy="28" r="2.8" fill="#fef08a" />
                                            <circle cx="18" cy="28" r="2.4" fill="#fef08a" />
                                            <circle cx="34" cy="28" r="2.2" fill="#fbbf24" />
                                            {/* Bottom Pole Node */}
                                            <circle cx="0" cy="46" r="2.8" fill="#fef08a" />
                                        </g>

                                        {/* ── 3. Jupiter Ring: Front Semi-Arc (Sweeps In Front of Planet) ── */}
                                        <g className="jupiter-ring-front">
                                            {/* Outer Ring Front Glowing Arc */}
                                            <path d="M 118 0 A 118 28 0 0 1 -118 0" stroke="#fef08a" strokeWidth="2.2" strokeOpacity="0.9" />
                                            {/* Main Ring Body Front Arc with Shading */}
                                            <path d="M 102 0 A 102 24 0 0 1 -102 0" stroke="#fbbf24" strokeWidth="3" strokeOpacity="0.8" />
                                            {/* Inner Crepe Ring Front Arc */}
                                            <path d="M 85 0 A 85 20 0 0 1 -85 0" stroke="#f59e0b" strokeWidth="1.5" strokeOpacity="0.6" />
                                            {/* Orbital Ring Stream Streamers */}
                                            <path d="M 110 5 A 110 26 0 0 1 -110 5" stroke="#fef08a" strokeWidth="1" strokeDasharray="8 6" strokeOpacity="0.75" />
                                        </g>

                                        {/* ── 4. Continuous 360° Orbiting Stars Revolved Along Ring ── */}
                                        <g className="jupiter-revolving-stars">
                                            <g className="orbit-star-node orbit-star-node--1">
                                                <circle cx="0" cy="0" r="4.5" fill="#fef08a" />
                                                <circle cx="0" cy="0" r="9" stroke="#fef08a" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
                                            </g>
                                            <g className="orbit-star-node orbit-star-node--2">
                                                <circle cx="0" cy="0" r="3.5" fill="#fbbf24" />
                                                <circle cx="0" cy="0" r="7" stroke="#fbbf24" strokeWidth="1" opacity="0.5" />
                                            </g>
                                            <g className="orbit-star-node orbit-star-node--3">
                                                <circle cx="0" cy="0" r="4" fill="#fef08a" />
                                                <circle cx="0" cy="0" r="8" stroke="#fbbf24" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
                                            </g>
                                            <g className="orbit-star-node orbit-star-node--4">
                                                <circle cx="0" cy="0" r="2.8" fill="#fef08a" />
                                                <circle cx="0" cy="0" r="6" stroke="#fef08a" strokeWidth="0.8" opacity="0.4" />
                                            </g>
                                        </g>
                                    </g>
                                </svg>
                            </div>
                            <span className="guide-context-tag">02</span>

                            <div className="guide-context-border"></div>
                            <div className="glow-card-content" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                                <div className="feature-icon-box feature-icon-box--yellow" style={{ flexShrink: 0, margin: 0 }}>
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

                        {/* Guide Card 3: Dual-Engine Speeds — Mechanical Dual-Interlocking Precision Gears */}
                        <div className="glass-card guide-context-card guide-context-card--gears guide-context-card--blue" data-reveal>
                            {/* Industrial Chamfer Corner Clip-Path Overlay */}
                            <div className="guide-card-clip guide-card-clip--gears"></div>

                            {/* Industrial Precision Involute Multi-Gear Assembly SVG */}
                            <div className="guide-context-svg guide-context-svg--gears">
                                <svg viewBox="0 0 440 220" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        <linearGradient id="metal-gear-main" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.85" />
                                            <stop offset="50%" stopColor="#1d4ed8" stopOpacity="0.65" />
                                            <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.45" />
                                        </linearGradient>
                                        <linearGradient id="metal-gear-pinion" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.85" />
                                            <stop offset="50%" stopColor="#2563eb" stopOpacity="0.65" />
                                            <stop offset="100%" stopColor="#1e40af" stopOpacity="0.45" />
                                        </linearGradient>
                                        <linearGradient id="metal-gear-aux" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.8" />
                                            <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.4" />
                                        </linearGradient>
                                    </defs>

                                    {/* ── 1. Primary 24-Tooth Heavy Industrial Bull Gear (Clockwise) ── */}
                                    <g className="gear-industrial-main" transform="translate(330, 122)">
                                        {/* Involute 24-Tooth Outer Gear Contour */}
                                        <path
                                            d="M 52.50 0.00 L 52.41 3.02 L 61.69 6.16 L 61.19 10.02 L 51.41 10.65 L 50.71 13.59 L 49.84 16.48 L 58.00 21.92 L 56.51 25.51 L 46.90 23.59 L 45.47 26.25 L 43.88 28.82 L 50.35 36.18 L 47.98 39.27 L 39.20 34.92 L 37.12 37.12 L 34.92 39.20 L 39.27 47.98 L 36.18 50.35 L 28.82 43.88 L 26.25 45.47 L 23.59 46.90 L 25.51 56.51 L 21.92 58.00 L 16.48 49.84 L 13.59 50.71 L 10.65 51.41 L 10.02 61.19 L 6.16 61.69 L 3.02 52.41 L 0.00 52.50 L -3.02 52.41 L -6.16 61.69 L -10.02 61.19 L -10.65 51.41 L -13.59 50.71 L -16.48 49.84 L -21.92 58.00 L -25.51 56.51 L -23.59 46.90 L -26.25 45.47 L -28.82 43.88 L -36.18 50.35 L -39.27 47.98 L -34.92 39.20 L -37.12 37.12 L -39.20 34.92 L -47.98 39.27 L -50.35 36.18 L -43.88 28.82 L -45.47 26.25 L -46.90 23.59 L -56.51 25.51 L -58.00 21.92 L -49.84 16.48 L -50.71 13.59 L -51.41 10.65 L -61.19 10.02 L -61.69 6.16 L -52.41 3.02 L -52.50 0.00 L -52.41 -3.02 L -61.69 -6.16 L -61.19 -10.02 L -51.41 -10.65 L -50.71 -13.59 L -49.84 -16.48 L -58.00 -21.92 L -56.51 -25.51 L -46.90 -23.59 L -45.47 -26.25 L -43.88 -28.82 L -50.35 -36.18 L -47.98 -39.27 L -39.20 -34.92 L -37.12 -37.12 L -34.92 -39.20 L -39.27 -47.98 L -36.18 -50.35 L -28.82 -43.88 L -26.25 -45.47 L -23.59 -46.90 L -25.51 -56.51 L -21.92 -58.00 L -16.48 -49.84 L -13.59 -50.71 L -10.65 -51.41 L -10.02 -61.19 L -6.16 -61.69 L -3.02 -52.41 L -0.00 -52.50 L 3.02 -52.41 L 6.16 -61.69 L 10.02 -61.19 L 10.65 -51.41 L 13.59 -50.71 L 16.48 -49.84 L 21.92 -58.00 L 25.51 -56.51 L 23.59 -46.90 L 26.25 -45.47 L 28.82 -43.88 L 36.18 -50.35 L 39.27 -47.98 L 34.92 -39.20 L 37.12 -37.12 L 39.20 -34.92 L 47.98 -39.27 L 50.35 -36.18 L 43.88 -28.82 L 45.47 -26.25 L 46.90 -23.59 L 56.51 -25.51 L 58.00 -21.92 L 49.84 -16.48 L 50.71 -13.59 L 51.41 -10.65 L 61.19 -10.02 L 61.69 -6.16 L 52.41 -3.02 L 52.50 -0.00 Z"
                                            fill="url(#metal-gear-main)"
                                            stroke="#60a5fa"
                                            strokeWidth="1.8"
                                        />
                                        {/* Machined Rim Bevel Circle */}
                                        <circle cx="0" cy="0" r="44" fill="none" stroke="#93c5fd" strokeWidth="1.2" strokeOpacity="0.8" />
                                        {/* Recessed Internal Web Step */}
                                        <circle cx="0" cy="0" r="35" fill="#030712" fillOpacity="0.8" stroke="#3b82f6" strokeWidth="1.5" />
                                        {/* 6 Weight-Reduction Circular Cutout Holes */}
                                        {[0, 60, 120, 180, 240, 300].map((deg) => (
                                            <circle key={deg} cx={22 * Math.cos((deg * Math.PI) / 180)} cy={22 * Math.sin((deg * Math.PI) / 180)} r="5.2" fill="#030712" stroke="#60a5fa" strokeWidth="1.4" />
                                        ))}
                                        {/* Central Steel Axle Spindle Collar */}
                                        <circle cx="0" cy="0" r="14" fill="url(#metal-gear-main)" stroke="#93c5fd" strokeWidth="1.8" />
                                        {/* Heavy Mechanical Hex Nut */}
                                        <polygon points="9,0 4.5,7.79 -4.5,7.79 -9,0 -4.5,-7.79 4.5,-7.79" fill="#60a5fa" stroke="#93c5fd" strokeWidth="1.2" />
                                        {/* Center Hollow Shaft Bore */}
                                        <circle cx="0" cy="0" r="4.2" fill="#030712" stroke="#3b82f6" strokeWidth="1.2" />
                                    </g>

                                    {/* ── 2. Intermeshing 16-Tooth Precision Pinion Gear (Counter-Clockwise) ── */}
                                    <g className="gear-industrial-pinion" transform="translate(251, 67)">
                                        {/* Involute 16-Tooth Outer Gear Contour */}
                                        <path
                                            d="M 32.86 6.54 L 32.17 9.35 L 40.46 14.57 L 38.91 18.31 L 29.36 16.14 L 27.85 18.61 L 26.14 20.95 L 31.80 28.94 L 28.94 31.80 L 20.95 26.14 L 18.61 27.85 L 16.14 29.36 L 18.31 38.91 L 14.57 40.46 L 9.35 32.17 L 6.54 32.86 L 3.68 33.30 L 2.03 42.95 L -2.03 42.95 L -3.68 33.30 L -6.54 32.86 L -9.35 32.17 L -14.57 40.46 L -18.31 38.91 L -16.14 29.36 L -18.61 27.85 L -20.95 26.14 L -28.94 31.80 L -31.80 28.94 L -26.14 20.95 L -27.85 18.61 L -29.36 16.14 L -38.91 18.31 L -40.46 14.57 L -32.17 9.35 L -32.86 6.54 L -33.30 3.68 L -42.95 2.03 L -42.95 -2.03 L -33.30 -3.68 L -32.86 -6.54 L -32.17 -9.35 L -40.46 -14.57 L -38.91 -18.31 L -29.36 -16.14 L -27.85 -18.61 L -26.14 -20.95 L -31.80 -28.94 L -28.94 -31.80 L -20.95 -26.14 L -18.61 -27.85 L -16.14 -29.36 L -18.31 -38.91 L -14.57 -40.46 L -9.35 -32.17 L -6.54 -32.86 L -3.68 -33.30 L -2.03 -42.95 L 2.03 -42.95 L 3.68 -33.30 L 6.54 -32.86 L 9.35 -32.17 L 14.57 -40.46 L 18.31 -38.91 L 16.14 -29.36 L 18.61 -27.85 L 20.95 -26.14 L 28.94 -31.80 L 31.80 -28.94 L 26.14 -20.95 L 27.85 -18.61 L 29.36 -16.14 L 38.91 -18.31 L 40.46 -14.57 L 32.17 -9.35 L 32.86 -6.54 L 33.30 -3.68 L 42.95 -2.03 L 42.95 2.03 L 33.30 3.68 L 32.86 6.54 Z"
                                            fill="url(#metal-gear-pinion)"
                                            stroke="#93c5fd"
                                            strokeWidth="1.6"
                                        />
                                        {/* Machined Inner Rim */}
                                        <circle cx="0" cy="0" r="27" fill="none" stroke="#60a5fa" strokeWidth="1.2" strokeOpacity="0.8" />
                                        {/* Recessed Web Ring */}
                                        <circle cx="0" cy="0" r="21" fill="#030712" fillOpacity="0.75" stroke="#3b82f6" strokeWidth="1.4" />
                                        {/* 4 Weight-Reduction Cutout Holes */}
                                        {[0, 90, 180, 270].map((deg) => (
                                            <circle key={deg} cx={13 * Math.cos((deg * Math.PI) / 180)} cy={13 * Math.sin((deg * Math.PI) / 180)} r="3.6" fill="#030712" stroke="#93c5fd" strokeWidth="1.2" />
                                        ))}
                                        {/* Center Retaining Bolt Collar */}
                                        <circle cx="0" cy="0" r="9" fill="url(#metal-gear-pinion)" stroke="#93c5fd" strokeWidth="1.5" />
                                        <circle cx="0" cy="0" r="3.5" fill="#93c5fd" stroke="#030712" strokeWidth="1" />
                                    </g>

                                    {/* ── 3. Auxiliary 12-Tooth High-Speed Gear (Counter-Clockwise) ── */}
                                    <g className="gear-industrial-aux" transform="translate(366, 44)">
                                        <path
                                            d="M 23.18 6.21 L 22.31 8.83 L 29.56 14.67 L 27.49 18.26 L 18.81 14.91 L 16.97 16.97 L 14.91 18.81 L 18.26 27.49 L 14.67 29.56 L 8.83 22.31 L 6.21 23.18 L 3.51 23.74 L 2.07 32.93 L -2.07 32.93 L -3.51 23.74 L -6.21 23.18 L -8.83 22.31 L -14.67 29.56 L -18.26 27.49 L -14.91 18.81 L -16.97 16.97 L -18.81 14.91 L -27.49 18.26 L -29.56 14.67 L -22.31 8.83 L -23.18 6.21 L -23.74 3.51 L -32.93 2.07 L -32.93 -2.07 L -23.74 -3.51 L -23.18 -6.21 L -22.31 -8.83 L -29.56 -14.67 L -27.49 -18.26 L -18.81 -14.91 L -16.97 -16.97 L -14.91 -18.81 L -18.26 -27.49 L -14.67 -29.56 L -8.83 -22.31 L -6.21 -23.18 L -3.51 -23.74 L -2.07 -32.93 L 2.07 -32.93 L 3.51 -23.74 L 6.21 -23.18 L 8.83 -22.31 L 14.67 -29.56 L 18.26 -27.49 L 14.91 -18.81 L 16.97 -16.97 L 18.81 -14.91 L 27.49 -18.26 L 29.56 -14.67 L 22.31 -8.83 L 23.18 -6.21 L 23.74 -3.51 L 32.93 -2.07 L 32.93 2.07 L 23.74 3.51 L 23.18 6.21 Z"
                                            fill="url(#metal-gear-aux)"
                                            stroke="#60a5fa"
                                            strokeWidth="1.4"
                                        />
                                        <circle cx="0" cy="0" r="17" fill="#030712" fillOpacity="0.75" stroke="#3b82f6" strokeWidth="1.2" />
                                        <circle cx="0" cy="0" r="7" fill="#60a5fa" stroke="#93c5fd" strokeWidth="1.2" />
                                        <circle cx="0" cy="0" r="2.8" fill="#030712" />
                                    </g>
                                </svg>
                            </div>
                            <span className="guide-context-tag">03</span>

                            <div className="guide-context-border"></div>
                            <div className="glow-card-content" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                                <div className="feature-icon-box feature-icon-box--blue" style={{ flexShrink: 0, margin: 0 }}>
                                    <LightningIcon />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)' }}>Dual-Engine Speeds</h3>
                                    <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                                        Keyword matching fills standard fields instantly. AI Smart Fill takes a few extra seconds to read the questions, then picks answers and drafts short responses.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Guide Card 4: Zero-Knowledge Privacy — Hans Wagner Vault Door (Army of Thieves) */}
                        <div className="glass-card guide-context-card guide-context-card--vault guide-context-card--yellow" data-reveal>
                            {/* Security Vault Beveled Arch Clip-Path Overlay */}
                            <div className="guide-card-clip guide-card-clip--vault"></div>

                            {/* Iconic Hans Wagner Vault Door & Master Combination Rosette SVG */}
                            <div className="guide-context-svg guide-context-svg--vault">
                                <svg viewBox="0 0 440 220" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        <radialGradient id="wagner-gold-core" cx="50%" cy="50%" r="50%">
                                            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.95" />
                                            <stop offset="40%" stopColor="#fbbf24" stopOpacity="0.8" />
                                            <stop offset="80%" stopColor="#d97706" stopOpacity="0.5" />
                                            <stop offset="100%" stopColor="#451a03" stopOpacity="0.2" />
                                        </radialGradient>
                                        <linearGradient id="wagner-steel-plate" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.3" />
                                            <stop offset="50%" stopColor="#271b0c" stopOpacity="0.75" />
                                            <stop offset="100%" stopColor="#030712" stopOpacity="0.9" />
                                        </linearGradient>
                                        <linearGradient id="wagner-gold-filigree" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#fef08a" />
                                            <stop offset="50%" stopColor="#fbbf24" />
                                            <stop offset="100%" stopColor="#d97706" />
                                        </linearGradient>
                                    </defs>

                                    {/* ── Iconic Hans Wagner Circular Vault Door Assembly ── */}
                                    <g className="wagner-vault-assembly" transform="translate(325, 110)">
                                        {/* 1. Outer Heavy Steel Door Rim */}
                                        <circle cx="0" cy="0" r="82" fill="url(#wagner-steel-plate)" stroke="#fbbf24" strokeWidth="2.2" />

                                        {/* 2. Perimeter Locking Radial Lug Bolts */}
                                        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                                            <g key={deg} transform={`rotate(${deg})`}>
                                                <rect x="-3.5" y="-87" width="7" height="9" rx="2" fill="#fef08a" stroke="#d97706" strokeWidth="1" />
                                                <circle cx="0" cy="-82" r="1.5" fill="#030712" />
                                            </g>
                                        ))}

                                        {/* 3. Outer Wagner Ring Celtic Knotwork Band */}
                                        <circle cx="0" cy="0" r="74" fill="none" stroke="#d97706" strokeWidth="9" strokeOpacity="0.35" />
                                        <circle cx="0" cy="0" r="78.5" fill="none" stroke="#fef08a" strokeWidth="1" strokeOpacity="0.8" />
                                        <circle cx="0" cy="0" r="69.5" fill="none" stroke="#fef08a" strokeWidth="1" strokeOpacity="0.8" />

                                        {/* Norse Knotwork Interlaced Arcs */}
                                        {[0, 24, 48, 72, 96, 120, 144, 168, 192, 216, 240, 264, 288, 312, 336].map((deg) => (
                                            <g key={deg} transform={`rotate(${deg})`}>
                                                <path d="M-5 -74 Q 0 -78 5 -74 Q 0 -70 -5 -74" stroke="url(#wagner-gold-filigree)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                                                <circle cx="0" cy="-74" r="1.6" fill="#fef08a" />
                                            </g>
                                        ))}

                                        {/* 4. Stepped Internal Steel Door Basin */}
                                        <circle cx="0" cy="0" r="63" fill="#030712" fillOpacity="0.75" stroke="#fbbf24" strokeWidth="1.6" />
                                        <circle cx="0" cy="0" r="56" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.5" />

                                        {/* 5. Master Rosette Mythological Filigree Relief */}
                                        <circle cx="0" cy="0" r="48" fill="url(#wagner-steel-plate)" stroke="#fbbf24" strokeWidth="1.8" />
                                        {[0, 60, 120, 180, 240, 300].map((deg) => (
                                            <g key={deg} transform={`rotate(${deg})`}>
                                                <path d="M0 -18 C -7 -28 7 -28 0 -44 C -5 -34 5 -34 0 -18" fill="#fbbf24" fillOpacity="0.35" stroke="#fef08a" strokeWidth="1.2" />
                                                <circle cx="0" cy="-32" r="2.5" fill="#fef08a" />
                                            </g>
                                        ))}

                                        {/* 6. Four-Spoke Vault Locking Turnstile Wheel */}
                                        <g className="wagner-turnstile-wheel">
                                            {[0, 90, 180, 270].map((deg) => (
                                                <g key={deg} transform={`rotate(${deg})`}>
                                                    <line x1="0" y1="0" x2="0" y2="-44" stroke="#fef08a" strokeWidth="3.2" strokeLinecap="round" />
                                                    <circle cx="0" cy="-44" r="4.2" fill="#fef08a" stroke="#d97706" strokeWidth="1.2" />
                                                </g>
                                            ))}
                                            <circle cx="0" cy="0" r="19" fill="#030712" stroke="#fbbf24" strokeWidth="2" />
                                        </g>

                                        {/* 7. Central Calibrated Combination Dial (Safe-Cracking Animation) */}
                                        <g className="wagner-center-tumbler">
                                            <circle cx="0" cy="0" r="16" fill="url(#wagner-gold-core)" stroke="#fef08a" strokeWidth="1.8" />
                                            <circle cx="0" cy="0" r="12" fill="#030712" stroke="#d97706" strokeWidth="1" />
                                            {/* Combination Calibration Hash Ticks */}
                                            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                                                <line key={deg} x1="0" y1="-8.5" x2="0" y2="-11.5" stroke="#fef08a" strokeWidth="1" transform={`rotate(${deg})`} />
                                            ))}
                                            {/* Central Knurled Dial Spindle & Pointer */}
                                            <circle cx="0" cy="0" r="5" fill="#fef08a" />
                                            <line x1="0" y1="0" x2="0" y2="-9.5" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
                                        </g>
                                    </g>
                                </svg>
                            </div>
                            <span className="guide-context-tag">04</span>

                            <div className="guide-context-border"></div>
                            <div className="glow-card-content" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                                <div className="feature-icon-box feature-icon-box--yellow" style={{ flexShrink: 0, margin: 0 }}>
                                    <LockShieldIcon />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)' }}>Privacy You Control</h3>
                                    <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                                        Your profiles are encrypted on your machine. Fields marked SENSITIVE never reach the AI, and you decide which answers the AI may see.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Pros and Cons */}
                    <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div data-reveal className="section-title" style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>Pros & Cons Overview</div>

                        <div data-reveal style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                            <div style={{ background: 'var(--card-gradient-pos)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '1.5rem', borderRadius: '14px' }}>
                                <h4 style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 0.85rem 0', fontSize: '1.15rem' }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                                    Pros (Advantages)
                                </h4>
                                <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                                    <li style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}><strong>Massive Time Savings:</strong> Fills forms in seconds.</li>
                                    <li style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}><strong>Local Encryption:</strong> AES-256 with your own passphrase, on your device.</li>
                                    <li style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}><strong>Works Offline:</strong> Keyword matching needs no internet or AI key.</li>
                                    <li style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}><strong>Unauthenticated forms:</strong> Works on forms without signing up.</li>
                                </ul>
                            </div>

                            <div style={{ background: 'var(--card-gradient-neg)', border: '1px solid rgba(251, 191, 36, 0.2)', padding: '1.5rem', borderRadius: '14px' }}>
                                <h4 style={{ color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 0.85rem 0', fontSize: '1.15rem' }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                    Cons (Limitations)
                                </h4>
                                <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                                    <li style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}><strong>AI Needs a Key:</strong> AI Smart Fill uses your own API key (Gemini has a free tier) or your own AI server, and adds a few seconds.</li>
                                    <li style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}><strong>CAPTCHAs Stay Manual:</strong> Aullevo never solves or bypasses CAPTCHAs.</li>
                                    <li style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}><strong>Unusual Widgets:</strong> Some highly custom inputs may need a manual touch.</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                        <Link to="/docs" className="btn btn-secondary btn-lg" style={{ textDecoration: 'none' }}>
                            View Full Guides & Docs
                        </Link>
                    </div>
                </div>
            </section>

            {/* Community Reviews Section */}
            <div data-reveal>
                <Reviews />
            </div>

            {/* Roadmap — What We're Working On */}
            <section className="section roadmap-section" data-anim-scope>
                <div className="container">
                    <div data-reveal className="section-title">What's Coming Next</div>
                    <p data-reveal className="section-description">
                        We're constantly improving Aullevo. Here's a look at what's on the horizon.
                    </p>

                    <div className="roadmap-grid">
                        <div className="roadmap-card roadmap-card--completed" data-reveal>
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

                        <div className="roadmap-card roadmap-card--completed" data-reveal>
                            <div className="roadmap-status">
                                <span className="roadmap-status-dot roadmap-status-dot--done"></span>
                                Completed
                            </div>
                            <div className="roadmap-icon" style={{ background: 'var(--bg-badge-live)', color: 'var(--accent-pop)' }}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
                                </svg>
                            </div>
                            <h3>Choose Your AI Provider</h3>
                            <p>
                                AI Smart Fill runs on Google Gemini, ChatGPT (OpenAI), Claude (Anthropic), or any
                                OpenAI-compatible server, with SENSITIVE fields never sent.
                            </p>
                        </div>

                        <div className="roadmap-card roadmap-card--completed" data-reveal>
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
                                Deep field detection that works inside Shadow DOM web components
                                and iframes, including Google Forms and Microsoft Forms.
                            </p>
                        </div>

                        <div className="roadmap-card" data-reveal>
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
                            <h3>Resume Scanner (PDF & DOCX)</h3>
                            <p>
                                Upload your resume and have Aullevo pull your details straight into your profile, processed on your device.
                            </p>
                        </div>

                        <div className="roadmap-card" data-reveal>
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
                                You can already point AI Smart Fill at a model on your own computer (Ollama, LM Studio). Next: models that
                                run inside the browser itself, with no setup and zero external API/cloud calls.
                            </p>
                        </div>

                        <div className="roadmap-card" data-reveal>
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

                        <div className="roadmap-card" data-reveal>
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
                            <h3>Firefox Support</h3>
                            <p>
                                Aullevo already runs on Chrome, Brave, and Edge.
                                Firefox is next, so everyone can use it no matter their browser.
                            </p>
                        </div>
                    </div>
                </div>
            </section>


        </div>
    );
};

export default Home;

import React, { useState, useEffect } from 'react';

const DemoAnimation: React.FC = () => {
    const [step, setStep] = useState(0);
    const [sequenceCount, setSequenceCount] = useState(0);

    useEffect(() => {
        let isMounted = true;
        let timers: ReturnType<typeof setTimeout>[] = [];

        const schedule = (delay: number, s: number) => {
            timers.push(setTimeout(() => {
                if (isMounted) setStep(s);
            }, delay));
        };

        const runSequence = () => {
            setStep(0);

            // --- Scene 1: Extensions Page & Installation ---
            schedule(1000, 1);    // Idle on extensions page
            schedule(2000, 2);    // Move cursor to "Load unpacked"
            schedule(3000, 3);    // Click "Load unpacked"
            schedule(3500, 4);    // Aullevo card appears
            schedule(4500, 5);    // Move cursor to enable toggle
            schedule(5500, 5.5);  // Click toggle — enable Aullevo

            // --- Scene 2: Switch to Job Application page ---
            schedule(6500, 6);    // Crossfade to Form view
            schedule(7000, 7);    // Move to Extension icon
            schedule(8000, 8);    // Click Ext icon
            schedule(8300, 8.5);  // Sidebar opens

            // --- Scene 3: Settings tab Configuration ---
            schedule(9000, 9);    // Move cursor to Settings tab
            schedule(10000, 10);  // Click → switch to Settings tab
            schedule(12000, 11);  // Idle in Settings tab

            // --- Scene 4: My Profile setup ---
            schedule(13000, 12);  // Move cursor to Profile tab
            schedule(14000, 13);  // Click → switch to Profile tab
            schedule(16000, 14);  // Idle in Profile tab

            // --- Scene 5: Fill Form ---
            schedule(17000, 15);  // Move cursor to Fill Form tab
            schedule(18000, 16);  // Click -> Switch to Fill form tab
            schedule(18500, 17);  // Move to Fill button
            schedule(19500, 18);  // Click Fill
            schedule(19800, 19);  // Scanning glow starts
            schedule(20500, 20);  // Fill fields 1 & 2
            schedule(21000, 21);  // Fill fields 3 & 4
            schedule(21500, 22);  // Success status

            // --- Reset ---
            schedule(25000, 99);
        };

        runSequence();

        return () => {
            isMounted = false;
            timers.forEach(clearTimeout);
        };
    }, [sequenceCount]);

    useEffect(() => {
        if (step === 99) {
            setSequenceCount(c => c + 1);
        }
    }, [step]);

    /* ── Derived state ── */
    const isExtensionView = step < 6;
    const isFormView = step >= 6;
    const isExtLoaded = step >= 4;
    const isExtEnabled = step >= 5.5;
    const isSidebarOpen = step >= 8.5 && step < 99;
    const isScanning = step === 19 || step === 20;
    const isFilling = step >= 19 && step < 22;
    const isSuccess = step >= 22 && step < 99;
    const isClicking = step === 3 || step === 5.5 || step === 8 || step === 10 || step === 13 || step === 16 || step === 18;

    // Active sidebar tab
    let activeTab: 'fill' | 'profile' | 'settings' = 'fill'; // starts as fill right after opening
    if (step >= 10 && step < 13) activeTab = 'settings';
    if (step >= 13 && step < 16) activeTab = 'profile';
    if (step >= 16) activeTab = 'fill';

    /* ── Cursor position ── */
    const getCursorStyle = (): React.CSSProperties => {
        // ── Extension page ──
        if (isExtensionView) {
            if (step < 2) return { top: '50%', left: '40%' };                        // idle
            if (step < 3) return { top: '142px', left: '100px' };                      // hover Load unpacked (toolbar row)
            if (step < 4) return { top: '142px', left: '150px' };                      // clicking Load unpacked
            if (step < 5) return { top: '380px', left: 'calc(100% - 55px)' };          // move to Aullevo toggle (far right of card footer)
            return { top: '380px', left: 'calc(100% - 55px)' };                  // clicking toggle
        }

        // ── Form / sidebar page ──
        if (step >= 6 && step < 7) return { top: '50%', left: '35%' };              // idle on form
        if (step >= 7 && step < 8.5) return { top: '26px', left: 'calc(100% - 36px)' }; // hover ext icon in browser bar

        // Settings Tab Hover
        if (step >= 8.5 && step < 10) return { top: '118px', left: 'calc(100% - 80px)' }; // hover Settings tab
        if (step >= 10 && step < 12) return { top: '45%', left: '42%' }; // idle in Settings tab

        // Profile Tab Hover
        if (step >= 12 && step < 13) return { top: '118px', left: 'calc(100% - 200px)' }; // hover My Profile tab
        if (step >= 13 && step < 15) return { top: '45%', left: '42%' }; // idle in Profile tab

        // Fill Form Tab Hover
        if (step >= 15 && step < 16) return { top: '118px', left: 'calc(100% - 250px)' }; // hover Fill form tab

        // Fill Form Button Hover
        if (step >= 16 && step < 18) return { top: '55%', left: 'calc(100% - 150px)' }; // hover Fill button

        // Watch form fill
        if (step >= 18) return { top: '45%', left: '42%' };              // watch form fill

        return { top: '50%', left: '35%' };
    };

    /* ── RENDER ── */
    return (
        <div className="demo-animation-wrapper">
            {/* Fake cursor */}
            <div className={`demo-cursor ${isClicking ? 'clicking' : ''}`} style={getCursorStyle()}>
                <svg viewBox="0 0 24 24">
                    <polygon points="5,3 19,12 12,14 15,21 12,22 9,15 4,18" />
                </svg>
            </div>

            {/* Browser chrome header */}
            <div className="demo-browser-header">
                <div className="browser-dots">
                    <div className="dot-r" />
                    <div className="dot-y" />
                    <div className="dot-g" />
                </div>
                <div className="browser-url-bar">
                    <span style={{ color: 'var(--text-muted)', marginRight: 4 }}>
                        {isExtensionView ? '' : 'https://'}
                    </span>
                    <span style={{ color: 'var(--text-main)' }}>
                        {isExtensionView ? 'chrome://extensions' : 'apply.company.com/engineering'}
                    </span>
                </div>
                {isFormView && (
                    <div className="browser-extensions">
                        <div className={`ext-icon aullevo-icon ${isSidebarOpen ? 'active' : ''}`}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                            </svg>
                        </div>
                    </div>
                )}
            </div>

            {/* ═══════════ CONTENT AREA ═══════════ */}
            <div className="demo-browser-content">

                {/* ── VIEW 1: Chrome Extensions Page ── */}
                <div className={`demo-view-layer demo-extensions-page ${isExtensionView ? 'active' : ''}`}>
                    {/* Extensions header */}
                    <div className="ext-header">
                        <div className="ext-header-left">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e8eaed" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                            <h2>Extensions</h2>
                        </div>
                        <div className="ext-search">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9aa0a6" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                            <span>Search extensions</span>
                        </div>
                        <div className="ext-dev-mode">
                            <span>Developer mode</span>
                            <div className="ext-toggle active"><div className="ext-toggle-knob" /></div>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="ext-toolbar">
                        <button className={`ext-btn ${step === 3 ? 'ext-btn-clicked' : ''}`}>Load unpacked</button>
                        <button className="ext-btn">Pack extension</button>
                        <button className="ext-btn">Update</button>
                    </div>

                    {/* Main area */}
                    <div className="ext-main">
                        <div className="ext-sidebar-panel">
                            <ul>
                                <li className="active">My extensions</li>
                                <li>Keyboard shortcuts</li>
                            </ul>
                        </div>
                        <div className="ext-grid-container">
                            <div className="ext-grid-title">All Extensions</div>
                            <div className="ext-grid">
                                {/* Aullevo card — appears after step 4 */}
                                <div className={`ext-card ${isExtLoaded ? 'fade-in' : 'hidden'}`}>
                                    <div className="ext-card-header">
                                        <div className="ext-card-icon" style={{ background: 'var(--brand-gradient)', color: 'var(--accent-gold)' }}>
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                                        </div>
                                        <div className="ext-card-info">
                                            <h3>Aullevo - AI Form Filler <span className="ext-version">1.1.0</span></h3>
                                            <p>Auto-fill forms using your resume data powered by Gemini AI. Press Ctrl+M to open the sidebar!</p>
                                        </div>
                                    </div>
                                    <div className="ext-card-footer">
                                        <div className="ext-card-buttons"><button>Details</button><button>Remove</button></div>
                                        <div className={`ext-toggle ${isExtEnabled ? 'active' : ''}`}><div className="ext-toggle-knob" /></div>
                                    </div>
                                </div>

                                {/* Other extensions */}
                                <div className="ext-card fade-in">
                                    <div className="ext-card-header">
                                        <div className="ext-card-icon" style={{ background: 'var(--primary)', color: 'var(--text-on-gradient)' }}>
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 15h14M5 9h14M9 20h6" /></svg>
                                        </div>
                                        <div className="ext-card-info">
                                            <h3>Action Model <span className="ext-version">0.25.0</span></h3>
                                            <p>Train and automate browser interactions with optimized performance.</p>
                                        </div>
                                    </div>
                                    <div className="ext-card-footer">
                                        <div className="ext-card-buttons"><button>Details</button><button>Remove</button></div>
                                        <div className="ext-toggle active"><div className="ext-toggle-knob" /></div>
                                    </div>
                                </div>

                                <div className="ext-card fade-in">
                                    <div className="ext-card-header">
                                        <div className="ext-card-icon" style={{ background: 'var(--accent-pop)', color: 'var(--text-on-gradient)', fontSize: '20px', fontWeight: 700 }}>G</div>
                                        <div className="ext-card-info">
                                            <h3>Google Translate <span className="ext-version">2.0.16</span></h3>
                                            <p>View translations easily as you browse the web.</p>
                                        </div>
                                    </div>
                                    <div className="ext-card-footer">
                                        <div className="ext-card-buttons"><button>Details</button><button>Remove</button></div>
                                        <div className="ext-toggle active"><div className="ext-toggle-knob" /></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── VIEW 2: Job Application + Sidebar ── */}
                <div className={`demo-view-layer demo-form-layer ${isFormView ? 'active' : ''}`}>

                    {/* Left: Form */}
                    <div className="demo-main-form">
                        <h2>Job Application</h2>
                        <div className="form-row">
                            <div className="form-group">
                                <label>First Name</label>
                                <div className={`form-input ${isScanning ? 'scanning' : ''} ${step >= 20 ? 'filled' : ''}`}>
                                    <span className="val">Julian</span>
                                    <span className="tag">AI</span>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Last Name</label>
                                <div className={`form-input ${isScanning ? 'scanning' : ''} ${step >= 20 ? 'filled' : ''}`}>
                                    <span className="val">Mythic</span>
                                    <span className="tag">AI</span>
                                </div>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Email Address</label>
                            <div className={`form-input ${(step === 19 || step === 20) ? 'scanning' : ''} ${step >= 21 ? 'filled' : ''}`}>
                                <span className="val">julian@mythic.dev</span>
                                <span className="tag">AI</span>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Resume</label>
                            <div className={`form-input ${(step >= 19 && step < 21) ? 'scanning' : ''} ${step >= 21 ? 'filled' : ''}`}>
                                <span className="val" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
                                    Julian_Mythic_Resume.pdf
                                </span>
                                <span className="tag green">Matched</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Sidebar */}
                    <div className={`demo-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                        {/* Header */}
                        <div className="av-demo-header">
                            <div className="av-demo-brand">
                                <div className="av-demo-logo">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 3l1.5 3.2 3.5.5-2.5 2.4.6 3.5L12 11l-3.1 1.6.6-3.5L7 6.7l3.5-.5z" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="av-demo-brand-name">Aullevo</div>
                                    <div className="av-demo-brand-sub">AI Form Filler</div>
                                </div>
                            </div>
                            <button className="av-demo-close">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        {/* Tab bar */}
                        <div className="av-demo-tabs">
                            <div className={`av-demo-tab ${activeTab === 'fill' ? 'av-demo-tab--active' : ''}`}>Fill Form</div>
                            <div className={`av-demo-tab ${activeTab === 'profile' ? 'av-demo-tab--active' : ''}`}>My Profile</div>
                            <div className={`av-demo-tab ${activeTab === 'settings' ? 'av-demo-tab--active' : ''}`}>Settings</div>
                        </div>

                        {/* Body — ONLY render the active tab */}
                        <div className="av-demo-body">

                            {activeTab === 'fill' && (
                                <>
                                    <div className="av-demo-upload">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                                            <polyline points="14 2 14 8 20 8" />
                                        </svg>
                                        <span>Upload Resume (PDF / DOCX)</span>
                                    </div>
                                    <div className="av-demo-card av-demo-file-badge">
                                        <div className="av-demo-file-badge__left">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--accent-glow)', flexShrink: 0 }}>
                                                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                                            </svg>
                                            <div>
                                                <div className="av-demo-file-badge__count">4 files in library</div>
                                                <div className="av-demo-file-badge__hint">Manage in My Profile →</div>
                                            </div>
                                        </div>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--accent-glow)' }}>
                                            <polyline points="9 18 15 12 9 6" />
                                        </svg>
                                    </div>
                                    <div className="av-demo-card av-demo-detection">
                                        <div>
                                            <div className="av-demo-detection__eyebrow">Page Detection</div>
                                            <div className={`av-demo-detection__count ${isScanning ? 'scanning' : ''}`}>4</div>
                                            <div className="av-demo-detection__sub">form fields</div>
                                        </div>
                                        <button className="av-demo-rescan">
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <polyline points="23 4 23 10 17 10" />
                                                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                                            </svg>
                                            Rescan
                                        </button>
                                    </div>
                                    <button className={`av-demo-fill-btn ${step === 18 ? 'btn-pressing' : ''} ${isSuccess ? 'btn-success' : ''}`}>
                                        {isSuccess ? (
                                            <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg> Filled 4 Fields!</>
                                        ) : isFilling ? (
                                            <><span className="av-demo-spinner" /> Filling…</>
                                        ) : (
                                            <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 3l1.5 3.2 3.5.5-2.5 2.4.6 3.5L12 11l-3.1 1.6.6-3.5L7 6.7l3.5-.5z" /></svg> Fill 4 Fields with AI</>
                                        )}
                                    </button>
                                    {isSuccess && (
                                        <div className="av-demo-status av-demo-status--success">All fields filled successfully!</div>
                                    )}
                                    <div className="av-demo-card av-demo-shortcuts">
                                        <div className="av-demo-shortcuts__title">Shortcuts</div>
                                        <div className="av-demo-shortcuts__item"><code>Alt+F</code><span>Quick fill form</span></div>
                                        <div className="av-demo-shortcuts__item"><code>Alt+A</code><span>Toggle sidebar</span></div>
                                        <div className="av-demo-shortcuts__item"><code>Ctrl+M</code><span>Toggle sidebar</span></div>
                                    </div>
                                </>
                            )}

                            {activeTab === 'profile' && (
                                <>
                                    <div className="av-demo-section-header">
                                        <span>Personal Information</span>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: 'rotate(180deg)' }}><polyline points="6 9 12 15 18 9" /></svg>
                                    </div>
                                    <div className="av-demo-section-body">
                                        <div className="av-demo-row">
                                            <div className="av-demo-input-group"><label>First Name</label><div className="av-demo-input">Julian</div></div>
                                            <div className="av-demo-input-group"><label>Last Name</label><div className="av-demo-input">Mythic</div></div>
                                        </div>
                                        <div className="av-demo-input-group"><label>Email</label><div className="av-demo-input">julian@mythic.dev</div></div>
                                        <div className="av-demo-input-group"><label>Phone</label><div className="av-demo-input">+1 555 123 4567</div></div>
                                        <div className="av-demo-input-group"><label>Headline</label><div className="av-demo-input">Senior Full-Stack Developer</div></div>
                                    </div>
                                    <div className="av-demo-section-header">
                                        <span>File Library (4)</span>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: 'rotate(180deg)' }}><polyline points="6 9 12 15 18 9" /></svg>
                                    </div>
                                    <div className="av-demo-section-body">
                                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'var(--bg-main)', padding: 8, borderRadius: 6, border: '1px solid var(--border-glass)' }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-glow)" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const }}>
                                                <span style={{ fontSize: 11, color: 'var(--text-main)' }}>Julian_Mythic_Resume.pdf</span>
                                                <span style={{ fontSize: 9, color: 'var(--accent-pop)', display: 'flex', alignItems: 'center', gap: 2, fontWeight: 'bold' }}>
                                                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                                                    Matches: Resume
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="av-demo-section-header">
                                        <span>Links & URLs</span>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                                    </div>
                                    <div className="av-demo-profile-save">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
                                        Save Profile
                                    </div>
                                </>
                            )}

                            {activeTab === 'settings' && (
                                <>
                                    <div className="av-demo-section-body">
                                        <div style={{ fontSize: 13, fontWeight: 'bold', color: 'var(--text-main)', margin: '4px 0' }}>Gemini API Key</div>
                                        <p style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: 8 }}>
                                            Your key is stored locally and never sent to any server. Get yours free at aistudio.google.com.
                                        </p>
                                        <div className="av-demo-input-group">
                                            <label>API Key</label>
                                            <div className="av-demo-input masked">AIzaSyBw90sdf3k...</div>
                                        </div>
                                    </div>
                                    <div className="av-demo-settings-save">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
                                        Save API Key
                                    </div>
                                    <div className="av-demo-privacy">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></svg>
                                        <div><strong>Privacy-first</strong> — Gemini only sees form field labels, never the data you type into fields.</div>
                                    </div>
                                    <div style={{ height: '1.5px', background: 'var(--border-glass)', margin: 14 }} />
                                    <div className="av-demo-toggle-row">
                                        <div className="label-col">
                                            <span className="label">Appearance</span>
                                            <span className="hint">Dark mode</span>
                                        </div>
                                        <div className="toggle-switch" />
                                    </div>
                                </>
                            )}

                        </div>

                        {/* Footer */}
                        <div className="av-demo-footer">
                            <span>Powered by Gemini 2.5 Flash</span>
                            <span>Ctrl+M to toggle</span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default DemoAnimation;

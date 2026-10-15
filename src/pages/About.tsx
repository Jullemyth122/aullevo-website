import React from 'react';
import SEO from '../components/SEO';

const About: React.FC = () => {
    return (
        <div className="about-page animate-fade-in">
            <SEO
                title="About Aullevo | Private, Local-First Form Automation"
                description="Aullevo's mission is to make repetitive web forms effortless without giving up your privacy. Learn how the encrypted vault, offline matching engine, and privacy-controlled AI (Gemini, ChatGPT, Claude, or your own server) work."
                keywords="about aullevo, private autofill, encrypted form filler, local-first browser extension, gemini form filling privacy"
            />
            {/* Minimal hero section */}
            <section className="about-hero">
                <div className="container">
                    <div className="about-hero-grid">
                        <div className="about-hero-content">
                            <div className="eyebrow">Our Mission</div>
                            <h1 className="about-title">
                                Stop typing. <br />
                                <span className="gradient-text">Start working.</span>
                            </h1>
                            <p className="about-subtitle">
                                We're building a fast, private way to handle repetitive web forms, from job applications to school and government portals, so you can spend your time on what actually matters.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Problem & Solution Split Layout */}
            <section className="split-section glass-panel">
                <div className="container">
                    <div className="split-grid">
                        <div className="split-left">
                            <h2 className="sticky-heading">The Problem</h2>
                        </div>
                        <div className="split-right">
                            <p className="large-text">
                                Whether it's <strong>job applications, university admissions, government portals, or medical intake forms</strong>, we keep typing the exact same information again and again.
                            </p>
                            <p className="secondary-text">
                                Browser autofill only knows your name and address, and it breaks on modern sites built with custom dropdowns, Shadow DOM components, and embedded frames. Many autofill tools also upload your personal data to their own cloud servers.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="split-section">
                <div className="container">
                    <div className="split-grid reverse">
                        <div className="split-left">
                            <h2 className="sticky-heading">Our Solution</h2>
                        </div>
                        <div className="split-right">
                            <div className="solution-card">
                                <div className="solution-icon">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                                    </svg>
                                </div>
                                <h3>Smart Matching, Optional AI</h3>
                                <p>A fast matching engine fills standard fields <strong>offline, with no AI at all</strong>. When you turn on AI Smart Fill, the AI provider you pick (Google Gemini, ChatGPT, Claude, or your own OpenAI-compatible server) helps with multiple-choice and open-ended questions, and <strong>you decide which of your answers it may see.</strong></p>
                            </div>
                            <div className="solution-card">
                                <div className="solution-icon yellow">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    </svg>
                                </div>
                                <h3>Encrypted on Your Device</h3>
                                <p>Your profiles, documents, and API keys are encrypted with AES-256-GCM and stored only in your browser, with a separate key for each account. Aullevo has no server that stores your profile data.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Data Privacy Contrast */}
            <section className="privacy-section">
                <div className="container">
                    <div className="text-center mb-12">
                        <h2 className="section-title">Privacy by Design</h2>
                        <p className="section-description">AI Smart Fill is off by default. When you turn it on, here is exactly what your chosen AI provider can and cannot see.</p>
                    </div>

                    <div className="privacy-comparison">
                        <div className="privacy-card negative">
                            <div className="privacy-header">
                                <div className="icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg></div>
                                <h3>Never Sent to AI</h3>
                            </div>
                            <ul>
                                <li>Values of fields marked SENSITIVE (email, phone, address, IDs, medical, and financial fields start as SENSITIVE)</li>
                                <li>Your uploaded documents (resume, IDs, certificates)</li>
                                <li>Your encryption key</li>
                                <li>Anything at all while AI Smart Fill is turned off</li>
                            </ul>
                        </div>
                        <div className="privacy-card positive">
                            <div className="privacy-header">
                                <div className="icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg></div>
                                <h3>Sent to Your AI Provider (AI Smart Fill Only)</h3>
                            </div>
                            <ul>
                                <li>The form's questions and answer options</li>
                                <li>Labels and context hints of your enabled fields</li>
                                <li>Values of fields marked AI SAFE (e.g. name, skills), so it can pick better answers</li>
                                <li>Toggle any field to SENSITIVE at any time to keep its value private</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Architecture Section */}
            <section className="architecture-section">
                <div className="container">
                    <div className="text-center mb-12">
                        <div className="arch-eyebrow">
                            <span className="arch-eyebrow-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                                    <polyline points="2 17 12 22 22 17" />
                                    <polyline points="2 12 12 17 22 12" />
                                </svg>
                            </span>
                            Deep Dive: How Aullevo Is Built
                        </div>
                        <h2 className="section-title">System Architecture</h2>
                        <p className="section-description">
                            A Manifest V3 browser extension built for privacy, reliability on modern websites, and speed.
                        </p>
                    </div>

                    <div className="arch-timeline">
                        {/* Layer 1 */}
                        <div className="arch-step arch-step-blue">
                            <div className="arch-step-header">
                                <div className="arch-number">01</div>
                                <div className="arch-title-wrapper">
                                    <div className="arch-badge-row">
                                        <span className="arch-badge badge-blue">INTERFACE</span>
                                    </div>
                                    <h3 className="arch-title">Layer 1: Side Panel &amp; Full-Page View</h3>
                                </div>
                            </div>

                            <div className="arch-body">
                                <div className="arch-meta-row">
                                    <span className="arch-meta-label">Technology:</span>
                                    <span className="arch-meta-value">React 19, TypeScript, Vite, Chrome Side Panel API (Manifest V3).</span>
                                </div>

                                <div className="arch-mechanism-block">
                                    <span className="arch-meta-label">Mechanism:</span>
                                    <p className="arch-mechanism-desc">
                                        Aullevo lives in the browser's native <strong>side panel</strong> (Alt+Q), so it never covers or restyles the page you're filling. A <strong>full-page view</strong> gives you room to edit profiles and settings, and both views stay in sync. An optional floating button appears only on the top-level page, never inside ads or embedded frames.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Layer 2 */}
                        <div className="arch-step arch-step-yellow">
                            <div className="arch-step-header">
                                <div className="arch-number">02</div>
                                <div className="arch-title-wrapper">
                                    <div className="arch-badge-row">
                                        <span className="arch-badge badge-yellow">FORM ENGINE</span>
                                    </div>
                                    <h3 className="arch-title">Layer 2: Content Script &amp; Deep DOM Engine</h3>
                                </div>
                            </div>

                            <div className="arch-body">
                                <div className="arch-mechanism-block">
                                    <span className="arch-meta-label">Mechanism:</span>
                                    <ul className="arch-spec-list">
                                        <li className="arch-spec-item">
                                            <span className="arch-spec-bullet" />
                                            <div className="arch-spec-text">
                                                <strong className="arch-spec-label">Shadow DOM &amp; Frames:</strong>{' '}
                                                Finds inputs inside open and closed shadow roots (via <code>chrome.dom.openOrClosedShadowRoot</code>) in every frame of the page.
                                            </div>
                                        </li>
                                        <li className="arch-spec-item">
                                            <span className="arch-spec-bullet" />
                                            <div className="arch-spec-text">
                                                <strong className="arch-spec-label">Label Resolution:</strong>{' '}
                                                Reads labels, ARIA attributes, grid row headers, and nearby question text so each field is identified the way a person would read it.
                                            </div>
                                        </li>
                                        <li className="arch-spec-item">
                                            <span className="arch-spec-bullet" />
                                            <div className="arch-spec-text">
                                                <strong className="arch-spec-label">Framework-Aware Input:</strong>{' '}
                                                Sets values through native prototype setters and dispatches real <code>input</code>, <code>change</code>, and <code>blur</code> events so React, Vue, and Angular forms register every answer.
                                            </div>
                                        </li>
                                        <li className="arch-spec-item">
                                            <span className="arch-spec-bullet" />
                                            <div className="arch-spec-text">
                                                <strong className="arch-spec-label">Every Input Type:</strong>{' '}
                                                Custom dropdowns and listboxes, radios and checkboxes, Microsoft Forms ranking questions, split date fields, dial-code pickers, and file inputs (attached with <code>DataTransfer</code>).
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Layer 3 */}
                        <div className="arch-step arch-step-blue">
                            <div className="arch-step-header">
                                <div className="arch-number">03</div>
                                <div className="arch-title-wrapper">
                                    <div className="arch-badge-row">
                                        <span className="arch-badge badge-blue">MATCHING &amp; AI</span>
                                    </div>
                                    <h3 className="arch-title">Layer 3: Hybrid Matching Engine</h3>
                                </div>
                            </div>

                            <div className="arch-body">
                                <div className="arch-mechanism-block">
                                    <span className="arch-meta-label">Mechanism:</span>
                                    <ul className="arch-spec-list">
                                        <li className="arch-spec-item">
                                            <span className="arch-spec-bullet" />
                                            <div className="arch-spec-text">
                                                <strong className="arch-spec-label">Offline Keyword Matching:</strong>{' '}
                                                Scores every field-to-question pair using label similarity, word stems, and aliases, then assigns the highest-confidence matches first so each field is filled exactly once.
                                            </div>
                                        </li>
                                        <li className="arch-spec-item">
                                            <span className="arch-spec-bullet" />
                                            <div className="arch-spec-text">
                                                <strong className="arch-spec-label">Privacy-Filtered AI Prompt:</strong>{' '}
                                                Before calling the AI, values of SENSITIVE fields are stripped out. The AI replies with <em>which</em> of your fields answers each question, and the real value is filled in locally.
                                            </div>
                                        </li>
                                        <li className="arch-spec-item">
                                            <span className="arch-spec-bullet" />
                                            <div className="arch-spec-text">
                                                <strong className="arch-spec-label">AI First, Keywords as Backup:</strong>{' '}
                                                Uncertain matches wait for the AI. Anything the AI skips or cannot answer is filled by the keyword engine, without overriding an answer the AI already chose.
                                            </div>
                                        </li>
                                        <li className="arch-spec-item">
                                            <span className="arch-spec-bullet" />
                                            <div className="arch-spec-text">
                                                <strong className="arch-spec-label">Plan Limits:</strong>{' '}
                                                Free users get 6 AI fills every day, and each short ad gives 10 more for 2 hours. Pro removes the limit, with no ads.
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Layer 4 */}
                        <div className="arch-step arch-step-yellow">
                            <div className="arch-step-header">
                                <div className="arch-number">04</div>
                                <div className="arch-title-wrapper">
                                    <div className="arch-badge-row">
                                        <span className="arch-badge badge-yellow">STORAGE &amp; PRIVACY</span>
                                    </div>
                                    <h3 className="arch-title">Layer 4: Encrypted Local Vault</h3>
                                </div>
                            </div>

                            <div className="arch-body">
                                <div className="arch-mechanism-block">
                                    <span className="arch-meta-label">Mechanism:</span>
                                    <ul className="arch-spec-list">
                                        <li className="arch-spec-item">
                                            <span className="arch-spec-bullet" />
                                            <div className="arch-spec-text">
                                                <strong className="arch-spec-label">Local Encryption:</strong>{' '}
                                                Profiles, documents, and your AI provider keys are encrypted with <strong>AES-256-GCM</strong> using a random key Aullevo creates for each account (and for guest use) on the device. No passphrase to remember: the side panel opens straight to Autofill.
                                            </div>
                                        </li>
                                        <li className="arch-spec-item">
                                            <span className="arch-spec-bullet" />
                                            <div className="arch-spec-text">
                                                <strong className="arch-spec-label">One Key per Account:</strong>{' '}
                                                Each account (and guest use) has its own key in the extension's storage, which web pages can't read. Signing in with another account switches to that account's own data.
                                            </div>
                                        </li>
                                        <li className="arch-spec-item">
                                            <span className="arch-spec-bullet" />
                                            <div className="arch-spec-text">
                                                <strong className="arch-spec-label">No Profile Uploads:</strong>{' '}
                                                Encrypted data stays in <code>chrome.storage.local</code> on your device. No analytics or tracking runs inside the extension.
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Layer 5 */}
                        <div className="arch-step arch-step-blue">
                            <div className="arch-step-header">
                                <div className="arch-number">05</div>
                                <div className="arch-title-wrapper">
                                    <div className="arch-badge-row">
                                        <span className="arch-badge badge-blue">ORCHESTRATION</span>
                                    </div>
                                    <h3 className="arch-title">Layer 5: Service Worker &amp; Account Sync</h3>
                                </div>
                            </div>

                            <div className="arch-body">
                                <div className="arch-mechanism-block">
                                    <span className="arch-meta-label">Mechanism:</span>
                                    <ul className="arch-spec-list">
                                        <li className="arch-spec-item">
                                            <span className="arch-spec-bullet" />
                                            <div className="arch-spec-text">
                                                <strong className="arch-spec-label">Keyboard Shortcuts:</strong>{' '}
                                                Alt+Q opens the panel, Alt+Shift+L fills the current page, and Alt+Shift+B runs a Multi-link batch.
                                            </div>
                                        </li>
                                        <li className="arch-spec-item">
                                            <span className="arch-spec-bullet" />
                                            <div className="arch-spec-text">
                                                <strong className="arch-spec-label">Multi-link Batch Fill:</strong>{' '}
                                                Queue several form links and Aullevo opens and fills each one in its own tab, waiting for pages to finish loading.
                                            </div>
                                        </li>
                                        <li className="arch-spec-item">
                                            <span className="arch-spec-bullet" />
                                            <div className="arch-spec-text">
                                                <strong className="arch-spec-label">Auto-Pagination (Pro):</strong>{' '}
                                                Fills each page of a multi-step form, clicks Next, and submits on the last page. It pauses on empty required fields and corrects answers a form rejects.
                                            </div>
                                        </li>
                                        <li className="arch-spec-item">
                                            <span className="arch-spec-bullet" />
                                            <div className="arch-spec-text">
                                                <strong className="arch-spec-label">Verified Account Sync:</strong>{' '}
                                                When you sign in on Aullevo Web, the site hands the extension a short-lived Firebase ID token. The extension checks your plan directly with Firestore, so Pro status can't be faked.
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default About;

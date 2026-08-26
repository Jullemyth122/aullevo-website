import React from 'react';
import SEO from '../components/SEO';

const About: React.FC = () => {
    return (
        <div className="about-page animate-fade-in">
            <SEO
                title="About Aullevo | Secure, Local AI Form Automation"
                description="Our mission is to build the fastest, most private way to automate repetitive forms. Learn about Aullevo's zero-knowledge architecture and local-first execution."
                keywords="about aullevo, zero knowledge autofill, privacy design, local execution security, open source web automator"
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
                                We are building the fastest, most private way to automate repetitive web forms, job applications, and government portals, giving you back thousands of hours.
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
                                Whether it's <strong>university admissions, government portals, or medical intake forms</strong>, we lose countless hours manually typing the exact same information.
                            </p>
                            <p className="secondary-text">
                                The average person spends dozens of hours a year navigating complex, multi-step forms across Workday, visa applications, and institutional databases. Existing autofillers fail completely on these dynamic sites, and worse, they often store your highly sensitive personal data on random cloud servers.
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
                                <h3>Zero-Knowledge AI Analysis</h3>
                                <p>Aullevo utilizes Gemini 2.5 Flash to deeply understand the context of complex forms. <strong>The AI only ever sees the blank form structure.</strong> It figures out what the page needs, without ever seeing or transmitting your actual data.</p>
                            </div>
                            <div className="solution-card">
                                <div className="solution-icon green">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    </svg>
                                </div>
                                <h3>100% Local Execution</h3>
                                <p>The actual data filling happens strictly on your device. Your sensitive information (IDs, financial details, health records) is encrypted with AES-256-GCM in your local vault. It never leaves your machine.</p>
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
                        <p className="section-description">Unlike cloud-based autofill tools, we isolate the AI from your sensitive data.</p>
                    </div>

                    <div className="privacy-comparison">
                        <div className="privacy-card negative">
                            <div className="privacy-header">
                                <div className="icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></div>
                                <h3>What We NEVER Send to AI</h3>
                            </div>
                            <ul>
                                <li>Your PII (Name, Email, Phone, Address)</li>
                                <li>Highly sensitive IDs (SSN, Passport, Visas)</li>
                                <li>Medical, financial, or salary information</li>
                                <li>Actual form field values you type</li>
                                <li>Custom field values or passwords</li>
                            </ul>
                        </div>
                        <div className="privacy-card positive">
                            <div className="privacy-header">
                                <div className="icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg></div>
                                <h3>What IS Sent (Form Structure Only)</h3>
                            </div>
                            <ul>
                                <li>Blank field labels and ARIA labels</li>
                                <li>Expected input types (e.g., "date", "text")</li>
                                <li>Available dropdown/radio options</li>
                                <li>Empty DOM hierarchy and form structure</li>
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
                            Deep Dive: Layer-by-Layer Technical Specifications
                        </div>
                        <h2 className="section-title">System Architecture</h2>
                        <p className="section-description">
                            Engineered for complete encapsulation, zero-knowledge privacy, and deep DOM resilience.
                        </p>
                    </div>

                    <div className="arch-timeline">
                        {/* Layer 1 */}
                        <div className="arch-step arch-step-blue">
                            <div className="arch-step-header">
                                <div className="arch-number">01</div>
                                <div className="arch-title-wrapper">
                                    <div className="arch-badge-row">
                                        <span className="arch-badge badge-blue">FRONTEND</span>
                                    </div>
                                    <h3 className="arch-title">Layer 1: Frontend &amp; UI Engine</h3>
                                </div>
                            </div>

                            <div className="arch-body">
                                <div className="arch-meta-row">
                                    <span className="arch-meta-label">Technology:</span>
                                    <span className="arch-meta-value">React 19, Lucide Icons, Vanilla CSS with CSS custom properties.</span>
                                </div>

                                <div className="arch-mechanism-block">
                                    <span className="arch-meta-label">Mechanism:</span>
                                    <p className="arch-mechanism-desc">
                                        Creates a top-level host element (<code>#aullevo-sidebar-host</code>) with <code>z-index: 2147483646</code> and attaches an <strong>Open Shadow Root</strong>. Extension styles are injected directly into the shadow tree, ensuring 100% encapsulation—host CSS frameworks (Tailwind, Bootstrap, etc.) cannot disrupt the UI.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Layer 2 */}
                        <div className="arch-step arch-step-purple">
                            <div className="arch-step-header">
                                <div className="arch-number">02</div>
                                <div className="arch-title-wrapper">
                                    <div className="arch-badge-row">
                                        <span className="arch-badge badge-purple">BRIDGE</span>
                                    </div>
                                    <h3 className="arch-title">Layer 2: Content Scripts &amp; Deep DOM Engine</h3>
                                </div>
                            </div>

                            <div className="arch-body">
                                <div className="arch-mechanism-block">
                                    <span className="arch-meta-label">Mechanism:</span>
                                    <ul className="arch-spec-list">
                                        <li className="arch-spec-item">
                                            <span className="arch-spec-bullet" />
                                            <div className="arch-spec-text">
                                                <strong className="arch-spec-label">Deep Shadow Piercing:</strong>{' '}
                                                <code>querySelectorAllDeep</code> recursively extracts elements inside nested Shadow DOM trees.
                                            </div>
                                        </li>
                                        <li className="arch-spec-item">
                                            <span className="arch-spec-bullet" />
                                            <div className="arch-spec-text">
                                                <strong className="arch-spec-label">Tab Panel Activation:</strong>{' '}
                                                Detects hidden tab panels (<code>[role="tabpanel"]</code>) and momentarily reveals them to extract all fields before filling.
                                            </div>
                                        </li>
                                        <li className="arch-spec-item">
                                            <span className="arch-spec-bullet" />
                                            <div className="arch-spec-text">
                                                <strong className="arch-spec-label">Honeypot &amp; CAPTCHA Shields:</strong>{' '}
                                                Identifies and skips hidden bot-traps (<code>aria-hidden</code>, 0-size, offscreen) and warns users if reCAPTCHA, hCaptcha, Turnstile, or Arkose are detected.
                                            </div>
                                        </li>
                                        <li className="arch-spec-item">
                                            <span className="arch-spec-bullet" />
                                            <div className="arch-spec-text">
                                                <strong className="arch-spec-label">Human Input Simulation:</strong>{' '}
                                                Injects values using prototype property setters and triggers React's internal <code>_valueTracker</code> to ensure form validation states acknowledge the changes.
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Layer 3 */}
                        <div className="arch-step arch-step-cyan">
                            <div className="arch-step-header">
                                <div className="arch-number">03</div>
                                <div className="arch-title-wrapper">
                                    <div className="arch-badge-row">
                                        <span className="arch-badge badge-cyan">LLM &amp; HYBRID</span>
                                    </div>
                                    <h3 className="arch-title">Layer 3: Hybrid AI &amp; Matching Engine</h3>
                                </div>
                            </div>

                            <div className="arch-body">
                                <div className="arch-mechanism-block">
                                    <span className="arch-meta-label">Mechanism:</span>
                                    <ul className="arch-spec-list">
                                        <li className="arch-spec-item">
                                            <span className="arch-spec-bullet" />
                                            <div className="arch-spec-text">
                                                <strong className="arch-spec-label">Dual-Tier Resolution:</strong>{' '}
                                                Combines Google Gemini LLM analysis with instant deterministic heuristics.
                                            </div>
                                        </li>
                                        <li className="arch-spec-item">
                                            <span className="arch-spec-bullet" />
                                            <div className="arch-spec-text">
                                                <strong className="arch-spec-label">2D Matrix / Table Optimizer:</strong>{' '}
                                                Directly resolves availability tables (e.g., <em>Mon - From, Tue - To</em>) via heuristics, saving LLM tokens and avoiding prompt bloat.
                                            </div>
                                        </li>
                                        <li className="arch-spec-item">
                                            <span className="arch-spec-bullet" />
                                            <div className="arch-spec-text">
                                                <strong className="arch-spec-label">Domain Session Cache:</strong>{' '}
                                                Uses <code>chrome.storage.session</code> to cache field signature mappings for 15 minutes, making multi-page job applications instantaneous.
                                            </div>
                                        </li>
                                        <li className="arch-spec-item">
                                            <span className="arch-spec-bullet" />
                                            <div className="arch-spec-text">
                                                <strong className="arch-spec-label">Contextual RAG &amp; Chat:</strong>{' '}
                                                Pulls structured user memories to generate context-grounded responses to open-ended application questions or conversational chat inputs.
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Layer 4 */}
                        <div className="arch-step arch-step-green">
                            <div className="arch-step-header">
                                <div className="arch-number">04</div>
                                <div className="arch-title-wrapper">
                                    <div className="arch-badge-row">
                                        <span className="arch-badge badge-green">STORAGE &amp; PRIVACY</span>
                                    </div>
                                    <h3 className="arch-title">Layer 4: Zero-Knowledge Data Vault</h3>
                                </div>
                            </div>

                            <div className="arch-body">
                                <div className="arch-mechanism-block">
                                    <span className="arch-meta-label">Mechanism:</span>
                                    <ul className="arch-spec-list">
                                        <li className="arch-spec-item">
                                            <span className="arch-spec-bullet" />
                                            <div className="arch-spec-text">
                                                <strong className="arch-spec-label">100% Local-First Storage:</strong>{' '}
                                                User profiles, custom fields, work histories, and uploaded resumes (parsed via <code>pdfjs-dist</code> and <code>mammoth</code>) are stored exclusively on-device in <code>chrome.storage.local</code>.
                                            </div>
                                        </li>
                                        <li className="arch-spec-item">
                                            <span className="arch-spec-bullet" />
                                            <div className="arch-spec-text">
                                                <strong className="arch-spec-label">Namespace Partitioning:</strong>{' '}
                                                Dynamically partitions data keys based on active authentication state (<code>aullevo_profiles_user_&lt;uid&gt;</code> vs <code>aullevo_profiles_guest</code>), enabling seamless switching between accounts.
                                            </div>
                                        </li>
                                        <li className="arch-spec-item">
                                            <span className="arch-spec-bullet" />
                                            <div className="arch-spec-text">
                                                <strong className="arch-spec-label">Virtual File Dispatcher:</strong>{' '}
                                                Reconstructs base64-stored files into native <code>File</code> / <code>DataTransfer</code> objects to populate native file upload inputs.
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Layer 5 */}
                        <div className="arch-step arch-step-amber">
                            <div className="arch-step-header">
                                <div className="arch-number">05</div>
                                <div className="arch-title-wrapper">
                                    <div className="arch-badge-row">
                                        <span className="arch-badge badge-amber">ORCHESTRATION</span>
                                    </div>
                                    <h3 className="arch-title">Layer 5: Autonomous Autopilot Core</h3>
                                </div>
                            </div>

                            <div className="arch-body">
                                <div className="arch-mechanism-block">
                                    <span className="arch-meta-label">Mechanism:</span>
                                    <ul className="arch-spec-list">
                                        <li className="arch-spec-item">
                                            <span className="arch-spec-bullet" />
                                            <div className="arch-spec-text">
                                                <strong className="arch-spec-label">Multi-Page State Machine:</strong>{' '}
                                                Uses <code>chrome.tabs.onUpdated</code> to track multi-step form journeys across page navigations up to 30 continuous steps.
                                            </div>
                                        </li>
                                        <li className="arch-spec-item">
                                            <span className="arch-spec-bullet" />
                                            <div className="arch-spec-text">
                                                <strong className="arch-spec-label">Dynamic Row Expansion:</strong>{' '}
                                                Detects "+ Add Experience" buttons, triggers clicks, invalidates the cache, and recurses to fill newly exposed form rows.
                                            </div>
                                        </li>
                                        <li className="arch-spec-item">
                                            <span className="arch-spec-bullet" />
                                            <div className="arch-spec-text">
                                                <strong className="arch-spec-label">Anti-Loop Fingerprinting:</strong>{' '}
                                                Compares field-value fingerprints to detect and safely abort if a form gets stuck in an infinite loop.
                                            </div>
                                        </li>
                                        <li className="arch-spec-item">
                                            <span className="arch-spec-bullet" />
                                            <div className="arch-spec-text">
                                                <strong className="arch-spec-label">Web-to-Extension Sync:</strong>{' '}
                                                Listens to the web dashboard via IndexedDB/postMessage to synchronize user session and Pro status in real-time.
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
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

            {/* Architecture Timeline */}
            <section className="architecture-section">
                <div className="container">
                    <h2 className="section-title text-center mb-12">System Architecture</h2>
                    <div className="arch-timeline">
                        {[
                            { layer: 'Layer 1: UI Core', desc: 'Secure React sidebar injected via Shadow DOM for absolute CSS isolation.', badge: 'Frontend' },
                            { layer: 'Layer 2: Content Scripts', desc: 'MutationObserver and iframe extraction engine to handle dynamic government and enterprise forms.', badge: 'Bridge' },
                            { layer: 'Layer 3: AI Engine', desc: 'Gemini 2.5 Flash logic that analyzes the blank DOM structure to map required fields.', badge: 'LLM' },
                            { layer: 'Layer 4: Data Vault', desc: 'AES-256-GCM encrypted local multi-profile storage. Injects data directly into the browser. No cloud DBs.', badge: 'Storage' },
                            { layer: 'Layer 5: Background', desc: 'Service workers regulating rate limits, notifications, and workflow orchestrations.', badge: 'System' },
                        ].map(({ layer, desc, badge }, idx) => (
                            <div key={layer} className="arch-step">
                                <div className="arch-number">0{idx + 1}</div>
                                <div className="arch-content">
                                    <div className="arch-badge">{badge}</div>
                                    <h3>{layer}</h3>
                                    <p>{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Open Source / CTA */}
            <section className="about-footer-cta">
                <div className="container">
                    <div className="cta-box">
                        <div className="cta-text">
                            <h2>Open & Transparent</h2>
                            <p>We believe trust is earned through transparency. Inspect our source code, audit our privacy claims, and verify Aullevo for yourself.</p>
                        </div>
                        <div className="cta-action">
                            <a href="https://github.com/Jullemyth122/aullevo" target="_blank" rel="noreferrer" className="btn btn-primary btn-lg">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '0.75rem' }}>
                                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
                                </svg>
                                View our GitHub
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
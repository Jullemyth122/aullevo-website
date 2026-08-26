import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const PrivacyPolicy: React.FC = () => {
    const [activeSection, setActiveSection] = useState<string>('introduction');
    const [copiedEmail, setCopiedEmail] = useState<boolean>(false);

    const sections = [
        { id: 'introduction', label: '1. Introduction & Overview' },
        { id: 'zero-knowledge', label: '2. Zero-Knowledge Architecture' },
        { id: 'data-stored', label: '3. Data We Store (Local Vault)' },
        { id: 'data-transmitted', label: '4. Data We Transmit & AI Processing' },
        { id: 'permissions', label: '5. Browser Extension Permissions' },
        { id: 'chrome-store-compliance', label: '6. Chrome Web Store Compliance' },
        { id: 'google-limited-use', label: '7. Google Limited Use Disclosure' },
        { id: 'user-control', label: '8. User Data Control & Deletion' },
        { id: 'security-encryption', label: '9. Security & Encryption' },
        { id: 'third-party', label: '10. Third-Party Services' },
        { id: 'cookies', label: '11. Cookies & Tracking Policy' },
        { id: 'gdpr-ccpa', label: '12. GDPR & CCPA Rights' },
        { id: 'children', label: '13. Children\'s Privacy' },
        { id: 'policy-changes', label: '14. Updates to This Policy' },
        { id: 'contact', label: '15. Contact Us' },
    ];

    const scrollToSection = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setActiveSection(id);
            window.history.pushState(null, '', `#${id}`);
        }
    };

    const handleCopyEmail = () => {
        navigator.clipboard.writeText('privacy@aullevo.com');
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2500);
    };

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + 200;
            for (let i = sections.length - 1; i >= 0; i--) {
                const section = document.getElementById(sections[i].id);
                if (section && section.offsetTop <= scrollPosition) {
                    setActiveSection(sections[i].id);
                    break;
                }
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="legal-page animate-fade-in">
            <SEO
                title="Privacy Policy | Aullevo - Zero-Knowledge AI Form Automation"
                description="Read Aullevo's Privacy Policy. Learn how our local-first, zero-knowledge architecture protects your personal data with AES-256-GCM encryption and zero cloud storage."
                keywords="aullevo privacy policy, chrome extension privacy, local storage autofill, zero knowledge AI, form autofill privacy, data security"
                canonicalPath="/privacy"
            />

            {/* Header */}
            <div className="legal-header">
                <div className="container">
                    <div className="legal-badge-wrapper">
                        <span className="legal-badge badge-success">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                            Zero-Knowledge Architecture
                        </span>
                        <span className="legal-badge">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                            Effective Date: August 2026
                        </span>
                    </div>

                    <h1 className="legal-title">Privacy Policy</h1>

                    <div className="legal-meta">
                        <div className="legal-meta-item">
                            <span>Last Updated: <strong>August 25, 2026</strong></span>
                        </div>
                        <div className="legal-meta-item">
                            <span>Product: <strong>Aullevo Browser Extension & Web App</strong></span>
                        </div>
                        <div className="legal-meta-item">
                            <span>Direct Inquiries: <strong>privacy@aullevo.com</strong></span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container">
                {/* 4 Summary Cards */}
                <div className="legal-summary-grid">
                    <div className="legal-summary-card">
                        <div className="card-icon green">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                        </div>
                        <h3>100% Local-First Storage</h3>
                        <p>Your resume data, profiles, and personal answers reside in your browser's local IndexedDB with AES-256-GCM encryption. We operate zero central databases holding your profile data.</p>
                    </div>

                    <div className="legal-summary-card">
                        <div className="card-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1 1 0 0 1-2 0V7a1 1 0 0 1 2 0z" />
                            </svg>
                        </div>
                        <h3>Isolated AI Vision</h3>
                        <p>When analyzing forms, Google Gemini only inspects field labels and structural HTML metadata. It <strong>never</strong> receives your sensitive profile values or confidential records.</p>
                    </div>

                    <div className="legal-summary-card">
                        <div className="card-icon purple">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                                <line x1="12" y1="2" x2="12" y2="12" />
                            </svg>
                        </div>
                        <h3>No Tracking or Telemetry</h3>
                        <p>Aullevo collects no personal telemetry, records no browsing history, places no cross-site advertising cookies, and never sells or brokers your personal data to third parties.</p>
                    </div>

                    <div className="legal-summary-card">
                        <div className="card-icon amber">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                        </div>
                        <h3>One-Click Total Deletion</h3>
                        <p>You retain unconditional ownership over your information. Clear your vault or uninstall the extension at any time to instantly erase all local data from your computer.</p>
                    </div>
                </div>

                {/* Main Content & Sidebar Layout */}
                <div className="legal-layout">
                    {/* Sticky Table of Contents */}
                    <aside className="legal-sidebar">
                        <div className="sidebar-inner">
                            <h4>Table of Contents</h4>
                            <nav aria-label="Privacy Policy Sections">
                                <ul>
                                    {sections.map((sec) => (
                                        <li key={sec.id}>
                                            <a
                                                href={`#${sec.id}`}
                                                className={activeSection === sec.id ? 'active' : ''}
                                                onClick={(e) => scrollToSection(sec.id, e)}
                                            >
                                                {sec.label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        </div>
                    </aside>

                    {/* Legal Sections */}
                    <main className="legal-content">
                        {/* 1. Introduction */}
                        <section id="introduction" className="legal-section">
                            <h2>
                                <span className="section-num">1</span>
                                Introduction & Overview
                            </h2>
                            <p>
                                Welcome to <strong>Aullevo</strong> (&quot;Aullevo&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). We build next-generation browser automation software, including the Aullevo Chrome Extension, web application, and associated tools (collectively, the &quot;Service&quot;).
                            </p>
                            <p>
                                At Aullevo, your privacy is not an afterthought or marketing phrase—it is the foundational engineering requirement upon which our entire software is built. This Privacy Policy details how Aullevo handles, stores, and protects your information, and explains the strict boundaries we have established to ensure your personal data remains strictly under your control.
                            </p>
                            <div className="legal-callout callout-info">
                                <div className="callout-icon">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="12" y1="16" x2="12" y2="12" />
                                        <line x1="12" y1="8" x2="12.01" y2="8" />
                                    </svg>
                                </div>
                                <div className="callout-body">
                                    <h4>Single Purpose Commitment</h4>
                                    <p>Aullevo is engineered exclusively to assist users in accurately filling web forms, questionnaires, and employment applications. We do not monetize user data, display targeted ads, or build behavioral profiles.</p>
                                </div>
                            </div>
                        </section>

                        {/* 2. Zero-Knowledge Architecture */}
                        <section id="zero-knowledge" className="legal-section">
                            <h2>
                                <span className="section-num">2</span>
                                Zero-Knowledge Architecture
                            </h2>
                            <p>
                                Traditional autofillers store your names, contact records, employment histories, and sensitive documents on remote cloud servers. If those servers are compromised, your data is exposed.
                            </p>
                            <p>
                                <strong>Aullevo is built differently:</strong> We operate on a <em>Zero-Knowledge, Local-First</em> architecture:
                            </p>
                            <ul>
                                <li><strong>No Central Database of Profile Data:</strong> We do not operate remote databases that store your personal records, resumes, work histories, or form submissions.</li>
                                <li><strong>Local Execution Pipeline:</strong> The intelligence that matches your profile fields to input boxes executes locally within your browser sandbox.</li>
                                <li><strong>Decoupled AI Inspection:</strong> The AI model (Google Gemini) receives only the semantic structure of the form (e.g., &quot;First Name&quot;, &quot;Job Title&quot;, &quot;Years of Experience&quot;) to determine the required data type. Your actual personal information is never included in the analysis prompt.</li>
                            </ul>
                        </section>

                        {/* 3. Data We Store */}
                        <section id="data-stored" className="legal-section">
                            <h2>
                                <span className="section-num">3</span>
                                Data We Store (Local Vault)
                            </h2>
                            <p>
                                To enable autofill functionality, Aullevo stores user-provided information directly on your local device. The table below outlines each category of data, its exact storage location, and how it is secured:
                            </p>

                            <div className="legal-table-wrapper">
                                <table className="legal-table">
                                    <thead>
                                        <tr>
                                            <th>Data Category</th>
                                            <th>Storage Location</th>
                                            <th>Encryption & Scope</th>
                                            <th>Transmitted to Cloud?</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td><strong>Profile & Resume Data</strong><br />(Name, email, phone, work history, education, custom answers)</td>
                                            <td>Browser IndexedDB &amp; LocalStorage</td>
                                            <td>AES-256-GCM encrypted client-side; isolated to extension sandbox</td>
                                            <td><strong>NO</strong> — Remains 100% on your device</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Document Blobs</strong><br />(Uploaded PDF/Word resumes &amp; cover letters)</td>
                                            <td>Local IndexedDB (Binary Blobs)</td>
                                            <td>AES-256-GCM local encryption; never uploaded to Aullevo servers</td>
                                            <td><strong>NO</strong> — Local only</td>
                                        </tr>
                                        <tr>
                                            <td><strong>AI API Keys (BYOK)</strong><br />(Your personal Google Gemini API key)</td>
                                            <td><code>chrome.storage.sync</code> or <code>chrome.storage.local</code></td>
                                            <td>Secure browser storage isolation; used only for direct HTTPS requests to Google API</td>
                                            <td><strong>NO</strong> — Never sent to Aullevo</td>
                                        </tr>
                                        <tr>
                                            <td><strong>User Preferences & Settings</strong><br />(Autofill speed, theme, hotkey bindings, enabled sites)</td>
                                            <td><code>chrome.storage.local</code></td>
                                            <td>Plaintext configuration within extension sandbox</td>
                                            <td><strong>NO</strong> — Local only</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* 4. Data We Transmit & AI Processing */}
                        <section id="data-transmitted" className="legal-section">
                            <h2>
                                <span className="section-num">4</span>
                                Data We Transmit & AI Processing
                            </h2>
                            <p>
                                To provide intelligent form parsing, Aullevo interfaces with Google&apos;s Gemini API (either using your own API key or via our secure client proxy).
                            </p>

                            <h3>What IS Transmitted to the AI Model:</h3>
                            <ul>
                                <li>HTML field metadata (e.g., <code>&lt;input name=&quot;first_name&quot; placeholder=&quot;Enter your legal first name&quot;&gt;</code>)</li>
                                <li>Form labels, field hierarchy, and select dropdown options</li>
                                <li>Structural context required to disambiguate complex questions (e.g., &quot;Work Authorization status in the United States&quot;)</li>
                            </ul>

                            <h3>What is NEVER Transmitted to the AI Model:</h3>
                            <ul>
                                <li>Your actual typed personal data (e.g., your real name, address, Social Security Number, passport details)</li>
                                <li>Your uploaded PDF resume binaries or raw document contents</li>
                                <li>Your passwords, credit card numbers, or financial account details</li>
                                <li>Your browsing history, cookies, or session tokens</li>
                            </ul>

                            <div className="legal-callout callout-success">
                                <div className="callout-icon">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                                <div className="callout-body">
                                    <h4>Two-Stage Decoupled Matching</h4>
                                    <p>Stage 1: AI receives blank field labels and returns field keys (e.g., <code>field_12 -&gt; &quot;work_experience[0].company&quot;</code>).<br />
                                        Stage 2: Your browser locally maps the key to your locally decrypted value and fills the DOM. No personal data ever enters the AI prompt.</p>
                                </div>
                            </div>
                        </section>

                        {/* 5. Browser Extension Permissions */}
                        <section id="permissions" className="legal-section">
                            <h2>
                                <span className="section-num">5</span>
                                Browser Extension Permissions
                            </h2>
                            <p>
                                The Aullevo Chrome Extension requests minimal permissions strictly necessary to perform form automation. Below is a complete justification for every permission listed in our <code>manifest.json</code>:
                            </p>

                            <div className="legal-table-wrapper">
                                <table className="legal-table">
                                    <thead>
                                        <tr>
                                            <th>Permission</th>
                                            <th>Technical Purpose &amp; Justification</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td><code>activeTab</code></td>
                                            <td>Allows Aullevo to inspect the current active tab when you trigger autofill or open the extension overlay.</td>
                                        </tr>
                                        <tr>
                                            <td><code>storage</code></td>
                                            <td>Required to save your encrypted profile vault, API key, and user preferences locally on your browser.</td>
                                        </tr>
                                        <tr>
                                            <td><code>scripting</code></td>
                                            <td>Enables injecting the form filler content script to detect input elements, modals, and iframes on web pages.</td>
                                        </tr>
                                        <tr>
                                            <td><code>host_permissions (&lt;all_urls&gt;)</code></td>
                                            <td>Allows Aullevo to function on any webpage where you choose to automate forms (job boards, government websites, application portals). Aullevo never passively monitors websites in the background.</td>
                                        </tr>
                                        <tr>
                                            <td><code>alarms</code></td>
                                            <td>Used for periodic local cache cleanup and non-blocking session lifecycle maintenance.</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* 6. Chrome Web Store Compliance */}
                        <section id="chrome-store-compliance" className="legal-section">
                            <h2>
                                <span className="section-num">6</span>
                                Chrome Web Store User Data Policy Compliance
                            </h2>
                            <p>
                                Aullevo strictly complies with the <strong>Chrome Web Store Developer Program Policies</strong>, including the User Data FAQ and Quality Guidelines:
                            </p>
                            <ol>
                                <li><strong>Single Purpose:</strong> Aullevo has a single, clear purpose: automating form fields and input completion using AI assistance.</li>
                                <li><strong>No Sale of Data:</strong> We do not sell, rent, lease, or monetize user data to any third party, broker, or advertising network under any circumstance.</li>
                                <li><strong>No Credit-Worthiness Assessment or Lending:</strong> Data processed by Aullevo is never used to determine creditworthiness or for financial evaluation.</li>
                                <li><strong>No Behavioral Profiling:</strong> We do not build user profiles for advertising, marketing, or behavioral tracking across websites.</li>
                            </ol>
                        </section>

                        {/* 7. Google Limited Use Disclosure */}
                        <section id="google-limited-use" className="legal-section">
                            <h2>
                                <span className="section-num">7</span>
                                Google API Services & Limited Use Disclosure
                            </h2>
                            <p>
                                Aullevo&apos;s use and transfer to any other app of information received from Google APIs adheres to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="legal-link">Google API Services User Data Policy</a>, including the Limited Use requirements:
                            </p>
                            <ul>
                                <li>We do not allow humans to read user data unless we have obtained your explicit consent for troubleshooting, it is necessary for security purposes (e.g., investigating abuse), or to comply with applicable laws.</li>
                                <li>Google user data is never used to serve targeted advertisements.</li>
                                <li>Data received from Google APIs is never shared with third parties except as necessary to provide or improve the core functionality of the Service.</li>
                            </ul>
                        </section>

                        {/* 8. User Data Control & Deletion */}
                        <section id="user-control" className="legal-section">
                            <h2>
                                <span className="section-num">8</span>
                                User Data Control, Export & Total Deletion
                            </h2>
                            <p>
                                You maintain total sovereignty over your data at all times:
                            </p>
                            <ul>
                                <li><strong>Export Data:</strong> You can export your full profile, custom field library, and preferences as an unencrypted or encrypted JSON file at any time via the extension settings.</li>
                                <li><strong>Edit / Update:</strong> You can modify or remove individual fields, resumes, and answers directly from the extension dashboard.</li>
                                <li><strong>One-Click Wipe (Total Deletion):</strong> Clicking &quot;Reset Vault / Clear All Data&quot; in the extension settings immediately and permanently destroys all local IndexedDB and Storage keys.</li>
                                <li><strong>Uninstalling Extension:</strong> Uninstalling Aullevo from your browser automatically deletes all local storage data associated with the extension sandbox. Because we hold no server copy, your data ceases to exist instantly.</li>
                            </ul>
                        </section>

                        {/* 9. Security & Encryption */}
                        <section id="security-encryption" className="legal-section">
                            <h2>
                                <span className="section-num">9</span>
                                Security & Encryption Standards
                            </h2>
                            <p>
                                We apply industry-standard security safeguards to protect your information:
                            </p>
                            <ul>
                                <li><strong>AES-256-GCM Local Vault Encryption:</strong> Profile data stored locally is encrypted using authenticated AES-256-GCM before write operations to local storage.</li>
                                <li><strong>HTTPS / TLS 1.3 in Transit:</strong> Any outgoing API communication (e.g., prompt analysis with Gemini AI) is strictly encrypted via TLS 1.3.</li>
                                <li><strong>Zero-Trust DOM Isolation:</strong> Form injection routines simulate natural human keystrokes and focus events while preventing page scripts from inspecting extension internals.</li>
                                <li><strong>Content Security Policy (CSP):</strong> Extension manifests and web apps enforce a strict CSP preventing arbitrary code execution and unauthorized script injection.</li>
                            </ul>
                        </section>

                        {/* 10. Third-Party Services */}
                        <section id="third-party" className="legal-section">
                            <h2>
                                <span className="section-num">10</span>
                                Third-Party Services & Sub-Processors
                            </h2>
                            <p>
                                Aullevo minimizes third-party dependencies. Below is the full list of external service providers utilized:
                            </p>
                            <div className="legal-table-wrapper">
                                <table className="legal-table">
                                    <thead>
                                        <tr>
                                            <th>Provider</th>
                                            <th>Role</th>
                                            <th>Privacy Policy</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td><strong>Google AI / Gemini API</strong></td>
                                            <td>AI form parsing and semantic field matching</td>
                                            <td><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="legal-link">Google Privacy Policy</a></td>
                                        </tr>
                                        <tr>
                                            <td><strong>Vercel</strong></td>
                                            <td>Static website hosting and CDN distribution</td>
                                            <td><a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="legal-link">Vercel Privacy Policy</a></td>
                                        </tr>
                                        <tr>
                                            <td><strong>Firebase Auth (Optional)</strong></td>
                                            <td>Authentication for cloud sync features (if explicitly enabled)</td>
                                            <td><a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer" className="legal-link">Firebase Privacy Policy</a></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* 11. Cookies */}
                        <section id="cookies" className="legal-section">
                            <h2>
                                <span className="section-num">11</span>
                                Cookies & Tracking Policy
                            </h2>
                            <p>
                                <strong>The Aullevo Extension does NOT use cookies.</strong> It relies strictly on browser-isolated storage (<code>chrome.storage.local</code> and <code>IndexedDB</code>).
                            </p>
                            <p>
                                <strong>Our Website (aullevo-web.vercel.app):</strong> Uses only essential technical session storage for theme persistence (light/dark mode) and authentication state if you log in. We do not use third-party tracking pixels, Facebook Pixels, or cross-site advertising cookies.
                            </p>
                        </section>

                        {/* 12. GDPR & CCPA */}
                        <section id="gdpr-ccpa" className="legal-section">
                            <h2>
                                <span className="section-num">12</span>
                                GDPR & CCPA/CPRA Rights
                            </h2>
                            <p>
                                Under the European General Data Protection Regulation (GDPR) and California Consumer Privacy Act (CCPA / CPRA), users possess explicit rights regarding their personal data:
                            </p>
                            <ul>
                                <li><strong>Right to Access:</strong> You have full visibility into all data stored within Aullevo at any time in the dashboard.</li>
                                <li><strong>Right to Rectification:</strong> You can edit or update any profile field directly in the extension.</li>
                                <li><strong>Right to Erasure (&quot;Right to be Forgotten&quot;):</strong> You can wipe your local vault with one click. Because we do not keep server records, erasure is instantaneous and irreversible.</li>
                                <li><strong>Right to Data Portability:</strong> You can export your entire dataset in standard JSON format.</li>
                                <li><strong>Right to Non-Discrimination:</strong> We will never discriminate against you for exercising your privacy rights.</li>
                            </ul>
                        </section>

                        {/* 13. Children */}
                        <section id="children" className="legal-section">
                            <h2>
                                <span className="section-num">13</span>
                                Children&apos;s Privacy
                            </h2>
                            <p>
                                Aullevo is not directed at children under the age of 13 (or 16 in the European Union). We do not knowingly collect, store, or solicit personal data from children. If you believe a child has provided personal information through our Service, please contact us immediately so we can assist with deletion.
                            </p>
                        </section>

                        {/* 14. Updates */}
                        <section id="policy-changes" className="legal-section">
                            <h2>
                                <span className="section-num">14</span>
                                Updates to This Privacy Policy
                            </h2>
                            <p>
                                We may update this Privacy Policy from time to time to reflect changes in our technology, legal obligations, or product capabilities. Any updates will be posted directly to this URL with an updated &quot;Last Updated&quot; date. We encourage you to periodically review this page to stay informed about how we protect your information.
                            </p>
                        </section>

                        {/* 15. Contact */}
                        <section id="contact" className="legal-section">
                            <h2>
                                <span className="section-num">15</span>
                                Contact Us & Inquiries
                            </h2>
                            <p>
                                If you have any questions, concerns, or feedback regarding this Privacy Policy or Aullevo&apos;s data practices, please contact our Data Protection and Privacy team:
                            </p>
                            <ul>
                                <li><strong>Email:</strong> <a href="mailto:xenexashura@gmail.com" className="legal-link">privacy@aullevo.com</a></li>
                                <li><strong>Support Desk:</strong> <a href="mailto:xenexashura@gmail.com" className="legal-link">support@aullevo.com</a></li>
                                <li><strong>Official Website:</strong> <a href="https://aullevo-web.vercel.app" className="legal-link">https://aullevo-web.vercel.app</a></li>
                            </ul>

                            <div className="legal-action-bar">
                                <div className="legal-action-text">
                                    <h4>Have questions about our zero-knowledge model?</h4>
                                    <p>Contact our privacy engineering team directly.</p>
                                </div>
                                <div className="legal-action-buttons">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={handleCopyEmail}
                                        aria-label="Copy Privacy Contact Email"
                                        style={{ fontSize: '0.9rem', padding: '0.6rem 1.25rem' }}
                                    >
                                        {copiedEmail ? '✓ Copied privacy@aullevo.com' : 'Copy Privacy Email'}
                                    </button>
                                    <Link to="/docs#privacy" className="btn btn-primary" style={{ fontSize: '0.9rem', padding: '0.6rem 1.25rem' }}>
                                        View Security Docs
                                    </Link>
                                </div>
                            </div>
                        </section>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;

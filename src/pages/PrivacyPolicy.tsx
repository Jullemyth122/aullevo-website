import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const CONTACT_EMAIL = 'mythicalxenon12@gmail.com';

const PrivacyPolicy: React.FC = () => {
    const [activeSection, setActiveSection] = useState<string>('introduction');
    const tocRef = useRef<HTMLDivElement>(null);
    const [copiedEmail, setCopiedEmail] = useState<boolean>(false);

    const sections = [
        { id: 'introduction', label: '1. Introduction & Overview' },
        { id: 'local-first', label: '2. Local-First Design' },
        { id: 'data-stored', label: '3. Data Stored in the Extension' },
        { id: 'data-transmitted', label: '4. AI Smart Fill & Google Gemini' },
        { id: 'account-payments', label: '5. Accounts, Payments & Website' },
        { id: 'permissions', label: '6. Browser Extension Permissions' },
        { id: 'chrome-store-compliance', label: '7. Chrome Web Store Compliance' },
        { id: 'google-limited-use', label: '8. Google Limited Use Disclosure' },
        { id: 'user-control', label: '9. Your Control & Deletion' },
        { id: 'security-encryption', label: '10. Security & Encryption' },
        { id: 'third-party', label: '11. Third-Party Services' },
        { id: 'cookies', label: '12. Cookies & Analytics' },
        { id: 'gdpr-ccpa', label: '13. GDPR & CCPA Rights' },
        { id: 'children', label: '14. Children\'s Privacy' },
        { id: 'policy-changes', label: '15. Updates to This Policy' },
        { id: 'contact', label: '16. Contact Us' },
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
        navigator.clipboard.writeText(CONTACT_EMAIL);
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

    // Keep the highlighted entry visible inside the sticky table of contents
    // (scrolls only the sidebar box, never the page).
    useEffect(() => {
        const container = tocRef.current;
        const link = container?.querySelector<HTMLElement>('a.active');
        if (!container || !link || container.scrollHeight <= container.clientHeight) return;
        const box = container.getBoundingClientRect();
        const item = link.getBoundingClientRect();
        if (item.top < box.top) container.scrollTop -= box.top - item.top + 12;
        else if (item.bottom > box.bottom) container.scrollTop += item.bottom - box.bottom + 12;
    }, [activeSection]);

    return (
        <div className="legal-page animate-fade-in">
            <SEO
                title="Privacy Policy | Aullevo - Private, Local-First Form Automation"
                description="How Aullevo handles your data: profiles encrypted on your device with AES-256-GCM, optional Gemini AI with SENSITIVE-field controls, and exactly what our website, accounts, and payments collect."
                keywords="aullevo privacy policy, chrome extension privacy, encrypted autofill, gemini form filling privacy, form autofill data security"
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
                            Local-First &amp; Encrypted
                        </span>
                        <span className="legal-badge">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                            Effective Date: September 30, 2026
                        </span>
                    </div>

                    <h1 className="legal-title">Privacy Policy</h1>

                    <div className="legal-meta">
                        <div className="legal-meta-item">
                            <span>Last Updated: <strong>September 30, 2026</strong></span>
                        </div>
                        <div className="legal-meta-item">
                            <span>Product: <strong>Aullevo Browser Extension (v0.6.0) &amp; Aullevo Web</strong></span>
                        </div>
                        <div className="legal-meta-item">
                            <span>Direct Inquiries: <strong>{CONTACT_EMAIL}</strong></span>
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
                        <h3>Encrypted on Your Device</h3>
                        <p>Your profiles, documents, and Gemini API key are encrypted with your own passphrase (AES-256-GCM) and stored only in your browser. They are never uploaded to Aullevo.</p>
                    </div>

                    <div className="legal-summary-card">
                        <div className="card-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1 1 0 0 1-2 0V7a1 1 0 0 1 2 0z" />
                            </svg>
                        </div>
                        <h3>AI Is Optional &amp; Controlled</h3>
                        <p>AI Smart Fill is off by default. When on, Google Gemini receives the form's questions and your field labels, plus values only from fields you mark AI SAFE and the AI Memories you enable. SENSITIVE values are never sent.</p>
                    </div>

                    <div className="legal-summary-card">
                        <div className="card-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                        </div>
                        <h3>Minimal Account Data</h3>
                        <p>An account is optional and only used for your Pro plan. We store your Google name, email, photo, plan status, and payment records, never your profile data.</p>
                    </div>

                    <div className="legal-summary-card">
                        <div className="card-icon yellow">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                        </div>
                        <h3>You Stay in Control</h3>
                        <p>Delete any field or document anytime, reset your vault, or uninstall to erase all extension data. Email us to delete your account record.</p>
                    </div>
                </div>

                {/* Main Content & Sidebar Layout */}
                <div className="legal-layout">
                    {/* Sticky Table of Contents */}
                    <aside className="legal-sidebar">
                        <div className="sidebar-inner" ref={tocRef}>
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
                                Welcome to <strong>Aullevo</strong> (&quot;Aullevo&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). Aullevo consists of the Aullevo browser extension for Chrome, Brave, and Edge, and the Aullevo Web website at aullevo-web.vercel.app (together, the &quot;Service&quot;).
                            </p>
                            <p>
                                This Privacy Policy explains what information the Service handles, where it is stored, when it leaves your device, and the choices you have. We have written it to match exactly how the Service works today.
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
                                    <p>Aullevo has one purpose: helping you fill web forms, questionnaires, and applications with information you choose to save. We do not sell data, show ads, or build advertising profiles.</p>
                                </div>
                            </div>
                        </section>

                        {/* 2. Local-First Design */}
                        <section id="local-first" className="legal-section">
                            <h2>
                                <span className="section-num">2</span>
                                Local-First Design
                            </h2>
                            <p>
                                Many autofill tools keep your personal records on their own cloud servers. Aullevo does not:
                            </p>
                            <ul>
                                <li><strong>Your profile data stays on your device.</strong> Profiles, custom fields, and documents are stored in your browser's extension storage (<code>chrome.storage.local</code>), encrypted with your passphrase.</li>
                                <li><strong>No server copy of your profiles.</strong> We do not operate any database that stores your profiles, documents, form answers, or browsing activity.</li>
                                <li><strong>Matching happens locally.</strong> The engine that matches your saved fields to form questions runs inside your browser and works offline.</li>
                                <li><strong>AI is optional.</strong> Nothing is sent to an AI service unless you turn on AI Smart Fill (see Section 4).</li>
                                <li><strong>You decide who submits.</strong> By default you submit every form yourself. If you turn on <strong>Auto-Pagination</strong> (Pro), Aullevo clicks Next / Continue and <strong>presses Submit on the last page for you</strong>, which sends your answers to that website under its own privacy policy. It pauses instead when a required field is empty or the form shows an error it can't fix.</li>
                            </ul>
                        </section>

                        {/* 3. Data We Store */}
                        <section id="data-stored" className="legal-section">
                            <h2>
                                <span className="section-num">3</span>
                                Data Stored in the Extension
                            </h2>

                            <div className="legal-callout callout-success">
                                <div className="callout-icon">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    </svg>
                                </div>
                                <div className="callout-body">
                                    <h4>Encrypted Vault</h4>
                                    <p>Your profiles, documents, and API key are encrypted with AES-256-GCM using a key derived from your passphrase (PBKDF2-SHA256, 600,000 iterations). Your passphrase is never stored. If you forget it, the data cannot be recovered, by you or by us.</p>
                                </div>
                            </div>

                            <p>
                                The extension stores only information you enter or that it needs to work. The table below lists each category:
                            </p>

                            <div className="legal-table-wrapper">
                                <table className="legal-table">
                                    <thead>
                                        <tr>
                                            <th>Data Category</th>
                                            <th>Storage Location</th>
                                            <th>Protection</th>
                                            <th>Sent to Aullevo?</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td><strong>Profiles &amp; Custom Fields</strong><br />(Identity, contact, job, academic, government, medical, financial, and custom answers you enter)</td>
                                            <td><code>chrome.storage.local</code> (encrypted vault)</td>
                                            <td>AES-256-GCM with your passphrase</td>
                                            <td><strong>NO</strong>, stays on your device</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Documents</strong><br />(Resumes, cover letters, IDs, certificates you upload)</td>
                                            <td>Inside the encrypted vault</td>
                                            <td>AES-256-GCM with your passphrase</td>
                                            <td><strong>NO</strong>, only attached to forms you fill</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Gemini API Key</strong><br />(Optional, your own key)</td>
                                            <td>Inside the encrypted vault</td>
                                            <td>AES-256-GCM; sent only to Google's Gemini API</td>
                                            <td><strong>NO</strong></td>
                                        </tr>
                                        <tr>
                                            <td><strong>Unlock Key</strong></td>
                                            <td><code>chrome.storage.session</code> (memory only)</td>
                                            <td>Not readable by websites; cleared when you close the browser or press Lock</td>
                                            <td><strong>NO</strong></td>
                                        </tr>
                                        <tr>
                                            <td><strong>Settings &amp; Link Queue</strong><br />(Theme, typing speed, AI toggle, Auto-Pagination toggle, floating button, Multi-link URLs, weekly AI-fill counter)</td>
                                            <td><code>chrome.storage.local</code></td>
                                            <td>Stored unencrypted (no profile data)</td>
                                            <td><strong>NO</strong></td>
                                        </tr>
                                        <tr>
                                            <td><strong>AI Memories</strong><br />(Optional short notes you add for AI Smart Fill, e.g. "Work style: remote only")</td>
                                            <td><code>chrome.storage.local</code></td>
                                            <td>Stored unencrypted; don't add passwords or ID numbers</td>
                                            <td><strong>NO</strong> (enabled ones go to Google Gemini when AI Smart Fill is on)</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Account Snapshot</strong><br />(Only if you connect an account: name, email, photo, account ID, plan, plan expiry)</td>
                                            <td><code>chrome.storage.local</code></td>
                                            <td>Copy of your Aullevo Web account record, re-checked with our database</td>
                                            <td>Read from our database (Section 5)</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* 4. AI Processing */}
                        <section id="data-transmitted" className="legal-section">
                            <h2>
                                <span className="section-num">4</span>
                                AI Smart Fill &amp; Google Gemini
                            </h2>

                            <div className="legal-callout callout-info">
                                <div className="callout-icon">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="12" y1="16" x2="12" y2="12" />
                                        <line x1="12" y1="8" x2="12.01" y2="8" />
                                    </svg>
                                </div>
                                <div className="callout-body">
                                    <h4>Off by Default</h4>
                                    <p>AI Smart Fill only runs if you turn it on and add your own Gemini API key. Requests go directly from your browser to Google's Gemini API; they do not pass through Aullevo servers.</p>
                                </div>
                            </div>

                            <p>
                                Every field in your profile has a <strong>SENSITIVE / AI SAFE</strong> setting. Email, phone, address, ID numbers, and medical and financial fields start as SENSITIVE; you can change any field at any time.
                            </p>

                            <h3>What IS Sent to Gemini (only when AI Smart Fill is on):</h3>
                            <ul>
                                <li>The text of the form's questions and their answer options, plus a short note on the format an input expects (for example &quot;whole number only&quot;)</li>
                                <li>The labels and context hints of your enabled profile fields</li>
                                <li>The <strong>values</strong> of enabled fields marked <strong>AI SAFE</strong> (for example your name or skills), so the AI can choose better answers</li>
                                <li>The title and content of your <strong>enabled AI Memories</strong></li>
                                <li>When Auto-Pagination asks the AI to fix an answer a form rejected: the form's error message, and the rejected answer <strong>only if</strong> the AI wrote it or it came from an AI SAFE field</li>
                            </ul>

                            <h3>What is NEVER Sent to Gemini:</h3>
                            <ul>
                                <li>Values of fields marked SENSITIVE</li>
                                <li>Values a website filled in by itself</li>
                                <li>Your uploaded documents</li>
                                <li>Your passphrase or encryption key</li>
                                <li>Your browsing history, cookies, or other page content beyond the form's questions</li>
                            </ul>

                            <div className="legal-callout callout-success">
                                <div className="callout-icon">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                                <div className="callout-body">
                                    <h4>Two-Stage Matching</h4>
                                    <p>Stage 1: Gemini replies with <em>which</em> of your fields answers each question (e.g. <code>question_3 → email</code>), or picks an option from the list.<br />
                                        Stage 2: Your browser looks up the real value locally and fills the form, so SENSITIVE values never enter the AI request.</p>
                                </div>
                            </div>

                            <p>
                                Google processes these requests under its own terms: the <a href="https://ai.google.dev/gemini-api/terms" target="_blank" rel="noopener noreferrer" className="legal-link">Gemini API Terms</a> and <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="legal-link">Google Privacy Policy</a>. Depending on your Google account and API tier, Google's terms may allow it to use submitted data to improve its services. Keep anything you don't want shared marked SENSITIVE, or leave AI Smart Fill off.
                            </p>
                        </section>

                        {/* 5. Accounts, Payments & Website */}
                        <section id="account-payments" className="legal-section">
                            <h2>
                                <span className="section-num">5</span>
                                Accounts, Payments &amp; Website
                            </h2>
                            <p>
                                You can use the extension without an account. An account on Aullevo Web is only needed to buy and use Aullevo Pro.
                            </p>

                            <h3>Account (Google Sign-In)</h3>
                            <ul>
                                <li>When you sign in with Google, Firebase Authentication (operated by Google) provides us your <strong>name, email address, profile photo, and account ID</strong>.</li>
                                <li>We store an account record in our Firebase database containing that information, the date you joined, and your <strong>plan status and plan expiry date</strong>.</li>
                                <li>When you connect the extension, Aullevo Web gives it a short-lived sign-in token so the extension can read <em>your own</em> account record and confirm your plan. Your profiles are never uploaded.</li>
                            </ul>

                            <h3>Payments</h3>
                            <ul>
                                <li>Payments are processed by <strong>PayPal</strong> (PayPal and cards) and <strong>PayMongo</strong> (GCash, Maya, QR Ph, and bank apps). We never see or store your card or wallet details.</li>
                                <li>After a payment, we store a <strong>payment record</strong> so we can verify it and activate Pro: your account ID and email, the payment method, the transaction or Payment ID, the PayPal account email used to pay (for PayPal), the amount and currency, and the time.</li>
                                <li>GCash, Maya, and QR Ph payments are confirmed directly with PayMongo, which activates Pro on your account automatically. PayPal payments are checked in our PayPal dashboard before we activate Pro. Pro lasts 30 days per payment and does not renew automatically.</li>
                            </ul>

                            <h3>Reviews</h3>
                            <ul>
                                <li>If you post a review, the display name, rating, and text you submit are stored and <strong>shown publicly</strong> on the website.</li>
                            </ul>
                        </section>

                        {/* 6. Browser Extension Permissions */}
                        <section id="permissions" className="legal-section">
                            <h2>
                                <span className="section-num">6</span>
                                Browser Extension Permissions
                            </h2>
                            <p>
                                The Aullevo extension requests only the permissions it needs. Here is every permission in its <code>manifest.json</code> and why:
                            </p>

                            <div className="legal-table-wrapper">
                                <table className="legal-table">
                                    <thead>
                                        <tr>
                                            <th>Permission</th>
                                            <th>Why Aullevo Needs It</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td><code>host_permissions (&lt;all_urls&gt;)</code></td>
                                            <td>Lets Aullevo detect and fill forms on whichever website you choose, from job portals to school and government sites. It reads form structure locally and only fills when you ask it to.</td>
                                        </tr>
                                        <tr>
                                            <td><code>storage</code> &amp; <code>unlimitedStorage</code></td>
                                            <td>Saves your encrypted vault, settings, and link queue in your browser. Unlimited storage is needed because documents like resume PDFs can be large.</td>
                                        </tr>
                                        <tr>
                                            <td><code>scripting</code></td>
                                            <td>Re-activates Aullevo in tabs that were already open when you install or update the extension, so you don't have to refresh every page. During Auto-Pagination it also checks which frame of the page holds the form. It never runs code from outside the extension.</td>
                                        </tr>
                                        <tr>
                                            <td><code>sidePanel</code></td>
                                            <td>Shows Aullevo's interface in the browser's native side panel.</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* 7. Chrome Web Store Compliance */}
                        <section id="chrome-store-compliance" className="legal-section">
                            <h2>
                                <span className="section-num">7</span>
                                Chrome Web Store User Data Policy Compliance
                            </h2>
                            <p>
                                Aullevo follows the <strong>Chrome Web Store Developer Program Policies</strong>, including the User Data Policy and its Limited Use requirements:
                            </p>

                            <div className="legal-compliance-quote">
                                <div className="quote-badge">Chrome Web Store Policy Compliance Statement</div>
                                <blockquote>
                                    &ldquo;Aullevo's use of information received from Chrome APIs complies with the Chrome Web Store User Data Policy, including the Limited Use requirements. We do not sell or transfer user data to third parties outside of the uses described in this policy, do not use user data for creditworthiness or lending, and do not use user data for purposes unrelated to form automation.&rdquo;
                                </blockquote>
                            </div>

                            <ol>
                                <li><strong>Single Purpose:</strong> Aullevo exists to fill web forms with information you save.</li>
                                <li><strong>No Sale of Data:</strong> We do not sell, rent, or trade user data to anyone.</li>
                                <li><strong>Limited Transfers:</strong> Data is only shared with Google Gemini (if you turn on AI Smart Fill), Google Firebase (account and plan), and PayPal or PayMongo (payments), as described in this policy.</li>
                                <li><strong>No Creditworthiness or Lending Use:</strong> Data is never used to assess credit or lending eligibility.</li>
                                <li><strong>No Advertising or Profiling:</strong> We do not build advertising profiles or track you across websites through the extension.</li>
                            </ol>
                        </section>

                        {/* 8. Google Limited Use Disclosure */}
                        <section id="google-limited-use" className="legal-section">
                            <h2>
                                <span className="section-num">8</span>
                                Google API Services &amp; Limited Use Disclosure
                            </h2>
                            <p>
                                Aullevo&apos;s use and transfer of information received from Google APIs (including Google Sign-In) adheres to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="legal-link">Google API Services User Data Policy</a> and the <a href="https://developer.chrome.com/docs/webstore/program-policies/user-data-faq" target="_blank" rel="noopener noreferrer" className="legal-link">Chrome Web Store User Data Policy</a>, including the Limited Use requirements:
                            </p>
                            <ul>
                                <li><strong>Google Sign-In Data:</strong> Your Google name, email, and photo are used only to identify your Aullevo account and plan.</li>
                                <li><strong>Human Review Restrictions:</strong> We only look at account and payment records to verify payments, provide support you request, investigate abuse, or comply with law. We cannot see your profile data at all.</li>
                                <li><strong>No Advertising Use:</strong> Google user data is never used for advertising.</li>
                                <li><strong>No Third-Party Sharing:</strong> Google user data is not shared with third parties except the service providers listed in Section 11 that are needed to run the Service.</li>
                            </ul>
                        </section>

                        {/* 9. User Data Control & Deletion */}
                        <section id="user-control" className="legal-section">
                            <h2>
                                <span className="section-num">9</span>
                                Your Control &amp; Deletion
                            </h2>
                            <p>
                                You are in control of your data:
                            </p>
                            <ul>
                                <li><strong>Edit or Delete:</strong> Change or remove any field, profile, document, or queued link from the extension at any time.</li>
                                <li><strong>Export:</strong> Pro users can copy or download their profile fields as a JSON file from the extension.</li>
                                <li><strong>Reset Everything:</strong> On the unlock screen, &quot;Forgot passphrase? Reset Aullevo&quot; permanently deletes your encrypted vault.</li>
                                <li><strong>Disconnect:</strong> The Disconnect button in Settings removes the account snapshot from the extension.</li>
                                <li><strong>Uninstall:</strong> Uninstalling Aullevo deletes all data the extension stored in your browser. We hold no copy of your profiles.</li>
                                <li><strong>Account &amp; Payment Records:</strong> Email us at {CONTACT_EMAIL} to access or delete your account record. We may keep payment records as long as needed for accounting, refunds, and legal obligations.</li>
                            </ul>
                        </section>

                        {/* 10. Security & Encryption */}
                        <section id="security-encryption" className="legal-section">
                            <h2>
                                <span className="section-num">10</span>
                                Security &amp; Encryption
                            </h2>
                            <p>
                                We use industry-standard safeguards to protect your information:
                            </p>
                            <ul>
                                <li><strong>AES-256-GCM Vault Encryption:</strong> Profile data, documents, and your API key are encrypted before being written to storage, with a fresh random value for every save.</li>
                                <li><strong>Passphrase-Derived Key:</strong> PBKDF2-SHA256 with 600,000 iterations turns your passphrase into the encryption key. The unlocked key lives only in memory and is never readable by websites.</li>
                                <li><strong>HTTPS in Transit:</strong> Connections to Google Gemini, Firebase, PayPal, and PayMongo are encrypted with HTTPS.</li>
                                <li><strong>Protected Plan Status:</strong> Database rules prevent anyone from changing their own plan. Pro is only activated by Aullevo after a payment is verified.</li>
                                <li><strong>No Remote Code:</strong> The extension runs only code packaged with it, as required by Manifest V3.</li>
                            </ul>
                            <p>
                                No system is perfectly secure. If you believe you've found a security issue, please contact us.
                            </p>
                        </section>

                        {/* 11. Third-Party Services */}
                        <section id="third-party" className="legal-section">
                            <h2>
                                <span className="section-num">11</span>
                                Third-Party Services &amp; Sub-Processors
                            </h2>
                            <p>
                                These are all the external services the Service uses:
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
                                            <td><strong>Google Gemini API</strong></td>
                                            <td>AI Smart Fill (optional, uses your own API key)</td>
                                            <td><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="legal-link">Google Privacy Policy</a></td>
                                        </tr>
                                        <tr>
                                            <td><strong>Google Firebase</strong></td>
                                            <td>Sign-in, account records, payment records, and reviews</td>
                                            <td><a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer" className="legal-link">Firebase Privacy</a></td>
                                        </tr>
                                        <tr>
                                            <td><strong>PayPal</strong></td>
                                            <td>PayPal and card payments</td>
                                            <td><a href="https://www.paypal.com/myaccount/privacy/privacyhub" target="_blank" rel="noopener noreferrer" className="legal-link">PayPal Privacy</a></td>
                                        </tr>
                                        <tr>
                                            <td><strong>PayMongo</strong></td>
                                            <td>GCash, Maya, QR Ph, and bank payments</td>
                                            <td><a href="https://www.paymongo.com/privacy" target="_blank" rel="noopener noreferrer" className="legal-link">PayMongo Privacy</a></td>
                                        </tr>
                                        <tr>
                                            <td><strong>Vercel</strong></td>
                                            <td>Website hosting and downloads</td>
                                            <td><a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="legal-link">Vercel Privacy Policy</a></td>
                                        </tr>
                                        <tr>
                                            <td><strong>Google Tag Manager / Google Analytics</strong></td>
                                            <td>Website visit and download statistics (website only)</td>
                                            <td><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="legal-link">Google Privacy Policy</a></td>
                                        </tr>
                                        <tr>
                                            <td><strong>Google Fonts</strong></td>
                                            <td>Website typography (website only)</td>
                                            <td><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="legal-link">Google Privacy Policy</a></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* 12. Cookies */}
                        <section id="cookies" className="legal-section">
                            <h2>
                                <span className="section-num">12</span>
                                Cookies &amp; Analytics
                            </h2>
                            <p>
                                <strong>The Aullevo extension does not use cookies, analytics, or tracking.</strong> It uses only the browser's extension storage described in Section 3.
                            </p>
                            <p>
                                <strong>Our website (aullevo-web.vercel.app)</strong> uses Google Tag Manager to measure visits, page views, and extension downloads. These Google tools may set cookies or similar identifiers. The website also stores your sign-in state (Firebase), theme preference, and plan status in your browser's local storage. You can block or delete cookies in your browser settings; the website will still work.
                            </p>
                            <p>
                                We do not use advertising cookies, Facebook Pixel, or cross-site advertising trackers.
                            </p>
                        </section>

                        {/* 13. GDPR & CCPA */}
                        <section id="gdpr-ccpa" className="legal-section">
                            <h2>
                                <span className="section-num">13</span>
                                GDPR &amp; CCPA/CPRA Rights
                            </h2>
                            <p>
                                Depending on where you live, including under the EU General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA/CPRA), and the Philippine Data Privacy Act of 2012, you may have these rights:
                            </p>
                            <ul>
                                <li><strong>Right to Access:</strong> Your profile data is always visible in the extension. For your account and payment records, email us.</li>
                                <li><strong>Right to Rectification:</strong> Edit profile data in the extension; ask us to correct account records.</li>
                                <li><strong>Right to Erasure:</strong> Reset your vault or uninstall to erase extension data instantly. Email us to delete your account record (subject to payment-record retention in Section 9).</li>
                                <li><strong>Right to Data Portability:</strong> Export profile fields as JSON (Pro), or request a copy of your account record.</li>
                                <li><strong>Right to Object &amp; Non-Discrimination:</strong> You can turn AI Smart Fill off at any time, and we will never treat you differently for exercising your rights.</li>
                            </ul>
                        </section>

                        {/* 14. Children */}
                        <section id="children" className="legal-section">
                            <h2>
                                <span className="section-num">14</span>
                                Children&apos;s Privacy
                            </h2>
                            <p>
                                Aullevo is not directed at children under the age of 13 (or 16 in the European Union). We do not knowingly collect personal data from children. If you believe a child has created an account or made a payment, please contact us and we will delete the account record.
                            </p>
                        </section>

                        {/* 15. Updates */}
                        <section id="policy-changes" className="legal-section">
                            <h2>
                                <span className="section-num">15</span>
                                Updates to This Privacy Policy
                            </h2>
                            <p>
                                We may update this Privacy Policy as the Service changes. Updates are posted at this address with a new &quot;Last Updated&quot; date. Significant changes, such as a new AI provider or cloud sync of profile data, will also be announced in the extension's release notes before they take effect.
                            </p>
                        </section>

                        {/* 16. Contact */}
                        <section id="contact" className="legal-section">
                            <h2>
                                <span className="section-num">16</span>
                                Contact Us
                            </h2>
                            <p>
                                If you have questions, concerns, or requests about this Privacy Policy or your data, contact us:
                            </p>
                            <ul>
                                <li><strong>Email:</strong> <a href={`mailto:${CONTACT_EMAIL}`} className="legal-link">{CONTACT_EMAIL}</a></li>
                                <li><strong>Official Website:</strong> <a href="https://aullevo-web.vercel.app" className="legal-link">https://aullevo-web.vercel.app</a></li>
                            </ul>

                            <div className="legal-action-bar">
                                <div className="legal-action-text">
                                    <h4>Have a privacy question?</h4>
                                    <p>We reply to every message, usually within a few days.</p>
                                </div>
                                <div className="legal-action-buttons">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={handleCopyEmail}
                                        aria-label="Copy Privacy Contact Email"
                                        style={{ fontSize: '0.9rem', padding: '0.6rem 1.25rem' }}
                                    >
                                        {copiedEmail ? '✓ Email Copied' : 'Copy Contact Email'}
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

import React, { useState, useEffect } from 'react';
import SEO from '../components/SEO';
import { logEvent } from '../utils/analytics';


const Documentation: React.FC = () => {
    const [activeSection, setActiveSection] = useState('what-is-aullevo');
    const [installMethod, setInstallMethod] = useState<'standard' | 'developer'>('standard');

    // Smooth scroll and spy functionality
    useEffect(() => {
        const handleScroll = () => {
            const sections = document.querySelectorAll('.docs-section');
            let current = 'what-is-aullevo';

            sections.forEach((section) => {
                const sectionTop = (section as HTMLElement).offsetTop;
                if (window.scrollY >= sectionTop - 120) {
                    current = section.getAttribute('id') || current;
                }
            });
            setActiveSection(current);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollTo = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            window.scrollTo({
                top: element.offsetTop - 100,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="documentation-page animate-fade-in">
            <SEO
                title="Aullevo Documentation | Setup, Plans & User Guide"
                description="The complete Aullevo guide: installation, creating your encrypted vault, profiles and documents, Gemini AI Smart Fill, Free vs Pro plans, privacy, and known limitations."
                keywords="aullevo guide, form autofill instructions, gemini api key setup, chrome extension install, encrypted autofill, aullevo pro"
            />
            {/* Docs Header */}
            <div className="docs-header">
                <div className="container">
                    <div className="docs-breadcrumb">
                        <span>Aullevo</span> <span className="separator">/</span> <span>Documentation</span> <span className="separator">/</span> <span className="current">v0.5.0</span>
                    </div>
                    <h1 className="docs-title">User Guide</h1>
                    <p className="docs-subtitle">Everything you need to install, set up, and get the most out of Aullevo.</p>
                </div>
            </div>

            <div className="container docs-container">
                {/* Sidebar */}
                <aside className="docs-sidebar">
                    <div className="sidebar-sticky">
                        <div className="sidebar-group">
                            <h4>Getting Started</h4>
                            <ul>
                                <li><a href="#what-is-aullevo" className={activeSection === 'what-is-aullevo' ? 'active' : ''} onClick={(e) => scrollTo('what-is-aullevo', e)}>What is Aullevo?</a></li>
                                <li><a href="#beginner-guide" className={activeSection === 'beginner-guide' ? 'active' : ''} onClick={(e) => scrollTo('beginner-guide', e)}>Aullevo for Beginners</a></li>
                                <li><a href="#free-vs-premium" className={activeSection === 'free-vs-premium' ? 'active' : ''} onClick={(e) => scrollTo('free-vs-premium', e)}>Free vs. Pro</a></li>
                                <li><a href="#real-world-use-cases" className={activeSection === 'real-world-use-cases' ? 'active' : ''} onClick={(e) => scrollTo('real-world-use-cases', e)}>Real-World Use Cases</a></li>
                                <li><a href="#pros-and-cons" className={activeSection === 'pros-and-cons' ? 'active' : ''} onClick={(e) => scrollTo('pros-and-cons', e)}>Pros & Cons</a></li>
                                <li><a href="#installation" className={activeSection === 'installation' ? 'active' : ''} onClick={(e) => scrollTo('installation', e)}>Installation & Setup</a></li>
                                <li><a href="#api-key" className={activeSection === 'api-key' ? 'active' : ''} onClick={(e) => scrollTo('api-key', e)}>Creating an API Key</a></li>
                            </ul>
                        </div>
                        <div className="sidebar-group">
                            <h4>Core Concepts</h4>
                            <ul>
                                <li><a href="#profiles-vault" className={activeSection === 'profiles-vault' ? 'active' : ''} onClick={(e) => scrollTo('profiles-vault', e)}>Profiles & Documents</a></li>
                                <li><a href="#filling-process" className={activeSection === 'filling-process' ? 'active' : ''} onClick={(e) => scrollTo('filling-process', e)}>How Filling Works</a></li>
                            </ul>
                        </div>
                        <div className="sidebar-group">
                            <h4>Security</h4>
                            <ul>
                                <li><a href="#privacy" className={activeSection === 'privacy' ? 'active' : ''} onClick={(e) => scrollTo('privacy', e)}>Privacy & Security</a></li>
                            </ul>
                        </div>
                        <div className="sidebar-group">
                            <h4>Updates & Capabilities</h4>
                            <ul>
                                <li><a href="#capabilities-limitations" className={activeSection === 'capabilities-limitations' ? 'active' : ''} onClick={(e) => scrollTo('capabilities-limitations', e)}>Edge Cases & Limits</a></li>
                            </ul>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="docs-content">
                    <section id="what-is-aullevo" className="docs-section">
                        <h2>1. What is Aullevo?</h2>
                        <p>
                            Aullevo is a browser extension for Chrome, Brave, and Edge that fills web forms for you: job applications, surveys, school and government forms, and everyday sign-ups. You save your details once, and Aullevo fills them in with one shortcut using a fast offline matching engine, with optional help from Google's Gemini AI for harder questions.
                        </p>
                        <div className="docs-note">
                            <div className="note-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                            </div>
                            <div className="note-content">
                                <strong>Privacy First:</strong> Your profiles are encrypted on your device with your own passphrase and never uploaded to Aullevo. AI Smart Fill is optional, uses your own Gemini API key, and never sees fields you mark SENSITIVE.
                            </div>
                        </div>
                    </section>

                    <section id="beginner-guide" className="docs-section">
                        <h2>2. Beginner's Guide</h2>
                        <p>
                            New to Aullevo? This section explains everything in plain English, with no developer jargon.
                        </p>

                        <h3>How does Aullevo help me?</h3>
                        <p>
                            Aullevo is a helper that lives in your browser's side panel. Instead of typing your name, email, school, work details, and survey answers over and over, you save them once and Aullevo fills them in for you with one click or one shortcut.
                        </p>

                        <div className="docs-card-grid" style={{ margin: '2rem 0' }}>
                            <div className="docs-minicard" style={{ margin: 0 }}>
                                <div className="minicard-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                    </svg>
                                </div>
                                <h4>Profiles for Every Form</h4>
                                <p>
                                    Use ready-made profiles for <strong>Job Applications</strong>, <strong>Academic</strong>, <strong>Government</strong>, <strong>Medical</strong>, <strong>Survey</strong>, and <strong>Financial</strong> forms, or create your own, and switch between them in one click.
                                </p>
                            </div>
                            <div className="docs-minicard" style={{ margin: 0 }}>
                                <div className="minicard-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M10 13a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                        <path d="M14 11a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.71 1.71" />
                                        <line x1="8" y1="16" x2="16" y2="8" />
                                    </svg>
                                </div>
                                <h4>Works on Any Link</h4>
                                <p>
                                    You don't need an account on the form's website. As long as the page has a form, whether Google Forms, Microsoft Forms, a job portal, or a plain web page, Aullevo can scan and fill it.
                                </p>
                            </div>
                        </div>

                        <h3>Two Engines: Keywords and AI</h3>
                        <p>
                            Aullevo has two ways of understanding a form, and they work together:
                        </p>

                        <div className="docs-table-wrapper" style={{ marginTop: '1rem' }}>
                            <table className="docs-table">
                                <thead>
                                    <tr>
                                        <th>Engine</th>
                                        <th>How it Works</th>
                                        <th>Speed</th>
                                        <th>Best For</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><strong>Keyword Matching (No AI)</strong></td>
                                        <td>Compares each form question with your saved field labels using similarity, word stems, and aliases (e.g. "E-mail Address" matches your Email field). Works offline.</td>
                                        <td><strong>Instant</strong></td>
                                        <td>Standard fields: names, contact details, addresses, IDs, school and work info.</td>
                                    </tr>
                                    <tr>
                                        <td><strong>AI Smart Fill (Gemini)</strong></td>
                                        <td>Reads the questions a keyword can't solve, picks the best multiple-choice option, combines fields (First + Last → Full Name), and drafts short answers.</td>
                                        <td><strong>A few extra seconds</strong></td>
                                        <td>Unusual wording, dropdown and radio choices, short open-ended questions.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <h3>You Control What AI Sees</h3>
                        <p>
                            Every field has a <strong>SENSITIVE / AI SAFE</strong> switch. Email, phone, address, ID numbers, and medical and financial fields start as SENSITIVE.
                        </p>
                        <div className="docs-note" style={{ margin: '1.5rem 0' }}>
                            <div className="note-content">
                                <strong>How AI Smart Fill stays private:</strong> Aullevo sends Gemini the form's questions and the <strong>labels</strong> of your fields. Values are included only for fields marked <strong>AI SAFE</strong>. Gemini replies with <em>which</em> of your fields answers each question, and the real value is filled in <strong>locally inside your browser</strong>. SENSITIVE values and your documents are never sent.
                            </div>
                        </div>

                        <h3>Coming Soon: Resume Scanner</h3>
                        <div className="docs-note" style={{ margin: '1.5rem 0', borderLeftColor: 'var(--accent-glow)', background: 'var(--bg-badge-live)' }}>
                            <div className="note-content">
                                ✨ <strong>In development:</strong> Upload a PDF or DOCX resume and have Aullevo pull your details straight into your profile. Until then, you can fill your profile by hand or bulk-import fields with JSON (Pro).
                            </div>
                        </div>
                    </section>

                    <section id="free-vs-premium" className="docs-section">
                        <h2>3. Free vs. Pro</h2>
                        <p>
                            Aullevo is <strong>free to use</strong>: the full form engine, all profile types, the encrypted vault, and Multi-link batch fill are included. AI Smart Fill uses your own free Gemini API key, so there are no AI fees from us.
                        </p>
                        <p>
                            <strong>Aullevo Pro</strong> is for people who fill a lot of forms: unlimited AI fills, unlimited active profiles, automatic document uploads, Auto-Pagination for multi-page forms, and more control.
                        </p>

                        <h3>Plan Comparison</h3>
                        <div className="docs-table-wrapper" style={{ marginTop: '1.5rem' }}>
                            <table className="docs-table">
                                <thead>
                                    <tr>
                                        <th>Feature</th>
                                        <th><span className="tier-badge free">Free</span></th>
                                        <th><span className="tier-badge pro">Pro ($2.50 / 30 days)</span></th>
                                        <th>What It Means</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><strong>Keyword Autofill</strong></td>
                                        <td>✓ Unlimited</td>
                                        <td><strong>✓ Unlimited</strong></td>
                                        <td>Instant, offline filling of standard fields.</td>
                                    </tr>
                                    <tr>
                                        <td><strong>AI Smart Fill</strong></td>
                                        <td>10 fills per week</td>
                                        <td><strong>Unlimited</strong></td>
                                        <td>Uses your own free Gemini API key. Free resets every Monday.</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Active Profiles</strong></td>
                                        <td>2 at a time</td>
                                        <td><strong>Unlimited</strong></td>
                                        <td>All profile types and custom profiles are available on both plans.</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Document Upload into Forms</strong></td>
                                        <td>—</td>
                                        <td><strong>✓ Automatic</strong></td>
                                        <td>Resumes, cover letters, and IDs are attached to the right upload fields.</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Auto-Pagination</strong></td>
                                        <td>—</td>
                                        <td><strong>✓ Fill, Next &amp; Submit</strong></td>
                                        <td>Fills every page of a multi-step form and submits it. Pauses when a required field is empty.</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Typing Speed</strong></td>
                                        <td>Instant, Natural</td>
                                        <td><strong>+ Slow &amp; Custom</strong></td>
                                        <td>A slower, human pace for sites that expect real keystrokes.</td>
                                    </tr>
                                    <tr>
                                        <td><strong>JSON Import &amp; Export</strong></td>
                                        <td>View only</td>
                                        <td><strong>✓ Import, Copy &amp; Download</strong></td>
                                        <td>Back up your profile or bulk-add fields.</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Custom Fields, AI Memories, Multi-link, Encrypted Vault</strong></td>
                                        <td>✓</td>
                                        <td><strong>✓</strong></td>
                                        <td>Included on every plan.</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Price</strong></td>
                                        <td>Free</td>
                                        <td><strong>$2.50 or ₱154.29</strong></td>
                                        <td>30 days of Pro per payment. No auto-renewal: renew whenever you like.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <h3>How to Upgrade</h3>
                        <div className="process-timeline">
                            <div className="process-step">
                                <div className="step-point">1</div>
                                <div className="step-text">
                                    <strong>Sign in on Aullevo Web</strong>
                                    Go to the Account page and sign in with Google.
                                </div>
                            </div>
                            <div className="process-step">
                                <div className="step-point">2</div>
                                <div className="step-text">
                                    <strong>Pay with PayPal, Card, GCash, or Maya</strong>
                                    GCash, Maya, and QR Ph open a secure PayMongo checkout linked to your account.
                                </div>
                            </div>
                            <div className="process-step">
                                <div className="step-point">3</div>
                                <div className="step-text">
                                    <strong>Pro turns on</strong>
                                    GCash, Maya, and QR Ph activate Pro automatically as soon as PayMongo confirms the payment. PayPal and card payments are verified and activated within 24 hours. Your Account page shows the status.
                                </div>
                            </div>
                            <div className="process-step">
                                <div className="step-point">4</div>
                                <div className="step-text">
                                    <strong>Connect the Extension</strong>
                                    In the side panel, open <kbd>Settings</kbd> → <strong>Connect with Aullevo Web</strong> while signed in with the same account. The badge switches to <strong>PRO</strong>.
                                </div>
                            </div>
                        </div>
                    </section>

                    <section id="real-world-use-cases" className="docs-section">
                        <h2>4. Real-World Use Cases</h2>
                        <p>
                            Here is how people use Aullevo to skip repetitive typing:
                        </p>

                        <div className="docs-card-grid" style={{ gridTemplateColumns: '1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
                            <div className="use-case-card">
                                <span className="use-case-badge">Job Seekers & Applicants</span>
                                <div className="use-case-header">
                                    <h4>High-Volume Job Applications</h4>
                                    <span className="tier-badge pro">Pro: Document Upload</span>
                                </div>
                                <div className="use-case-problem">
                                    <strong>The Scenario:</strong> Applying to dozens of roles every week on company career portals, each asking for the same contact details, links, and a resume upload.
                                </div>
                                <div className="use-case-solution">
                                    <strong>How Aullevo Helps:</strong> Fill in your Job profile once (headline, LinkedIn, GitHub, portfolio, skills) and attach your resume. On each application, press <kbd>Alt+Shift+L</kbd>: fields are filled and your resume is attached. Queue several links in Multi-link to fill them in one go.
                                </div>
                            </div>

                            <div className="use-case-card">
                                <span className="use-case-badge">Students & Researchers</span>
                                <div className="use-case-header">
                                    <h4>Scholarship & School Forms</h4>
                                    <span className="tier-badge free">Free: Keywords + AI</span>
                                </div>
                                <div className="use-case-problem">
                                    <strong>The Scenario:</strong> University registrations, scholarship applications, and class surveys that repeat the same personal and academic details.
                                </div>
                                <div className="use-case-solution">
                                    <strong>How Aullevo Helps:</strong> The Academic profile fills your school, student ID, course, and GPA instantly. Turn on AI Smart Fill to handle multiple-choice survey questions and differently worded fields.
                                </div>
                            </div>

                            <div className="use-case-card">
                                <span className="use-case-badge">Freelancers & Virtual Assistants</span>
                                <div className="use-case-header">
                                    <h4>Forms for Multiple Clients</h4>
                                    <span className="tier-badge pro">Pro: Unlimited Profiles</span>
                                </div>
                                <div className="use-case-problem">
                                    <strong>The Scenario:</strong> Submitting vendor forms or registrations on behalf of several different clients.
                                </div>
                                <div className="use-case-solution">
                                    <strong>How Aullevo Helps:</strong> Create one custom profile per client and switch before each form, with no risk of mixing up tax IDs, addresses, or emails. Everything stays encrypted in your local vault.
                                </div>
                            </div>

                            <div className="use-case-card">
                                <span className="use-case-badge">Administrative & Operations</span>
                                <div className="use-case-header">
                                    <h4>Repetitive Web Data Entry</h4>
                                    <span className="tier-badge free">Free: Keyword Engine</span>
                                </div>
                                <div className="use-case-problem">
                                    <strong>The Scenario:</strong> Re-typing the same standard details into web portals and internal forms every day.
                                </div>
                                <div className="use-case-solution">
                                    <strong>How Aullevo Helps:</strong> Save the details as custom fields and press <kbd>Alt+Shift+L</kbd> to fill 20+ inputs at once, instantly and offline, with no copy-pasting.
                                </div>
                            </div>
                        </div>
                    </section>

                    <section id="pros-and-cons" className="docs-section">
                        <h2>5. Pros & Cons</h2>
                        <p>
                            We believe in transparency. Here is an honest breakdown of what Aullevo does well and where its limits are:
                        </p>

                        <div className="pros-cons-grid">
                            <div className="pc-card pros">
                                <h4>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                                    Pros (Advantages)
                                </h4>
                                <ul className="docs-list">
                                    <li><strong>Big Time Savings:</strong> Fill long applications, government pages, and school surveys in a fraction of the time.</li>
                                    <li><strong>Encrypted on Your Device:</strong> AES-256-GCM encryption with your own passphrase; profiles are never uploaded.</li>
                                    <li><strong>Works Offline:</strong> Keyword matching needs no internet, account, or AI key.</li>
                                    <li><strong>No Sign-Up on Forms:</strong> Works on any public form link without creating accounts.</li>
                                    <li><strong>Hard-to-Reach Fields:</strong> Fills inputs inside Shadow DOM components and iframes where browser autofill gives up.</li>
                                </ul>
                            </div>

                            <div className="pc-card cons">
                                <h4>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                    Cons (Limitations)
                                </h4>
                                <ul className="docs-list">
                                    <li><strong>AI Needs a Key:</strong> AI Smart Fill requires your own free Gemini API key and adds a few seconds.</li>
                                    <li><strong>Manual Installation:</strong> Until the Chrome Web Store listing is live, you load it with "Developer mode".</li>
                                    <li><strong>CAPTCHAs Stay Manual:</strong> Aullevo never solves or bypasses CAPTCHAs; you complete them yourself.</li>
                                    <li><strong>Multi-Page Forms Need Pro:</strong> On Free, press your shortcut again on each new page. Pro's Auto-Pagination clicks Next and Submit for you.</li>
                                    <li><strong>Forgotten Passphrase:</strong> Your vault can't be recovered without it, so keep a JSON backup.</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section id="installation" className="docs-section">
                        <h2>6. Installation & Setup</h2>
                        <p>Choose the installation path that matches your preference. For most users, we recommend the Standard installation.</p>

                        <div className="docs-tabs-header">
                            <button
                                type="button"
                                className={`docs-tab-btn ${installMethod === 'standard' ? 'active' : ''}`}
                                onClick={() => setInstallMethod('standard')}
                            >
                                Standard Installation
                            </button>
                            <button
                                type="button"
                                className={`docs-tab-btn ${installMethod === 'developer' ? 'active' : ''}`}
                                onClick={() => setInstallMethod('developer')}
                            >
                                Developer CLI (Advanced)
                            </button>
                        </div>

                        {installMethod === 'standard' ? (
                            <div className="process-timeline" style={{ marginTop: '1.5rem' }}>
                                <div className="process-step">
                                    <div className="step-point">1</div>
                                    <div className="step-text">
                                        <strong>Download and Extract</strong>
                                        First, download the extension ZIP file: <a
                                            href="/aullevo-extension.zip"
                                            download
                                            className="external-link"
                                            style={{ fontWeight: 600, color: 'var(--primary)' }}
                                            onClick={() => {
                                                logEvent('download_extension', {
                                                    method: 'docs_link',
                                                    file_name: 'aullevo-extension.zip'
                                                });
                                            }}
                                        >aullevo-extension.zip</a>. Once downloaded, extract it by right-clicking the ZIP file and selecting <strong>"Extract All..."</strong> (on Windows) or double-clicking it (on macOS). This will produce a folder containing a <code>dist</code> subfolder.
                                    </div>
                                </div>
                                <div className="process-step">
                                    <div className="step-point">2</div>
                                    <div className="step-text">
                                        <strong>Open the Extensions Dashboard</strong>
                                        Open a new tab in your browser and go to the extensions page by typing the following into your address bar and pressing Enter:
                                        <ul className="docs-list" style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
                                            <li>Google Chrome: <code>chrome://extensions</code></li>
                                            <li>Brave Browser: <code>brave://extensions</code></li>
                                            <li>Microsoft Edge: <code>edge://extensions</code></li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="process-step">
                                    <div className="step-point">3</div>
                                    <div className="step-text">
                                        <strong>Enable Developer Mode</strong>
                                        Turn on the <strong>"Developer mode"</strong> toggle in the top-right corner of the Extensions dashboard. This lets your browser load an extension from a folder.
                                    </div>
                                </div>
                                <div className="process-step">
                                    <div className="step-point">4</div>
                                    <div className="step-text">
                                        <strong>Load Unpacked Folder</strong>
                                        Click <strong>"Load unpacked"</strong>, select the <code>dist</code> folder from Step 1 (the one containing <code>manifest.json</code>), and click <strong>"Select Folder"</strong>. Updating? Remove the old version first, then load the new <code>dist</code> folder.
                                    </div>
                                </div>
                                <div className="process-step">
                                    <div className="step-point">5</div>
                                    <div className="step-text">
                                        <strong>Open Aullevo & Create Your Vault</strong>
                                        Press <kbd>Alt+Q</kbd> (or click the Aullevo icon) to open the side panel, then choose a passphrase. It encrypts everything you save, and you'll enter it once each time you start your browser. <strong>If you forget it, your data can't be recovered.</strong>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="code-block">
                                <div className="code-header">
                                    <span className="dot red"></span><span className="dot yellow"></span><span className="dot green"></span>
                                    <span className="filename">Setup Process</span>
                                </div>
                                <pre><code>
                                    <span className="comment"># 1. Download the latest release archive</span>
                                    <br />
                                    <span className="keyword">curl</span> -O https://aullevo-web.vercel.app/aullevo-extension.zip
                                    <br />
                                    <span className="comment"># 2. Extract the archive</span>
                                    <br />
                                    <span className="keyword">unzip</span> aullevo-extension.zip -d aullevo-extension
                                    <br />
                                    <span className="comment"># 3. Open the extensions dashboard (chrome:// · brave:// · edge://)</span>
                                    <br />
                                    <span className="string">chrome://extensions</span>
                                    <br />
                                    <span className="comment"># 4. Enable "Developer mode" in the top right</span>
                                    <br />
                                    <span className="comment"># 5. Click "Load unpacked" and select the 'dist' subfolder</span>
                                    <br />
                                    <span className="comment"># 6. Press Alt+Q and create your vault passphrase</span>
                                </code></pre>
                            </div>
                        )}
                    </section>

                    <section id="api-key" className="docs-section">
                        <h2>7. Creating a Gemini API Key</h2>
                        <p>AI Smart Fill is optional. It connects directly from your browser to Google's Gemini models using your own API key, and Google offers a free tier for Gemini Flash models.</p>

                        <div className="process-timeline">
                            <div className="process-step">
                                <div className="step-point">1</div>
                                <div className="step-text">
                                    <strong>Access Google AI Studio</strong>
                                    Visit <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="external-link">Google AI Studio</a> and sign in with your Google Account.
                                </div>
                            </div>
                            <div className="process-step">
                                <div className="step-point">2</div>
                                <div className="step-text">
                                    <strong>Create API Key</strong>
                                    Click <strong>"Create API key"</strong>. If prompted, agree to the Terms of Service. You can create the key in a new or existing project.
                                </div>
                            </div>
                            <div className="process-step">
                                <div className="step-point">3</div>
                                <div className="step-text">
                                    <strong>Copy the Key</strong>
                                    Copy the long string of characters. <strong>Keep it secret</strong> and don't share it with anyone.
                                </div>
                            </div>
                            <div className="process-step">
                                <div className="step-point">4</div>
                                <div className="step-text">
                                    <strong>Add to Aullevo</strong>
                                    In the side panel, open <kbd>Settings</kbd>, turn on <strong>AI Smart Fill</strong>, and paste your key into <strong>Gemini API Key</strong>. It is saved inside your encrypted vault.
                                </div>
                            </div>
                        </div>
                        <div className="docs-note" style={{ marginTop: '1.5rem' }}>
                            <div className="note-content">
                                <strong>Note:</strong> Your use of the Gemini API is governed by Google's terms. Depending on your Google account and tier, Google may use submitted data to improve its services. Mark anything you don't want shared as SENSITIVE.
                            </div>
                        </div>
                    </section>

                    <section id="profiles-vault" className="docs-section">
                        <h2>8. Profiles & Documents</h2>
                        <p>
                            Everything Aullevo fills comes from your <strong>Profiles</strong> and <strong>Documents</strong>, all stored inside your encrypted vault.
                        </p>

                        <div className="docs-card-grid">
                            <div className="docs-minicard">
                                <div className="minicard-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg></div>
                                <h4>Profiles & Custom Fields</h4>
                                <p>Fill in identity, contact, and domain details (job, academic, government, and more). Add custom fields with a <strong>context hint</strong> that explains what each answer means, and mark each field SENSITIVE or AI SAFE.</p>
                            </div>
                            <div className="docs-minicard">
                                <div className="minicard-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg></div>
                                <h4>Documents (Pro Upload)</h4>
                                <p>Save your resume, cover letter, IDs, and certificates with a label. With Pro, Aullevo reads each upload field's label and attaches the best-matching document automatically.</p>
                            </div>
                            <div className="docs-minicard">
                                <div className="minicard-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h12l4 4v12H4z" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="8" y1="16" x2="13" y2="16" /></svg></div>
                                <h4>AI Memories</h4>
                                <p>In <strong>Settings → AI Memories</strong>, save short facts (e.g. "Work style: remote only") that AI Smart Fill can use for open-ended questions. Memories are not encrypted and enabled ones are sent to Gemini, so keep secrets out of them.</p>
                            </div>
                        </div>
                        <p>Need more room? Click the <strong>⤢ Open full page</strong> button in the side panel header to edit profiles and settings in a full browser tab.</p>
                    </section>

                    <section id="filling-process" className="docs-section">
                        <h2>9. How Filling Works</h2>
                        <p>Once your profile is set up, filling a form takes a single shortcut.</p>

                        <div className="process-timeline">
                            <div className="process-step">
                                <div className="step-point">1</div>
                                <div className="step-text">
                                    <strong>Open the Side Panel</strong>
                                    Press <kbd>Alt+Q</kbd>, click the Aullevo toolbar icon, or use the floating Aullevo button on the page's edge.
                                </div>
                            </div>
                            <div className="process-step">
                                <div className="step-point">2</div>
                                <div className="step-text">
                                    <strong>Scan &amp; Preview</strong>
                                    Aullevo counts every field on the page, including inside Shadow DOM and iframes. Click <strong>Highlight</strong> to see them outlined before filling.
                                </div>
                            </div>
                            <div className="process-step">
                                <div className="step-point">3</div>
                                <div className="step-text">
                                    <strong>Fill</strong>
                                    Press <kbd>Alt+Shift+L</kbd> or click <strong>Fill</strong>. Keyword matching fills confident matches instantly; with AI Smart Fill on, Gemini answers the rest and the keyword engine fills anything AI skips.
                                </div>
                            </div>
                            <div className="process-step">
                                <div className="step-point">4</div>
                                <div className="step-text">
                                    <strong>Review &amp; Submit</strong>
                                    Filled fields are badged so you can check them before you submit. With Auto-Pagination (Pro) on, Aullevo clicks Next and Submit itself and pauses if a required field is empty.
                                </div>
                            </div>
                        </div>

                        <h3>Auto-Pagination (Pro)</h3>
                        <p>Turn it on in <strong>Settings → Auto-Pagination</strong>. It works with the Fill button, <kbd>Alt+Shift+L</kbd>, and Multi-link batches:</p>
                        <ul className="docs-list">
                            <li><strong>Page by page:</strong> fills the page, clicks Next or Continue, and presses Submit on the last page (up to 12 pages per run).</li>
                            <li><strong>Never skips a required field:</strong> if a field marked required (*) is still empty, it pauses and highlights that field in red. Fields that were already filled, including a resume the site already has, count as done.</li>
                            <li><strong>The site has the final word:</strong> if the form refuses to continue, Aullevo reads the error, fixes what it can (for example "5 years" becomes "5" when a whole number is required), and tries again. If it still can't continue, it pauses and tells you which field to check.</li>
                            <li><strong>Knows which buttons to press:</strong> clicks through steps like "Apply anyway" or "Continue to application", and never clicks Back, "Return to job search", or "Save and close".</li>
                            <li><strong>Patient with slow sites:</strong> waits up to 20 seconds for each new page to load.</li>
                        </ul>

                        <h3>Keyboard Shortcuts</h3>
                        <div className="docs-table-wrapper">
                            <table className="docs-table">
                                <tbody>
                                    <tr><td><kbd>Alt+Q</kbd></td><td>Open or close the Aullevo side panel</td></tr>
                                    <tr><td><kbd>Alt+Shift+L</kbd></td><td>Fill the current page with your active profile</td></tr>
                                    <tr><td><kbd>Alt+Shift+B</kbd></td><td>Run a Multi-link batch fill on your queued links</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <p>You can change these at <code>chrome://extensions/shortcuts</code>.</p>
                    </section>

                    <section id="privacy" className="docs-section">
                        <h2>10. Privacy & Security</h2>
                        <p>Aullevo is local-first: your profile data is encrypted on your device and never uploaded to Aullevo.</p>

                        <div className="docs-table-wrapper">
                            <table className="docs-table">
                                <thead>
                                    <tr>
                                        <th>Data</th>
                                        <th>Where It Lives</th>
                                        <th>Protection</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><strong>Profiles &amp; Custom Fields</strong></td>
                                        <td>Your browser (<code>chrome.storage.local</code>)</td>
                                        <td><code>AES-256-GCM</code>, key from your passphrase (PBKDF2-SHA256)</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Documents</strong></td>
                                        <td>Inside the same encrypted vault</td>
                                        <td><code>AES-256-GCM</code></td>
                                    </tr>
                                    <tr>
                                        <td><strong>Gemini API Key</strong></td>
                                        <td>Inside the same encrypted vault</td>
                                        <td><code>AES-256-GCM</code>; sent only to Google</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Unlock Key</strong></td>
                                        <td>Browser memory (<code>chrome.storage.session</code>)</td>
                                        <td>Cleared when the browser closes or you press Lock</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Account &amp; Plan</strong></td>
                                        <td>Your browser, verified with our Firebase database</td>
                                        <td>Plan status can only be changed by Aullevo, not by clients</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p>There is no analytics or tracking inside the extension. When AI Smart Fill is on, only the form's questions, your field labels, the values of AI SAFE fields, and your enabled AI Memories are sent directly to Google Gemini. Read the full <a href="/privacy" className="external-link">Privacy Policy</a>.</p>
                    </section>

                    <section id="capabilities-limitations" className="docs-section">
                        <h2>11. Edge Cases & Limits</h2>
                        <p>No autofill tool works on 100% of the web. Here is what Aullevo handles well and where you may need to step in:</p>

                        <h3>1. Shadow DOM &amp; iFrames</h3>
                        <div className="docs-card">
                            <p>✅ <strong>What it CAN Do:</strong> Aullevo reads inputs inside both open and closed Shadow DOM components and fills forms in every frame of the page, including embedded forms.</p>
                        </div>

                        <h3>2. Conditional Questions</h3>
                        <div className="docs-card">
                            <p>✅ <strong>What it CAN Do:</strong> After the first pass, Aullevo re-scans for fields revealed by your answers (e.g. a text box that appears after choosing "Other") and fills them too.</p>
                            <p>⚠️ <strong>The Limitation:</strong> If new questions take a long time to appear, press your shortcut again once they load.</p>
                        </div>

                        <h3>3. Repeated or Unlabeled Questions</h3>
                        <div className="docs-card">
                            <p>✅ <strong>What it CAN Do:</strong> Grid questions and tables (e.g. availability by day) are matched by their row and column labels.</p>
                            <p>⚠️ <strong>The Limitation:</strong> If the same generic question repeats with no label (e.g. "Comment" five times), Aullevo can't tell the boxes apart. Add custom fields with clear labels and context hints to guide it.</p>
                        </div>

                        <h3>4. What Aullevo Does NOT Do</h3>
                        <div className="docs-table-wrapper" style={{ marginTop: '1rem' }}>
                            <table className="docs-table">
                                <tbody>
                                    <tr>
                                        <td><strong>CAPTCHAs</strong></td>
                                        <td>Aullevo never solves or bypasses CAPTCHAs. Complete them yourself.</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Back Buttons &amp; Leaving the Form</strong></td>
                                        <td>Aullevo never clicks Back, Previous, "Return to job search", "Save and close", or links to other sites. Without Auto-Pagination (Pro), it also never clicks Next or Submit.</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Passwords &amp; Payment Cards</strong></td>
                                        <td>Aullevo is not a password manager or card wallet. Don't store passwords or full card numbers in it; use your browser or a password manager for those.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="docs-note" style={{ marginTop: '2rem' }}>
                            <div className="note-content">
                                <strong>Tip:</strong> Most "missed" fields come from unusual wording. Adding a custom field with the exact question as its label, or a context hint, fixes it for every future form, and AI Smart Fill catches most of the rest.
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default Documentation;

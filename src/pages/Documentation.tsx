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
                title="Aullevo Documentation | Developer & User Guide"
                description="Read the complete guide to setup, configure, and automate forms with Aullevo. Learn about our local storage schema, security models, and how Aullevo handles modal frames."
                keywords="aullevo guide, developer docs, form autofill instructions, iframe integration, open source extension, local privacy schema"
            />
            {/* Docs Header */}
            <div className="docs-header">
                <div className="container">
                    <div className="docs-breadcrumb">
                        <span>Aullevo</span> <span className="separator">/</span> <span>Documentation</span> <span className="separator">/</span> <span className="current">v0.4.0</span>
                    </div>
                    <h1 className="docs-title">Developer & User Guide</h1>
                    <p className="docs-subtitle">Everything you need to set up, configure, and automate with Aullevo.</p>
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
                                <li><a href="#installation" className={activeSection === 'installation' ? 'active' : ''} onClick={(e) => scrollTo('installation', e)}>Installation & Setup</a></li>
                                <li><a href="#api-key" className={activeSection === 'api-key' ? 'active' : ''} onClick={(e) => scrollTo('api-key', e)}>Creating an API Key</a></li>
                            </ul>
                        </div>
                        <div className="sidebar-group">
                            <h4>Core Concepts</h4>
                            <ul>
                                <li><a href="#profiles-vault" className={activeSection === 'profiles-vault' ? 'active' : ''} onClick={(e) => scrollTo('profiles-vault', e)}>Profiles & File Vault</a></li>
                                <li><a href="#filling-process" className={activeSection === 'filling-process' ? 'active' : ''} onClick={(e) => scrollTo('filling-process', e)}>How Filling Works</a></li>
                            </ul>
                        </div>
                        <div className="sidebar-group">
                            <h4>Security</h4>
                            <ul>
                                <li><a href="#privacy" className={activeSection === 'privacy' ? 'active' : ''} onClick={(e) => scrollTo('privacy', e)}>Local Privacy & Security</a></li>
                            </ul>
                        </div>
                        <div className="sidebar-group">
                            <h4>Updates & Capabilities</h4>
                            <ul>
                                <li><a href="#capabilities-limitations" className={activeSection === 'capabilities-limitations' ? 'active' : ''} onClick={(e) => scrollTo('capabilities-limitations', e)}>Edge Cases & Boundaries</a></li>
                            </ul>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="docs-content">
                    <section id="what-is-aullevo" className="docs-section">
                        <h2>1. What is Aullevo?</h2>
                        <p>
                            Aullevo is an AI-powered browser extension that automatically fills forms, job applications, and repetitive data entries using your personal profile and the power of Google's Gemini 2.5 Flash AI.
                        </p>
                        <div className="docs-note">
                            <div className="note-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                            </div>
                            <div className="note-content">
                                <strong>Privacy First:</strong> Unlike cloud-based form fillers, Aullevo prioritizes your privacy by keeping your personal data locally stored and using your own API key to directly communicate with the AI engine. You own your data.
                            </div>
                        </div>
                    </section>

                    <section id="installation" className="docs-section">
                        <h2>2. Installation & Setup</h2>
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
                                        Open a new tab in your web browser (Chrome, Brave, Edge, or Opera) and navigate to the extensions page by typing the following into your address bar and pressing Enter:
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
                                        Locate the <strong>"Developer mode"</strong> toggle in the top-right corner of the Extensions dashboard and switch it to the <strong>ON</strong> position. This enables your browser to load local unpackaged folders.
                                    </div>
                                </div>
                                <div className="process-step">
                                    <div className="step-point">4</div>
                                    <div className="step-text">
                                        <strong>Load Unpacked Folder</strong>
                                        Click the <strong>"Load unpacked"</strong> button in the top-left corner. In the file explorer, navigate to the folder you extracted in Step 1, select the <code>dist</code> folder (the one containing <code>manifest.json</code>), and click <strong>"Select Folder"</strong> or <strong>"Open"</strong>. Aullevo is now installed and ready to fill!
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
                                    <span className="comment"># 3. Open Chrome Extensions Dashboard</span>
                                    <br />
                                    <span className="string">chrome://extensions</span>
                                    <br />
                                    <span className="comment"># 4. Enable "Developer mode" in the top right</span>
                                    <br />
                                    <span className="comment"># 5. Click "Load unpacked" and select the 'dist' subfolder</span>
                                </code></pre>
                            </div>
                        )}
                    </section>

                    <section id="api-key" className="docs-section">
                        <h2>3. Creating a Gemini API Key</h2>
                        <p>Because Aullevo connects directly to Google's Gemini models from your browser securely, you need to provide your own API key. Google currently offers a generous free tier for Gemini Flash.</p>

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
                                    Click the <strong>"Get API key"</strong> or <strong>"Create API key"</strong> button. If prompted, you may need to agree to the Terms of Service. You can create the key in a new project or an existing one.
                                </div>
                            </div>
                            <div className="process-step">
                                <div className="step-point">3</div>
                                <div className="step-text">
                                    <strong>Copy the Key</strong>
                                    Once generated, copy the long string of characters. <strong>Keep this secret</strong> and do not share it with anyone.
                                </div>
                            </div>
                            <div className="process-step">
                                <div className="step-point">4</div>
                                <div className="step-text">
                                    <strong>Add to Aullevo</strong>
                                    Open the Aullevo extension, navigate to the <kbd>Settings</kbd> tab in the sidebar, and paste your API key into the "Gemini API Key" input field. It will save automatically to your encrypted local storage.
                                </div>
                            </div>
                        </div>
                    </section>

                    <section id="profiles-vault" className="docs-section">
                        <h2>4. Profiles & Vault</h2>
                        <p>
                            The core of Aullevo is built on your <strong>Profile</strong> and <strong>Vault</strong>.
                            These data structures represent your entity model when filling forms.
                        </p>

                        <div className="docs-card-grid">
                            <div className="docs-minicard">
                                <div className="minicard-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg></div>
                                <h4>My Profile</h4>
                                <p>Enter your core details: name, email, phone, location, work history. Create multiple profiles (e.g. <code>Frontend</code> vs <code>Backend</code>).</p>
                            </div>
                            <div className="docs-minicard">
                                <div className="minicard-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg></div>
                                <h4>File Vault</h4>
                                <p>Upload your Resumes (PDF/DOCX) or Portfolios. Aullevo semantically fuzzy-matches the right file to the input fields on forms!</p>
                            </div>
                        </div>
                    </section>

                    <section id="filling-process" className="docs-section">
                        <h2>5. How Filling Works</h2>
                        <p>Once setup is complete, Aullevo automates data entry through an intelligent DOM traversal engine.</p>

                        <div className="process-timeline">
                            <div className="process-step">
                                <div className="step-point">1</div>
                                <div className="step-text">
                                    <strong>Trigger Sidebar</strong>
                                    Hit <kbd>Ctrl+M</kbd> or <kbd>Alt+A</kbd> on any web form to inject the isolated Shadow DOM sidebar.
                                </div>
                            </div>
                            <div className="process-step">
                                <div className="step-point">2</div>
                                <div className="step-text">
                                    <strong>DOM Scanning</strong>
                                    Aullevo recursively scans the entire page, penetrating Cross-Origin iframes and mapping visible fields.
                                </div>
                            </div>
                            <div className="process-step">
                                <div className="step-point">3</div>
                                <div className="step-text">
                                    <strong>Flash Processing</strong>
                                    Click <strong>Fill with AI</strong>. The field semantics are sent to Gemini to map your profile data back to the relevant inputs.
                                </div>
                            </div>
                            <div className="process-step">
                                <div className="step-point">4</div>
                                <div className="step-text">
                                    <strong>Human-Mimic Injection</strong>
                                    Data is pushed into the fields using native React/Vue property setters simulating natural focus/blur events.
                                </div>
                            </div>
                        </div>
                    </section>

                    <section id="privacy" className="docs-section">
                        <h2>6. Privacy & Security</h2>
                        <p>We take privacy seriously. Aullevo is engineered on a zero-knowledge trust model.</p>

                        <div className="docs-table-wrapper">
                            <table className="docs-table">
                                <thead>
                                    <tr>
                                        <th>Component</th>
                                        <th>Storage Location</th>
                                        <th>Encryption Model</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><strong>Profile Data</strong></td>
                                        <td>Local IndexedDB</td>
                                        <td><code>AES-256-GCM</code></td>
                                    </tr>
                                    <tr>
                                        <td><strong>PDF/Docs Vault</strong></td>
                                        <td>Local IndexedDB (Blobs)</td>
                                        <td><code>AES-256-GCM</code></td>
                                    </tr>
                                    <tr>
                                        <td><strong>API Key</strong></td>
                                        <td>Chrome Sync/Local Storage</td>
                                        <td>Native secure isolation</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p>We do not maintain any servers to track usage. When matching, Aullevo simply formats your locally-stored data structure with the labels of the input fields to fetch intelligent answers directly from Google's API.</p>
                    </section>

                    <section id="capabilities-limitations" className="docs-section">
                        <h2>7. Updates: Edge Cases & Boundaries</h2>
                        <p>Aullevo is a robust application natively out-of-the-box, but as with any advanced DOM automation tool, there are specific things it can and cannot do. Here is a breakdown of its absolute boundaries based on our deep codebase scans:</p>

                        <h3>1. Pop-up Modals (e.g., LinkedIn Easy Apply)</h3>
                        <div className="docs-card">
                            <p>✅ <strong>What it CAN Do:</strong> Aullevo is built to handle this seamlessly. When it detects an active modal (via <code>role="dialog"</code>, <code>.modal</code>, or <code>.popup</code>), it isolates its scan to only the fields inside that modal, ignoring the background page entirely.</p>
                            <p>⚠️ <strong>Vulnerability:</strong> If a custom-built modal completely omits standard ARIA attributes or CSS classes, the parser may become confused and over-scan the background along with the modal.</p>
                        </div>

                        <h3>2. Repetitive Forms (e.g., Teacher or Medical Forms)</h3>
                        <div className="docs-card">
                            <p>✅ <strong>What it CAN Do:</strong> By using the Custom Fields feature and array grouping logic (e.g., matching "Experience 1", "Experience 2"), Aullevo handles repetitive structured data immaculately via heuristic mapping.</p>
                            <p>⚠️ <strong>The Limitation:</strong> If a generic question repeats 5 times in a row without contextual labels (e.g., "Enter student comment" repeatedly), the AI lacks the specific "contextual memory" to implicitly link each unspecified box to a distinct subject, and may copy-paste the identical response. Explicitly labeling Custom Fields prevents this.</p>
                        </div>

                        <h3>3. IFrames (Embedded Inputs)</h3>
                        <div className="docs-card">
                            <p>✅ <strong>What it CAN Do:</strong> Aullevo shines at penetrating embedded properties. Its extraction engine targets Cross-Origin iframes natively (like embedded Google Forms, Greenhouse, Workday), pulling fields accurately—even where most autobots fail completely.</p>
                        </div>

                        <h3>4. What Aullevo CANNOT Do (Targeted Exceptions)</h3>
                        <div className="docs-table-wrapper" style={{ marginTop: '1rem' }}>
                            <table className="docs-table">
                                <tbody>
                                    <tr>
                                        <td><strong>CAPTCHAs</strong></td>
                                        <td>Aullevo will correctly DETECT them, pause its operations, and alert you via the sidebar. It cannot SOLVE CAPTCHAs natively. You must pass them manually.</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Ultra-Modern Shadow DOMs</strong></td>
                                        <td>On sites entirely sandboxed by secure Web Components (closed Shadow roots), standard query selectors will return 0 matching fields.</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Non-Standard Navigation</strong></td>
                                        <td>Aullevo clicks buttons explicitly labeled "Next", "Continue", or "Submit". If a form uses custom tabs (e.g., a clickable progress bar graphic) to advance, you have to click it yourself.</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Rapid Conditional React DOMs</strong></td>
                                        <td>Sometimes, answering "Yes" to a radio button animates 10 new questions. If those questions render too slowly, Aullevo finishes the fill cycle before seeing them. You'll need to hit your shortcut again.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="docs-note" style={{ marginTop: '2rem' }}>
                            <div className="note-content">
                                <strong>Conclusion:</strong> For a V1 production release, Aullevo covers the classic 90% automation use-case brilliantly. No autobot operates at 100% universality on the dynamic modern web, but by setting up granular Custom Fields, it easily scales repetitive inputs across thousands of unique variations.
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default Documentation;

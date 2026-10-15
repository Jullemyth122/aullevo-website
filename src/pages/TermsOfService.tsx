import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const TermsOfService: React.FC = () => {
    const [activeSection, setActiveSection] = useState<string>('agreement');
    const tocRef = useRef<HTMLDivElement>(null);

    const sections = [
        { id: 'agreement', label: '1. Agreement to Terms' },
        { id: 'service-description', label: '2. Description of Service' },
        { id: 'license-access', label: '3. Software License & Scope' },
        { id: 'user-responsibilities', label: '4. User Responsibilities & Data Accuracy' },
        { id: 'ai-disclaimer', label: '5. AI Processing & Accuracy Disclaimer' },
        { id: 'pro-payments', label: '6. Free Plan, Ad Unlocks & Aullevo Pro' },
        { id: 'acceptable-use', label: '7. Acceptable Use Policy' },
        { id: 'intellectual-property', label: '8. Intellectual Property' },
        { id: 'disclaimer-warranties', label: '9. Disclaimer of Warranties' },
        { id: 'limitation-liability', label: '10. Limitation of Liability' },
        { id: 'termination', label: '11. Termination & Vault Erasure' },
        { id: 'governing-law', label: '12. Governing Law & Dispute Resolution' },
        { id: 'changes-terms', label: '13. Changes to These Terms' },
        { id: 'contact-terms', label: '14. Contact Information' },
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
                title="Terms of Service | Aullevo - AI Form Automation"
                description="Read Aullevo's Terms of Service. Understand the software license, acceptable use policy, and AI automation guidelines for our browser extension."
                keywords="aullevo terms of service, extension user agreement, software license, form automation terms"
                canonicalPath="/terms"
            />

            {/* Header */}
            <div className="legal-header">
                <div className="container">
                    <div className="legal-badge-wrapper">
                        <span className="legal-badge">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                            Effective Date: October 12, 2026
                        </span>
                    </div>

                    <h1 className="legal-title">Terms of Service</h1>

                    <div className="legal-meta">
                        <div className="legal-meta-item">
                            <span>Last Updated: <strong>October 15, 2026</strong></span>
                        </div>
                        <div className="legal-meta-item">
                            <span>Applicability: <strong>All Aullevo Extensions &amp; Services</strong></span>
                        </div>
                        <div className="legal-meta-item">
                            <span>Inquiries: <strong>mythicalxenon12@gmail.com</strong></span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container">
                <div className="legal-layout">
                    {/* Sticky Table of Contents */}
                    <aside className="legal-sidebar">
                        <div className="sidebar-inner" ref={tocRef}>
                            <h4>Table of Contents</h4>
                            <nav aria-label="Terms of Service Sections">
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

                    {/* Legal Content */}
                    <main className="legal-content">
                        <section id="agreement" className="legal-section">
                            <h2>
                                <span className="section-num">1</span>
                                Agreement to Terms
                            </h2>
                            <p>
                                By downloading, installing, accessing, or using the <strong>Aullevo browser extension</strong> (for Chrome, Brave, and Edge), the Aullevo Web website, or associated services (collectively, &quot;Aullevo&quot; or the &quot;Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to all of these Terms, do not install or use the Service.
                            </p>
                        </section>

                        <section id="service-description" className="legal-section">
                            <h2>
                                <span className="section-num">2</span>
                                Description of Service
                            </h2>
                            <p>
                                Aullevo provides form automation software that fills web forms, job applications, and questionnaires with information you save. Aullevo is local-first: your profile data is encrypted and stored on your own device and matched to form fields by an offline matching engine, with optional AI assistance from the provider you choose (Google Gemini, OpenAI, Anthropic, or an OpenAI-compatible server) using your own API key.
                            </p>
                        </section>

                        <section id="license-access" className="legal-section">
                            <h2>
                                <span className="section-num">3</span>
                                Software License & Scope
                            </h2>
                            <p>
                                Subject to these Terms, Aullevo grants you a limited, non-exclusive, non-transferable, revocable license to install and use the extension solely for your personal or internal business purposes in accordance with our documentation.
                            </p>
                        </section>

                        <section id="user-responsibilities" className="legal-section">
                            <h2>
                                <span className="section-num">4</span>
                                User Responsibilities & Review of Form Submissions
                            </h2>
                            <p>
                                <strong>Always Review Before Submitting:</strong> Aullevo assists in autofilling form fields, but you remain solely responsible for reviewing and verifying the accuracy of all submitted information before clicking submit on any third-party website or portal.
                            </p>
                            <p>
                                <strong>Auto-Pagination (Pro):</strong> If you turn on Auto-Pagination, Aullevo clicks Next / Continue and presses Submit on your behalf for the forms you start filling. By turning it on, you authorize those submissions and remain responsible for them. Keep your profile accurate before using it, and turn it off for any form you want to review before it is sent. Aullevo pauses when a field marked as required is empty or when a form reports an error, but it cannot guarantee that every submitted answer is correct or complete.
                            </p>
                            <p>
                                Aullevo is not responsible for any inaccuracies, omitted data, application rejections, or form submission errors resulting from automated input.
                            </p>
                        </section>

                        <section id="ai-disclaimer" className="legal-section">
                            <h2>
                                <span className="section-num">5</span>
                                AI Processing & Accuracy Disclaimer
                            </h2>
                            <p>
                                Aullevo can use artificial intelligence (Google Gemini, OpenAI, or Anthropic models, or a model on an OpenAI-compatible server you choose) to match form fields and suggest answers. AI systems are probabilistic and may misinterpret a question, pick an unintended option, or draft an inaccurate answer. AI features are provided on an &quot;as-is&quot; assistive basis, and you must review every AI-filled answer.
                            </p>
                            <p>
                                AI Smart Fill uses your own API key for the provider you select. Your use of that provider&apos;s API is subject to its own terms (for example Google&apos;s Gemini API terms, OpenAI&apos;s terms, or Anthropic&apos;s terms), and any usage costs on your account with that provider are your responsibility. If you use a custom server, its operator&apos;s terms apply.
                            </p>
                        </section>

                        <section id="pro-payments" className="legal-section">
                            <h2>
                                <span className="section-num">6</span>
                                Free Plan, Ad Unlocks &amp; Aullevo Pro
                            </h2>
                            <p>
                                <strong>Free Plan:</strong> Aullevo is free to use. Without ads, the Free plan includes keyword autofill, 3 active profiles, a Multi-link queue of 3 links, and 3 JSON imports every 2 weeks.
                            </p>
                            <p>
                                <strong>Ad Unlocks (Free Plan):</strong> Some features unlock for a limited time when you watch a short ad on the Aullevo website while signed in:
                            </p>
                            <ul>
                                <li><strong>AI Smart Fill:</strong> a 1-minute ad gives 6 AI fills, usable for 2 hours. Each page the AI helps fill (including each page during auto-pagination) uses one fill.</li>
                                <li><strong>Auto-pagination:</strong> a 1-minute ad unlocks it for 4 hours.</li>
                                <li><strong>Voice mode:</strong> a 1-minute ad gives 2 voice sessions, usable for 2 hours; each session lasts up to 10 minutes.</li>
                                <li><strong>More active profiles:</strong> a 30-second ad allows more than 3 active profiles for 2 hours.</li>
                                <li><strong>Multi-link:</strong> a 1-minute ad allows up to 10 links in the queue for 5 hours.</li>
                                <li><strong>JSON imports:</strong> a 1-minute ad gives 10 more imports, usable for 5 hours.</li>
                                <li><strong>Typing speeds:</strong> a 20-second ad unlocks Slow and custom speeds for 4 hours.</li>
                            </ul>
                            <p>
                                Unlocks are saved to your Aullevo account, expire at the stated time, are not transferable, and have no cash value. You may watch at most 24 ads a day. Ads are provided by third-party ad networks (such as Google); the ad shown, its exact length, and whether an ad is available are decided by the ad network. You agree not to use bots, scripts, multiple accounts, or tools that fake ad views or completion to obtain unlocks; we may remove unlocks or suspend ad unlocks on accounts that do. We may change the unlock rules (lengths, durations, and limits) with notice on this page.
                            </p>
                            <p>
                                <strong>Aullevo Pro:</strong> Pro removes these limits with no ads, including unlimited AI Smart Fill, auto-pagination, Voice mode, active profiles, Multi-link links, typing speeds and JSON imports, and adds automatic document uploads and JSON file download. Features may change as Aullevo improves.
                            </p>
                            <ul>
                                <li><strong>Price &amp; Term:</strong> Pro comes in three plans, paid in USD via PayPal or card, or in pesos via GCash, Maya, or QR Ph: <strong>Monthly</strong> ($2.50 or ₱154.29) gives 30 days, <strong>Yearly</strong> ($20 or ₱1,234.32) gives 365 days, and <strong>Lifetime</strong> ($50 or ₱3,085.80) is a one-time payment for Pro on that account for as long as Aullevo Pro is offered. Monthly and yearly time is added on top of any Pro time you have left. Pro does <strong>not</strong> renew automatically; you choose whether to pay again.</li>
                                <li><strong>Payment Processors:</strong> Payments are handled by PayPal and PayMongo under their own terms. We never receive your full card or wallet details.</li>
                                <li><strong>Activation:</strong> Pro is activated on the Aullevo account you were signed in with when you paid. GCash, Maya, and QR Ph payments activate automatically once PayMongo confirms them; PayPal and card payments are verified and activated, normally within 24 hours.</li>
                                <li><strong>Problems &amp; Refunds:</strong> If Pro isn&apos;t activated within 24 hours, or you were charged by mistake, contact us with your transaction or Payment ID and we will activate Pro or refund the payment.</li>
                                <li><strong>Misuse:</strong> We may deny or revoke Pro obtained through fraud, chargebacks, or tampering with plan status, without refund.</li>
                            </ul>
                        </section>

                        <section id="acceptable-use" className="legal-section">
                            <h2>
                                <span className="section-num">7</span>
                                Acceptable Use Policy
                            </h2>
                            <p>
                                You agree not to use Aullevo for any unlawful, fraudulent, abusive, or unauthorized purpose, including but not limited to:
                            </p>
                            <ul>
                                <li>Attempting to bypass security systems, rate limits, or CAPTCHA protections of third-party platforms in violation of their Terms.</li>
                                <li>Submitting fraudulent, deceptive, or forged identities, resumes, or financial credentials.</li>
                                <li>Spamming web forms, executing automated denial-of-service attacks, or scraping protected data.</li>
                                <li>Reverse-engineering, decompiling, or attempting to extract source code in violation of applicable open-source or proprietary licenses.</li>
                                <li>Tampering with the extension or our systems to unlock Pro features or bypass plan limits without paying.</li>
                            </ul>
                        </section>

                        <section id="intellectual-property" className="legal-section">
                            <h2>
                                <span className="section-num">8</span>
                                Intellectual Property & User Content
                            </h2>
                            <p>
                                <strong>Your Content:</strong> You retain 100% ownership and intellectual property rights over all personal data, resumes, documents, and answers you store in Aullevo. Aullevo claims no ownership or licensing rights over your personal files.
                            </p>
                            <p>
                                <strong>Aullevo IP:</strong> The Aullevo brand, logo, user interface designs, and proprietary automation logic are protected by copyright, trademark, and intellectual property laws.
                            </p>
                        </section>

                        <section id="disclaimer-warranties" className="legal-section">
                            <h2>
                                <span className="section-num">9</span>
                                Disclaimer of Warranties
                            </h2>
                            <p>
                                THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
                            </p>
                        </section>

                        <section id="limitation-liability" className="legal-section">
                            <h2>
                                <span className="section-num">10</span>
                                Limitation of Liability
                            </h2>
                            <p>
                                TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL AULLEVO, ITS CREATORS, OR CONTRIBUTORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, USE, GOODWILL, OR JOB OPPORTUNITIES ARISING FROM YOUR USE OF THE SERVICE.
                            </p>
                        </section>

                        <section id="termination" className="legal-section">
                            <h2>
                                <span className="section-num">11</span>
                                Termination & Vault Erasure
                            </h2>
                            <p>
                                You may stop using Aullevo at any time by uninstalling the extension, which deletes all data it stored in your browser. To delete your Aullevo Web account record, email us. We may suspend accounts that violate these Terms.
                            </p>
                        </section>

                        <section id="governing-law" className="legal-section">
                            <h2>
                                <span className="section-num">12</span>
                                Governing Law & Dispute Resolution
                            </h2>
                            <p>
                                These Terms shall be governed by and construed in accordance with the laws of the applicable jurisdiction, without regard to its conflict of law provisions.
                            </p>
                        </section>

                        <section id="changes-terms" className="legal-section">
                            <h2>
                                <span className="section-num">13</span>
                                Changes to These Terms
                            </h2>
                            <p>
                                We reserve the right to revise or modify these Terms at any time. Material changes will be noted on this page with an updated modification timestamp. Continued use of the Service following modifications constitutes acceptance of the new Terms.
                            </p>
                        </section>

                        <section id="contact-terms" className="legal-section">
                            <h2>
                                <span className="section-num">14</span>
                                Contact Information
                            </h2>
                            <p>
                                For questions or inquiries concerning these Terms of Service, please reach out to:
                            </p>
                            <ul>
                                <li><strong>Email:</strong> <a href="mailto:xenexashura@gmail.com" className="legal-link">xenexashura@gmail.com</a></li>
                                <li><strong>Website:</strong> <a href="https://aullevo-web.vercel.app" className="legal-link">https://aullevo-web.vercel.app</a></li>
                            </ul>

                            <div className="legal-action-bar">
                                <div className="legal-action-text">
                                    <h4>Looking for our Privacy Policy?</h4>
                                    <p>Read how your data is encrypted on your device and what we collect for accounts and payments.</p>
                                </div>
                                <div className="legal-action-buttons">
                                    <Link to="/privacy" className="btn btn-primary" style={{ fontSize: '0.9rem', padding: '0.6rem 1.25rem' }}>
                                        Read Privacy Policy
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

export default TermsOfService;

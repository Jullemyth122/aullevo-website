import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const TermsOfService: React.FC = () => {
    const [activeSection, setActiveSection] = useState<string>('agreement');

    const sections = [
        { id: 'agreement', label: '1. Agreement to Terms' },
        { id: 'service-description', label: '2. Description of Service' },
        { id: 'license-access', label: '3. Software License & Scope' },
        { id: 'user-responsibilities', label: '4. User Responsibilities & Data Accuracy' },
        { id: 'ai-disclaimer', label: '5. AI Processing & Accuracy Disclaimer' },
        { id: 'acceptable-use', label: '6. Acceptable Use Policy' },
        { id: 'intellectual-property', label: '7. Intellectual Property' },
        { id: 'disclaimer-warranties', label: '8. Disclaimer of Warranties' },
        { id: 'limitation-liability', label: '9. Limitation of Liability' },
        { id: 'termination', label: '10. Termination & Vault Erasure' },
        { id: 'governing-law', label: '11. Governing Law & Dispute Resolution' },
        { id: 'changes-terms', label: '12. Changes to These Terms' },
        { id: 'contact-terms', label: '13. Contact Information' },
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
                            Effective Date: August 2026
                        </span>
                    </div>

                    <h1 className="legal-title">Terms of Service</h1>

                    <div className="legal-meta">
                        <div className="legal-meta-item">
                            <span>Last Updated: <strong>August 25, 2026</strong></span>
                        </div>
                        <div className="legal-meta-item">
                            <span>Applicability: <strong>All Aullevo Extensions &amp; Services</strong></span>
                        </div>
                        <div className="legal-meta-item">
                            <span>Inquiries: <strong>support@aullevo.com</strong></span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container">
                <div className="legal-layout">
                    {/* Sticky Table of Contents */}
                    <aside className="legal-sidebar">
                        <div className="sidebar-inner">
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
                                By downloading, installing, accessing, or using the <strong>Aullevo Chrome Extension</strong>, web application, or associated services (collectively, &quot;Aullevo&quot; or the &quot;Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to all of these Terms, do not install or use the Service.
                            </p>
                        </section>

                        <section id="service-description" className="legal-section">
                            <h2>
                                <span className="section-num">2</span>
                                Description of Service
                            </h2>
                            <p>
                                Aullevo provides client-side, AI-assisted form automation software designed to speed up form completion across web applications, job boards, and questionnaires. Aullevo operates on a local-first model where user personal data is stored locally on the user&apos;s machine and matched to form fields using AI semantic analysis.
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
                                Aullevo is not responsible for any inaccuracies, omitted data, application rejections, or form submission errors resulting from automated input.
                            </p>
                        </section>

                        <section id="ai-disclaimer" className="legal-section">
                            <h2>
                                <span className="section-num">5</span>
                                AI Processing & Accuracy Disclaimer
                            </h2>
                            <p>
                                Aullevo utilizes artificial intelligence (such as Google Gemini models) to semantically match form fields. AI systems are probabilistic and may occasionally misinterpret field contexts or select an unintended dropdown option. You acknowledge that AI automation is provided on an &quot;as-is&quot; assistive basis.
                            </p>
                        </section>

                        <section id="acceptable-use" className="legal-section">
                            <h2>
                                <span className="section-num">6</span>
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
                            </ul>
                        </section>

                        <section id="intellectual-property" className="legal-section">
                            <h2>
                                <span className="section-num">7</span>
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
                                <span className="section-num">8</span>
                                Disclaimer of Warranties
                            </h2>
                            <p>
                                THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
                            </p>
                        </section>

                        <section id="limitation-liability" className="legal-section">
                            <h2>
                                <span className="section-num">9</span>
                                Limitation of Liability
                            </h2>
                            <p>
                                TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL AULLEVO, ITS CREATORS, OR CONTRIBUTORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, USE, GOODWILL, OR JOB OPPORTUNITIES ARISING FROM YOUR USE OF THE SERVICE.
                            </p>
                        </section>

                        <section id="termination" className="legal-section">
                            <h2>
                                <span className="section-num">10</span>
                                Termination & Vault Erasure
                            </h2>
                            <p>
                                You may terminate this agreement at any time simply by uninstalling the Aullevo extension and ceasing use of the web platform. Doing so immediately purges all local storage.
                            </p>
                        </section>

                        <section id="governing-law" className="legal-section">
                            <h2>
                                <span className="section-num">11</span>
                                Governing Law & Dispute Resolution
                            </h2>
                            <p>
                                These Terms shall be governed by and construed in accordance with the laws of the applicable jurisdiction, without regard to its conflict of law provisions.
                            </p>
                        </section>

                        <section id="changes-terms" className="legal-section">
                            <h2>
                                <span className="section-num">12</span>
                                Changes to These Terms
                            </h2>
                            <p>
                                We reserve the right to revise or modify these Terms at any time. Material changes will be noted on this page with an updated modification timestamp. Continued use of the Service following modifications constitutes acceptance of the new Terms.
                            </p>
                        </section>

                        <section id="contact-terms" className="legal-section">
                            <h2>
                                <span className="section-num">13</span>
                                Contact Information
                            </h2>
                            <p>
                                For questions or inquiries concerning these Terms of Service, please reach out to:
                            </p>
                            <ul>
                                <li><strong>Email:</strong> <a href="mailto:support@aullevo.com" className="legal-link">support@aullevo.com</a></li>
                                <li><strong>Privacy Team:</strong> <a href="mailto:privacy@aullevo.com" className="legal-link">privacy@aullevo.com</a></li>
                                <li><strong>Website:</strong> <a href="https://aullevo-web.vercel.app" className="legal-link">https://aullevo-web.vercel.app</a></li>
                            </ul>

                            <div className="legal-action-bar">
                                <div className="legal-action-text">
                                    <h4>Looking for our Privacy Policy?</h4>
                                    <p>Read about our zero-knowledge architecture and local data storage.</p>
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

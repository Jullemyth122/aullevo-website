import React from 'react';
import TrustDownloadButton from '../components/TrustDownloadButton';
import SEO from '../components/SEO';

const HowItWorks: React.FC = () => {
    const steps = [
        {
            num: "01",
            title: 'Install Extension',
            desc: 'Add Aullevo to Chrome in one click. It lives entirely locally in your browser as a lightweight <2MB extension. There are no heavy desktop apps or cloud accounts required.',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
            )
        },
        {
            num: "02",
            title: 'Set Up Your API Key',
            desc: 'Get your own free Gemini API key from Google AI Studio. Paste it into Aullevo\'s settings. By using your own key, your data communicates directly with Google, completely bypassing any 3rd party servers. We never see your data.',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                </svg>
            )
        },
        {
            num: "03",
            title: 'Build Your Profile & File Vault',
            desc: 'Upload your Resumes (PDF or DOCX) into the File Vault and let Gemini parse them into structured JSON profiles. You can create different setups for different roles (e.g., "Full Stack" vs "Frontend" profiles). Everything is locally encrypted via AES-256-GCM.',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                </svg>
            )
        },
        {
            num: "04",
            title: 'Navigate & Auto-Fill',
            desc: 'Go to any web form (Workday, Greenhouse, Taleo) and hit Alt+F (or click "Fill" in the sidebar). Aullevo instantly scans the DOM (including deep iframes) and instructs Gemini to semantically map your profile data into exactly the right fields in milliseconds.',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
            )
        },
        {
            num: "05",
            title: 'Review & Submit',
            desc: 'Aullevo simulates human typing to bypass anti-bot tech, filling your fields perfectly. We deliberately do not auto-submit forms, giving you a chance to verify everything. If a CAPTCHA appears, Aullevo intelligently pauses until you solve it.',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 11 12 14 22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
            )
        }
    ];

    return (
        <div className="how-it-works-page animate-fade-in">
            <SEO 
                title="How Aullevo Works | AI-Powered Web Form Filling"
                description="Learn how to install, set up your Gemini API key, configure your encrypted profiles, and automate forms on Workday or Greenhouse in 2 minutes."
                keywords="how to automate forms, gemini api key setup, local file vault, chrome extension setup, browser automation"
            />
            {/* Hero Section */}
            <section className="hiw-hero">
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-badge">The workflow</div>
                        <h1 className="hero-title">From <span className="gradient-text">installation</span><br/> to <span className="gradient-text">automation</span> in 2 minutes.</h1>
                        <p className="hero-subtitle">
                            No complex configuration. No sign up required. Just install the extension, add your own API key, and reclaim your time securely.
                        </p>
                    </div>
                </div>
            </section>

            {/* ZigZag Steps Timeline */}
            <section className="hiw-steps-section">
                <div className="container">
                    <div className="steps-container">
                        {steps.map((step, index) => (
                            <div key={step.num} className={`hiw-step-row ${index % 2 !== 0 ? 'reverse' : ''}`}>
                                <div className="step-content">
                                    <div className="step-icon">
                                        {step.icon}
                                    </div>
                                    <h2 className="step-title">{step.title}</h2>
                                    <p className="step-desc">{step.desc}</p>
                                </div>
                                <div className="step-visual">
                                    <div className="giant-number">{step.num}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="hiw-cta section">
                <div className="container text-center">
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Ready to stop typing?</h2>
                    <p style={{ fontSize: '1.2rem', marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
                        Download the source and load it into your Chrome browser today. Time is your most valuable asset.
                    </p>
                    <TrustDownloadButton className="btn btn-primary btn-lg">
                        Download Extension (ZIP)
                    </TrustDownloadButton>
                </div>
            </section>
        </div>
    );
};

export default HowItWorks;

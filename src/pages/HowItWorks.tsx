import React from 'react';
import TrustDownloadButton from '../components/TrustDownloadButton';
import SEO from '../components/SEO';
import { CHROME_WEB_STORE_URL } from '../config/store';
import { logEvent } from '../utils/analytics';

const HowItWorks: React.FC = () => {
    const steps = [
        {
            num: "01",
            title: 'Install & Create Your Vault',
            desc: 'Add Aullevo from the Chrome Web Store (just search "Aullevo"), or download the ZIP and load it into Chrome, Brave, or Edge. Open the side panel with Alt+Q: it goes straight to Autofill, and everything you save is encrypted in your browser. A guided tour then walks you through every tab, in your browser\'s language (34 are supported). No account needed to start.',
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
            title: 'Fill In Your Profile',
            desc: 'Pick a ready-made profile (Job, Academic, Government, and more) and fill in your details once. In a hurry? Copy the profile as JSON, have an AI chatbot fill it from your resume, and import the result. Add custom fields with context hints, attach documents like your resume, and mark anything private as SENSITIVE.',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                </svg>
            )
        },
        {
            num: "03",
            title: 'Optional: Turn On AI Smart Fill',
            desc: 'Pick an AI provider in Settings (Google Gemini, ChatGPT, Claude, or any OpenAI-compatible server such as OpenRouter, Groq, or Ollama) and paste your API key. Gemini has a free tier. AI handles open-ended and multiple-choice questions keywords cannot. Your key talks directly to the provider you chose, and SENSITIVE fields are never sent.',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                </svg>
            )
        },
        {
            num: "04",
            title: 'Open a Form & Press Alt+Shift+L',
            desc: 'Go to any form, whether Google Forms, Microsoft Forms, or a job portal, and press Alt+Shift+L or click Fill in the side panel. Aullevo scans the page, including Shadow DOM and iframes, and fills every field it can match.',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
            )
        },
        {
            num: "05",
            title: 'Review & Submit',
            desc: 'Filled fields are highlighted so you can check them at a glance, then you submit when you\'re ready. With Pro Auto-Pagination on, Aullevo clicks Next and Submit for you and pauses if a required field is empty. Choose Instant, Natural, or Slow typing for sites that expect real keystrokes.',
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
                description="Install Aullevo, create your encrypted vault, fill in your profile once, and autofill any web form with one shortcut. Optional AI (Gemini, ChatGPT, Claude, or your own server) for harder questions."
                keywords="how to autofill forms, chrome form filler setup, gemini api key setup, openai api key setup, claude api key setup, aullevo chrome web store, job application autofill, browser extension setup"
            />
            {/* Hero Section */}
            <section className="hiw-hero">
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-badge">The workflow</div>
                        <h1 className="hero-title">From <span className="gradient-text">installation</span><br /> to <span className="gradient-text">automation</span> in 2 minutes.</h1>
                        <p className="hero-subtitle">
                            No complex setup and no account required to start. Install the extension, save your details once, and let Aullevo handle the typing.
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
                        Add Aullevo from the Chrome Web Store, or download the ZIP and load it into Chrome, Brave, or Edge in under a minute. Free to start, and Pro when you need more.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <TrustDownloadButton className="btn btn-primary btn-lg">
                            Download Extension (ZIP)
                        </TrustDownloadButton>
                        <a
                            href={CHROME_WEB_STORE_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary btn-lg"
                            style={{ textDecoration: 'none' }}
                            onClick={() => logEvent('open_chrome_web_store', { method: 'how_it_works_cta' })}
                        >
                            Chrome Web Store
                        </a>
                    </div>
                    <p style={{ marginTop: '1rem', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                        On the Chrome Web Store, just search <strong>Aullevo</strong>.
                    </p>
                </div>
            </section>
        </div>
    );
};

export default HowItWorks;

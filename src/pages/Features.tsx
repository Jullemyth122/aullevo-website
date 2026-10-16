import React from 'react';
import SEO from '../components/SEO';

// Clean SVG Icons for All Features
const BrainIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 2A5.5 5.5 0 0 0 4 7.5c0 1.29.44 2.53 1.23 3.5H5a4.5 4.5 0 0 0-.32 8.92" />
        <path d="M14.5 2A5.5 5.5 0 0 1 20 7.5c0 1.29-.44 2.53-1.23 3.5h.23a4.5 4.5 0 0 1 .32 8.92" />
        <path d="M12 2v20" />
    </svg>
);

const TableIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18" />
        <path d="M3 15h18" />
        <path d="M9 3v18" />
        <path d="M15 3v18" />
    </svg>
);

const ZapIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
);

const ChatIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
);

const ShadowDomIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
    </svg>
);

const MousePointerIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
        <path d="M13 13l6 6" />
    </svg>
);

const ShieldLockIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <rect x="9" y="10" width="6" height="5" rx="1" />
        <path d="M10 10V8a2 2 0 1 1 4 0v2" />
    </svg>
);

const ShieldAlertIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
);

const FrameIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
);

const LayersIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
);

const RefreshIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" />
        <polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
);

const UserGroupIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const FileUploadIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="12" y1="18" x2="12" y2="12" />
        <polyline points="9 15 12 12 15 15" />
    </svg>
);

const RepeatIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M16 12l-4-4-4 4" />
        <path d="M12 16V8" />
    </svg>
);

const PagesIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="12" height="16" rx="2" />
        <polyline points="15 9 19 12 15 15" />
        <line x1="19" y1="12" x2="9" y2="12" />
    </svg>
);

const NoteIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h12l4 4v12H4z" />
        <polyline points="16 4 16 8 20 8" />
        <line x1="8" y1="12" x2="16" y2="12" />
        <line x1="8" y1="16" x2="13" y2="16" />
    </svg>
);

const GlobeIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
);

const CompassIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
);

const MicIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="2" width="6" height="12" rx="3" />
        <path d="M5 10a7 7 0 0 0 14 0" />
        <line x1="12" y1="17" x2="12" y2="22" />
    </svg>
);

const TargetIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1.5" />
    </svg>
);

const WaveIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="10" x2="4" y2="14" />
        <line x1="8" y1="6" x2="8" y2="18" />
        <line x1="12" y1="3" x2="12" y2="21" />
        <line x1="16" y1="7" x2="16" y2="17" />
        <line x1="20" y1="10" x2="20" y2="14" />
    </svg>
);

const featuresList = [
    // Form Engine
    {
        title: 'Works on Nearly Any Web Form',
        badge: 'Form Engine',
        color: 'blue',
        icon: <LayersIcon />,
        desc: 'Detects text fields, text areas, native and custom dropdowns, radio buttons, checkboxes, date pickers, and file inputs on Google Forms, Microsoft Forms, job portals, and plain HTML forms. No site-specific setup needed.',
        pill: 'Universal Detection'
    },
    {
        title: 'Shadow DOM & iFrame Support',
        badge: 'Form Engine',
        color: 'yellow',
        icon: <ShadowDomIcon />,
        desc: 'Reaches inputs hidden inside open and closed Shadow DOM components and fills forms in every frame of the page, where regular browser autofill gives up.',
        pill: 'Deep DOM + Frames'
    },
    {
        title: 'React, Vue & Angular Ready',
        badge: 'Form Engine',
        color: 'blue',
        icon: <MousePointerIcon />,
        desc: 'Sets values through native input setters and fires real input, change, and blur events, so modern single-page apps register every answer and run their own validation.',
        pill: 'Framework-Aware'
    },
    {
        title: 'Smart Keyword Matching',
        badge: 'Form Engine',
        color: 'yellow',
        icon: <ZapIcon />,
        desc: 'Matches your saved fields to form questions using label similarity, word stems, and aliases. Every match is scored and the best one wins, so each field is filled once with the right value, instantly and fully offline.',
        pill: 'Instant & Offline'
    },
    {
        title: 'Grids, Rankings & Tricky Inputs',
        badge: 'Form Engine',
        color: 'blue',
        icon: <TableIcon />,
        desc: 'Handles Google Forms grid questions, Microsoft Forms ranking questions, availability tables, split date fields, and country dial-code pickers.',
        pill: 'Edge Cases Covered'
    },
    {
        title: 'Highlight & Rescan',
        badge: 'Form Engine',
        color: 'yellow',
        icon: <RefreshIcon />,
        desc: 'See every field Aullevo detected before you fill. Outlines and badges show exactly what will be touched, and filled fields are labeled so you can review them at a glance.',
        pill: 'Preview Before Fill'
    },
    // AI
    {
        title: 'AI Smart Fill, Your Choice of AI',
        badge: 'AI',
        color: 'blue',
        icon: <BrainIcon />,
        desc: 'For questions keywords cannot answer, the AI you choose (Google Gemini, ChatGPT, Claude, or any OpenAI-compatible server such as OpenRouter, Groq, or Ollama) picks the best multiple-choice option (several for checkbox questions), combines fields (like First + Last Name into Full Name), follows format instructions such as "Surname, Given Names", and drafts short answers. Uses your own API key; Gemini has a free tier.',
        pill: 'Free: 6 / Day · 2 Ads: Unlimited for 5 h · Pro: Unlimited'
    },
    {
        title: 'Privacy Controls for AI',
        badge: 'AI',
        color: 'yellow',
        icon: <ShieldAlertIcon />,
        desc: 'Mark any field SENSITIVE and its value never reaches the AI, only its label. The AI replies with which of your fields to use, and the real value is filled in locally on your device.',
        pill: 'Sensitive = Never Sent'
    },
    {
        title: 'AI First, Keywords as Backup',
        badge: 'AI',
        color: 'blue',
        icon: <ChatIcon />,
        desc: 'AI answers take priority. If the AI skips a question, times out, or is unavailable, the keyword engine fills whatever is left, and Aullevo tells you exactly what happened.',
        pill: 'Never Half-Filled'
    },
    {
        title: 'AI Memories',
        badge: 'AI',
        color: 'yellow',
        icon: <NoteIcon />,
        desc: 'Save short facts about yourself, like "Prefers remote roles" or "Available from March", and the AI uses them for open-ended questions your profile fields don\'t cover. Switch any memory off at any time.',
        pill: 'Your Context for AI'
    },
    // Voice
    {
        title: 'Voice Mode: Talk to Aullevo',
        badge: 'Voice',
        color: 'blue',
        icon: <MicIcon />,
        desc: 'Switch the side panel to the agent orb and just say it: "fill this page", "highlight the fields", "use my job profile", "create a profile called Work", "set my phone to…", "fill my links", "open settings". The agent answers in a natural ElevenLabs voice. English and Tagalog.',
        pill: 'Free: 3 Sessions / Day · 2 Ads: Unlimited for 5 h · Your ElevenLabs Key'
    },
    {
        title: 'Fill Exactly What You Name',
        badge: 'Voice',
        color: 'yellow',
        icon: <TargetIcon />,
        desc: 'Say "fill the email", "fill this one", "fill my birthday" or "the one about market risk", and only that question is filled. Your AI provider reads what you said with the form\'s questions (never your saved values) and picks the exact ones. Dictate your own answer too: "answer the gym question with: I jog every morning".',
        pill: 'Voice Mode · Targeted Fills'
    },
    {
        title: 'Live, Hands-Free Conversation',
        badge: 'Voice',
        color: 'blue',
        icon: <WaveIcon />,
        desc: 'Turn on Live conversation and give one command after another without touching the mouse. Say "stop talking" to cut the agent off, "stop" to cancel a fill, "next" or "submit" to move on, and "end conversation" when you\'re done.',
        pill: 'Voice Mode · Interrupt Anytime'
    },
    // Profiles & Files
    {
        title: '7 Ready-Made Profiles, Plus Your Own',
        badge: 'Profiles & Files',
        color: 'yellow',
        icon: <UserGroupIcon />,
        desc: 'Start from Job, Medical, Government, Survey, Academic, Financial, or Custom profiles, or create your own. Add unlimited custom fields with context hints that help matching and AI understand your data.',
        pill: 'Free: 3 Active · 2 Ads: Unlimited for 5 h · Pro: Unlimited'
    },
    {
        title: 'Document Upload into Forms',
        badge: 'Pro',
        color: 'blue',
        icon: <FileUploadIcon />,
        desc: 'Save your resume, cover letter, IDs, and certificates once. Aullevo attaches the right document to each file input or drag-and-drop zone by reading its label.',
        pill: 'Pro, or 5 h with 2 Ads · Auto-Attach Files'
    },
    {
        title: 'JSON Quick Setup',
        badge: 'Profiles & Files',
        color: 'yellow',
        icon: <RepeatIcon />,
        desc: 'Copy your profile as JSON, give it to Gemini, Claude, or ChatGPT together with your resume, and paste the filled-in result back. Your whole profile is set up in a minute. Pro adds unlimited imports and a JSON file download for backups.',
        pill: 'Free: 4 Imports / Day · 2 Ads: Unlimited for 5 h · Pro: Unlimited'
    },
    {
        title: 'Auto-Pagination for Multi-Page Forms',
        badge: 'Pro',
        color: 'blue',
        icon: <PagesIcon />,
        desc: 'Fills a page, clicks Next or Continue, and repeats until it presses Submit on the last page. It pauses when a required field is empty, fixes answers a form rejects (like "5 years" in a number-only box), and clicks through steps like "Apply anyway".',
        pill: 'Free: 2 h / Day · 2 Ads: 5 h · Fill · Next · Submit'
    },
    // Privacy
    {
        title: 'Encrypted Vault, No Passphrase',
        badge: 'Privacy',
        color: 'blue',
        icon: <ShieldLockIcon />,
        desc: 'Profiles, documents, and your API keys are encrypted with AES-256-GCM and kept only in your browser, with a separate key for each account and for guest use. Nothing to remember: Aullevo opens straight to Autofill.',
        pill: 'Encrypted on Device'
    },
    {
        title: 'Your Profiles Never Leave Your Device',
        badge: 'Privacy',
        color: 'yellow',
        icon: <FrameIcon />,
        desc: 'Aullevo has no server that stores your profile data. Connecting your Aullevo account only syncs your plan status. There is no tracking or analytics inside the extension.',
        pill: 'Local-First'
    },
    {
        title: 'One Vault per Account',
        badge: 'Privacy',
        color: 'blue',
        icon: <UserGroupIcon />,
        desc: 'Share a browser with family or teammates? Each Aullevo account gets its own separately encrypted profiles, documents, API key, memories, and link queue. Switching accounts locks the previous one, and Settings → Data on this device removes accounts you no longer use.',
        pill: 'Accounts Kept Apart'
    },
    // Ease of use
    {
        title: '34 Languages',
        badge: 'Ease of Use',
        color: 'yellow',
        icon: <GlobeIcon />,
        desc: 'The whole extension, from the side panel and guided tour to the badges it shows on web pages, follows your browser\'s language automatically. Pick another from the globe button at any time; English is always one click away.',
        pill: 'Auto-Detects Your Language'
    },
    {
        title: 'Guided Tour',
        badge: 'Ease of Use',
        color: 'blue',
        icon: <CompassIcon />,
        desc: 'A step-by-step walkthrough of every tab points at each button and explains what it does, and checks whether your keyboard shortcuts are active. It shows again until your first profile has data, and you can replay it from Settings anytime.',
        pill: 'Learn in 2 Minutes'
    }
];

const Features: React.FC = () => {
    return (
        <div className="features-page animate-fade-in">
            <SEO
                title="Aullevo Features | AI Form Filler for Chrome, Brave & Edge"
                description="Everything Aullevo does: fills nearly any web form, Shadow DOM and iframe support, AI Smart Fill with Gemini, ChatGPT, Claude or your own server and privacy controls, Voice mode with targeted fills, multi-profile vault, document upload into forms, auto-pagination for multi-page forms, passphrase encryption, a guided tour, and 34 languages."
                keywords="ai form filler features, chrome autofill extension, gemini form filling, chatgpt form filling, claude form filling, voice form filling, voice autofill assistant, job application autofill, encrypted profile vault, shadow dom autofill, multilingual autofill extension"
            />
            
            {/* Features Hero */}
            <section className="features-hero">
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-badge">Everything Aullevo Does</div>
                        <h1 className="hero-title">
                            Fill any form. <br />
                            <span className="gradient-text">Keep your data yours.</span>
                        </h1>
                        <p className="hero-subtitle">
                            Every web form is different. Aullevo combines a fast offline matching engine with optional AI (Gemini, ChatGPT, Claude, or your own server) to fill them, while your profiles stay encrypted on your own device.
                        </p>
                    </div>
                </div>
            </section>

            {/* Bento Grid Features */}
            <section className="features-bento-section">
                <div className="container">
                    <div className="features-grid">
                        {featuresList.map((feat, idx) => (
                            <div key={idx} className={`feature-card feature-card--${feat.color}`}>
                                <div className={`item-bg-gradient ${feat.color}`} />
                                <div className="feature-card-header">
                                    <div className="feature-icon">{feat.icon}</div>
                                    <span className={`feature-badge badge-${feat.color}`}>{feat.badge}</span>
                                </div>
                                <h3 className="feature-card-title">{feat.title}</h3>
                                <p className="feature-card-desc">{feat.desc}</p>
                                <div className="feature-card-footer">
                                    <span className="feature-pill">{feat.pill}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Features;

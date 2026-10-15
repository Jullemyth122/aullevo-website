import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { logEvent } from '../utils/analytics';
import { CHROME_WEB_STORE_URL } from '../config/store';

// SVG Icons
const ShieldIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
);

const CodeIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"/>
        <polyline points="8 6 2 12 8 18"/>
    </svg>
);

const LockIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
);

const StoreIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
);

interface Props {
    className?: string;
    style?: React.CSSProperties;
    children: React.ReactNode;
}

const TrustDownloadButton: React.FC<Props> = ({ className, style, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        if (isOpen) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    const modal = isOpen ? ReactDOM.createPortal(
        <div className="trust-overlay" onClick={() => setIsOpen(false)}>
            <div className="trust-dialog" onClick={(e) => e.stopPropagation()}>
                {/* Close btn */}
                <button className="trust-close" onClick={() => setIsOpen(false)} aria-label="Close">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>

                {/* Icon + Title */}
                <div className="trust-head">
                    <div className="trust-shield"><ShieldIcon /></div>
                    <h3>Security & Transparency</h3>
                    <p>The download is a <strong>ZIP you load yourself</strong>, so you can see exactly what you're installing.</p>
                </div>

                {/* Features */}
                <div className="trust-cards">
                    <div className="trust-card">
                        <div className="trust-card-icon"><CodeIcon /></div>
                        <div>
                            <h4>Nothing Hidden</h4>
                            <p>Every file is in the ZIP. The extension runs only the code packaged inside it and never downloads code from the internet.</p>
                        </div>
                    </div>
                    <div className="trust-card">
                        <div className="trust-card-icon green"><LockIcon /></div>
                        <div>
                            <h4>Your Data Stays Yours</h4>
                            <p>Profiles are encrypted on your device and never uploaded. No tracking in the extension. AI talks directly to the provider you pick (Gemini, ChatGPT, Claude, or your own server) with your own key.</p>
                        </div>
                    </div>
                    <div className="trust-card trust-card--store">
                        <div className="trust-card-icon"><StoreIcon /></div>
                        <div>
                            <h4>Rather Not Download a ZIP?</h4>
                            <p>Aullevo is also on the Chrome Web Store. Open it and search <strong>Aullevo</strong>, then click <strong>Add to Chrome</strong>. It installs and updates automatically.</p>
                            <a
                                href={CHROME_WEB_STORE_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="trust-store-link"
                                onClick={() => {
                                    logEvent('open_chrome_web_store', { method: 'trust_modal' });
                                    setIsOpen(false);
                                }}
                            >
                                Open Chrome Web Store &rarr;
                            </a>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="trust-foot">
                    <div className="trust-btns">
                        <button className="trust-btn-cancel" onClick={() => setIsOpen(false)}>Cancel</button>
                        <a
                            href="/aullevo-extension.zip"
                            download
                            className="trust-btn-confirm"
                            onClick={() => {
                                logEvent('download_extension', {
                                    method: 'trust_button',
                                    file_name: 'aullevo-extension.zip'
                                });
                                setIsOpen(false);
                            }}
                        >
                            I Understand, Download
                        </a>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    ) : null;

    return (
        <>
            <button
                className={className}
                style={{ ...style, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                onClick={() => setIsOpen(true)}
            >
                {children}
            </button>
            {modal}
        </>
    );
};

export default TrustDownloadButton;

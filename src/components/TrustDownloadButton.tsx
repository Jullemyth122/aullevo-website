import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

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
                    <p>We distribute Aullevo as an <strong>unpacked ZIP</strong> so you can fully inspect the source before installing.</p>
                </div>

                {/* Features */}
                <div className="trust-cards">
                    <div className="trust-card">
                        <div className="trust-card-icon"><CodeIcon /></div>
                        <div>
                            <h4>100% Inspectable Code</h4>
                            <p>Extract the ZIP and read every file. No obfuscation, no hidden payloads, no minified bundles.</p>
                        </div>
                    </div>
                    <div className="trust-card">
                        <div className="trust-card-icon green"><LockIcon /></div>
                        <div>
                            <h4>Zero Servers. Full Privacy.</h4>
                            <p>No backend. No tracking. Communicates directly with Google Gemini API using your own key.</p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="trust-foot">
                    <a href="https://github.com/aullevo" target="_blank" rel="noreferrer" className="trust-gh-link">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
                        View Source
                    </a>
                    <div className="trust-btns">
                        <button className="trust-btn-cancel" onClick={() => setIsOpen(false)}>Cancel</button>
                        <a
                            href="/download/aullevo-extension.zip"
                            download
                            className="trust-btn-confirm"
                            onClick={() => setIsOpen(false)}
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

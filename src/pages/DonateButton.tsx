import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

/**
 * DonateButton — Production-ready multi-gateway donation integration.
 *
 * HOW IT WORKS:
 * Instead of a single Stripe link, this opens a sleek modal giving the user options.
 * This is perfect for supporting global payments AND localized payments (like GCash).
 *
 * SETUP (one-time):
 * 1. Global Link: Get a link from Buy Me A Coffee, Ko-fi, or global PayMongo.
 * 2. Local Link: Get a PayMongo Payment Link enabling GCash, Maya, QR Ph.
 * 3. Replace the placeholder URLs below!
 */

const GLOBAL_PAYMENT_LINK = 'https://buymeacoffee.com/mythicalxex';
const LOCAL_PAYMENT_LINK = 'https://pm.link/org-CkTB77gBCh4xvPkK6c3H6RPt/oMCZpHE';

// SVG Icons
const HeartIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);

const GlobeIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
);

const WalletIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
        <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
);

interface DonateButtonProps {
    className?: string;
}

const DonateButton: React.FC<DonateButtonProps> = ({ className = '' }) => {
    const [isHovered, setIsHovered] = useState(false);
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
        <div className="donate-overlay" onClick={() => setIsOpen(false)}>
            <div className="donate-dialog" onClick={(e) => e.stopPropagation()}>
                <button className="donate-close" onClick={() => setIsOpen(false)} aria-label="Close">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                <div className="donate-head">
                    <div className="donate-shield"><HeartIcon /></div>
                    <h3>Support Aullevo</h3>
                    <p>Choose how you would like to support the development. Your contribution keeps this tool open and ad-free.</p>
                </div>

                <div className="donate-cards">
                    <a href={GLOBAL_PAYMENT_LINK} target="_blank" rel="noreferrer" className="donate-option-card">
                        <div className="donate-card-icon"><GlobeIcon /></div>
                        <div className="donate-card-text">
                            <h4>Global Payments</h4>
                            <p>Credit Card, Apple Pay, Google Pay</p>
                        </div>
                        <div className="donate-arrow">&rarr;</div>
                    </a>

                    <a href={LOCAL_PAYMENT_LINK} target="_blank" rel="noreferrer" className="donate-option-card">
                        <div className="donate-card-icon green"><WalletIcon /></div>
                        <div className="donate-card-text">
                            <h4>Philippines (Local)</h4>
                            <p>GCash, Maya, QR Ph, GrabPay</p>
                        </div>
                        <div className="donate-arrow">&rarr;</div>
                    </a>
                </div>

                <div className="donate-foot">
                    <button className="donate-btn-cancel" onClick={() => setIsOpen(false)}>Maybe Later</button>
                    <p className="donate-secure-text">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        Secure checkouts via external partners
                    </p>
                </div>
            </div>
        </div>,
        document.body
    ) : null;

    return (
        <>
            <button
                id="donate-button"
                className={`btn btn-donate ${className}`}
                onClick={() => setIsOpen(true)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                aria-label="Support Aullevo with a donation"
                type="button"
            >
                <span className={`donate-icon ${isHovered ? 'donate-icon--beat' : ''}`}>
                    <HeartIcon />
                </span>
                Support Us
            </button>
            {modal}
        </>
    );
};

export default DonateButton;

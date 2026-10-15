import React from 'react';
import { Link } from 'react-router-dom';
import { logEvent } from '../utils/analytics';
import { CHROME_WEB_STORE_URL } from '../config/store';

const Footer: React.FC = () => {
    return (
        <footer className="footer">
            {/* Gradient Separator */}
            <div className="footer-gradient-line"></div>

            <div className="container footer-content">
                <div className="footer-main">
                    <Link to="/" className="footer-logo">
                        <img src="/icon48.png" alt="Aullevo" width="28" height="28" className="footer-logo-icon" style={{ borderRadius: '7px', objectFit: 'cover' }} />
                        <span className="footer-logo-text">Aullevo</span>
                    </Link>
                    <p>
                        Form automation that keeps your data encrypted on your device.
                        Private, fast, and simple.
                    </p>
                    <div className="social-links">
                        <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="Follow Aullevo on X">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                        </a>
                        <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="Aullevo on LinkedIn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                        </a>
                    </div>
                </div>

                <div className="footer-links">
                    <div className="footer-col">
                        <h4>Product</h4>
                        <Link to="/features">Features</Link>
                        <Link to="/how-it-works">How It Works</Link>
                        <Link to="/docs">Documentation</Link>
                        <a
                            href="/aullevo-extension.zip"
                            download="aullevo-extension.zip"
                            onClick={() => logEvent('download_extension', {
                                method: 'footer_link',
                                file_name: 'aullevo-extension.zip'
                            })}
                        >Download Extension</a>
                        <a
                            href={CHROME_WEB_STORE_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => logEvent('open_chrome_web_store', { method: 'footer_link' })}
                        >Chrome Web Store</a>
                        <Link to="/docs#free-vs-premium">Free vs. Pro</Link>
                    </div>
                    <div className="footer-col">
                        <h4>Company</h4>
                        <Link to="/about">About Us</Link>
                        <Link to="/docs#what-is-aullevo">Mission &amp; Overview</Link>
                        <a href="mailto:xenexashura@gmail.com">Contact Support</a>
                        <Link to="/privacy#contact">Privacy Questions</Link>
                    </div>
                    <div className="footer-col">
                        <h4>Legal</h4>
                        <Link to="/privacy">Privacy Policy</Link>
                        <Link to="/terms">Terms of Service</Link>
                        <Link to="/privacy#cookies">Cookie Policy</Link>
                        <Link to="/docs#privacy">Security Docs</Link>
                    </div>
                </div>
            </div>

            {/* Bottom bar with newsletter CTA */}
            <div className="footer-bottom-wrapper">
                <div className="container footer-bottom">
                    <div className="footer-bottom-left">
                        <p>&copy; {new Date().getFullYear()} Aullevo. All rights reserved.</p>
                    </div>
                    <div className="footer-bottom-right">
                        <span className="footer-status">
                            <span className="footer-status-dot"></span>
                            All systems operational
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

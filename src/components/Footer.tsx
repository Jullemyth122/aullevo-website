import React from 'react';
import { Link } from 'react-router-dom';
import { logEvent } from '../utils/analytics';
import { CHROME_WEB_STORE_URL } from '../config/store';
import PrivacyChoicesLink from './PrivacyChoicesLink';

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
                </div>

                <div className="footer-links">
                    <div className="footer-col">
                        <h4>Product</h4>
                        <Link to="/features">Features</Link>
                        <Link to="/how-it-works">How It Works</Link>
                        <Link to="/docs">Documentation</Link>
                        <Link to="/guides">Guides</Link>
                        <a
                            href={CHROME_WEB_STORE_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => logEvent('open_chrome_web_store', { method: 'footer_link' })}
                        >Chrome Web Store</a>
                        <a
                            href="/aullevo-extension.zip"
                            download="aullevo-extension.zip"
                            onClick={() => logEvent('download_extension', {
                                method: 'footer_link',
                                file_name: 'aullevo-extension.zip'
                            })}
                        >Download ZIP (manual install)</a>
                        <Link to="/docs#free-vs-premium">Free vs. Pro</Link>
                    </div>
                    <div className="footer-col">
                        <h4>Company</h4>
                        <Link to="/about">About Us</Link>
                        <Link to="/docs#what-is-aullevo">Mission &amp; Overview</Link>
                        <Link reloadDocument to="/contact">Contact &amp; Support</Link>
                        <Link reloadDocument to="/privacy#contact">Privacy Questions</Link>
                    </div>
                    <div className="footer-col">
                        <h4>Legal</h4>
                        <Link reloadDocument to="/privacy">Privacy Policy</Link>
                        <Link reloadDocument to="/terms">Terms of Service</Link>
                        <Link reloadDocument to="/advertising">Advertising</Link>
                        <PrivacyChoicesLink />
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
                            <a href="/contact">Questions? Contact support</a>
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

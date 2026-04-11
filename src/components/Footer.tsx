import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    return (
        <footer className="footer">
            {/* Gradient Separator */}
            <div className="footer-gradient-line"></div>

            <div className="container footer-content">
                <div className="footer-main">
                    <Link to="/" className="footer-logo">
                        {/* Logo SVG with gradient */}
                        <svg width="28" height="28" viewBox="0 0 32 32" fill="none" className="footer-logo-icon">
                            <rect width="32" height="32" rx="8" fill="url(#footerGrad)" />
                            <path d="M10 22L16 10L22 22H10Z" fill="white" fillOpacity="0.9" />
                            <defs>
                                <linearGradient id="footerGrad" x1="0" y1="0" x2="32" y2="32">
                                    <stop stopColor="#3B82F6" />
                                    <stop offset="1" stopColor="#8B5CF6" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <span className="footer-logo-text">Aullevo</span>
                    </Link>
                    <p>
                        AI-powered form automation that runs entirely on your device.
                        Private, fast, and undetectable.
                    </p>
                    <div className="social-links">
                        <a href="#" aria-label="Twitter">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                        </a>
                        <a href="#" aria-label="GitHub">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                            </svg>
                        </a>
                        <a href="#" aria-label="LinkedIn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                        </a>
                    </div>
                </div>

                <div className="footer-links">
                    <div>
                        <h4>Product</h4>
                        <Link to="/features">Features</Link>
                        <Link to="/how-it-works">How It Works</Link>
                        <a href="#">Chrome Extension</a>
                        <a href="#">Pricing</a>
                    </div>
                    <div>
                        <h4>Company</h4>
                        <Link to="/about">About Us</Link>
                        <a href="#">Blog</a>
                        <a href="#">Careers</a>
                        <a href="#">Contact</a>
                    </div>
                    <div>
                        <h4>Legal</h4>
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                        <a href="#">Cookie Policy</a>
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

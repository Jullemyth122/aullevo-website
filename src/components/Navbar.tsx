import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import TrustDownloadButton from './TrustDownloadButton';
import ThemeToggle from './ThemeToggle';
import { auth } from '../config/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';

const Navbar: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        
        // Listen to Auth State Changes
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            unsubscribe();
        };
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location.pathname]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        document.body.style.overflow = isMenuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isMenuOpen]);

    const navItems = ['Features', 'How It Works', 'About'];
    const getPath = (item: string) => `/${item.toLowerCase().replace(/ /g, '-')}`;
    const isActive = (item: string) => location.pathname.includes(item.toLowerCase().replace(/ /g, '-'));

    return (
        <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="container navbar-inner">
                <Link to="/" className="nav-logo">
                    <img src="/icon48.png" alt="Aullevo" width="28" height="28" className="nav-logo-img" />
                    <span>Aullevo</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="nav-links">
                    {navItems.map((item) => (
                        <Link
                            key={item}
                            to={getPath(item)}
                            className={`nav-link ${isActive(item) ? 'active' : ''}`}
                        >
                            {item}
                        </Link>
                    ))}
                    
                    {/* Account Status / Sign In */}
                    {user && !user.isAnonymous ? (
                        <Link to="/login" className={`nav-link nav-link--account ${location.pathname === '/login' ? 'active' : ''}`}>
                            <span className="nav-avatar">
                                {user.photoURL ? (
                                    <img src={user.photoURL} alt="Avatar" />
                                ) : (
                                    user.displayName?.charAt(0).toUpperCase() || 'U'
                                )}
                            </span>
                            Account
                        </Link>
                    ) : (
                        <Link to="/login" className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}>
                            Sign In
                        </Link>
                    )}

                    <ThemeToggle />

                    <TrustDownloadButton className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}>
                        Download Extension
                    </TrustDownloadButton>
                </nav>

                {/* Mobile Hamburger */}
                <button
                    className={`mobile-menu-btn ${isMenuOpen ? 'open' : ''}`}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <span className="bar"></span>
                    <span className="bar"></span>
                    <span className="bar"></span>
                </button>
            </div>

            {/* Mobile Nav Overlay */}
            <div 
                className={`mobile-nav-backdrop ${isMenuOpen ? 'open' : ''}`} 
                onClick={() => setIsMenuOpen(false)} 
            />
            
            <nav className={`mobile-nav ${isMenuOpen ? 'open' : ''}`} aria-hidden={!isMenuOpen}>
                <div className="mobile-nav-inner">
                    <div className="mobile-nav-links">
                        {navItems.map((item) => (
                            <Link
                                key={item}
                                to={getPath(item)}
                                className={`mobile-link ${isActive(item) ? 'active' : ''}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <span>{item}</span>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mobile-link-arrow">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </Link>
                        ))}
                        
                        {user && !user.isAnonymous ? (
                            <Link 
                                to="/login" 
                                className={`mobile-link mobile-link--account ${location.pathname === '/login' ? 'active' : ''}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <span className="mobile-account-info">
                                    <span className="nav-avatar">
                                        {user.photoURL ? (
                                            <img src={user.photoURL} alt="Avatar" />
                                        ) : (
                                            user.displayName?.charAt(0).toUpperCase() || 'U'
                                        )}
                                    </span>
                                    <span>My Account</span>
                                </span>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mobile-link-arrow">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </Link>
                        ) : (
                            <Link 
                                to="/login" 
                                className={`mobile-link ${location.pathname === '/login' ? 'active' : ''}`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <span>Sign In</span>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mobile-link-arrow">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </Link>
                        )}
                    </div>

                    <div className="mobile-nav-footer">
                        <div className="mobile-nav-utility">
                            <span className="utility-label">Theme Appearance</span>
                            <ThemeToggle />
                        </div>

                        <TrustDownloadButton className="btn btn-primary btn-block mobile-download-btn">
                            Download Extension
                        </TrustDownloadButton>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Navbar;

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import TrustDownloadButton from './TrustDownloadButton';

const Navbar: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
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
                <Link to="/" className="nav-logo">Aullevo</Link>

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
            <nav className={`mobile-nav ${isMenuOpen ? 'open' : ''}`}>
                {navItems.map((item) => (
                    <Link
                        key={item}
                        to={getPath(item)}
                        className={`mobile-link ${isActive(item) ? 'active' : ''}`}
                    >
                        {item}
                    </Link>
                ))}
                <TrustDownloadButton className="btn btn-primary btn-lg">
                    Download Extension
                </TrustDownloadButton>
            </nav>
        </header>
    );
};

export default Navbar;

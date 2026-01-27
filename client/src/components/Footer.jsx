/**
 * Footer.jsx
 * Main footer component for the landing page
 */
import { Link } from 'react-router-dom';
import { Send, Share2, Globe } from 'lucide-react';
import './Footer.css';

/**
 * Footer component
 * Site-wide footer with navigation links and newsletter signup
 */
const Footer = () => {
    const currentYear = new Date().getFullYear();

    // Footer navigation sections
    const footerSections = [
        {
            title: 'Platform',
            links: [
                { label: 'Features', href: '#features' },
                { label: 'Adaptive Quizzing', href: '#quizzing' },
                { label: 'AI Feedback', href: '#feedback' },
                { label: 'Analytics', href: '#analytics' }
            ]
        },
        {
            title: 'Company',
            links: [
                { label: 'About Us', href: '/about' },
                { label: 'Careers', href: '/careers' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' }
            ]
        }
    ];

    return (
        <footer className="footer">
            <div className="footer-container">
                {/* Main Footer Content */}
                <div className="footer-grid">
                    {/* Brand Column */}
                    <div className="footer-brand">
                        <Link to="/" className="footer-logo">
                            <div className="footer-logo-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <rect width="24" height="24" rx="6" fill="#4f46e5" />
                                    <path d="M7 8h10M7 12h10M7 16h6" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </div>
                            <span className="footer-logo-text">EduAI</span>
                        </Link>
                        <p className="footer-description">
                            Empowering the next generation of learners with personalized AI intelligence.
                        </p>
                    </div>

                    {/* Navigation Columns */}
                    {footerSections.map((section) => (
                        <div key={section.title} className="footer-section">
                            <h4 className="footer-section-title">{section.title}</h4>
                            <ul className="footer-links">
                                {section.links.map((link) => (
                                    <li key={link.label}>
                                        {link.href.startsWith('/') ? (
                                            <Link to={link.href} className="footer-link">
                                                {link.label}
                                            </Link>
                                        ) : (
                                            <a href={link.href} className="footer-link">
                                                {link.label}
                                            </a>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Newsletter Column */}
                    <div className="footer-newsletter">
                        <h4 className="footer-section-title">Newsletter</h4>
                        <p className="newsletter-text">
                            Stay updated with the latest AI education news.
                        </p>
                        <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="email"
                                placeholder="Your email"
                                className="newsletter-input"
                            />
                            <button type="submit" className="newsletter-btn" aria-label="Subscribe">
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="footer-bottom">
                    <p className="footer-copyright">
                        © {currentYear} EduAI Inc. All rights reserved.
                    </p>
                    <div className="footer-social">
                        <button className="social-btn" aria-label="Share">
                            <Share2 size={18} />
                        </button>
                        <button className="social-btn" aria-label="Language">
                            <Globe size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

/**
 * Navbar.jsx
 * Main navigation bar component for the application
 */
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    Search,
    Bell,
    MessageSquare,
    HelpCircle,
    Menu,
    X,
    ChevronDown
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import './Navbar.css';

/**
 * Navbar component
 * Displays the main navigation with search, notifications, and user actions
 * @param {boolean} showSearch - Whether to show the search bar
 * @param {boolean} isLanding - Whether this is the landing page variant
 */
const Navbar = ({ showSearch = true, isLanding = false }) => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [searchQuery, setSearchQuery] = useState('');
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    // Handle search submission
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            // Navigate to search results (to be implemented)
            console.log('Search for:', searchQuery);
        }
    };

    // Handle logout
    const handleLogout = () => {
        logout();
        navigate('/');
        setShowUserMenu(false);
    };

    // Landing page navigation items
    const landingNavItems = [
        // { label: 'Features', href: '#features' },
        // { label: 'For Instructors', href: '#instructors' },
        // { label: 'Pricing', href: '#pricing' },
        // { label: 'Resources', href: '#resources' }
    ];

    // Check if a link is active
    const isActive = (path) => location.pathname === path;

    return (
        <nav className={`navbar ${isLanding ? 'navbar-landing' : 'navbar-dashboard'}`}>
            <div className="navbar-container">
                {/* Logo */}
                <Link to="/" className="navbar-logo">
                    <div className="logo-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <rect width="24" height="24" rx="6" fill="#4f46e5" />
                            <path d="M7 8h10M7 12h10M7 16h6" stroke="white" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>
                    <span className="logo-text">
                        {isLanding ? 'EduAI' : 'eLearn AI'}
                    </span>
                </Link>

                {/* Landing Page Navigation */}
                {isLanding && !isAuthenticated && (
                    <div className={`navbar-nav ${showMobileMenu ? 'show' : ''}`}>
                        {landingNavItems.map((item) => (
                            <a
                                key={item.label}
                                href={item.href}
                                className="nav-link"
                                onClick={() => setShowMobileMenu(false)}
                            >
                                {item.label}
                            </a>
                        ))}
                    </div>
                )}

                {/* Dashboard Search Bar */}
                {showSearch && !isLanding && isAuthenticated && (
                    <form className="navbar-search" onSubmit={handleSearch}>
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search courses, lessons, or notes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    </form>
                )}

                {/* Right Section */}
                <div className="navbar-actions">
                    {isAuthenticated ? (
                        <>
                            {/* Notification Icons */}
                            <button className="action-btn" aria-label="Notifications">
                                <Bell size={20} />
                                <span className="notification-badge">3</span>
                            </button>

                            <button className="action-btn" aria-label="Messages">
                                <MessageSquare size={20} />
                            </button>

                            <Link to="/help" className="help-link">
                                Help Center <HelpCircle size={16} />
                            </Link>

                            {/* User Menu */}
                            <div className="user-menu-container">
                                <button
                                    className="user-menu-trigger"
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    aria-expanded={showUserMenu}
                                >
                                    <div className="user-avatar">
                                        {user?.avatar ? (
                                            <img src={user.avatar} alt={user.name} />
                                        ) : (
                                            <span>{user?.name?.charAt(0) || 'U'}</span>
                                        )}
                                    </div>
                                    <ChevronDown size={16} className={`chevron ${showUserMenu ? 'rotate' : ''}`} />
                                </button>

                                {showUserMenu && (
                                    <div className="user-menu">
                                        <div className="user-menu-header">
                                            <div className="user-info">
                                                <span className="user-name">{user?.name}</span>
                                                <span className="user-email">{user?.email}</span>
                                            </div>
                                        </div>
                                        <div className="user-menu-divider" />
                                        <Link
                                            to="/profile"
                                            className="user-menu-item"
                                            onClick={() => setShowUserMenu(false)}
                                        >
                                            Profile Settings
                                        </Link>
                                        <Link
                                            to={user?.role === 'instructor' ? '/instructor' : '/dashboard'}
                                            className="user-menu-item"
                                            onClick={() => setShowUserMenu(false)}
                                        >
                                            Dashboard
                                        </Link>
                                        <div className="user-menu-divider" />
                                        <button
                                            className="user-menu-item logout"
                                            onClick={handleLogout}
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Landing page auth buttons */}
                            <Link to="/login" className="btn btn-ghost login-btn">
                                Log in
                            </Link>
                            <Link to="/signup" className="btn btn-primary signup-btn">
                                Sign Up
                            </Link>
                        </>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        aria-label="Toggle menu"
                    >
                        {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {showMobileMenu && (
                <div
                    className="mobile-menu-overlay"
                    onClick={() => setShowMobileMenu(false)}
                />
            )}
        </nav>
    );
};

export default Navbar;

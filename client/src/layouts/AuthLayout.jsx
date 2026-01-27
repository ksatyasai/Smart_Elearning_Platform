/**
 * AuthLayout.jsx
 * Layout wrapper for authentication pages (login, signup)
 */
import { Link, Outlet } from 'react-router-dom';
import './AuthLayout.css';

/**
 * AuthLayout component
 * Provides consistent layout for auth pages with gradient background
 */
const AuthLayout = () => {
    return (
        <div className="auth-layout">
            {/* Gradient Background */}
            <div className="auth-background">
                <div className="gradient-blob blob-1" />
                <div className="gradient-blob blob-2" />
                <div className="gradient-blob blob-3" />
            </div>

            {/* Header */}
            <header className="auth-header">
                <Link to="/" className="auth-logo">
                    <div className="logo-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <rect width="24" height="24" rx="6" fill="#4f46e5" />
                            <path d="M7 8h10M7 12h10M7 16h6" stroke="white" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>
                    <span className="logo-text">EduAI</span>
                </Link>

                <nav className="auth-nav">
                    <Link to="#features" className="nav-link">Features</Link>
                    <Link to="#pricing" className="nav-link">Pricing</Link>
                    <Link to="/about" className="nav-link">About</Link>
                    <Link to="/login" className="btn btn-primary">Log In</Link>
                </nav>
            </header>

            {/* Main Content */}
            <main className="auth-main">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="auth-footer">
                <p>© 2026 EduAI Inc. Empowering the future of learning.</p>
            </footer>
        </div>
    );
};

export default AuthLayout;

/**
 * Signup.jsx
 * User registration page with role selection
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, GraduationCap, UserSquare2, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import './Auth.css';

/**
 * Signup component
 * Handles user registration with role selection (Student/Instructor)
 */
const Signup = () => {
    const navigate = useNavigate();
    const { signup, loading, error, clearError } = useAuth();

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        role: 'student',
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [formError, setFormError] = useState('');

    // Password strength calculation
    const getPasswordStrength = (password) => {
        if (!password) return { level: 0, label: '' };
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;

        const labels = ['Weak', 'Fair', 'Good', 'Strong'];
        return { level: strength, label: labels[strength - 1] || '' };
    };

    const passwordStrength = getPasswordStrength(formData.password);

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setFormError('');
        clearError();
    };

    // Handle role selection
    const handleRoleSelect = (role) => {
        setFormData(prev => ({ ...prev, role }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        // Validation
        if (!formData.name || !formData.email || !formData.password) {
            setFormError('Please fill in all fields');
            return;
        }

        if (formData.name.trim().length < 2) {
            setFormError('Name must be at least 2 characters');
            return;
        }

        if (formData.password.length < 8) {
            setFormError('Password must be at least 8 characters');
            return;
        }

        // Attempt signup
        const result = await signup(formData);

        if (result.success) {
            const redirectPath = result.user.role === 'instructor' ? '/instructor' : '/dashboard';
            navigate(redirectPath, { replace: true });
        }
    };

    return (
        <div className="auth-card auth-card-signup">
            <div className="auth-card-header">
                <h1 className="auth-title">Create your account</h1>
                <p className="auth-subtitle">Choose your path in the AI-powered classroom.</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
                {/* Error Message */}
                {(formError || error) && (
                    <div className="auth-error">
                        {formError || error}
                    </div>
                )}

                {/* Role Selection */}
                <div className="role-selection">
                    <button
                        type="button"
                        className={`role-card ${formData.role === 'student' ? 'active' : ''}`}
                        onClick={() => handleRoleSelect('student')}
                    >
                        <div className="role-icon">
                            <GraduationCap size={28} />
                        </div>
                        <span className="role-title">Student</span>
                        <span className="role-description">I want to learn and grow.</span>
                        {formData.role === 'student' && (
                            <div className="role-check">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <circle cx="8" cy="8" r="8" fill="#4f46e5" />
                                    <path d="M5 8L7 10L11 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        )}
                    </button>

                    <button
                        type="button"
                        className={`role-card ${formData.role === 'instructor' ? 'active' : ''}`}
                        onClick={() => handleRoleSelect('instructor')}
                    >
                        <div className="role-icon">
                            <UserSquare2 size={28} />
                        </div>
                        <span className="role-title">Instructor</span>
                        <span className="role-description">I want to teach and inspire.</span>
                        {formData.role === 'instructor' && (
                            <div className="role-check">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <circle cx="8" cy="8" r="8" fill="#4f46e5" />
                                    <path d="M5 8L7 10L11 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        )}
                    </button>
                </div>

                {/* Name Field */}
                <div className="input-group">
                    <label htmlFor="name" className="input-label">Full Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="input"
                        autoComplete="name"
                    />
                </div>

                {/* Email Field */}
                <div className="input-group">
                    <label htmlFor="email" className="input-label">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="name@example.com"
                        className="input"
                        autoComplete="email"
                    />
                </div>

                {/* Password Field */}
                <div className="input-group">
                    <label htmlFor="password" className="input-label">Password</label>
                    <div className="input-wrapper">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="input"
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {formData.password && (
                        <div className="password-strength">
                            <div className="strength-bars">
                                {[1, 2, 3, 4].map((level) => (
                                    <div
                                        key={level}
                                        className={`strength-bar ${passwordStrength.level >= level ? 'active' : ''}`}
                                        data-level={passwordStrength.level}
                                    />
                                ))}
                            </div>
                            <span className="strength-label">{passwordStrength.label}</span>
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="btn btn-primary btn-lg auth-submit"
                    disabled={loading}
                >
                    {loading ? (
                        <span className="loading-dots">Creating account...</span>
                    ) : (
                        <>
                            Create Account
                            <Sparkles size={18} />
                        </>
                    )}
                </button>

                {/* Divider */}
                <div className="auth-divider">
                    <span>Or continue with</span>
                </div>

                {/* Social Logins */}
                <div className="social-buttons">
                    <button type="button" className="btn btn-secondary social-btn">
                        <svg className="social-icon" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Google
                    </button>
                    <button type="button" className="btn btn-secondary social-btn">
                        <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                        GitHub
                    </button>
                </div>

                {/* Login Link */}
                <p className="auth-switch">
                    Already have an account? <Link to="/login">Log in</Link>
                </p>

                {/* Terms */}
                <p className="auth-terms">
                    By clicking "Create Account", you agree to our{' '}
                    <Link to="/terms">Terms of Service</Link> and{' '}
                    <Link to="/privacy">Privacy Policy</Link>.
                </p>
            </form>
        </div>
    );
};

export default Signup;

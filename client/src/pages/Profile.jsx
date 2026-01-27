/**
 * Profile.jsx
 * User profile and settings page
 */
import { useState } from 'react';
import {
    User,
    Palette,
    Bell,
    Shield,
    CreditCard,
    LogOut,
    Sun,
    Moon,
    CheckCircle,
    ChevronRight
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import './Profile.css';

/**
 * Profile component
 * User settings and preferences management
 */
const Profile = () => {
    const { user, logout, isInstructor } = useAuth();

    // Settings state
    const [activeTab, setActiveTab] = useState('profile');
    const [theme, setTheme] = useState('light');
    const [aiOverlay, setAiOverlay] = useState(true);
    const [notifications, setNotifications] = useState({
        enrollments: true,
        aiFeedback: true,
        marketing: false
    });
    const [passwords, setPasswords] = useState({
        current: '',
        new: ''
    });

    // Sidebar navigation items
    const navItems = [
        { id: 'profile', icon: User, label: 'Account Profile' },
        { id: 'appearance', icon: Palette, label: 'Appearance' },
        { id: 'notifications', icon: Bell, label: 'Notifications' },
        { id: 'security', icon: Shield, label: 'Security & Privacy' },
        { id: 'billing', icon: CreditCard, label: 'Billing' }
    ];

    // Handle notification toggle
    const toggleNotification = (key) => {
        setNotifications(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    // Handle save
    const handleSave = () => {
        // Mock save action
        alert('Settings saved successfully!');
    };

    return (
        <div className="profile-page">
            {/* Sidebar */}
            <aside className="profile-sidebar">
                <div className="profile-user">
                    <div className="profile-avatar-large">
                        {user?.avatar ? (
                            <img src={user.avatar} alt={user?.name} />
                        ) : (
                            <span>{user?.name?.charAt(0) || 'A'}</span>
                        )}
                    </div>
                    <div className="profile-user-info">
                        <span className="profile-user-name">{user?.name || 'Alex Johnson'}</span>
                        <span className="profile-user-role">
                            {isInstructor ? 'Senior Instructor' : 'Student'}
                        </span>
                    </div>
                </div>

                <nav className="profile-nav">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            className={`profile-nav-item ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(item.id)}
                        >
                            <item.icon size={18} />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Plan Card */}
                <div className="plan-info">
                    <span className="plan-label">CURRENT PLAN</span>
                    <span className="plan-name">{user?.plan || 'Instructor Pro AI'}</span>
                    <button className="upgrade-btn">Upgrade Plan</button>
                </div>

                <button className="signout-btn" onClick={logout}>
                    <LogOut size={18} />
                    Sign Out
                </button>
            </aside>

            {/* Main Content */}
            <main className="profile-main">
                <div className="settings-header">
                    <h1>User Settings</h1>
                    <p>Manage your account preferences and AI learning environment.</p>
                </div>

                {/* Account Profile Section */}
                {activeTab === 'profile' && (
                    <section className="settings-section">
                        <div className="profile-card">
                            <div className="profile-card-left">
                                <div className="profile-avatar-edit">
                                    {user?.avatar ? (
                                        <img src={user.avatar} alt={user?.name} />
                                    ) : (
                                        <span>{user?.name?.charAt(0) || 'A'}</span>
                                    )}
                                </div>
                                <div className="profile-details">
                                    <h3>{user?.name || 'Alex Johnson'}</h3>
                                    <p>{user?.email || 'alex.johnson@ai-academy.edu'}</p>
                                    <div className="profile-badges">
                                        <span className="badge badge-primary">{isInstructor ? 'INSTRUCTOR' : 'STUDENT'}</span>
                                        {user?.verified && <span className="badge badge-success">VERIFIED</span>}
                                    </div>
                                </div>
                            </div>
                            <button className="btn btn-secondary">Edit Profile</button>
                        </div>
                    </section>
                )}

                {/* Appearance Section */}
                <section className="settings-section">
                    <h2 className="section-title">
                        <Palette size={20} />
                        Appearance
                    </h2>
                    <div className="settings-grid">
                        <div className="settings-card">
                            <div className="setting-info">
                                <h4>Interface Theme</h4>
                                <p>Switch between light and dark modes.</p>
                            </div>
                            <div className="theme-selector">
                                <button
                                    className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                                    onClick={() => setTheme('light')}
                                >
                                    <Sun size={16} />
                                    Light
                                </button>
                                <button
                                    className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                                    onClick={() => setTheme('dark')}
                                >
                                    <Moon size={16} />
                                    Dark
                                </button>
                            </div>
                        </div>
                        <div className="settings-card">
                            <div className="setting-info">
                                <h4>AI Assistance Overlay</h4>
                                <p>Show AI insights directly on course materials.</p>
                            </div>
                            <div className="toggle-wrapper">
                                <button
                                    className={`toggle ${aiOverlay ? 'active' : ''}`}
                                    onClick={() => setAiOverlay(!aiOverlay)}
                                >
                                    <span className="toggle-knob"></span>
                                </button>
                                <span className="toggle-label">{aiOverlay ? 'Always On' : 'Off'}</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Notifications Section */}
                <section className="settings-section">
                    <h2 className="section-title">
                        <Bell size={20} />
                        Notification Preferences
                    </h2>
                    <div className="notifications-list">
                        <div className="notification-item">
                            <div className="notification-info">
                                <h4>New Course Enrollments</h4>
                                <p>Receive email alerts when students join your courses.</p>
                            </div>
                            <button
                                className={`toggle ${notifications.enrollments ? 'active' : ''}`}
                                onClick={() => toggleNotification('enrollments')}
                            >
                                <span className="toggle-knob"></span>
                            </button>
                        </div>
                        <div className="notification-item">
                            <div className="notification-info">
                                <h4>AI-Generated Feedback</h4>
                                <p>Notifications when AI completes grading your assignments.</p>
                            </div>
                            <button
                                className={`toggle ${notifications.aiFeedback ? 'active' : ''}`}
                                onClick={() => toggleNotification('aiFeedback')}
                            >
                                <span className="toggle-knob"></span>
                            </button>
                        </div>
                        <div className="notification-item">
                            <div className="notification-info">
                                <h4>Marketing & Updates</h4>
                                <p>Stay informed about new features and platform news.</p>
                            </div>
                            <button
                                className={`toggle ${notifications.marketing ? 'active' : ''}`}
                                onClick={() => toggleNotification('marketing')}
                            >
                                <span className="toggle-knob"></span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* Security Section */}
                <section className="settings-section">
                    <h2 className="section-title">
                        <Shield size={20} />
                        Security
                    </h2>
                    <div className="security-grid">
                        <div className="password-section">
                            <div className="input-group">
                                <label className="input-label">Current Password</label>
                                <input
                                    type="password"
                                    className="input"
                                    placeholder="••••••••"
                                    value={passwords.current}
                                    onChange={(e) => setPasswords(p => ({ ...p, current: e.target.value }))}
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">New Password</label>
                                <input
                                    type="password"
                                    className="input"
                                    placeholder="Min. 8 characters"
                                    value={passwords.new}
                                    onChange={(e) => setPasswords(p => ({ ...p, new: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="twofa-card">
                            <div className="twofa-header">
                                <CheckCircle size={18} className="twofa-icon" />
                                <span>Two-Factor Authentication</span>
                            </div>
                            <p>Adding a layer of security to your account by requiring more than just a password to log in.</p>
                            <button className="twofa-link">
                                Enable 2FA Now
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                    <button className="btn btn-primary security-update-btn">
                        Update Security Settings
                    </button>
                </section>

                {/* Actions Footer */}
                <div className="settings-footer">
                    <button className="btn btn-ghost">Discard Changes</button>
                    <button className="btn btn-primary" onClick={handleSave}>Save All Changes</button>
                </div>
            </main>
        </div>
    );
};

export default Profile;

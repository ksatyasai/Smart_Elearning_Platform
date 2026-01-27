/**
 * Sidebar.jsx
 * Dashboard sidebar navigation component
 */
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    Sparkles,
    Library,
    Settings,
    BarChart3,
    Users,
    LogOut,
    MessageCircle,
    ChevronRight
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import './Sidebar.css';

/**
 * Sidebar component
 * Navigation sidebar for dashboard pages
 * @param {boolean} isCollapsed - Whether sidebar is in collapsed state
 */
const Sidebar = ({ isCollapsed = false }) => {
    const { user, logout, isInstructor } = useAuth();
    const navigate = useNavigate();

    // Student navigation items
    const studentNavItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: BookOpen, label: 'Courses', path: '/courses' },
        { icon: Sparkles, label: 'AI Tutor', path: '/ai-tutor' },
        { icon: Library, label: 'My Library', path: '/library' },
        { icon: Settings, label: 'Settings', path: '/profile' }
    ];

    // Instructor navigation items
    const instructorNavItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/instructor' },
        { icon: BookOpen, label: 'Courses', path: '/instructor/courses' },
        { icon: BarChart3, label: 'Analytics', path: '/analytics' },
        { icon: Users, label: 'Students', path: '/instructor/students' },
        { icon: Settings, label: 'Settings', path: '/profile' }
    ];

    const navItems = isInstructor ? instructorNavItems : studentNavItems;

    // Handle logout
    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <aside className={`sidebar ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
            {/* Logo Section */}
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <div className="logo-icon-wrapper">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                            <rect width="24" height="24" rx="6" fill="#4f46e5" />
                            <path d="M7 8h10M7 12h10M7 16h6" stroke="white" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>
                    {!isCollapsed && (
                        <span className="sidebar-logo-text">
                            {isInstructor ? 'EduAI Admin' : 'eLearn AI'}
                        </span>
                    )}
                </div>
            </div>

            {/* User Profile Section (Instructor) */}
            {isInstructor && !isCollapsed && (
                <div className="sidebar-profile">
                    <div className="profile-avatar">
                        {user?.avatar ? (
                            <img src={user.avatar} alt={user.name} />
                        ) : (
                            <span>{user?.name?.charAt(0) || 'P'}</span>
                        )}
                    </div>
                    <div className="profile-info">
                        <span className="profile-name">{user?.name || 'Prof. Anderson'}</span>
                        <span className="profile-role">Senior Instructor</span>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `sidebar-nav-item ${isActive ? 'active' : ''}`
                        }
                        title={isCollapsed ? item.label : undefined}
                    >
                        <item.icon size={20} className="nav-icon" />
                        {!isCollapsed && <span className="nav-label">{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* AI Assistant Card */}
            <div className="sidebar-assistant">
                {!isCollapsed ? (
                    <div className="assistant-card">
                        <span className="assistant-label">AI ASSISTANT</span>
                        <p className="assistant-text">
                            {isInstructor
                                ? 'Need help with lesson plans or grading insights?'
                                : 'Get instant help with your studies'
                            }
                        </p>
                        <button
                            className="assistant-btn"
                            onClick={() => navigate('/ai-tutor')}
                        >
                            <Sparkles size={16} />
                            Ask AI {isInstructor ? 'Assistant' : 'Tutor'}
                        </button>
                    </div>
                ) : (
                    <button
                        className="assistant-btn-collapsed"
                        onClick={() => navigate('/ai-tutor')}
                        title="Ask AI Tutor"
                    >
                        <MessageCircle size={20} />
                    </button>
                )}
            </div>

            {/* User Section (Student) */}
            {!isInstructor && !isCollapsed && (
                <div className="sidebar-user">
                    <div className="user-card">
                        <div className="user-avatar-sidebar">
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user.name} />
                            ) : (
                                <span>{user?.name?.charAt(0) || 'A'}</span>
                            )}
                        </div>
                        <div className="user-details">
                            <span className="user-name">{user?.name || 'Alex Johnson'}</span>
                            <span className="user-plan">{user?.plan || 'Premium Plan'}</span>
                        </div>
                    </div>
                    <button className="sidebar-tutor-btn" onClick={() => navigate('/ai-tutor')}>
                        <Sparkles size={16} />
                        Ask AI Tutor
                    </button>
                </div>
            )}

            {/* Plan & Logout (Instructor) */}
            {isInstructor && !isCollapsed && (
                <div className="sidebar-footer">
                    <div className="plan-card">
                        <span className="plan-label">CURRENT PLAN</span>
                        <span className="plan-name">{user?.plan || 'Instructor Pro AI'}</span>
                        <button className="upgrade-btn">Upgrade Plan</button>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;

/**
 * StudentDashboard.jsx - Updated to use dynamic API data
 * Main dashboard page for student users with course browsing and enrollment
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Play,
    BookOpen,
    Flame,
    Award,
    Sparkles,
    ChevronRight,
    ChevronDown,
    Calendar,
    AlertCircle,
    Plus,
    X,
    Loader
} from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { useAuth } from '../hooks/useAuth';
import { coursesAPI } from '../services/api';
import './StudentDashboard.css';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

/**
 * StudentDashboard component - Fetches enrolled courses and allows browsing all courses
 */
const StudentDashboard = () => {
    const { user } = useAuth();
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [allCourses, setAllCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [enrollError, setEnrollError] = useState('');
    const [enrollSuccess, setEnrollSuccess] = useState('');
    const [activityFilter, setActivityFilter] = useState('Study Hours');
    const [showCourseModal, setShowCourseModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [enrolling, setEnrolling] = useState(false);

    // Fetch enrolled courses from API
    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('Fetching courses...');
            
            // Fetch enrolled courses
            try {
                const enrolledRes = await coursesAPI.getEnrolled();
                console.log('Enrolled courses response:', enrolledRes);
                setEnrolledCourses(enrolledRes.data.courses || []);
            } catch (enrollErr) {
                console.error('Error fetching enrolled courses:', enrollErr);
                setEnrolledCourses([]);
            }
            
            // Fetch all available courses
            try {
                const allRes = await coursesAPI.getAll();
                console.log('All courses response:', allRes);
                setAllCourses(allRes.data.courses || []);
            } catch (allErr) {
                console.error('Error fetching all courses:', allErr);
                setAllCourses([]);
            }
        } catch (err) {
            console.error('Error in fetchCourses:', err);
            setError('Failed to load courses. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async (courseId) => {
        try {
            setEnrolling(true);
            setEnrollError('');
            setEnrollSuccess('');

            const response = await coursesAPI.enroll(courseId);

            if (response.data.success) {
                setEnrollSuccess('✓ Successfully enrolled in course!');
                setShowCourseModal(false);
                setSelectedCourse(null);
                
                // Refresh courses list
                setTimeout(() => {
                    fetchCourses();
                    setEnrollSuccess('');
                }, 1500);
            }
        } catch (err) {
            console.error('Error enrolling:', err);
            const message = err.response?.data?.message || 'Failed to enroll. Please try again.';
            setEnrollError(message);
        } finally {
            setEnrolling(false);
        }
    };

    const openCourseDetail = (course) => {
        setSelectedCourse(course);
        setShowCourseModal(true);
        setEnrollError('');
        setEnrollSuccess('');
    };

    // Check if already enrolled
    const isEnrolled = (courseId) => {
        return enrolledCourses.some(c => c._id === courseId);
    };

    // Calculate stats from user data
    const stats = [
        {
            icon: BookOpen,
            label: 'COURSES IN PROGRESS',
            value: enrolledCourses.length.toString(),
            change: `${allCourses.length} available to explore`,
            color: 'primary'
        },
        {
            icon: Flame,
            label: 'STUDY STREAK',
            value: `${user?.stats?.currentStreak || 0} Days`,
            subtext: `Personal best: ${user?.stats?.longestStreak || 0} days`,
            color: 'warning'
        },
        {
            icon: Award,
            label: 'CERTIFICATES',
            value: (user?.stats?.certificatesEarned || 0).toString(),
            change: 'Achievements unlocked',
            color: 'success'
        }
    ];

    // Dynamic chart data derived from enrolled courses
    const chartData = (() => {
        if (!enrolledCourses || enrolledCourses.length === 0) {
            return {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [
                    {
                        label: 'Study Hours',
                        data: [2.5, 4, 5.5, 3, 4.5, 2, 1.5],
                        backgroundColor: [
                            '#c7d2fe', '#818cf8', '#4f46e5', '#c7d2fe', '#4f46e5', '#c7d2fe', '#c7d2fe'
                        ],
                        borderRadius: 8,
                        borderSkipped: false
                    }
                ]
            };
        }

        // If user has enrolled courses, show progress per course as the activity chart
        const labels = enrolledCourses.map(c => c.title.length > 20 ? c.title.slice(0, 20) + '…' : c.title);
        const values = enrolledCourses.map(c => Math.round(c.enrollment?.progress || 0));

        const bg = labels.map((_, i) => (i % 3 === 0 ? '#c7d2fe' : (i % 3 === 1 ? '#818cf8' : '#4f46e5')));

        return {
            labels,
            datasets: [
                {
                    label: activityFilter === 'Study Hours' ? 'Progress (%)' : activityFilter,
                    data: values,
                    backgroundColor: bg,
                    borderRadius: 8,
                    borderSkipped: false
                }
            ]
        };
    })();

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: '#1f2937',
                padding: 12,
                cornerRadius: 8,
                titleFont: { size: 12, weight: '600' },
                bodyFont: { size: 14 }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: enrolledCourses && enrolledCourses.length > 0 ? 100 : 8,
                ticks: {
                    stepSize: 2
                },
                grid: {
                    color: '#f3f4f6'
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    };

    if (loading) {
        return (
            <div className="student-dashboard dashboard-loading">
                <Loader size={40} className="loading-spinner" />
                <p>Loading your dashboard...</p>
            </div>
        );
    }

    return (
        <div className="student-dashboard">
            {/* Header */}
            <div className="dashboard-header">
                <div className="header-top">
                    <div className="welcome-section">
                        <h1>Welcome back, {user?.name || 'Student'}! 👋</h1>
                        <p>Here's your learning progress and activity</p>
                    </div>
                    <div className="header-action">
                        <Link to="/courses" className="btn btn-primary">
                            <Plus size={20} />
                            Browse Courses
                        </Link>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="message-container message-error">
                    <AlertCircle size={20} />
                    <div>
                        <strong>Error loading data</strong>
                        <p>{error}</p>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="stats-grid">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="stat-card">
                            <div className="stat-card-header">
                                <div className="stat-info">
                                    <div className="stat-label">{stat.label}</div>
                                    <div className="stat-value">{stat.value}</div>
                                    {stat.change && <div className="stat-change">{stat.change}</div>}
                                    {stat.subtext && <div className="stat-change">{stat.subtext}</div>}
                                </div>
                                <div className="stat-icon">
                                    <Icon size={24} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Main Content Grid */}
            <div className="content-grid">
                {/* My Courses */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">My Courses ({enrolledCourses.length})</h2>
                        <Link to="/courses" className="btn btn-ghost">
                            View All
                            <ChevronRight size={18} />
                        </Link>
                    </div>

                    {enrolledCourses.length === 0 ? (
                        <div className="empty-state">
                            <BookOpen size={48} />
                            <p className="empty-state-title">No courses enrolled yet</p>
                            <button onClick={() => setShowCourseModal(true)} className="empty-state-action">
                                Browse Courses →
                            </button>
                        </div>
                    ) : (
                        <div className="course-list">
                            {enrolledCourses.slice(0, 3).map((course) => (
                                <div key={course._id || course.id} className="course-item">
                                    <img src={course.image} alt={course.title} className="course-image" onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f70d504f0?w=600&h=400&fit=crop'} />
                                    <div className="course-info">
                                        <h3 className="course-title">{course.title}</h3>
                                        <p className="course-meta">{course.category} • {course.level}</p>
                                        <div className="progress-bar">
                                            <div className="progress-fill" style={{ width: `${course.enrollment?.progress || 0}%` }}></div>
                                        </div>
                                    </div>
                                    <div className="course-progress">
                                        <span className="progress-value">{course.enrollment?.progress || 0}%</span>
                                        <ChevronRight size={20} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Activity Chart */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title card-title-small">Activity</h2>
                        <button className="btn btn-icon">
                            <ChevronDown size={20} />
                        </button>
                    </div>
                    <div className="activity-filters">
                        {['Study Hours', 'Lessons', 'Quizzes'].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActivityFilter(filter)}
                                className={`btn-pill ${activityFilter === filter ? 'active' : ''}`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                    <div className="chart-container">
                        <Bar data={chartData} options={chartOptions} />
                    </div>
                </div>
            </div>

            {/* AI Insights */}
            <div className="ai-insights">
                <div className="ai-insights-header">
                    <Sparkles size={28} />
                    <h3>AI Insights</h3>
                </div>
                <p className="ai-insights-content">
                    Based on your learning pattern, you're most productive on Wednesday evenings. We recommend scheduling your study sessions then for better retention.
                </p>
                <button className="btn btn-secondary">
                    <Sparkles size={18} />
                    Get Personalized Tips
                </button>
            </div>

            {/* Explore Courses */}
            <div className="explore-section">
                <div className="explore-header">
                    <h2>Explore More Courses</h2>
                    <button onClick={() => setShowCourseModal(true)} className="btn btn-ghost">
                        View All <ChevronRight size={20} />
                    </button>
                </div>

                {allCourses.filter(c => !isEnrolled(c._id)).length === 0 ? (
                    <div className="empty-state" style={{background: 'white', border: '1px solid #e2e8f0'}}>
                        <BookOpen size={48} />
                        <p className="empty-state-title">You're enrolled in all available courses!</p>
                    </div>
                ) : (
                    <div className="courses-grid">
                        {allCourses.filter(c => !isEnrolled(c._id)).slice(0, 8).map((course) => (
                            <div key={course._id} className="course-card" onClick={() => openCourseDetail(course)}>
                                <img src={course.image} alt={course.title} className="course-card-image" onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f70d504f0?w=600&h=400&fit=crop'} />
                                <div className="course-card-body">
                                    <h3 className="course-card-title">{course.title}</h3>
                                    <p className="course-card-desc">{course.description}</p>
                                    <div className="course-card-meta">
                                        <span className="course-meta-tag">{course.category}</span>
                                        <span className="course-meta-tag">{course.level}</span>
                                    </div>
                                </div>
                                <div className="course-card-footer">
                                    <button className="btn btn-primary" style={{fontSize: '0.9rem', padding: '10px 16px'}} onClick={(e) => {
                                        e.stopPropagation();
                                        openCourseDetail(course);
                                    }}>
                                        <Plus size={18} />
                                        Enroll
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Course Modal */}
            {showCourseModal && selectedCourse && (
                <div className="modal-overlay show">
                    <div className="modal">
                        <div className="modal-header" style={{padding: 0, overflow: 'hidden', borderBottom: 'none'}}>
                            <img src={selectedCourse.image} alt={selectedCourse.title} style={{width: '100%', height: '240px', objectFit: 'cover'}} onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f70d504f0?w=600&h=400&fit=crop'} />
                            <button onClick={() => setShowCourseModal(false)} className="modal-close" style={{position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.9)'}}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className="modal-body">
                            {enrollSuccess && (
                                <div className="message-container message-success">
                                    <AlertCircle size={20} />
                                    <p>{enrollSuccess}</p>
                                </div>
                            )}
                            {enrollError && (
                                <div className="message-container message-error">
                                    <AlertCircle size={20} />
                                    <p>{enrollError}</p>
                                </div>
                            )}

                            <h2 className="modal-title" style={{fontSize: '1.6rem', marginBottom: '16px'}}>{selectedCourse.title}</h2>
                            
                            <div style={{display: 'flex', gap: '12px', marginBottom: '24px'}}>
                                <span className="course-meta-tag" style={{background: 'linear-gradient(135deg, #f3f0ff, #faf5ff)', color: '#7c5cff', padding: '10px 16px', fontSize: '0.95rem', fontWeight: 700}}>{selectedCourse.category}</span>
                                <span className="course-meta-tag" style={{padding: '10px 16px', fontSize: '0.95rem', fontWeight: 700}}>{selectedCourse.level}</span>
                            </div>

                            <p style={{fontSize: '1rem', color: '#4a5568', lineHeight: 1.6, marginBottom: '24px'}}>{selectedCourse.description}</p>

                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', padding: '16px', background: '#f8f9fa', borderRadius: '12px', marginBottom: '24px'}}>
                                <div>
                                    <p style={{fontSize: '0.85rem', color: '#718096', marginBottom: '4px'}}>Students</p>
                                    <p style={{fontSize: '1.5rem', fontWeight: 800, color: '#1a202c'}}>{selectedCourse.studentsEnrolled || 0}</p>
                                </div>
                                <div>
                                    <p style={{fontSize: '0.85rem', color: '#718096', marginBottom: '4px'}}>Price</p>
                                    <p style={{fontSize: '1.5rem', fontWeight: 800, color: '#7c5cff'}}>${selectedCourse.price}</p>
                                </div>
                                <div>
                                    <p style={{fontSize: '0.85rem', color: '#718096', marginBottom: '4px'}}>Status</p>
                                    <p style={{fontSize: '1rem', fontWeight: 700, color: '#22c55e'}}>Available</p>
                                </div>
                            </div>

                            <button onClick={() => handleEnroll(selectedCourse._id)} disabled={enrolling} className="btn btn-primary" style={{width: '100%', padding: '14px 20px', fontSize: '1rem'}}>
                                {enrolling ? (
                                    <>
                                        <Loader size={20} className="loading-spinner" style={{animation: 'spin 1s linear infinite'}} />
                                        Enrolling...
                                    </>
                                ) : (
                                    <>
                                        <Plus size={20} />
                                        Enroll Now
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;

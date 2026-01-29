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

    // Chart data from user stats
    const chartData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Study Hours',
                data: [2.5, 4, 5.5, 3, 4.5, 2, 1.5],
                backgroundColor: [
                    '#c7d2fe',
                    '#818cf8',
                    '#4f46e5',
                    '#c7d2fe',
                    '#4f46e5',
                    '#c7d2fe',
                    '#c7d2fe'
                ],
                borderRadius: 8,
                borderSkipped: false,
            }
        ]
    };

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
                max: 8,
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
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome back, {user?.name}! 👋
                    </h1>
                    <p className="text-gray-600">Here's your learning progress</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-red-900">Error loading data</h3>
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-500 mb-1">{stat.label}</p>
                                        <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                                        {stat.change && (
                                            <p className="text-xs text-gray-600 mt-2">{stat.change}</p>
                                        )}
                                        {stat.subtext && (
                                            <p className="text-xs text-gray-600 mt-2">{stat.subtext}</p>
                                        )}
                                    </div>
                                    <Icon className={`w-10 h-10 text-indigo-600 bg-indigo-50 p-2 rounded-lg`} />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Courses */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">
                                    My Courses ({enrolledCourses.length})
                                </h2>
                                <Link to="/courses" className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold">
                                    View All
                                </Link>
                            </div>

                            {enrolledCourses.length === 0 ? (
                                <div className="text-center py-12">
                                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 mb-4">No courses enrolled yet</p>
                                    <button 
                                        onClick={() => setShowCourseModal(true)}
                                        className="btn-ghost"
                                    >
                                        Browse Courses →
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {enrolledCourses.slice(0, 3).map((course) => (
                                        <div key={course._id || course.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <img
                                                src={course.image}
                                                alt={course.title}
                                                className="w-16 h-16 rounded-lg object-cover"
                                            />
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900">{course.title}</h3>
                                                <p className="text-sm text-gray-600">
                                                    {course.category} • {course.level}
                                                </p>
                                                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-indigo-600 h-2 rounded-full"
                                                        style={{ width: `${course.enrollment?.progress || 0}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-900">{course.enrollment?.progress || 0}%</p>
                                                <ChevronRight className="w-5 h-5 text-gray-400 mt-2" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Activity Chart */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Activity</h2>
                            <button className="btn-icon">
                                <ChevronDown className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex gap-2 mb-6">
                            {['Study Hours', 'Lessons', 'Quizzes'].map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setActivityFilter(filter)}
                                    className={`btn-pill ${
                                        activityFilter === filter
                                            ? 'btn-pill-active'
                                            : 'btn-pill-inactive'
                                    }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                        <div style={{ height: '250px' }}>
                            <Bar data={chartData} options={chartOptions} />
                        </div>
                    </div>
                </div>

                {/* AI Insights */}
                <div className="mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
                    <div className="flex items-center gap-3 mb-4">
                        <Sparkles className="w-6 h-6" />
                        <h2 className="text-xl font-bold">AI Insights</h2>
                    </div>
                    <p className="mb-4">
                        Based on your learning pattern, you're most productive on Wednesday evenings. We recommend scheduling your study sessions then for better retention.
                    </p>
                    <button className="btn-secondary btn-small">
                        <Sparkles className="w-4 h-4" />
                        Get Personalized Tips
                    </button>
                </div>

                {/* Browse All Courses Section */}
                <div className="mt-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Explore More Courses</h2>
                        <button
                            onClick={() => setShowCourseModal(true)}
                            className="btn-ghost"
                        >
                            View All
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {allCourses.filter(c => !isEnrolled(c._id)).length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl">
                            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600">You're enrolled in all available courses!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {allCourses.filter(c => !isEnrolled(c._id)).slice(0, 8).map((course) => (
                                <div
                                    key={course._id}
                                    onClick={() => openCourseDetail(course)}
                                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
                                >
                                    <img
                                        src={course.image}
                                        alt={course.title}
                                        className="w-full h-32 object-cover"
                                    />
                                    <div className="p-4">
                                        <h3 className="font-bold text-gray-900 line-clamp-2 mb-2">{course.title}</h3>
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                                                {course.category}
                                            </span>
                                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                                {course.level}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">
                                                {course.studentsEnrolled || 0} students
                                            </span>
                                            <span className="font-bold text-indigo-600">
                                                ${course.price}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Course Detail Modal */}
            {showCourseModal && selectedCourse && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
                        {/* Modal Header with Image */}
                        <div className="relative">
                            <img
                                src={selectedCourse.image}
                                alt={selectedCourse.title}
                                className="w-full h-64 object-cover"
                            />
                            <button
                                onClick={() => setShowCourseModal(false)}
                                className="absolute top-4 right-4 btn-icon"
                                style={{width: '2.5rem', height: '2.5rem'}}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-8">
                            {/* Messages */}
                            {enrollSuccess && (
                                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 text-green-600" />
                                    <p className="text-green-700 font-semibold">{enrollSuccess}</p>
                                </div>
                            )}
                            {enrollError && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-600" />
                                    <p className="text-red-700">{enrollError}</p>
                                </div>
                            )}

                            {/* Course Info */}
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">{selectedCourse.title}</h2>
                            
                            <div className="flex gap-4 mb-6">
                                <span className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full font-semibold">
                                    {selectedCourse.category}
                                </span>
                                <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full font-semibold">
                                    {selectedCourse.level}
                                </span>
                            </div>

                            <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                                {selectedCourse.description}
                            </p>

                            <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-600">Students</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {selectedCourse.studentsEnrolled || 0}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Price</p>
                                    <p className="text-2xl font-bold text-indigo-600">
                                        ${selectedCourse.price}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Instructor</p>
                                    <p className="text-lg font-bold text-gray-900">
                                        Available
                                    </p>
                                </div>
                            </div>

                            {/* Enroll Button */}
                            <button
                                onClick={() => handleEnroll(selectedCourse._id)}
                                disabled={enrolling}
                                className="w-full btn-primary"
                                style={{padding: '1rem 1.5rem'}}
                            >
                                {enrolling ? (
                                    <>
                                        <Loader size={20} className="animate-spin" />
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

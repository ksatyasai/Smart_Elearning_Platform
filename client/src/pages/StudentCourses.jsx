import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, Users, DollarSign, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { coursesAPI } from '../services/api';
import './StudentCourses.css';

const StudentCourses = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [allCourses, setAllCourses] = useState([]);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(null);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [levelFilter, setLevelFilter] = useState('All');

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            setError('');
            
            const [allRes, enrolledRes] = await Promise.all([
                coursesAPI.getAll(),
                coursesAPI.getEnrolled()
            ]);

            const allCoursesList = allRes.data.courses || [];
            const enrolledList = enrolledRes.data.courses || [];
            
            setAllCourses(allCoursesList);
            setEnrolledCourses(enrolledList);
        } catch (err) {
            console.error(err);
            setError('Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async (courseId) => {
        try {
            setEnrolling(courseId);
            const res = await coursesAPI.enroll(courseId);
            
            if (res.data.success) {
                // Move course from available to enrolled
                const course = allCourses.find(c => c._id === courseId);
                if (course) {
                    setEnrolledCourses([...enrolledCourses, course]);
                    setAllCourses(prev => prev.filter(c => c._id !== courseId));
                }
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to enroll in course');
        } finally {
            setEnrolling(null);
        }
    };

    const getAvailableCourses = () => {
        return allCourses.filter(course => {
            const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                course.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === 'All' || course.category === categoryFilter;
            const matchesLevel = levelFilter === 'All' || course.level === levelFilter;
            
            return matchesSearch && matchesCategory && matchesLevel;
        });
    };

    const getCategories = () => {
        const categories = new Set(allCourses.map(c => c.category));
        return Array.from(categories);
    };

    const getLevels = () => {
        const levels = new Set(allCourses.map(c => c.level));
        return Array.from(levels);
    };

    const availableCourses = getAvailableCourses();

    return (
        <div className="student-courses-container">
            {/* My Courses Section */}
            <section className="courses-section my-courses">
                <div className="section-header">
                    <h2 className="section-title">My Courses</h2>
                    <p className="section-subtitle">Continue learning where you left off</p>
                </div>

                {error && (
                    <div className="message message-error">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                {loading ? (
                    <div className="loading-container">
                        <Loader size={32} className="loading-spinner" />
                        <p>Loading courses...</p>
                    </div>
                ) : enrolledCourses.length === 0 ? (
                    <div className="empty-state">
                        <BookOpen size={48} />
                        <h3>No Enrolled Courses Yet</h3>
                        <p>Browse available courses and enroll to get started</p>
                    </div>
                ) : (
                    <div className="courses-grid">
                        {enrolledCourses.map(course => (
                            <div className="course-card enrolled" key={course._id}>
                                <div className="card-badge">Enrolled</div>
                                <div className="card-image">
                                    <img 
                                        src={course.image} 
                                        alt={course.title}
                                        onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f70d504f0?w=600&h=400&fit=crop'}
                                    />
                                </div>
                                <div className="card-content">
                                    <h3 className="card-title">{course.title}</h3>
                                    <p className="card-description">{course.description}</p>
                                    <div className="card-meta">
                                        <span className="meta-item">
                                            <BookOpen size={14} />
                                            {course.level}
                                        </span>
                                        <span className="meta-item">
                                            <Users size={14} />
                                            {course.studentsEnrolled || 0} students
                                        </span>
                                    </div>
                                </div>
                                <div className="card-footer">
                                    <button 
                                        className="btn btn-primary"
                                        onClick={() => navigate(`/course/${course._id}`)}
                                    >
                                        Continue Learning
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Available Courses Section */}
            <section className="courses-section available-courses">
                <div className="section-header">
                    <h2 className="section-title">Available Courses</h2>
                    <p className="section-subtitle">Explore new skills and knowledge</p>
                </div>

                {/* Search & Filters */}
                <div className="filters-wrapper">
                    <div className="search-box">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search courses by title or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    <div className="filters-row">
                        <div className="filter-group">
                            <label>Category</label>
                            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="filter-select">
                                <option value="All">All Categories</option>
                                {getCategories().map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Level</label>
                            <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} className="filter-select">
                                <option value="All">All Levels</option>
                                {getLevels().map(level => (
                                    <option key={level} value={level}>{level}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <Loader size={32} className="loading-spinner" />
                        <p>Loading courses...</p>
                    </div>
                ) : availableCourses.length === 0 ? (
                    <div className="empty-state">
                        <AlertCircle size={48} />
                        <h3>No Courses Found</h3>
                        <p>Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="courses-grid">
                        {availableCourses.map(course => (
                            <div className="course-card available" key={course._id}>
                                <div className={`card-badge price ${course.price === 0 ? 'free' : 'paid'}`}>
                                    {course.price === 0 ? 'FREE' : `$${course.price}`}
                                </div>
                                <div className="card-image">
                                    <img 
                                        src={course.image} 
                                        alt={course.title}
                                        onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f70d504f0?w=600&h=400&fit=crop'}
                                    />
                                </div>
                                <div className="card-content">
                                    <h3 className="card-title">{course.title}</h3>
                                    <p className="card-description">{course.description}</p>
                                    <div className="card-meta">
                                        <span className="meta-item">
                                            <BookOpen size={14} />
                                            {course.level}
                                        </span>
                                        <span className="meta-item">
                                            <Users size={14} />
                                            {course.studentsEnrolled || 0} students
                                        </span>
                                        {course.category && (
                                            <span className="meta-item category-tag">{course.category}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="card-footer">
                                    <button 
                                        className="btn btn-enroll"
                                        onClick={() => handleEnroll(course._id)}
                                        disabled={enrolling === course._id}
                                    >
                                        {enrolling === course._id ? (
                                            <>
                                                <Loader size={16} className="spin" />
                                                Enrolling...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle size={16} />
                                                Enroll Now
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default StudentCourses;

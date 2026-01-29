/**
 * InstructorDashboard.jsx
 * Main dashboard for instructors to manage courses and view analytics
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus,
    Users,
    BookOpen,
    AlertCircle,
    X,
    Trash2,
    Edit2,
    CheckSquare,
    Loader
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { coursesAPI } from '../services/api';
import './InstructorDashboard.css';

/**
 * InstructorDashboard component
 * Dashboard for instructors to create and manage courses
 */
const InstructorDashboard = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState('');
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Programming',
        level: 'Beginner',
        price: 0,
        image: 'https://images.unsplash.com/photo-1516321318423-f06f70d504f0?w=400&h=300&fit=crop'
    });

    // Fetch instructor's courses on mount
    useEffect(() => {
        fetchInstructorCourses();
    }, []);

    const fetchInstructorCourses = async () => {
        try {
            setLoading(true);
            setError(null);
            // Get all courses and filter by instructor
            const response = await coursesAPI.getAll();
            const instructorCourses = response.data.courses?.filter(
                course => course.instructor === user?.id || course.instructor?._id === user?.id
            ) || [];
            setCourses(instructorCourses);
        } catch (err) {
            console.error('Error fetching courses:', err);
            setError('Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'price' ? parseFloat(value) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');
        setSubmitSuccess('');

        // Validation
        if (!formData.title.trim()) {
            setSubmitError('Course title is required');
            return;
        }

        if (!formData.description.trim()) {
            setSubmitError('Course description is required');
            return;
        }

        try {
            let response;
            if (editingId) {
                response = await coursesAPI.update(editingId, formData);
            } else {
                response = await coursesAPI.create(formData);
            }

            if (response.data.success) {
                setSubmitSuccess(editingId ? 'Course updated successfully!' : 'Course created successfully!');
                resetForm();
                fetchInstructorCourses();
            }
        } catch (err) {
            console.error('Error saving course:', err);
            setSubmitError(err.response?.data?.message || 'Failed to save course');
        }
    };

    const handleEdit = (course) => {
        setFormData({
            title: course.title,
            description: course.description,
            category: course.category,
            level: course.level,
            price: course.price,
            image: course.image
        });
        setEditingId(course._id);
        setShowModal(true);
    };

    const handleDelete = async (courseId) => {
        if (!window.confirm('Are you sure you want to delete this course?')) return;

        try {
            await coursesAPI.delete(courseId);
            setSubmitSuccess('Course deleted successfully!');
            fetchInstructorCourses();
        } catch (err) {
            console.error('Error deleting course:', err);
            setSubmitError('Failed to delete course');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            category: 'Programming',
            level: 'Beginner',
            price: 0,
            image: 'https://images.unsplash.com/photo-1516321318423-f06f70d504f0?w=400&h=300&fit=crop'
        });
        setEditingId(null);
        setShowModal(false);
        setSubmitError('');
    };

    // Stats
    const stats = [
        {
            icon: BookOpen,
            label: 'Total Courses',
            value: courses.length.toString(),
            color: 'primary'
        },
        {
            icon: Users,
            label: 'Total Students',
            value: courses.reduce((sum, c) => sum + (c.studentsEnrolled || 0), 0).toString(),
            color: 'warning'
        },
        {
            icon: AlertCircle,
            label: 'Active Courses',
            value: courses.filter(c => c.isPublished).length.toString(),
            color: 'success'
        }
    ];

    if (loading) {
        return (
            <div className="instructor-dashboard dashboard-loading">
                <Loader size={40} className="loading-spinner" />
                <p>Loading your courses...</p>
            </div>
        );
    }

    return (
        <div className="instructor-dashboard">
            {/* Header */}
            <div className="dashboard-header">
                <div className="header-content">
                    <h1>Your Courses 📚</h1>
                    <p>Manage and track your courses</p>
                </div>
                <div className="header-actions">
                    <Link to="/instructor/create-course" className="btn btn-primary">
                        <Plus size={20} />
                        Create Course
                    </Link>
                </div>
            </div>

            {/* Messages */}
            {submitSuccess && (
                <div className="message-container message-success">
                    <AlertCircle size={20} />
                    <p>{submitSuccess}</p>
                </div>
            )}

            {error && (
                <div className="message-container message-error">
                    <AlertCircle size={20} />
                    <p>{error}</p>
                </div>
            )}

            {/* Stats Grid */}
            <div className="stats-grid">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    const isStudentsCard = stat.label === 'Total Students';
                    return (
                        <Link
                            key={index}
                            to={isStudentsCard ? '/instructor/students' : '#'}
                            className={`stat-card ${isStudentsCard ? 'stat-card-clickable' : ''}`}
                            style={{textDecoration: 'none'}}
                        >
                            <div className="stat-card-header">
                                <div className="stat-info">
                                    <div className="stat-label">{stat.label}</div>
                                    <div className="stat-value">{stat.value}</div>
                                    {stat.change && <div className="stat-change">{stat.change}</div>}
                                </div>
                                <div className="stat-icon">
                                    <Icon size={24} />
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Courses Section */}
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Your Courses ({courses.length})</h2>
                </div>

                {courses.length === 0 ? (
                    <div className="empty-state">
                        <BookOpen size={48} />
                        <p className="empty-state-title">No courses yet. Create your first course!</p>
                        <Link to="/instructor/create-course" className="btn btn-primary" style={{marginTop: '16px'}}>
                            <Plus size={18} />
                            Create Course
                        </Link>
                    </div>
                ) : (
                    <div className="courses-grid">
                        {courses.map((course) => (
                            <div key={course._id} className="course-card">
                                <img src={course.image} alt={course.title} className="course-image" onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f70d504f0?w=600&h=400&fit=crop'} />
                                <div className="course-body">
                                    <h3 className="course-title">{course.title}</h3>
                                    <p style={{fontSize: '0.85rem', color: '#718096', margin: '0', flex: 1}}>{course.description}</p>
                                    <div className="course-meta">
                                        <span className="course-meta-tag">{course.category}</span>
                                        <span className="course-meta-tag">{course.level}</span>
                                    </div>
                                    <div className="course-info">
                                        <span>{course.studentsEnrolled || 0} students</span>
                                        <span>${course.price}</span>
                                    </div>
                                </div>
                                <div className="course-footer">
                                    <button onClick={() => handleEdit(course)} className="action-btn edit">
                                        <Edit2 size={16} />
                                        Edit
                                    </button>
                                    <Link to={`/instructor/create-quiz/${course._id}`} className="action-btn quiz" style={{textDecoration: 'none', flex: 1}}>
                                        <CheckSquare size={16} />
                                        Quiz
                                    </Link>
                                    <button onClick={() => handleDelete(course._id)} className="action-btn delete">
                                        <Trash2 size={16} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="modal-overlay show">
                    <div className="modal">
                        <div className="modal-header">
                            <h2 className="modal-title">{editingId ? 'Edit Course' : 'Create New Course'}</h2>
                            <button onClick={resetForm} className="modal-close">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="modal-body">
                            {submitError && (
                                <div className="message-container message-error">
                                    <AlertCircle size={20} />
                                    <p>{submitError}</p>
                                </div>
                            )}

                            {/* Course Title */}
                            <div className="form-group">
                                <label className="form-label">Course Title</label>
                                <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Enter course title" className="form-input" />
                            </div>

                            {/* Course Description */}
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Enter course description" className="form-textarea"></textarea>
                            </div>

                            {/* Category & Level Row */}
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                                <div className="form-group">
                                    <label className="form-label">Category</label>
                                    <select name="category" value={formData.category} onChange={handleChange} className="form-select">
                                        <option value="Programming">Programming</option>
                                        <option value="Web Development">Web Development</option>
                                        <option value="Data Science">Data Science</option>
                                        <option value="Machine Learning">Machine Learning</option>
                                        <option value="Design">Design</option>
                                        <option value="Business">Business</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Level</label>
                                    <select name="level" value={formData.level} onChange={handleChange} className="form-select">
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                    </select>
                                </div>
                            </div>

                            {/* Price & Image Row */}
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                                <div className="form-group">
                                    <label className="form-label">Price ($)</label>
                                    <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="0.00" className="form-input" step="0.01" />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Image URL</label>
                                    <input type="url" name="image" value={formData.image} onChange={handleChange} placeholder="https://..." className="form-input" />
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="form-actions">
                                <button type="button" onClick={resetForm} className="btn btn-secondary">Cancel</button>
                                <button type="submit" disabled={loading} className="btn btn-primary">
                                    {loading ? 'Saving...' : editingId ? 'Update Course' : 'Create Course'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InstructorDashboard;

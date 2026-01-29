import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2, Plus, BookOpen, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { coursesAPI } from '../services/api';
import './InstructorCourses.css';

const InstructorCourses = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await coursesAPI.getAll();
            const instructorCourses = res.data.courses?.filter(c => (
                c.instructor === user?.id || c.instructor?._id === user?.id
            )) || [];
            setCourses(instructorCourses);
        } catch (err) {
            console.error(err);
            setError('Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (course) => {
        // Navigate to create course page with state for editing
        navigate('/instructor/create-course', { state: { course } });
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) return;
        try {
            setDeletingId(id);
            await coursesAPI.delete(id);
            setCourses(prev => prev.filter(c => c._id !== id));
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to delete course');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="instructor-courses-container">
            <div className="instructor-courses-header">
                <h1 className="title">Your Courses</h1>
                <div className="actions">
                    <button className="btn-primary" onClick={() => navigate('/instructor/create-course')}>
                        <Plus size={16} />
                        Create Course
                    </button>
                </div>
            </div>

            {error && (
                <div className="message message-error">
                    <AlertCircle />
                    <span>{error}</span>
                </div>
            )}

            {loading ? (
                <div className="loading">Loading...</div>
            ) : courses.length === 0 ? (
                <div className="empty">
                    <BookOpen size={48} />
                    <p>No courses found. Create your first course.</p>
                    <button className="btn-primary mt-4" onClick={() => navigate('/instructor/create-course')}>Create Course</button>
                </div>
            ) : (
                <div className="courses-grid">
                    {courses.map(course => (
                        <div className="course-card" key={course._id}>
                            <div className="card-media">
                                <img src={course.image} alt={course.title} onError={(e)=>e.target.src='https://images.unsplash.com/photo-1516321318423-f06f70d504f0?w=600&h=400&fit=crop'} />
                            </div>
                            <div className="card-body">
                                <h3 className="card-title">{course.title}</h3>
                                <p className="card-desc">{course.description}</p>
                                <div className="card-meta">
                                    <span className={`status ${course.isPublished ? 'published' : 'draft'}`}>{course.isPublished ? 'Published' : 'Draft'}</span>
                                    <span className="students">{course.studentsEnrolled || 0} students</span>
                                </div>
                                <div className="card-actions">
                                    <button className="action-btn edit" onClick={() => handleEdit(course)}>
                                        <Edit2 size={16} />
                                        Edit
                                    </button>
                                    <button className="action-btn delete" onClick={() => handleDelete(course._id)} disabled={deletingId === course._id}>
                                        <Trash2 size={16} />
                                        {deletingId === course._id ? 'Deleting...' : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InstructorCourses;

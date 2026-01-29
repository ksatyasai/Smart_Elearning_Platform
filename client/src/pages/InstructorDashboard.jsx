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
    Save,
    Trash2,
    Edit2,
    CheckSquare
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
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your courses...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Welcome back, {user?.name?.split(' ')[0]}! 👋
                        </h1>
                        <p className="text-gray-600">Manage your courses and track student progress</p>
                    </div>
                    <Link
                        to="/instructor/create-course"
                        className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                    >
                        <Plus size={20} />
                        Create Course
                    </Link>
                </div>

                {/* Success/Error Messages */}
                {submitSuccess && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-green-600" />
                        <p className="text-green-700">{submitSuccess}</p>
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-700">{error}</p>
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
                                    </div>
                                    <Icon className="w-10 h-10 text-indigo-600 bg-indigo-50 p-2 rounded-lg" />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Courses List */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Your Courses</h2>

                    {courses.length === 0 ? (
                        <div className="text-center py-12">
                            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 mb-4">No courses yet. Create your first course!</p>
                            <button
                                onClick={() => setShowModal(true)}
                                className="text-indigo-600 hover:text-indigo-700 font-semibold"
                            >
                                Create Course →
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {courses.map((course) => (
                                <div key={course._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                                    {/* Course Image */}
                                    <div className="h-40 bg-gradient-to-br from-indigo-400 to-purple-500 overflow-hidden">
                                        <img
                                            src={course.image}
                                            alt={course.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Course Content */}
                                    <div className="p-4">
                                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>

                                        {/* Course Info */}
                                        <div className="space-y-2 mb-4 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Level:</span>
                                                <span className="font-semibold text-gray-900">{course.level}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Students:</span>
                                                <span className="font-semibold text-gray-900">{course.studentsEnrolled || 0}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Price:</span>
                                                <span className="font-semibold text-gray-900">${course.price}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Status:</span>
                                                <span className={`font-semibold ${course.isPublished ? 'text-green-600' : 'text-yellow-600'}`}>
                                                    {course.isPublished ? 'Published' : 'Draft'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(course)}
                                                className="flex-1 flex items-center justify-center gap-2 bg-indigo-50 text-indigo-600 py-2 rounded hover:bg-indigo-100 transition-colors"
                                            >
                                                <Edit2 size={16} />
                                                Edit
                                            </button>
                                            <Link
                                                to={`/instructor/create-quiz/${course._id}`}
                                                className="flex-1 flex items-center justify-center gap-2 bg-green-50 text-green-600 py-2 rounded hover:bg-green-100 transition-colors"
                                            >
                                                <CheckSquare size={16} />
                                                Quiz
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(course._id)}
                                                className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 py-2 rounded hover:bg-red-100 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Create/Edit Course Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 flex items-center justify-between p-6 border-b bg-white">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {editingId ? 'Edit Course' : 'Create New Course'}
                            </h2>
                            <button
                                onClick={resetForm}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {submitError && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-red-700">{submitError}</p>
                                </div>
                            )}

                            {/* Course Title */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Course Title *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g., Advanced Python Programming"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Description *
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Describe what students will learn..."
                                    rows="4"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                />
                            </div>

                            {/* Category and Level */}
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Category
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                    >
                                        <option>Programming</option>
                                        <option>Design</option>
                                        <option>Business</option>
                                        <option>Data Science</option>
                                        <option>Web Development</option>
                                        <option>Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Level
                                    </label>
                                    <select
                                        name="level"
                                        value={formData.level}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                    >
                                        <option>Beginner</option>
                                        <option>Intermediate</option>
                                        <option>Advanced</option>
                                    </select>
                                </div>
                            </div>

                            {/* Price and Image */}
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Price ($)
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.01"
                                        placeholder="0"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Image URL
                                    </label>
                                    <input
                                        type="url"
                                        name="image"
                                        value={formData.image}
                                        onChange={handleChange}
                                        placeholder="https://..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                    />
                                </div>
                            </div>

                            {/* Preview */}
                            {formData.image && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Preview</label>
                                    <img
                                        src={formData.image}
                                        alt="Preview"
                                        className="w-full h-40 object-cover rounded-lg"
                                        onError={(e) => {
                                            e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f70d504f0?w=400&h=300&fit=crop';
                                        }}
                                    />
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex gap-3 sticky bottom-0 bg-white pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors py-3"
                                >
                                    <Save size={20} />
                                    {editingId ? 'Update Course' : 'Create Course'}
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

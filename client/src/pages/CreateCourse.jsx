/**
 * CreateCourse.jsx
 * Dedicated page for instructors to create and upload new courses
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Upload,
    BookOpen,
    FileText,
    Tag,
    DollarSign,
    Image,
    Save,
    ArrowLeft,
    AlertCircle,
    CheckCircle,
    Loader
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { coursesAPI } from '../services/api';
import './Course.css';

/**
 * CreateCourse component
 * Full-featured course creation form with backend integration
 */
const CreateCourse = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Programming',
        level: 'Beginner',
        price: 0,
        image: 'https://images.unsplash.com/photo-1516321318423-f06f70d504f0?w=600&h=400&fit=crop',
        isPublished: false
    });

    const [imagePreview, setImagePreview] = useState(formData.image);

    const categories = [
        'Programming',
        'Web Development',
        'Data Science',
        'Machine Learning',
        'Design',
        'Business',
        'Marketing',
        'Photography',
        'Video Editing',
        'Music',
        'Other'
    ];

    const levels = ['Beginner', 'Intermediate', 'Advanced'];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (name === 'price' ? parseFloat(value) : value)
        }));
    };

    const handleImageChange = (e) => {
        const { value } = e.target;
        setFormData(prev => ({ ...prev, image: value }));
        setImagePreview(value);
    };

    const validateForm = () => {
        setError('');

        if (!formData.title.trim()) {
            setError('Course title is required');
            return false;
        }

        if (formData.title.trim().length < 5) {
            setError('Course title must be at least 5 characters');
            return false;
        }

        if (!formData.description.trim()) {
            setError('Course description is required');
            return false;
        }

        if (formData.description.trim().length < 20) {
            setError('Description must be at least 20 characters');
            return false;
        }

        if (!formData.category) {
            setError('Please select a category');
            return false;
        }

        if (!formData.level) {
            setError('Please select a level');
            return false;
        }

        if (formData.price < 0) {
            setError('Price cannot be negative');
            return false;
        }

        if (!formData.image.trim()) {
            setError('Image URL is required');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setLoading(true);
            setError('');
            setSuccess('');

            const courseData = {
                ...formData,
                instructor: user?.id
            };

            const response = await coursesAPI.create(courseData);

            if (response.data.success) {
                setSuccess('✓ Course created successfully!');
                setTimeout(() => {
                    navigate('/instructor', { state: { courseCreated: true } });
                }, 2000);
            }
        } catch (err) {
            console.error('Error creating course:', err);
            setError(err.response?.data?.message || 'Failed to create course. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDraft = async () => {
        if (!validateForm()) return;

        try {
            setLoading(true);
            setError('');

            const courseData = {
                ...formData,
                isPublished: false,
                instructor: user?.id
            };

            const response = await coursesAPI.create(courseData);

            if (response.data.success) {
                setSuccess('✓ Course saved as draft!');
                setTimeout(() => {
                    navigate('/instructor');
                }, 2000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save draft');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/instructor')}
                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-6 font-semibold"
                    >
                        <ArrowLeft size={20} />
                        Back to Dashboard
                    </button>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Create a New Course</h1>
                    <p className="text-gray-600">Share your knowledge with students around the world</p>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                        <p className="text-green-700 font-semibold">{success}</p>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-red-900">Error</h3>
                            <p className="text-red-700">{error}</p>
                        </div>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8 space-y-8">
                    {/* Course Title */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                            <BookOpen size={18} className="text-indigo-600" />
                            Course Title *
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g., Advanced Python Programming for Data Science"
                            maxLength="100"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                        />
                        <p className="text-xs text-gray-500 mt-1">{formData.title.length}/100 characters</p>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                            <FileText size={18} className="text-indigo-600" />
                            Description *
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe what students will learn, the course structure, prerequisites, and target audience..."
                            maxLength="1000"
                            rows="6"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">{formData.description.length}/1000 characters</p>
                    </div>

                    {/* Category and Level Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Category */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                <Tag size={18} className="text-indigo-600" />
                                Category *
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                            >
                                <option value="">Select a category</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Level */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                <AlertCircle size={18} className="text-indigo-600" />
                                Level *
                            </label>
                            <select
                                name="level"
                                value={formData.level}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                            >
                                {levels.map(level => (
                                    <option key={level} value={level}>{level}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Price */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                            <DollarSign size={18} className="text-indigo-600" />
                            Price ($)
                        </label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Set to $0 for free courses
                        </p>
                    </div>

                    {/* Image URL */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                            <Image size={18} className="text-indigo-600" />
                            Course Image URL *
                        </label>
                        <input
                            type="url"
                            name="image"
                            value={formData.image}
                            onChange={handleImageChange}
                            placeholder="https://images.unsplash.com/photo-..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Use a high-quality image (recommended: 16:9 aspect ratio)
                        </p>
                    </div>

                    {/* Image Preview */}
                    {imagePreview && (
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-3 block">Image Preview</label>
                            <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                                <img
                                    src={imagePreview}
                                    alt="Course preview"
                                    className="w-full h-64 object-cover"
                                    onError={(e) => {
                                        e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f70d504f0?w=600&h=400&fit=crop';
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Publish Checkbox */}
                    <div>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                name="isPublished"
                                checked={formData.isPublished}
                                onChange={handleChange}
                                className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-600"
                            />
                            <span className="text-sm font-semibold text-gray-700">
                                Publish course immediately
                            </span>
                        </label>
                        <p className="text-xs text-gray-500 mt-2 ml-8">
                            If unchecked, the course will be saved as a draft and you can publish it later
                        </p>
                    </div>

                    {/* Course Info Summary */}
                    <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                        <h3 className="font-semibold text-indigo-900 mb-3">Course Summary</h3>
                        <div className="space-y-2 text-sm text-indigo-800">
                            <p><strong>Title:</strong> {formData.title || 'Not provided'}</p>
                            <p><strong>Category:</strong> {formData.category}</p>
                            <p><strong>Level:</strong> {formData.level}</p>
                            <p><strong>Price:</strong> ${formData.price.toFixed(2)}</p>
                            <p><strong>Status:</strong> {formData.isPublished ? '✓ Published' : 'Draft'}</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-6 border-t">
                        <button
                            type="button"
                            onClick={() => navigate('/instructor')}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={handleDraft}
                            disabled={loading}
                            className="flex-1 px-6 py-3 border border-indigo-300 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save as Draft'}
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 py-3"
                        >
                            {loading ? (
                                <>
                                    <Loader size={20} className="animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Save size={20} />
                                    Create Course
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Help Section */}
                <div className="mt-12 bg-blue-50 rounded-xl p-8 border border-blue-200">
                    <h3 className="text-lg font-bold text-blue-900 mb-4">Tips for Creating a Great Course</h3>
                    <ul className="space-y-3 text-blue-800">
                        <li className="flex gap-3">
                            <span className="text-xl">✓</span>
                            <span><strong>Compelling Title:</strong> Make it clear and engaging. Include keywords that help students find your course.</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-xl">✓</span>
                            <span><strong>Detailed Description:</strong> Clearly explain what students will learn and who the course is for.</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-xl">✓</span>
                            <span><strong>Quality Image:</strong> Use a professional, clear image that represents your course well.</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-xl">✓</span>
                            <span><strong>Right Pricing:</strong> Consider market rates and the value you're providing.</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-xl">✓</span>
                            <span><strong>Start as Draft:</strong> You can save as draft and add lessons, quizzes, and content later.</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CreateCourse;

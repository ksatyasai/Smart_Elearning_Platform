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
import './CreateCourse.css';

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
        <div className="create-course-container">
            <div className="create-course-wrapper">
                {/* Header */}
                <div className="course-header-section">
                    <button
                        onClick={() => navigate('/instructor')}
                        className="back-button"
                    >
                        <ArrowLeft size={20} />
                        Back to Dashboard
                    </button>
                    <h1 className="course-page-title">Create a New Course</h1>
                    <p className="course-page-subtitle">Share your knowledge with students around the world</p>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="message-container">
                        <div className="message-box message-success">
                            <CheckCircle className="message-icon" />
                            <p>{success}</p>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="message-container">
                        <div className="message-box message-error">
                            <AlertCircle className="message-icon" />
                            <div>
                                <h3>Error</h3>
                                <p>{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="course-form-container">
                    {/* Course Title */}
                    <div className="form-group">
                        <label className="form-label">
                            <BookOpen className="form-label-icon" />
                            Course Title <span className="required-indicator">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g., Advanced Python Programming for Data Science"
                            maxLength="100"
                            className="form-input"
                        />
                        <div className="character-count">{formData.title.length}/100 characters</div>
                    </div>

                    {/* Description */}
                    <div className="form-group">
                        <label className="form-label">
                            <FileText className="form-label-icon" />
                            Description <span className="required-indicator">*</span>
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe what students will learn, the course structure, prerequisites, and target audience..."
                            maxLength="1000"
                            className="form-textarea"
                        />
                        <div className="character-count">{formData.description.length}/1000 characters</div>
                    </div>

                    {/* Category and Level Row */}
                    <div className="form-row">
                        {/* Category */}
                        <div className="form-group">
                            <label className="form-label">
                                <Tag className="form-label-icon" />
                                Category <span className="required-indicator">*</span>
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="form-select"
                            >
                                <option value="">Select a category</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Level */}
                        <div className="form-group">
                            <label className="form-label">
                                <AlertCircle className="form-label-icon" />
                                Level <span className="required-indicator">*</span>
                            </label>
                            <select
                                name="level"
                                value={formData.level}
                                onChange={handleChange}
                                className="form-select"
                            >
                                {levels.map(level => (
                                    <option key={level} value={level}>{level}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Price */}
                    <div className="form-group">
                        <label className="form-label">
                            <DollarSign className="form-label-icon" />
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
                            className="form-input"
                        />
                        <p className="form-hint">Set to $0 for free courses</p>
                    </div>

                    {/* Image URL */}
                    <div className="form-group">
                        <label className="form-label">
                            <Image className="form-label-icon" />
                            Course Image URL <span className="required-indicator">*</span>
                        </label>
                        <input
                            type="url"
                            name="image"
                            value={formData.image}
                            onChange={handleImageChange}
                            placeholder="https://images.unsplash.com/photo-..."
                            className="form-input"
                        />
                        <p className="form-hint">Use a high-quality image (recommended: 16:9 aspect ratio)</p>
                    </div>

                    {/* Image Preview */}
                    {imagePreview && (
                        <div className="image-preview-section">
                            <label className="image-preview-label">Image Preview</label>
                            <div className="image-preview-container">
                                <img
                                    src={imagePreview}
                                    alt="Course preview"
                                    className="image-preview"
                                    onError={(e) => {
                                        e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f70d504f0?w=600&h=400&fit=crop';
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Publish Checkbox */}
                    <div className="form-group">
                        <label className="checkbox-wrapper">
                            <input
                                type="checkbox"
                                name="isPublished"
                                checked={formData.isPublished}
                                onChange={handleChange}
                                className="checkbox-input"
                            />
                            <span className="checkbox-label">Publish course immediately</span>
                        </label>
                        <p className="checkbox-hint">
                            If unchecked, the course will be saved as a draft and you can publish it later
                        </p>
                    </div>

                    {/* Course Info Summary */}
                    <div className="summary-box">
                        <h3 className="summary-title">Course Summary</h3>
                        <div className="summary-content">
                            <div className="summary-item">
                                <span className="summary-item-label">Title:</span>
                                <span>{formData.title || 'Not provided'}</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-item-label">Category:</span>
                                <span>{formData.category}</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-item-label">Level:</span>
                                <span>{formData.level}</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-item-label">Price:</span>
                                <span>${formData.price.toFixed(2)}</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-item-label">Status:</span>
                                <span className={formData.isPublished ? 'summary-item-value published' : 'summary-item-value draft'}>
                                    {formData.isPublished ? '✓ Published' : 'Draft'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={() => navigate('/instructor')}
                            className="btn btn-cancel"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={handleDraft}
                            disabled={loading}
                            className="btn btn-draft"
                        >
                            {loading ? 'Saving...' : 'Save as Draft'}
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary"
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
                <div className="help-section">
                    <h3 className="help-title">Tips for Creating a Great Course</h3>
                    <ul className="help-list">
                        <li className="help-item">
                            <span className="help-check">✓</span>
                            <span className="help-content">
                                <strong>Compelling Title:</strong> Make it clear and engaging. Include keywords that help students find your course.
                            </span>
                        </li>
                        <li className="help-item">
                            <span className="help-check">✓</span>
                            <span className="help-content">
                                <strong>Detailed Description:</strong> Clearly explain what students will learn and who the course is for.
                            </span>
                        </li>
                        <li className="help-item">
                            <span className="help-check">✓</span>
                            <span className="help-content">
                                <strong>Quality Image:</strong> Use a professional, clear image that represents your course well.
                            </span>
                        </li>
                        <li className="help-item">
                            <span className="help-check">✓</span>
                            <span className="help-content">
                                <strong>Right Pricing:</strong> Consider market rates and the value you're providing.
                            </span>
                        </li>
                        <li className="help-item">
                            <span className="help-check">✓</span>
                            <span className="help-content">
                                <strong>Start as Draft:</strong> You can save as draft and add lessons, quizzes, and content later.
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CreateCourse;

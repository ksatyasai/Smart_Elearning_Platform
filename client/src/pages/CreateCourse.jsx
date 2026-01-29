/**
 * CreateCourse.jsx
 * Dedicated page for instructors to create and upload new courses
 * Enhanced with module and lesson management (including YouTube videos)
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
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
    Loader,
    Plus,
    X,
    ChevronDown,
    ChevronUp,
    Youtube,
    Trash2,
    Video
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { coursesAPI } from '../services/api';
import './CreateCourse.css';

/**
 * CreateCourse component
 * Full-featured course creation form with module/lesson management
 */
const CreateCourse = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const location = useLocation();
    const [editingId, setEditingId] = useState(null);
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Programming',
        level: 'Beginner',
        price: 0,
        image: 'https://images.unsplash.com/photo-1516321318423-f06f70d504f0?w=600&h=400&fit=crop',
        isPublished: false,
        modules: []
    });

    const [imagePreview, setImagePreview] = useState(formData.image);
    const [expandedModuleIndex, setExpandedModuleIndex] = useState(-1);

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

    // Module Management
    const addModule = () => {
        setFormData(prev => ({
            ...prev,
            modules: [...prev.modules, {
                title: '',
                description: '',
                order: prev.modules.length,
                lessons: [],
                isPublished: true
            }]
        }));
    };

    const removeModule = (index) => {
        setFormData(prev => ({
            ...prev,
            modules: prev.modules.filter((_, i) => i !== index)
        }));
    };

    const updateModule = (index, field, value) => {
        setFormData(prev => {
            const newModules = [...prev.modules];
            newModules[index] = { ...newModules[index], [field]: value };
            return { ...prev, modules: newModules };
        });
    };

    const addLessonToModule = (moduleIndex) => {
        setFormData(prev => {
            const newModules = [...prev.modules];
            if (!newModules[moduleIndex].lessons) {
                newModules[moduleIndex].lessons = [];
            }
            newModules[moduleIndex].lessons.push({
                title: '',
                description: '',
                youtubeUrl: '',
                duration: 0,
                order: newModules[moduleIndex].lessons.length,
                isPublished: true
            });
            return { ...prev, modules: newModules };
        });
    };

    const removeLessonFromModule = (moduleIndex, lessonIndex) => {
        setFormData(prev => {
            const newModules = [...prev.modules];
            newModules[moduleIndex].lessons = newModules[moduleIndex].lessons.filter((_, i) => i !== lessonIndex);
            return { ...prev, modules: newModules };
        });
    };

    const updateLesson = (moduleIndex, lessonIndex, field, value) => {
        setFormData(prev => {
            const newModules = [...prev.modules];
            newModules[moduleIndex].lessons[lessonIndex] = {
                ...newModules[moduleIndex].lessons[lessonIndex],
                [field]: value
            };
            return { ...prev, modules: newModules };
        });
    };

    useEffect(() => {
        const course = location.state?.course;
        if (course) {
            setEditingId(course._id || course.id || null);
            setFormData(prev => ({
                ...prev,
                title: course.title || '',
                description: course.description || '',
                category: course.category || prev.category,
                level: course.level || prev.level,
                price: typeof course.price === 'number' ? course.price : prev.price,
                image: course.image || prev.image,
                isPublished: !!course.isPublished,
                modules: course.modules || []
            }));
            setImagePreview(course.image || imagePreview);
        }
    }, [location]);

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

        // Validate modules if any
        for (let i = 0; i < formData.modules.length; i++) {
            const module = formData.modules[i];
            if (!module.title.trim()) {
                setError(`Module ${i + 1}: Title is required`);
                return false;
            }
            if (module.lessons && module.lessons.length > 0) {
                for (let j = 0; j < module.lessons.length; j++) {
                    const lesson = module.lessons[j];
                    if (!lesson.title.trim()) {
                        setError(`Module ${i + 1}, Lesson ${j + 1}: Title is required`);
                        return false;
                    }
                    if (!lesson.youtubeUrl.trim()) {
                        setError(`Module ${i + 1}, Lesson ${j + 1}: YouTube URL is required`);
                        return false;
                    }
                }
            }
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

            let response;
            if (editingId) {
                response = await coursesAPI.update(editingId, courseData);
            } else {
                response = await coursesAPI.create(courseData);
            }

            if (response.data.success) {
                setSuccess(editingId ? '✓ Course updated successfully!' : '✓ Course created successfully!');
                setTimeout(() => {
                    navigate('/instructor', { state: { courseCreated: true } });
                }, 1200);
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

            let response;
            if (editingId) {
                response = await coursesAPI.update(editingId, courseData);
            } else {
                response = await coursesAPI.create(courseData);
            }

            if (response.data.success) {
                setSuccess('✓ Course saved as draft!');
                setTimeout(() => {
                    navigate('/instructor');
                }, 1200);
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

                    {/* Modules Section */}
                    <div className="modules-section">
                        <div className="modules-header">
                            <div className="modules-title-group">
                                <BookOpen size={28} className="modules-icon" />
                                <div>
                                    <h2 className="modules-title">Course Modules & Lessons</h2>
                                    <p className="modules-subtitle">Organize your course content into modules</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={addModule}
                                className="btn btn-add-module"
                            >
                                <Plus size={18} />
                                Add Module
                            </button>
                        </div>

                        {formData.modules.length === 0 ? (
                            <div className="empty-modules">
                                <div className="empty-modules-content">
                                    <BookOpen size={48} />
                                    <h3>No modules yet</h3>
                                    <p>Click "Add Module" to start building your course structure</p>
                                </div>
                            </div>
                        ) : (
                            <div className="modules-list">
                                {formData.modules.map((module, moduleIndex) => (
                                    <div key={moduleIndex} className={`module-card ${expandedModuleIndex === moduleIndex ? 'expanded' : ''}`}>
                                        <div className="module-header-row">
                                            <div className="module-counter">
                                                <span>{moduleIndex + 1}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setExpandedModuleIndex(expandedModuleIndex === moduleIndex ? -1 : moduleIndex)}
                                                className="module-toggle"
                                                title={expandedModuleIndex === moduleIndex ? 'Collapse module' : 'Expand module'}
                                            >
                                                {expandedModuleIndex === moduleIndex ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
                                            </button>
                                            <div className="module-title-wrapper">
                                                <label className="module-title-label">Title <span className="required-indicator">*</span></label>
                                                <input
                                                    type="text"
                                                    value={module.title}
                                                    onChange={(e) => updateModule(moduleIndex, 'title', e.target.value)}
                                                    placeholder="Enter module title (e.g., Introduction to Python)"
                                                    className="module-title-input"
                                                />
                                            </div>
                                            <div className="module-badge">
                                                {module.lessons?.length || 0} lessons
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeModule(moduleIndex)}
                                                className="btn-remove-module"
                                                title="Delete module"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>

                                        {expandedModuleIndex === moduleIndex && (
                                            <div className="module-content">
                                                <div className="form-group">
                                                    <label className="module-label">Module Title <span className="required-indicator">*</span></label>
                                                    <input
                                                        type="text"
                                                        value={module.title}
                                                        onChange={(e) => updateModule(moduleIndex, 'title', e.target.value)}
                                                        placeholder="Enter module title"
                                                        className="form-input"
                                                    />
                                                </div>
                                                <div className="module-description-group">
                                                    <label className="module-label">Module Description (Optional)</label>
                                                    <textarea
                                                        value={module.description}
                                                        onChange={(e) => updateModule(moduleIndex, 'description', e.target.value)}
                                                        placeholder="Describe what students will learn in this module..."
                                                        className="module-description-input"
                                                    />
                                                </div>

                                                {/* Lessons */}
                                                <div className="lessons-section">
                                                    <div className="lessons-header">
                                                        <h3>Lessons</h3>
                                                        <button
                                                            type="button"
                                                            onClick={() => addLessonToModule(moduleIndex)}
                                                            className="btn btn-add-lesson"
                                                        >
                                                            <Plus size={16} />
                                                            Add Lesson
                                                        </button>
                                                    </div>

                                                    {module.lessons && module.lessons.length > 0 ? (
                                                        <div className="lessons-list">
                                                            {module.lessons.map((lesson, lessonIndex) => (
                                                                <div key={lessonIndex} className="lesson-item">
                                                                    <div className="lesson-header">
                                                                        <span className="lesson-number">{lessonIndex + 1}</span>
                                                                        <input
                                                                            type="text"
                                                                            value={lesson.title}
                                                                            onChange={(e) => updateLesson(moduleIndex, lessonIndex, 'title', e.target.value)}
                                                                            placeholder="Lesson title"
                                                                            className="lesson-title-input"
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeLessonFromModule(moduleIndex, lessonIndex)}
                                                                            className="btn-remove-lesson"
                                                                        >
                                                                            <X size={18} />
                                                                        </button>
                                                                    </div>

                                                                    <textarea
                                                                        value={lesson.description}
                                                                        onChange={(e) => updateLesson(moduleIndex, lessonIndex, 'description', e.target.value)}
                                                                        placeholder="Lesson description (optional)"
                                                                        className="lesson-description-input"
                                                                        rows="2"
                                                                    />

                                                                    <div className="lesson-inputs-row">
                                                                        <div className="youtube-input-group">
                                                                            <Youtube size={18} className="youtube-icon" />
                                                                            <input
                                                                                type="url"
                                                                                value={lesson.youtubeUrl}
                                                                                onChange={(e) => updateLesson(moduleIndex, lessonIndex, 'youtubeUrl', e.target.value)}
                                                                                placeholder="Paste YouTube URL (e.g., https://www.youtube.com/watch?v=ABC123)"
                                                                                className="youtube-url-input"
                                                                            />
                                                                        </div>

                                                                        <input
                                                                            type="number"
                                                                            value={lesson.duration}
                                                                            onChange={(e) => updateLesson(moduleIndex, lessonIndex, 'duration', parseInt(e.target.value) || 0)}
                                                                            placeholder="Minutes"
                                                                            className="lesson-duration-input"
                                                                            min="0"
                                                                            max="600"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="empty-lessons">
                                                            <Video size={32} />
                                                            <p>No lessons yet. Click "Add Lesson" to add content.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

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
                            If unchecked, the course will be saved as a draft
                        </p>
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
            </div>
        </div>
    );
};

export default CreateCourse;

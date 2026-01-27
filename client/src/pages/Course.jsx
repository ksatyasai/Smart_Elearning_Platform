/**
 * Course.jsx
 * Individual course view page with modules and content
 */
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Play,
    Clock,
    Users,
    Star,
    BookOpen,
    CheckCircle,
    ChevronDown,
    ChevronRight,
    FileText,
    Video,
    Download,
    Lock
} from 'lucide-react';
import './Course.css';

/**
 * Course component
 * Displays course details, modules, and learning content
 */
const Course = () => {
    const { id } = useParams();
    const [expandedModule, setExpandedModule] = useState(0);

    // Mock course data
    const course = {
        id: id || 1,
        title: 'Advanced Machine Learning',
        description: 'Master the fundamentals of machine learning with hands-on projects. Learn neural networks, deep learning, and practical AI applications.',
        instructor: {
            name: 'Dr. Sarah Chen',
            avatar: null,
            title: 'AI Research Lead'
        },
        rating: 4.8,
        reviews: 2354,
        students: 12840,
        duration: '32 hours',
        lessons: 48,
        level: 'Advanced',
        lastUpdated: 'December 2024',
        progress: 65,
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop'
    };

    // Mock modules data
    const modules = [
        {
            id: 1,
            title: 'Introduction to Machine Learning',
            duration: '2h 30m',
            lessons: [
                { id: 1, title: 'What is Machine Learning?', type: 'video', duration: '15:00', completed: true },
                { id: 2, title: 'Types of Machine Learning', type: 'video', duration: '18:00', completed: true },
                { id: 3, title: 'Setting Up Your Environment', type: 'video', duration: '22:00', completed: true },
                { id: 4, title: 'Module Quiz', type: 'quiz', questions: 10, completed: true }
            ],
            completed: true
        },
        {
            id: 2,
            title: 'Supervised Learning Fundamentals',
            duration: '4h 15m',
            lessons: [
                { id: 5, title: 'Linear Regression', type: 'video', duration: '25:00', completed: true },
                { id: 6, title: 'Logistic Regression', type: 'video', duration: '28:00', completed: true },
                { id: 7, title: 'Decision Trees', type: 'video', duration: '32:00', completed: false },
                { id: 8, title: 'Practice Exercise', type: 'document', pages: 5, completed: false },
                { id: 9, title: 'Module Quiz', type: 'quiz', questions: 15, completed: false }
            ],
            completed: false
        },
        {
            id: 3,
            title: 'Neural Networks',
            duration: '5h 45m',
            lessons: [
                { id: 10, title: 'Introduction to Neural Networks', type: 'video', duration: '30:00', completed: false },
                { id: 11, title: 'Backpropagation', type: 'video', duration: '35:00', completed: false },
                { id: 12, title: 'Activation Functions', type: 'video', duration: '25:00', completed: false },
                { id: 13, title: 'Hands-on Project', type: 'document', pages: 12, completed: false }
            ],
            completed: false,
            locked: true
        }
    ];

    const toggleModule = (index) => {
        setExpandedModule(expandedModule === index ? -1 : index);
    };

    const getLessonIcon = (type) => {
        switch (type) {
            case 'video': return Video;
            case 'quiz': return FileText;
            case 'document': return FileText;
            default: return BookOpen;
        }
    };

    return (
        <div className="course-page">
            {/* Course Header */}
            <div className="course-header">
                <div className="course-header-content">
                    <div className="course-breadcrumb">
                        <Link to="/courses">Courses</Link>
                        <ChevronRight size={14} />
                        <span>{course.title}</span>
                    </div>

                    <h1 className="course-title">{course.title}</h1>
                    <p className="course-description">{course.description}</p>

                    <div className="course-meta">
                        <div className="meta-item">
                            <Star size={16} className="meta-icon star" />
                            <span>{course.rating}</span>
                            <span className="meta-secondary">({course.reviews} reviews)</span>
                        </div>
                        <div className="meta-item">
                            <Users size={16} className="meta-icon" />
                            <span>{course.students.toLocaleString()} students</span>
                        </div>
                        <div className="meta-item">
                            <Clock size={16} className="meta-icon" />
                            <span>{course.duration}</span>
                        </div>
                    </div>

                    <div className="course-instructor">
                        <div className="instructor-avatar">
                            {course.instructor.avatar ? (
                                <img src={course.instructor.avatar} alt={course.instructor.name} />
                            ) : (
                                <span>{course.instructor.name.charAt(0)}</span>
                            )}
                        </div>
                        <div className="instructor-info">
                            <span className="instructor-name">{course.instructor.name}</span>
                            <span className="instructor-title">{course.instructor.title}</span>
                        </div>
                    </div>
                </div>

                <div className="course-header-image">
                    <img src={course.image} alt={course.title} />
                    <button className="play-preview">
                        <Play size={32} fill="white" />
                    </button>
                </div>
            </div>

            {/* Course Progress */}
            <div className="course-progress-section">
                <div className="progress-header">
                    <h3>Your Progress</h3>
                    <span className="progress-percentage">{course.progress}% Complete</span>
                </div>
                <div className="progress-bar-large">
                    <div
                        className="progress-fill"
                        style={{ width: `${course.progress}%` }}
                    />
                </div>
                <button className="continue-btn">
                    <Play size={18} fill="currentColor" />
                    Continue Learning
                </button>
            </div>

            {/* Course Content */}
            <div className="course-content">
                <div className="content-header">
                    <h2>Course Content</h2>
                    <span className="content-stats">
                        {modules.length} modules • {course.lessons} lessons • {course.duration} total
                    </span>
                </div>

                <div className="modules-list">
                    {modules.map((module, index) => (
                        <div
                            key={module.id}
                            className={`module-item ${module.locked ? 'locked' : ''} ${module.completed ? 'completed' : ''}`}
                        >
                            <button
                                className="module-header"
                                onClick={() => !module.locked && toggleModule(index)}
                                disabled={module.locked}
                            >
                                <div className="module-status">
                                    {module.completed ? (
                                        <CheckCircle size={20} className="status-completed" />
                                    ) : module.locked ? (
                                        <Lock size={20} className="status-locked" />
                                    ) : (
                                        <div className="status-number">{index + 1}</div>
                                    )}
                                </div>
                                <div className="module-info">
                                    <span className="module-title">{module.title}</span>
                                    <span className="module-meta">
                                        {module.lessons.length} lessons • {module.duration}
                                    </span>
                                </div>
                                {!module.locked && (
                                    <ChevronDown
                                        size={20}
                                        className={`module-chevron ${expandedModule === index ? 'expanded' : ''}`}
                                    />
                                )}
                            </button>

                            {expandedModule === index && !module.locked && (
                                <div className="lessons-list">
                                    {module.lessons.map((lesson) => {
                                        const LessonIcon = getLessonIcon(lesson.type);
                                        return (
                                            <Link
                                                key={lesson.id}
                                                to={`/course/${course.id}/lesson/${lesson.id}`}
                                                className={`lesson-item ${lesson.completed ? 'completed' : ''}`}
                                            >
                                                <div className="lesson-icon">
                                                    <LessonIcon size={16} />
                                                </div>
                                                <span className="lesson-title">{lesson.title}</span>
                                                <span className="lesson-duration">
                                                    {lesson.duration || `${lesson.questions} questions` || `${lesson.pages} pages`}
                                                </span>
                                                {lesson.completed && (
                                                    <CheckCircle size={16} className="lesson-check" />
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Course;

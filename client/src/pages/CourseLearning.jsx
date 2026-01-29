/**
 * CourseLearning.jsx
 * Dynamic course learning view showing modules, lessons, and conditional quizzes
 * Displays YouTube videos from lessons and tracks progress
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    Lock,
    AlertCircle,
    CheckSquare,
    Loader,
    ArrowLeft,
    LogIn,
    X
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { coursesAPI, quizzesAPI } from '../services/api';
import './Course.css';

/**
 * CourseLearning component - Dynamic course view with modules and conditional quizzes
 */
const CourseLearning = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [course, setCourse] = useState(null);
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [enrolled, setEnrolled] = useState(false);
    const [enrolling, setEnrolling] = useState(false);
    const [enrollError, setEnrollError] = useState('');
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [expandedModuleIndex, setExpandedModuleIndex] = useState(0);

    useEffect(() => {
        fetchCourseData();
    }, [id]);

    const fetchCourseData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get course details
            const courseRes = await coursesAPI.getById(id);
            setCourse(courseRes.data.course);

            // Check if user is enrolled
            try {
                const enrolledRes = await coursesAPI.getEnrolled();
                const isEnrolled = enrolledRes.data.courses?.some(c => c._id === id);
                setEnrolled(isEnrolled);

                // Get quizzes if enrolled
                if (isEnrolled && courseRes.data.course?.quizzes?.length > 0) {
                    const quizzesRes = await quizzesAPI.getByCourse(id);
                    setQuizzes(quizzesRes.data.quizzes || []);
                }

                // Set first lesson as default if enrolled
                if (isEnrolled && courseRes.data.course?.modules?.length > 0) {
                    const firstModule = courseRes.data.course.modules[0];
                    if (firstModule.lessons && firstModule.lessons.length > 0) {
                        setSelectedLesson(firstModule.lessons[0]);
                    }
                }
            } catch (err) {
                console.log('Error checking enrollment:', err);
                setEnrolled(false);
            }
        } catch (err) {
            console.error('Error fetching course:', err);
            setError('Failed to load course details');
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async () => {
        try {
            setEnrolling(true);
            setEnrollError('');
            const response = await coursesAPI.enroll(id);
            
            if (response.data.success) {
                setEnrolled(true);
                // Set first lesson
                if (course?.modules?.length > 0) {
                    const firstModule = course.modules[0];
                    if (firstModule.lessons && firstModule.lessons.length > 0) {
                        setSelectedLesson(firstModule.lessons[0]);
                    }
                }
                // Fetch quizzes if available
                if (course?.quizzes?.length > 0) {
                    const quizzesRes = await quizzesAPI.getByCourse(id);
                    setQuizzes(quizzesRes.data.quizzes || []);
                }
            }
        } catch (err) {
            console.error('Error enrolling:', err);
            setEnrollError(err.response?.data?.message || 'Failed to enroll. Please try again.');
        } finally {
            setEnrolling(false);
        }
    };

    const handleSelectLesson = (lesson) => {
        setSelectedLesson(lesson);
    };

    const handleStartQuiz = (quiz) => {
        navigate(`/quiz/${quiz._id}`);
    };

    const extractYoutubeEmbedUrl = (url) => {
        if (!url) return '';
        // Convert watch URL to embed URL
        const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(youtubeRegex);
        if (match) {
            return `https://www.youtube.com/embed/${match[1]}`;
        }
        return url;
    };

    if (loading) {
        return (
            <div className="course-loading">
                <Loader className="spinner" size={48} />
                <p>Loading course details...</p>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="course-error">
                <AlertCircle size={48} />
                <p>{error || 'Course not found'}</p>
                <button onClick={() => navigate(-1)} className="btn-back">
                    <ArrowLeft size={20} /> Go Back
                </button>
            </div>
        );
    }

    const hasModules = course.modules && course.modules.length > 0;
    const totalLessons = hasModules 
        ? course.modules.reduce((sum, mod) => sum + (mod.lessons?.length || 0), 0)
        : 0;

    return (
        <div className="course-learning-page">
            {/* Course Header */}
            <div className="course-header">
                <div className="course-header-content">
                    <h1 className="course-title">{course.title}</h1>
                    <p className="course-description">{course.description}</p>

                    <div className="course-meta">
                        <div className="meta-item">
                            <Star size={16} className="meta-icon star" />
                            <span>{course.rating || 4.5}</span>
                        </div>
                        <div className="meta-item">
                            <Users size={16} className="meta-icon" />
                            <span>{course.studentsEnrolled || 0} students</span>
                        </div>
                        <div className="meta-item">
                            <BookOpen size={16} className="meta-icon" />
                            <span>{totalLessons} lessons</span>
                        </div>
                    </div>

                    {!enrolled && (
                        <div className="enrollment-section">
                            {enrollError && (
                                <div className="enrollment-error">
                                    <AlertCircle size={18} />
                                    <span>{enrollError}</span>
                                </div>
                            )}
                            <button 
                                className="enroll-btn"
                                onClick={handleEnroll}
                                disabled={enrolling}
                            >
                                {enrolling ? (
                                    <>
                                        <Loader size={20} className="spinner-small" />
                                        Enrolling...
                                    </>
                                ) : (
                                    <>
                                        <LogIn size={20} />
                                        Enroll Now
                                    </>
                                )}
                            </button>
                            <p className="enrollment-message">Enroll to access modules, videos, and quizzes</p>
                        </div>
                    )}

                    {enrolled && (
                        <div className="enrolled-badge">
                            <CheckCircle size={20} className="badge-icon" />
                            <span>Enrolled</span>
                        </div>
                    )}
                </div>

                <div className="course-header-image">
                    {course.image && <img src={course.image} alt={course.title} />}
                </div>
            </div>

            {enrolled && (
                <div className="course-content-wrapper">
                    <div className="course-main">
                        {/* Video Player */}
                        {selectedLesson && (
                            <div className="video-player-section">
                                <div className="video-container">
                                    {selectedLesson.youtubeUrl ? (
                                        <iframe
                                            width="100%"
                                            height="500"
                                            src={extractYoutubeEmbedUrl(selectedLesson.youtubeUrl)}
                                            title={selectedLesson.title}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        ></iframe>
                                    ) : (
                                        <div className="no-video">
                                            <Video size={64} />
                                            <p>No video available for this lesson</p>
                                        </div>
                                    )}
                                </div>
                                <div className="lesson-info">
                                    <h2>{selectedLesson.title}</h2>
                                    {selectedLesson.duration > 0 && (
                                        <div className="lesson-meta">
                                            <Clock size={16} />
                                            <span>{selectedLesson.duration} minutes</span>
                                        </div>
                                    )}
                                    {selectedLesson.description && (
                                        <p className="lesson-description">{selectedLesson.description}</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="course-sidebar">
                        {/* Modules Navigation */}
                        {hasModules ? (
                            <div className="modules-nav">
                                <h3 className="nav-title">Course Modules</h3>
                                <div className="modules-list">
                                    {course.modules.map((module, moduleIndex) => (
                                        <div key={moduleIndex} className="module-nav-item">
                                            <button
                                                className={`module-toggle ${expandedModuleIndex === moduleIndex ? 'active' : ''}`}
                                                onClick={() => setExpandedModuleIndex(expandedModuleIndex === moduleIndex ? -1 : moduleIndex)}
                                            >
                                                <ChevronRight size={18} />
                                                <span className="module-name">{module.title}</span>
                                            </button>

                                            {expandedModuleIndex === moduleIndex && module.lessons && module.lessons.length > 0 && (
                                                <div className="lessons-nav">
                                                    {module.lessons.map((lesson, lessonIndex) => (
                                                        <button
                                                            key={lessonIndex}
                                                            className={`lesson-nav-item ${selectedLesson?._id === lesson._id || (selectedLesson?.title === lesson.title) ? 'active' : ''}`}
                                                            onClick={() => handleSelectLesson(lesson)}
                                                        >
                                                            <Video size={14} />
                                                            <span>{lesson.title}</span>
                                                            {lesson.duration > 0 && (
                                                                <span className="lesson-duration">{lesson.duration}m</span>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="no-modules">
                                <AlertCircle size={32} />
                                <p>No modules available for this course</p>
                            </div>
                        )}

                        {/* Quizzes Section - Only show if quizzes exist */}
                        {quizzes.length > 0 && (
                            <div className="quizzes-nav">
                                <h3 className="nav-title">Quizzes</h3>
                                <div className="quizzes-list">
                                    {quizzes.map((quiz) => (
                                        <div key={quiz._id} className="quiz-nav-item">
                                            <div className="quiz-info">
                                                <h4>{quiz.title}</h4>
                                                <div className="quiz-meta">
                                                    <span className="quiz-questions">
                                                        {quiz.questions?.length || 0} questions
                                                    </span>
                                                    <span className="quiz-time">
                                                        {quiz.duration} min
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                className="attempt-quiz-btn"
                                                onClick={() => handleStartQuiz(quiz)}
                                            >
                                                <Play size={16} />
                                                Start
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseLearning;

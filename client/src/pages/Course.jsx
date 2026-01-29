/**
 * Course.jsx
 * Individual course view page with enrollment, modules, lessons, and quiz functionality
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
 * Course component - Full course overview with enrollment and quiz attempt
 */
const Course = () => {
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
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [expandedModule, setExpandedModule] = useState(0);

    // Fetch course data
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
                // Fetch quizzes after enrollment
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

    const handleAttemptQuiz = (quiz) => {
        setSelectedQuiz(quiz);
    };

    const handleStartQuiz = (quiz) => {
        navigate(`/quiz/${quiz._id}`);
    };

    const toggleModule = (index) => {
        setExpandedModule(expandedModule === index ? -1 : index);
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

    const getLessonIcon = (type) => {
        switch (type) {
            case 'video': return Video;
            case 'quiz': return CheckSquare;
            case 'document': return FileText;
            default: return BookOpen;
        }
    };

    return (
        <div className="course-page">
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
                            <Clock size={16} className="meta-icon" />
                            <span>{course.duration || 0} hours</span>
                        </div>
                    </div>

                    {/* Enrollment Section */}
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
                            <p className="enrollment-message">Enroll to access quizzes and track your progress</p>
                        </div>
                    )}

                    {enrolled && (
                        <div className="enrolled-badge">
                            <CheckCircle size={20} className="badge-icon" />
                            <span>Enrolled</span>
                        </div>
                    )}

                    {enrolled && (
                        <button 
                            className="learn-btn"
                            onClick={() => navigate(`/course/${id}/learn`)}
                        >
                            <Play size={20} />
                            Start Learning
                        </button>
                    )}
                </div>

                <div className="course-header-image">
                    {course.image && <img src={course.image} alt={course.title} />}
                </div>
            </div>

            {/* Quizzes Section - Only show if enrolled */}
            {enrolled && quizzes.length > 0 && (
                <div className="quizzes-section">
                    <h2>Available Quizzes</h2>
                    <div className="quizzes-grid">
                        {quizzes.map((quiz) => (
                            <div key={quiz._id} className="quiz-card">
                                <div className="quiz-header">
                                    <h3>{quiz.title}</h3>
                                    <span className="quiz-badge">
                                        {quiz.questions.length} Questions
                                    </span>
                                </div>
                                
                                <p className="quiz-description">{quiz.description || 'Test your knowledge'}</p>
                                
                                <div className="quiz-details">
                                    <div className="detail-item">
                                        <Clock size={16} />
                                        <span>{quiz.duration} mins</span>
                                    </div>
                                    <div className="detail-item">
                                        <CheckSquare size={16} />
                                        <span>Pass: {quiz.passingScore}%</span>
                                    </div>
                                    <div className="detail-item">
                                        <Star size={16} />
                                        <span>{quiz.totalPoints} points</span>
                                    </div>
                                </div>

                                <button 
                                    className="attempt-quiz-btn"
                                    onClick={() => handleStartQuiz(quiz)}
                                >
                                    <Play size={18} fill="white" />
                                    Start Quiz
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {enrolled && quizzes.length === 0 && (
                <div className="no-quizzes">
                    <CheckSquare size={48} />
                    <p>No quizzes available yet</p>
                    <span className="hint">Check back later for quiz assignments</span>
                </div>
            )}

            {/* Course Curriculum */}
            {course.lessons && course.lessons.length > 0 && (
                <div className="course-curriculum">
                    <h2>Course Curriculum</h2>
                    <div className="lessons-list">
                        {Array.isArray(course.lessons) && course.lessons.map((lesson, index) => (
                            <div key={lesson._id || index} className="lesson-item">
                                <div className="lesson-icon">
                                    <Video size={20} />
                                </div>
                                <div className="lesson-info">
                                    <h4>{lesson.title}</h4>
                                    <span className="lesson-type">Lesson</span>
                                </div>
                                {enrolled && (
                                    <button className="lesson-action">
                                        <Play size={18} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!enrolled && (
                <div className="locked-content">
                    <Lock size={48} />
                    <p>Enroll to access course content and quizzes</p>
                    <button 
                        className="unlock-btn"
                        onClick={handleEnroll}
                        disabled={enrolling}
                    >
                        {enrolling ? 'Enrolling...' : 'Enroll Now'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Course;

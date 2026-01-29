/**
 * CreateQuiz.jsx
 * Page for instructors to create quiz questions and save to MongoDB
 */
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Plus,
    Trash2,
    Save,
    AlertCircle,
    CheckCircle,
    Loader,
    ArrowLeft,
    X
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { quizzesAPI, coursesAPI } from '../services/api';
import '../styles/CreateQuiz.css';

const CreateQuiz = () => {
    const navigate = useNavigate();
    const { courseId } = useParams();
    const { user } = useAuth();
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [course, setCourse] = useState(null);
    
    const [quizData, setQuizData] = useState({
        title: '',
        description: '',
        passingScore: 60,
        duration: 30
    });

    const [questions, setQuestions] = useState([
        {
            id: 1,
            question: '',
            type: 'multiple-choice',
            options: ['', '', '', ''],
            correctAnswer: 0,
            points: 1
        }
    ]);

    const [nextQuestionId, setNextQuestionId] = useState(2);

    // Fetch course details
    useEffect(() => {
        fetchCourseDetails();
    }, [courseId]);

    const fetchCourseDetails = async () => {
        try {
            const response = await coursesAPI.getById(courseId);
            setCourse(response.data.course);
        } catch (err) {
            console.error('Error fetching course:', err);
            setError('Failed to load course details');
        }
    };

    const handleQuizDataChange = (e) => {
        const { name, value } = e.target;
        setQuizData(prev => ({
            ...prev,
            [name]: name === 'duration' || name === 'passingScore' ? parseInt(value) : value
        }));
    };

    const handleQuestionChange = (id, field, value) => {
        setQuestions(prev =>
            prev.map(q =>
                q.id === id ? { ...q, [field]: value } : q
            )
        );
    };

    const handleOptionChange = (questionId, optionIndex, value) => {
        setQuestions(prev =>
            prev.map(q =>
                q.id === questionId
                    ? {
                        ...q,
                        options: q.options.map((opt, idx) =>
                            idx === optionIndex ? value : opt
                        )
                    }
                    : q
            )
        );
    };

    const handleCorrectAnswerChange = (questionId, value) => {
        setQuestions(prev =>
            prev.map(q =>
                q.id === questionId
                    ? { ...q, correctAnswer: value }
                    : q
            )
        );
    };

    const addQuestion = () => {
        const newQuestion = {
            id: nextQuestionId,
            question: '',
            type: 'multiple-choice',
            options: ['', '', '', ''],
            correctAnswer: 0,
            points: 1
        };
        setQuestions(prev => [...prev, newQuestion]);
        setNextQuestionId(nextQuestionId + 1);
    };

    const removeQuestion = (id) => {
        if (questions.length === 1) {
            setError('Quiz must have at least one question');
            return;
        }
        setQuestions(prev => prev.filter(q => q.id !== id));
    };

    const validateQuiz = () => {
        setError('');

        if (!quizData.title.trim()) {
            setError('Quiz title is required');
            return false;
        }

        if (questions.length === 0) {
            setError('Quiz must have at least one question');
            return false;
        }

        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.question.trim()) {
                setError(`Question ${i + 1} text is required`);
                return false;
            }

            if (q.type === 'multiple-choice' || q.type === 'true-false') {
                const filledOptions = q.options.filter(opt => opt.trim());
                if (filledOptions.length < 2) {
                    setError(`Question ${i + 1} must have at least 2 options`);
                    return false;
                }

                if (q.type === 'multiple-choice' && filledOptions.length < 4) {
                    setError(`Question ${i + 1} (multiple-choice) must have at least 4 options`);
                    return false;
                }
            }

            if (q.points < 1) {
                setError(`Question ${i + 1} points must be at least 1`);
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateQuiz()) {
            return;
        }

        try {
            setLoading(true);
            setError('');
            setSuccess('');

            // Format questions for backend - ensure correct structure
            const formattedQuestions = questions.map(q => {
                const question = {
                    question: q.question.trim(),
                    type: q.type,
                    points: parseInt(q.points) || 1
                };

                // Handle different question types
                if (q.type === 'short-answer') {
                    question.options = [];
                    question.correctAnswer = q.question.trim();
                } else {
                    // Filter and keep only non-empty options
                    const validOptions = q.options.filter(opt => opt && opt.trim());
                    question.options = validOptions;
                    question.correctAnswer = parseInt(q.correctAnswer) || 0;
                }

                return question;
            });

            // Calculate total points
            const totalPoints = formattedQuestions.reduce((sum, q) => sum + (q.points || 1), 0);

            const payload = {
                title: quizData.title.trim(),
                description: quizData.description.trim() || '',
                course: courseId,
                questions: formattedQuestions,
                passingScore: parseInt(quizData.passingScore) || 60,
                duration: parseInt(quizData.duration) || 30
            };

            console.log('Submitting quiz payload:', JSON.stringify(payload, null, 2));

            const response = await quizzesAPI.create(payload);

            console.log('Quiz creation response:', response);

            if (response && response.data) {
                if (response.data.success) {
                    setSuccess('✓ Quiz created successfully! Redirecting...');
                    setTimeout(() => {
                        navigate(`/instructor/dashboard`);
                    }, 2000);
                } else {
                    setError(response.data.message || 'Failed to create quiz');
                }
            } else {
                setError('Unexpected response from server');
            }
        } catch (err) {
            console.error('Error creating quiz:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
                statusText: err.response?.statusText
            });
            
            let errorMsg = 'Failed to create quiz';
            let detailMsg = '';
            
            if (err.response?.data?.details) {
                // Handle detailed error response
                const details = err.response.data.details;
                errorMsg = err.response.data.message;
                detailMsg = `Course: ${details.courseTitle || 'Unknown'}\n`;
                detailMsg += `Course Instructor Email: ${details.instructorEmail || 'Unknown'}\n`;
                detailMsg += `Your Email: ${details.yourEmail || 'Unknown'}\n`;
                detailMsg += `Your Role: ${details.yourRole || 'Unknown'}\n`;
                detailMsg += `\nMake sure you are logged in with the SAME email that created this course.`;
            } else if (err.response?.data?.message) {
                errorMsg = err.response.data.message;
            } else if (err.response?.status === 403) {
                errorMsg = '❌ Authorization Failed: Not the course instructor';
                detailMsg = 'You can only create quizzes for courses YOU created.\n\nMake sure:\n1. You are logged in with the correct instructor account\n2. This course was created by you\n3. Your email matches the course instructor email';
            } else if (err.response?.status === 404) {
                errorMsg = '❌ Course not found';
                detailMsg = 'The course no longer exists. Refresh and try again.';
            } else if (err.response?.status === 400) {
                errorMsg = '❌ Invalid quiz data: ' + (err.response.data.message || 'Check your inputs');
                detailMsg = 'Please verify all required fields are filled correctly.';
            } else if (err.response?.status === 401) {
                errorMsg = '❌ Session expired';
                detailMsg = 'Your login token is invalid. Please logout and login again.';
            } else if (err.message === 'Network Error') {
                errorMsg = '❌ Network error';
                detailMsg = 'Cannot connect to server. Make sure the backend is running on http://localhost:3001\n\nRun: npm run dev (in /server folder)';
            }
            
            if (detailMsg) {
                setError(errorMsg + '\n\n' + detailMsg);
            } else {
                setError(errorMsg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-quiz-container">
            <div className="create-quiz-header">
                <button
                    className="back-button"
                    onClick={() => navigate(-1)}
                    disabled={loading}
                >
                    <ArrowLeft size={20} />
                    Back
                </button>
                <div>
                    <h1>Create Quiz</h1>
                    {course && <p className="course-name">{course.title}</p>}
                </div>
            </div>

            <div className="create-quiz-content">
                {error && (
                    <div className="alert alert-error">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                        <button
                            className="alert-close"
                            onClick={() => setError('')}
                        >
                            <X size={18} />
                        </button>
                    </div>
                )}

                {success && (
                    <div className="alert alert-success">
                        <CheckCircle size={20} />
                        <span>{success}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="quiz-form">
                    {/* Quiz Details Section */}
                    <section className="form-section">
                        <h2>Quiz Details</h2>

                        <div className="form-group">
                            <label htmlFor="title">Quiz Title *</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={quizData.title}
                                onChange={handleQuizDataChange}
                                placeholder="e.g., JavaScript Basics Quiz"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                value={quizData.description}
                                onChange={handleQuizDataChange}
                                placeholder="Quiz description (optional)"
                                rows="3"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="passingScore">Passing Score (%) *</label>
                                <input
                                    type="number"
                                    id="passingScore"
                                    name="passingScore"
                                    value={quizData.passingScore}
                                    onChange={handleQuizDataChange}
                                    min="0"
                                    max="100"
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="duration">Duration (minutes) *</label>
                                <input
                                    type="number"
                                    id="duration"
                                    name="duration"
                                    value={quizData.duration}
                                    onChange={handleQuizDataChange}
                                    min="1"
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Questions Section */}
                    <section className="form-section">
                        <div className="section-header">
                            <h2>Quiz Questions</h2>
                            <span className="question-count">
                                {questions.length} question{questions.length !== 1 ? 's' : ''}
                            </span>
                        </div>

                        <div className="questions-list">
                            {questions.map((question, index) => (
                                <div key={question.id} className="question-card">
                                    <div className="question-header">
                                        <h3>Question {index + 1}</h3>
                                        {questions.length > 1 && (
                                            <button
                                                type="button"
                                                className="delete-question-btn"
                                                onClick={() => removeQuestion(question.id)}
                                                disabled={loading}
                                                title="Delete question"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label>Question Text *</label>
                                        <textarea
                                            value={question.question}
                                            onChange={(e) =>
                                                handleQuestionChange(question.id, 'question', e.target.value)
                                            }
                                            placeholder="Enter your question"
                                            rows="3"
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Question Type *</label>
                                            <select
                                                value={question.type}
                                                onChange={(e) =>
                                                    handleQuestionChange(question.id, 'type', e.target.value)
                                                }
                                                disabled={loading}
                                            >
                                                <option value="multiple-choice">Multiple Choice</option>
                                                <option value="true-false">True/False</option>
                                                <option value="short-answer">Short Answer</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>Points *</label>
                                            <input
                                                type="number"
                                                value={question.points}
                                                onChange={(e) =>
                                                    handleQuestionChange(question.id, 'points', parseInt(e.target.value) || 1)
                                                }
                                                min="1"
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>

                                    {question.type !== 'short-answer' && (
                                        <div className="options-section">
                                            <label>Options & Correct Answer *</label>
                                            <div className="options-list">
                                                {question.options.map((option, optIdx) => (
                                                    <div key={optIdx} className="option-item">
                                                        <input
                                                            type={question.type === 'true-false' ? 'hidden' : 'text'}
                                                            value={option}
                                                            onChange={(e) =>
                                                                handleOptionChange(question.id, optIdx, e.target.value)
                                                            }
                                                            placeholder={`Option ${optIdx + 1}`}
                                                            disabled={loading}
                                                            style={{
                                                                display: question.type === 'true-false' ? 'none' : 'block'
                                                            }}
                                                        />
                                                        {question.type === 'true-false' && optIdx < 2 && (
                                                            <div className="true-false-option">
                                                                {optIdx === 0 ? 'True' : 'False'}
                                                            </div>
                                                        )}
                                                        <label className="radio-label">
                                                            <input
                                                                type="radio"
                                                                name={`correct-${question.id}`}
                                                                checked={question.correctAnswer === optIdx}
                                                                onChange={() =>
                                                                    handleCorrectAnswerChange(question.id, optIdx)
                                                                }
                                                                disabled={loading}
                                                            />
                                                            <span>Correct</span>
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            className="add-question-btn"
                            onClick={addQuestion}
                            disabled={loading}
                        >
                            <Plus size={20} />
                            Add Question
                        </button>
                    </section>

                    {/* Submit Button */}
                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => navigate(-1)}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader size={20} />
                                    Creating Quiz...
                                </>
                            ) : (
                                <>
                                    <Save size={20} />
                                    Create Quiz
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateQuiz;

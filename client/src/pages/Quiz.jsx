/**
 * Quiz.jsx
 * Quiz taking interface with question navigation
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Clock,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    AlertCircle,
    Flag,
    Loader
} from 'lucide-react';
import { quizzesAPI } from '../services/api';
import './Quiz.css';

/**
 * Quiz component
 * Interactive quiz interface with progress tracking and submission
 */
const Quiz = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Quiz state
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [flagged, setFlagged] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [submissionResult, setSubmissionResult] = useState(null);

    // Fetch quiz data
    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                setLoading(true);
                const response = await quizzesAPI.getById(id);
                const data = response.data.quiz;

                setQuiz(data);

                // Map backend questions to frontend format if needed, or just use them
                // Backend: { question: "...", options: [...], ... }
                // Frontend expected: { text: "...", options: [...], ... }
                const mappedQuestions = data.questions.map((q, index) => ({
                    ...q,
                    id: q._id || index,
                    text: q.question // Map 'question' to 'text' for compatibility
                }));

                setQuestions(mappedQuestions);
                setTimeRemaining(data.duration * 60); // Convert minutes to seconds
                setLoading(false);
            } catch (err) {
                console.error('Error fetching quiz:', err);
                setError('Failed to load quiz. Please try again.');
                setLoading(false);
            }
        };

        if (id) {
            fetchQuiz();
        }
    }, [id]);

    // Timer effect
    useEffect(() => {
        if (!loading && !showResults && timeRemaining > 0) {
            const timer = setInterval(() => {
                setTimeRemaining((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        submitQuiz(); // Auto submit when time runs out
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [loading, showResults, timeRemaining]);

    // Format time
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Handle answer selection
    const selectAnswer = (questionIndex, optionIndex) => {
        setAnswers(prev => ({
            ...prev,
            [questionIndex]: optionIndex
        }));
    };

    // Toggle flag
    const toggleFlag = () => {
        if (flagged.includes(currentQuestion)) {
            setFlagged(flagged.filter(q => q !== currentQuestion));
        } else {
            setFlagged([...flagged, currentQuestion]);
        }
    };

    // Navigate questions
    const goToQuestion = (index) => {
        setCurrentQuestion(index);
    };

    const nextQuestion = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const prevQuestion = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    // Submit quiz
    const submitQuiz = async () => {
        try {
            setSubmitting(true);

            // Format answers for backend (array of answers matching question order)
            // Backend expects array of answers. 
            // If user skipped a question, we should probably send null or handle it.
            // But checking quizController, it maps answers by index.

            const formattedAnswers = questions.map((_, index) => {
                return answers[index] !== undefined ? answers[index] : null;
            });

            const response = await quizzesAPI.submit(id, formattedAnswers);

            setSubmissionResult(response.data.submission);
            setShowResults(true);
        } catch (err) {
            console.error('Error submitting quiz:', err);
            alert('Failed to submit quiz. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Calculate score (only used for local display before API integration, 
    // but now we rely on backend response.
    // Kept for immediate feedback if needed, but 'submissonResult' is better)

    if (loading) {
        return (
            <div className="quiz-page loading">
                <Loader className="animate-spin" size={48} color="#2563eb" />
                <p>Loading quiz...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="quiz-page error">
                <AlertCircle size={48} color="#ef4444" />
                <h2>Error Loading Quiz</h2>
                <p>{error}</p>
                <button className="btn btn-primary" onClick={() => navigate(-1)}>
                    Go Back
                </button>
            </div>
        );
    }

    if (!quiz || questions.length === 0) {
        return (
            <div className="quiz-page error">
                <AlertCircle size={48} />
                <h2>No Questions Found</h2>
                <p>This quiz has no questions.</p>
                <button className="btn btn-primary" onClick={() => navigate(-1)}>
                    Go Back
                </button>
            </div>
        );
    }

    // Results View
    if (showResults && submissionResult) {
        const { score, percentage, passed, totalPoints } = submissionResult;

        return (
            <div className="quiz-page">
                <div className="quiz-results">
                    <div className={`results-icon ${passed ? 'passed' : 'failed'}`}>
                        {passed ? <CheckCircle size={48} /> : <AlertCircle size={48} />}
                    </div>
                    <h1 className="results-title">
                        {passed ? 'Congratulations!' : 'Keep Practicing!'}
                    </h1>
                    <p className="results-message">
                        {passed
                            ? 'You have successfully passed this quiz.'
                            : `You need ${quiz.passingScore}% to pass. Try again!`
                        }
                    </p>
                    <div className="results-score">
                        <span className="score-value">{percentage}%</span>
                        <span className="score-label">Your Score ({score}/{totalPoints} pts)</span>
                    </div>
                    <div className="results-stats">
                        <div className="stat">
                            <span className="stat-value">{Object.keys(answers).length}</span>
                            <span className="stat-label">Answered</span>
                        </div>
                        {/* We don't have correct/incorrect count from backend response explicitly unless we calculate or backend sends details.
                            Backend sends 'score', 'percentage', 'passed'. 
                            So we can't show "Correct" count easily without more data.
                            Let's just show Answered and Skipped.
                        */}
                        <div className="stat">
                            <span className="stat-value">{questions.length - Object.keys(answers).length}</span>
                            <span className="stat-label">Skipped</span>
                        </div>
                    </div>
                    <div className="results-actions">
                        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                            Back to Course
                        </button>
                        <button className="btn btn-primary" onClick={() => {
                            setAnswers({});
                            setFlagged([]);
                            setCurrentQuestion(0);
                            setShowResults(false);
                            setSubmissionResult(null);
                            setTimeRemaining(quiz.duration * 60);
                        }}>
                            Retry Quiz
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const question = questions[currentQuestion];

    return (
        <div className="quiz-page">
            {/* Quiz Header */}
            <div className="quiz-header">
                <div className="quiz-info">
                    <h1>{quiz.title}</h1>
                    <p>{quiz.description}</p>
                </div>
                <div className={`quiz-timer ${timeRemaining < 300 ? 'warning' : ''}`}>
                    <Clock size={18} />
                    <span>{formatTime(timeRemaining)}</span>
                </div>
            </div>

            {/* Quiz Content */}
            <div className="quiz-content">
                {/* Questions Navigator */}
                <div className="questions-nav">
                    <h3>Questions</h3>
                    <div className="questions-grid">
                        {questions.map((_, index) => (
                            <button
                                key={index}
                                className={`question-nav-btn 
                  ${currentQuestion === index ? 'current' : ''}
                  ${answers[index] !== undefined ? 'answered' : ''}
                  ${flagged.includes(index) ? 'flagged' : ''}
                `}
                                onClick={() => goToQuestion(index)}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                    <div className="nav-legend">
                        <div className="legend-item">
                            <span className="legend-dot answered"></span>
                            <span>Answered</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-dot flagged"></span>
                            <span>Flagged</span>
                        </div>
                    </div>
                </div>

                {/* Question Card */}
                <div className="question-card">
                    <div className="question-header">
                        <span className="question-number">
                            Question {currentQuestion + 1} of {questions.length}
                        </span>
                        <div className="header-actions">
                            <span className="question-points">
                                {question.points} point{question.points !== 1 ? 's' : ''}
                            </span>
                            <button
                                className={`flag-btn ${flagged.includes(currentQuestion) ? 'active' : ''}`}
                                onClick={toggleFlag}
                            >
                                <Flag size={16} />
                                {flagged.includes(currentQuestion) ? 'Flagged' : 'Flag for review'}
                            </button>
                        </div>
                    </div>

                    <h2 className="question-text">{question.text}</h2>

                    <div className="options-list">
                        {question.options.map((option, index) => (
                            <button
                                key={index}
                                className={`option-btn ${answers[currentQuestion] === index ? 'selected' : ''}`}
                                onClick={() => selectAnswer(currentQuestion, index)}
                            >
                                <span className="option-letter">
                                    {String.fromCharCode(65 + index)}
                                </span>
                                <span className="option-text">{option}</span>
                            </button>
                        ))}
                    </div>

                    <div className="question-actions">
                        <button
                            className="btn btn-secondary"
                            onClick={prevQuestion}
                            disabled={currentQuestion === 0}
                        >
                            <ChevronLeft size={18} />
                            Previous
                        </button>

                        {currentQuestion === questions.length - 1 ? (
                            <button
                                className="btn btn-primary"
                                onClick={submitQuiz}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <>
                                        <Loader size={18} className="animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        Submit Quiz
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                className="btn btn-primary"
                                onClick={nextQuestion}
                            >
                                Next
                                <ChevronRight size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Quiz;

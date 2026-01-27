/**
 * Quiz.jsx
 * Quiz taking interface with question navigation
 */
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Clock,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    AlertCircle,
    Flag
} from 'lucide-react';
import './Quiz.css';

/**
 * Quiz component
 * Interactive quiz interface with progress tracking and submission
 */
const Quiz = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [flagged, setFlagged] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(45 * 60); // 45 minutes

    // Mock quiz data
    const quiz = {
        id: id || 1,
        title: 'Machine Learning Fundamentals Quiz',
        course: 'Advanced Machine Learning',
        totalQuestions: 10,
        duration: 45,
        passingScore: 70
    };

    // Mock questions
    const questions = [
        {
            id: 1,
            text: 'What is the primary purpose of the activation function in a neural network?',
            options: [
                'To reduce the number of parameters',
                'To introduce non-linearity into the model',
                'To normalize the input data',
                'To prevent overfitting'
            ],
            correctAnswer: 1
        },
        {
            id: 2,
            text: 'Which of the following is NOT a type of machine learning?',
            options: [
                'Supervised Learning',
                'Unsupervised Learning',
                'Reinforcement Learning',
                'Deterministic Learning'
            ],
            correctAnswer: 3
        },
        {
            id: 3,
            text: 'What does the term "backpropagation" refer to in neural networks?',
            options: [
                'The forward pass of data through the network',
                'The process of adjusting weights based on error gradients',
                'The initialization of network weights',
                'The process of collecting training data'
            ],
            correctAnswer: 1
        },
        {
            id: 4,
            text: 'Which optimizer is known for adapting the learning rate for each parameter?',
            options: [
                'Stochastic Gradient Descent (SGD)',
                'Batch Gradient Descent',
                'Adam',
                'Fixed Learning Rate'
            ],
            correctAnswer: 2
        },
        {
            id: 5,
            text: 'What is the purpose of dropout in neural networks?',
            options: [
                'To speed up training',
                'To reduce overfitting',
                'To increase model complexity',
                'To normalize outputs'
            ],
            correctAnswer: 1
        },
        {
            id: 6,
            text: 'Which loss function is typically used for binary classification?',
            options: [
                'Mean Squared Error',
                'Cross-Entropy Loss',
                'Hinge Loss',
                'Huber Loss'
            ],
            correctAnswer: 1
        },
        {
            id: 7,
            text: 'What is a convolutional neural network primarily used for?',
            options: [
                'Natural Language Processing',
                'Time Series Analysis',
                'Image Recognition',
                'Tabular Data'
            ],
            correctAnswer: 2
        },
        {
            id: 8,
            text: 'Which technique helps prevent vanishing gradients in deep networks?',
            options: [
                'Using sigmoid activation',
                'Using ReLU activation',
                'Increasing batch size',
                'Reducing learning rate'
            ],
            correctAnswer: 1
        },
        {
            id: 9,
            text: 'What is transfer learning?',
            options: [
                'Training a model from scratch',
                'Using a pre-trained model as a starting point',
                'Transferring data between models',
                'Moving models between devices'
            ],
            correctAnswer: 1
        },
        {
            id: 10,
            text: 'What is the main advantage of using batch normalization?',
            options: [
                'Reduces training time only',
                'Stabilizes and accelerates training',
                'Increases model parameters',
                'Removes the need for activation functions'
            ],
            correctAnswer: 1
        }
    ];

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
    const submitQuiz = () => {
        // Calculate score
        let correct = 0;
        questions.forEach((q, index) => {
            if (answers[index] === q.correctAnswer) {
                correct++;
            }
        });
        setShowResults(true);
    };

    // Calculate score
    const calculateScore = () => {
        let correct = 0;
        questions.forEach((q, index) => {
            if (answers[index] === q.correctAnswer) {
                correct++;
            }
        });
        return Math.round((correct / questions.length) * 100);
    };

    const score = calculateScore();
    const passed = score >= quiz.passingScore;

    // Results View
    if (showResults) {
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
                        <span className="score-value">{score}%</span>
                        <span className="score-label">Your Score</span>
                    </div>
                    <div className="results-stats">
                        <div className="stat">
                            <span className="stat-value">{Object.keys(answers).length}</span>
                            <span className="stat-label">Answered</span>
                        </div>
                        <div className="stat">
                            <span className="stat-value">{questions.filter((q, i) => answers[i] === q.correctAnswer).length}</span>
                            <span className="stat-label">Correct</span>
                        </div>
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
                    <p>{quiz.course}</p>
                </div>
                <div className="quiz-timer">
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
                        <button
                            className={`flag-btn ${flagged.includes(currentQuestion) ? 'active' : ''}`}
                            onClick={toggleFlag}
                        >
                            <Flag size={16} />
                            {flagged.includes(currentQuestion) ? 'Flagged' : 'Flag for review'}
                        </button>
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
                            >
                                Submit Quiz
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

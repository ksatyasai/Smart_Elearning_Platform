import Quiz from '../models/Quiz.js';
import QuizSubmission from '../models/QuizSubmission.js';
import Course from '../models/Course.js';

// @desc    Get course quizzes
// @route   GET /api/quizzes/course/:courseId
// @access  Private
export const getCourseQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({ course: req.params.courseId });

    res.status(200).json({
      success: true,
      count: quizzes.length,
      quizzes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single quiz
// @route   GET /api/quizzes/:id
// @access  Private
export const getQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    res.status(200).json({
      success: true,
      quiz
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit quiz
// @route   POST /api/quizzes/:id/submit
// @access  Private
export const submitQuiz = async (req, res, next) => {
  try {
    const { answers } = req.body;

    if (!Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Answers array required' });
    }

    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Calculate score
    let score = 0;
    const evaluatedAnswers = answers.map((answer, index) => {
      const question = quiz.questions[index];
      const isCorrect = JSON.stringify(answer) === JSON.stringify(question.correctAnswer);
      const pointsEarned = isCorrect ? (question.points || 1) : 0;
      score += pointsEarned;

      return {
        questionId: question._id,
        answer,
        isCorrect,
        pointsEarned
      };
    });

    const percentage = Math.round((score / quiz.totalPoints) * 100);
    const passed = percentage >= quiz.passingScore;

    // Save submission
    const submission = await QuizSubmission.create({
      student: req.user.id,
      quiz: req.params.id,
      course: quiz.course,
      answers: evaluatedAnswers,
      score,
      percentage,
      passed
    });

    res.status(201).json({
      success: true,
      message: 'Quiz submitted successfully',
      submission: {
        score,
        percentage,
        passed,
        totalPoints: quiz.totalPoints,
        submittedAt: submission.submittedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get quiz submissions (Student)
// @route   GET /api/quizzes/:id/submissions
// @access  Private
export const getQuizSubmissions = async (req, res, next) => {
  try {
    const submissions = await QuizSubmission.find({
      student: req.user.id,
      quiz: req.params.id
    });

    res.status(200).json({
      success: true,
      count: submissions.length,
      submissions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create quiz (Instructor)
// @route   POST /api/quizzes
// @access  Private (instructor only)
export const createQuiz = async (req, res, next) => {
  try {
    const { title, description, course, questions, passingScore, duration } = req.body;

    if (!title || !course || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'Title, course and questions are required' });
    }

    // Check if user is the course instructor
    const courseDoc = await Course.findById(course);
    if (!courseDoc || courseDoc.instructor.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to create quiz for this course' });
    }

    const quiz = await Quiz.create({
      title,
      description: description || '',
      course,
      questions,
      passingScore: passingScore || 60,
      duration: duration || 30
    });

    // Add quiz to course
    courseDoc.quizzes.push(quiz._id);
    await courseDoc.save();

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      quiz
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update quiz (Instructor)
// @route   PUT /api/quizzes/:id
// @access  Private (instructor only)
export const updateQuiz = async (req, res, next) => {
  try {
    let quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Check authorization
    const course = await Course.findById(quiz.course);
    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this quiz' });
    }

    const { title, description, questions, passingScore, duration, isPublished } = req.body;

    if (title) quiz.title = title;
    if (description !== undefined) quiz.description = description;
    if (Array.isArray(questions)) quiz.questions = questions;
    if (passingScore !== undefined) quiz.passingScore = passingScore;
    if (duration !== undefined) quiz.duration = duration;
    if (isPublished !== undefined) quiz.isPublished = isPublished;

    await quiz.save();

    res.status(200).json({
      success: true,
      message: 'Quiz updated successfully',
      quiz
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete quiz (Instructor)
// @route   DELETE /api/quizzes/:id
// @access  Private (instructor only)
export const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Check authorization
    const course = await Course.findById(quiz.course);
    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this quiz' });
    }

    // Remove from course
    course.quizzes.pull(quiz._id);
    await course.save();

    await Quiz.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

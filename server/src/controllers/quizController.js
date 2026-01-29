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
    console.log('=== Quiz Creation Request ===');
    console.log('User:', req.user.email, '(', req.user.id, ')');
    console.log('Request Body:', req.body);

    const { title, description, course, questions, passingScore, duration } = req.body;

    // Validation
    if (!title || !title.trim()) {
      console.log('Validation Failed: Quiz title is required');
      return res.status(400).json({ success: false, message: 'Quiz title is required' });
    }

    if (!course) {
      console.log('Validation Failed: Course ID is required');
      return res.status(400).json({ success: false, message: 'Course ID is required' });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      console.log('Validation Failed: At least one question is required');
      return res.status(400).json({ success: false, message: 'At least one question is required' });
    }

    console.log('Validation Passed. Checking course authorization...');

    // Check if user is the course instructor
    const courseDoc = await Course.findById(course).populate('instructor', '_id email name role');
    if (!courseDoc) {
      console.log('Validation Failed: Course not found with ID:', course);
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    console.log('Course found:', courseDoc.title);
    console.log('Course instructor ID:', courseDoc.instructor._id.toString());
    console.log('Current user ID:', req.user._id.toString());
    console.log('Current user email:', req.user.email);
    console.log('Current user role:', req.user.role);

    // Authorization check with multiple fallbacks
    let isAuthorized = false;

    // Check 1: Direct ID comparison (string)
    if (courseDoc.instructor._id.toString() === req.user._id.toString()) {
      isAuthorized = true;
      console.log('✓ Authorization Check 1 PASSED: ID string comparison');
    }
    // Check 2: Direct ID comparison (object)
    else if (courseDoc.instructor._id.equals(req.user._id)) {
      isAuthorized = true;
      console.log('✓ Authorization Check 2 PASSED: ID equals comparison');
    }
    // Check 3: Fallback - check if user is admin (can create quiz for any course)
    else if (req.user.role === 'admin') {
      isAuthorized = true;
      console.log('✓ Authorization Check 3 PASSED: User is admin');
    }
    // Check 4: Check if instructor email matches (additional safety)
    else if (courseDoc.instructor.email === req.user.email) {
      isAuthorized = true;
      console.log('✓ Authorization Check 4 PASSED: Email match');
    }

    if (!isAuthorized) {
      console.log('❌ Authorization Failed: User is not the course instructor');
      console.log('Expected instructor ID:', courseDoc.instructor._id.toString());
      console.log('Got user ID:', req.user._id.toString());
      console.log('Instructor email:', courseDoc.instructor.email);
      console.log('User email:', req.user.email);
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to create quiz for this course',
        details: {
          reason: 'Only the course instructor can create quizzes',
          courseTitle: courseDoc.title,
          instructorEmail: courseDoc.instructor.email,
          yourEmail: req.user.email,
          yourRole: req.user.role
        }
      });
    }

    console.log('Authorization Passed. Creating quiz...');

    // Create quiz - totalPoints will be calculated by pre-save hook
    const quiz = await Quiz.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      course,
      questions,
      passingScore: passingScore || 60,
      duration: duration || 30,
      isPublished: false
    });

    console.log('Quiz created:', quiz._id);
    console.log('Total Points:', quiz.totalPoints);

    // Add quiz to course if quizzes array exists
    if (!courseDoc.quizzes) {
      courseDoc.quizzes = [];
    }
    courseDoc.quizzes.push(quiz._id);
    await courseDoc.save();

    console.log('Course updated with quiz reference');
    console.log('=== Quiz Creation Success ===\n');

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      quiz
    });
  } catch (error) {
    console.error('=== Quiz Creation Error ===');
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    console.error('=== End Error ===\n');
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

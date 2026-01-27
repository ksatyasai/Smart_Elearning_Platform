import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import * as quizController from '../controllers/quizController.js';

const router = express.Router();

// Protected routes - all quiz routes require authentication
router.use(protect);

router.get('/course/:courseId', quizController.getCourseQuizzes);
router.get('/:id', quizController.getQuiz);
router.post('/:id/submit', quizController.submitQuiz);
router.get('/:id/submissions', quizController.getQuizSubmissions);

// Instructor only routes
router.post('/', authorize('instructor', 'admin'), quizController.createQuiz);
router.put('/:id', authorize('instructor', 'admin'), quizController.updateQuiz);
router.delete('/:id', authorize('instructor', 'admin'), quizController.deleteQuiz);

export default router;

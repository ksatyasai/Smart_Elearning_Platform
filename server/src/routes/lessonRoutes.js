import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import * as lessonController from '../controllers/lessonController.js';

const router = express.Router();

// Protected routes - all lesson routes require authentication
router.use(protect);

router.get('/course/:courseId', lessonController.getCourseLessons);
router.get('/:id', lessonController.getLesson);
router.post('/:id/complete', lessonController.markLessonComplete);

// Instructor only routes
router.post('/', authorize('instructor', 'admin'), lessonController.createLesson);
router.put('/:id', authorize('instructor', 'admin'), lessonController.updateLesson);
router.delete('/:id', authorize('instructor', 'admin'), lessonController.deleteLesson);

export default router;

import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import * as courseController from '../controllers/courseController.js';

const router = express.Router();

// Public routes
router.get('/', courseController.getAllCourses);

// Protected routes (must come before /:id to be matched first)
router.use(protect);

router.get('/enrolled', courseController.getEnrolledCourses);
router.post('/:id/enroll', courseController.enrollCourse);
router.get('/:id/progress', courseController.getCourseProgress);
router.get('/:id', courseController.getCourse);

// Instructor only routes
router.post('/', authorize('instructor', 'admin'), courseController.createCourse);
router.put('/:id', authorize('instructor', 'admin'), courseController.updateCourse);
router.delete('/:id', authorize('instructor', 'admin'), courseController.deleteCourse);

export default router;

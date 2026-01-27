import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import * as authController from '../controllers/authController.js';

const router = express.Router();

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);

// Protected routes
router.get('/me', protect, authController.getMe);
router.post('/logout', protect, authController.logout);

export default router;

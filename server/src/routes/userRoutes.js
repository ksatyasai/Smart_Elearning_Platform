import express from 'express';
import { protect } from '../middleware/auth.js';
import * as userController from '../controllers/userController.js';

const router = express.Router();

// All user routes require authentication
router.use(protect);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.put('/password', userController.updatePassword);
router.get('/settings', userController.getSettings);
router.put('/settings', userController.updateSettings);

export default router;

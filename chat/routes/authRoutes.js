import express from 'express';
import {
    register,
    verifyEmail,
    login,
    getProfile,
    forgotPassword,
    resetPassword
} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// ─── Public routes ─────────────────────────────────────────────
router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// ─── Protected routes ──────────────────────────────────────────
router.get('/profile', authMiddleware, getProfile);

export default router;
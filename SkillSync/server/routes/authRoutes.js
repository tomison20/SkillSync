import express from 'express';
import {
    registerUser,
    loginUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
    requestOrganization,
    forgotPassword,
    resetPassword,
    googleAuth
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.post('/logout', logoutUser);

// Password Reset
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Ensure profile is protected here too if accessed via /api/auth/profile
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/request-org', requestOrganization);

export default router;

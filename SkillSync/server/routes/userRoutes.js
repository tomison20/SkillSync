import express from 'express';
import { getUserProfile } from '../controllers/authController.js';
import {
    getNetworkStudents,
    getPublicStudentProfile,
    followUser,
    unfollowUser,
    getOrganizationMembers
} from '../controllers/userController.js';
import { reportUser } from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Strictly protected
router.get('/profile', protect, getUserProfile);

// Network functionality (Student only)
router.route('/network').get(protect, authorize('student'), getNetworkStudents);
router.route('/network/:id').get(protect, authorize('student', 'organizer', 'admin'), getPublicStudentProfile);

router.route('/:id/follow').post(protect, authorize('student'), followUser);
router.route('/:id/unfollow').post(protect, authorize('student'), unfollowUser);

// Report user
router.route('/:id/report').post(protect, authorize('student', 'organizer'), reportUser);

// Organization functionality (Organizer only)
router.route('/organization/members').get(protect, authorize('organizer', 'admin'), getOrganizationMembers);

export default router;

import express from 'express';
import {
    getMyParticipation,
    verifyParticipation,
    getMyStats
} from '../controllers/participationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, authorize('student'), getMyParticipation);

router.route('/stats')
    .get(protect, authorize('student'), getMyStats);

router.route('/verify')
    .post(protect, authorize('organizer', 'admin'), verifyParticipation);

export default router;

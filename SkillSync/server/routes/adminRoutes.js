import express from 'express';
import { seedData, getOrgRequests, manageOrgRequest, getPlatformStats, getUsers, toggleUserStatus } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/seed', seedData);

router.route('/org-requests')
    .get(protect, authorize('admin'), getOrgRequests);

router.route('/org-requests/:id')
    .put(protect, authorize('admin'), manageOrgRequest);

router.route('/stats')
    .get(protect, authorize('admin'), getPlatformStats);

router.route('/users')
    .get(protect, authorize('admin'), getUsers);

router.route('/users/:id/disable')
    .put(protect, authorize('admin'), toggleUserStatus);

export default router;

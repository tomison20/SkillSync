import express from 'express';
import {
    seedData, getOrgRequests, manageOrgRequest, getPlatformStats,
    getUsers, toggleUserStatus, updateUser, deleteUser,
    getOrganizations, updateOrganization, deleteOrganization,
    getAllGigs, getAllPortfolios,
    getAllReports, updateReportStatus, unbanUser,
    regenerateOrganizerCode
} from '../controllers/adminController.js';
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

router.route('/users/:id/unban')
    .put(protect, authorize('admin'), unbanUser);

router.route('/users/:id')
    .put(protect, authorize('admin'), updateUser)
    .delete(protect, authorize('admin'), deleteUser);

router.route('/organizations')
    .get(protect, authorize('admin'), getOrganizations);

router.route('/organizations/:id')
    .put(protect, authorize('admin'), updateOrganization)
    .delete(protect, authorize('admin'), deleteOrganization);

router.route('/organizations/:id/regenerate-code')
    .put(protect, authorize('admin'), regenerateOrganizerCode);

router.route('/gigs')
    .get(protect, authorize('admin'), getAllGigs);

router.route('/portfolios')
    .get(protect, authorize('admin'), getAllPortfolios);

router.route('/reports')
    .get(protect, authorize('admin'), getAllReports);

router.route('/reports/:id')
    .put(protect, authorize('admin'), updateReportStatus);

export default router;

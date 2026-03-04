import express from 'express';
import { seedData, getOrgRequests, manageOrgRequest } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/seed', seedData);

router.route('/org-requests')
    .get(protect, authorize('admin'), getOrgRequests);

router.route('/org-requests/:id')
    .put(protect, authorize('admin'), manageOrgRequest);

export default router;

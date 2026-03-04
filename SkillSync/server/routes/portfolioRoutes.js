import express from 'express';
import {
    getMyPortfolio,
    createPortfolioItem,
    updatePortfolioItem,
    deletePortfolioItem
} from '../controllers/portfolioController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, authorize('student', 'faculty', 'admin'), getMyPortfolio)
    .post(protect, authorize('student'), createPortfolioItem);

router.route('/:id')
    .put(protect, authorize('student'), updatePortfolioItem)
    .delete(protect, authorize('student'), deletePortfolioItem);

export default router;

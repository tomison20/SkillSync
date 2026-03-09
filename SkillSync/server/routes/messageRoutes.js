import express from 'express';
import { sendMessage, getConversation, getConversationsList } from '../controllers/messageController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// MUST be before /:userId to avoid param collision
router.route('/').get(protect, authorize('student'), getConversationsList);
router.route('/:receiverId').post(protect, authorize('student'), sendMessage);
router.route('/:userId').get(protect, authorize('student'), getConversation);

export default router;

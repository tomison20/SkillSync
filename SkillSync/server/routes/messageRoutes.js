import express from 'express';
import { sendMessage, getConversation, getConversationsList, getGroupConversation, sendGroupMessage, deleteMessage } from '../controllers/messageController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Allow both students and organizers to access messaging APIs
const authMessaging = authorize('student', 'organizer', 'admin');

// MUST be before /:userId to avoid param collision
router.route('/').get(protect, authMessaging, getConversationsList);

// Group Chat Routes
router.route('/group/:gigId')
    .get(protect, authMessaging, getGroupConversation)
    .post(protect, authMessaging, sendGroupMessage);

// Delete message (must be before /:userId to avoid param collision)
router.route('/delete/:messageId').delete(protect, authMessaging, deleteMessage);

// 1-on-1 Chat Routes
router.route('/:receiverId').post(protect, authMessaging, sendMessage);
router.route('/:userId').get(protect, authMessaging, getConversation);

export default router;

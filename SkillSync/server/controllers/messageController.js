import Message from '../models/Message.js';
import User from '../models/User.js';

// @desc    Send a message
// @route   POST /api/messages/:receiverId
// @access  Private (Student)
export const sendMessage = async (req, res) => {
    try {
        const { receiverId } = req.params;
        const senderId = req.user._id;
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ message: "Message content is required." });
        }

        const receiver = await User.findById(receiverId);
        const sender = await User.findById(senderId);

        if (!receiver || receiver.role !== 'student') {
            return res.status(404).json({ message: "Recipient student not found." });
        }

        if (receiver.organization.toString() !== sender.organization.toString()) {
            return res.status(403).json({ message: "You can only message students in your college." });
        }

        const message = await Message.create({
            sender: senderId,
            receiver: receiverId,
            content
        });

        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get conversation history with a user
// @route   GET /api/messages/:userId
// @access  Private (Student)
export const getConversation = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user._id;

        const messages = await Message.find({
            $or: [
                { sender: currentUserId, receiver: userId },
                { sender: userId, receiver: currentUserId }
            ]
        }).sort({ createdAt: 1 }); // Oldest first for chat history

        // Mark unread messages as read
        const unreadMessages = messages.filter(
            m => m.receiver.toString() === currentUserId.toString() && !m.read
        );
        if (unreadMessages.length > 0) {
            const unreadIds = unreadMessages.map(m => m._id);
            await Message.updateMany({ _id: { $in: unreadIds } }, { $set: { read: true } });
        }

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all active conversations for the current user
// @route   GET /api/messages
// @access  Private (Student)
export const getConversationsList = async (req, res) => {
    try {
        const currentUserId = req.user._id;

        // Find all messages involving the current user
        const messages = await Message.find({
            $or: [{ sender: currentUserId }, { receiver: currentUserId }]
        })
        .sort({ createdAt: -1 })
        .populate('sender', 'name avatar')
        .populate('receiver', 'name avatar');

        const conversationsMap = new Map();

        messages.forEach(msg => {
            const isSender = msg.sender._id.toString() === currentUserId.toString();
            // The other participant in the conversation
            const partner = isSender ? msg.receiver : msg.sender;
            const partnerId = partner._id.toString();

            if (!conversationsMap.has(partnerId)) {
                // Initialize conversation entry with the latest message
                conversationsMap.set(partnerId, {
                    partner: partner,
                    latestMessage: msg.content,
                    latestMessageAt: msg.createdAt,
                    unreadCount: (!isSender && !msg.read) ? 1 : 0
                });
            } else {
                // Just count unread messages if it's not the latest
                if (!isSender && !msg.read) {
                    const conv = conversationsMap.get(partnerId);
                    conv.unreadCount += 1;
                }
            }
        });

        // Convert map to array and sort by latest message date
        const conversationsList = Array.from(conversationsMap.values());
        
        res.json(conversationsList);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

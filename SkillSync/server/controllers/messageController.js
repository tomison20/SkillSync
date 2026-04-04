import Message from '../models/Message.js';
import User from '../models/User.js';
import Gig from '../models/Gig.js';
import Bid from '../models/Bid.js';

// @desc    Send a direct message
// @route   POST /api/messages/:receiverId
// @access  Private (Student & Organizer)
export const sendMessage = async (req, res) => {
    try {
        const { receiverId } = req.params;
        const senderId = req.user._id;
        const { content, attachmentUrl, attachmentOrigName, gigId } = req.body;

        if (!content && !attachmentUrl) {
            return res.status(400).json({ message: "Message content or attachment is required." });
        }

        const receiver = await User.findById(receiverId);
        const sender = await User.findById(senderId);

        if (!receiver) {
            return res.status(404).json({ message: "Recipient not found." });
        }

        if (receiver.organization.toString() !== sender.organization.toString()) {
            return res.status(403).json({ message: "You can only message members in your college." });
        }

        const message = await Message.create({
            sender: senderId,
            receiver: receiverId,
            isGroupMessage: false,
            gig: gigId || undefined,
            content: content || '',
            attachmentUrl,
            attachmentOrigName
        });

        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get conversation history with a user
// @route   GET /api/messages/:userId
// @access  Private (Student & Organizer)
export const getConversation = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user._id;

        const messages = await Message.find({
            isGroupMessage: false, // Ensure we only get DMs
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
// @access  Private (Student & Organizer)
export const getConversationsList = async (req, res) => {
    try {
        const currentUserId = req.user._id;

        // 1. Fetch 1-on-1 Messages
        const dm_messages = await Message.find({
            isGroupMessage: false,
            $or: [{ sender: currentUserId }, { receiver: currentUserId }]
        })
            .sort({ createdAt: -1 })
            .populate('sender', 'name avatar')
            .populate('receiver', 'name avatar');

        const conversationsMap = new Map();

        dm_messages.forEach(msg => {
            const isSender = msg.sender._id.toString() === currentUserId.toString();
            // The other participant in the conversation
            const partner = isSender ? msg.receiver : msg.sender;

            // Handle edge case where partner was deleted
            if (!partner) return;

            const partnerId = partner._id.toString();

            if (!conversationsMap.has(partnerId)) {
                // Initialize conversation entry with the latest message
                conversationsMap.set(partnerId, {
                    type: 'direct',
                    partner: partner,
                    latestMessage: msg.content || (msg.attachmentUrl ? 'Attachment' : ''),
                    latestMessageAt: msg.createdAt,
                    unreadCount: (!isSender && !msg.read) ? 1 : 0
                });
            } else {
                // Count unread messages
                if (!isSender && !msg.read) {
                    const conv = conversationsMap.get(partnerId);
                    conv.unreadCount += 1;
                }
            }
        });

        // 2. Fetch Group Chats bounded to Gigs
        let userGigs = [];
        if (req.user.role === 'organizer' || req.user.role === 'admin') {
            userGigs = await Gig.find({ organizer: currentUserId }).select('_id title createdAt');
        } else if (req.user.role === 'student') {
            const bids = await Bid.find({ freelancer: currentUserId, status: 'accepted' }).select('gig');
            const gigIds = bids.map(b => b.gig);
            userGigs = await Gig.find({ _id: { $in: gigIds } }).select('_id title createdAt');
        }

        if (userGigs.length > 0) {
            const gigIds = userGigs.map(g => g._id);
            const groupMessages = await Message.find({
                isGroupMessage: true,
                gig: { $in: gigIds }
            }).sort({ createdAt: -1 });

            userGigs.forEach(g => {
                const gigIdStr = g._id.toString();
                const msgsForGig = groupMessages.filter(m => m.gig.toString() === gigIdStr);

                if (msgsForGig.length > 0) {
                    const latestMsg = msgsForGig[0];
                    conversationsMap.set(`group_${gigIdStr}`, {
                        type: 'group',
                        gig: g,
                        latestMessage: latestMsg.content || (latestMsg.attachmentUrl ? 'Attachment' : ''),
                        latestMessageAt: latestMsg.createdAt,
                        unreadCount: 0 // Simplification for group read receipts
                    });
                } else {
                    // Empty group chat entry to prompt start of chat
                    conversationsMap.set(`group_${gigIdStr}`, {
                        type: 'group',
                        gig: g,
                        latestMessage: 'Start a group conversation!',
                        latestMessageAt: g.createdAt,
                        unreadCount: 0
                    });
                }
            });
        }

        // Convert map to array and sort by latest message date overall
        const conversationsList = Array.from(conversationsMap.values())
            .sort((a, b) => new Date(b.latestMessageAt) - new Date(a.latestMessageAt));

        res.json(conversationsList);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get group chat history for a gig
// @route   GET /api/messages/group/:gigId
// @access  Private (Student & Organizer)
export const getGroupConversation = async (req, res) => {
    try {
        const { gigId } = req.params;

        const messages = await Message.find({
            isGroupMessage: true,
            gig: gigId
        })
            .sort({ createdAt: 1 })
            .populate('sender', 'name avatar role');

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Send a group message
// @route   POST /api/messages/group/:gigId
// @access  Private (Student & Organizer)
export const sendGroupMessage = async (req, res) => {
    try {
        const { gigId } = req.params;
        const senderId = req.user._id;
        const { content, attachmentUrl, attachmentOrigName } = req.body;

        if (!content && !attachmentUrl) {
            return res.status(400).json({ message: "Message content or attachment is required." });
        }

        const gig = await Gig.findById(gigId);
        if (!gig) {
            return res.status(404).json({ message: "Opportunity not found." });
        }

        const message = await Message.create({
            sender: senderId,
            isGroupMessage: true,
            gig: gigId,
            content: content || '',
            attachmentUrl,
            attachmentOrigName
        });

        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a message (soft delete — sender only)
// @route   DELETE /api/messages/:messageId
// @access  Private (Student & Organizer)
export const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ message: 'Message not found.' });
        }

        if (message.sender.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can only delete your own messages.' });
        }

        message.isDeleted = true;
        message.content = '';
        message.attachmentUrl = undefined;
        message.attachmentOrigName = undefined;
        await message.save();

        res.json({ message: 'Message deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


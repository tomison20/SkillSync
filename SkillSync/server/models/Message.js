import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional for Group Chats
    
    // Group Chat Context
    isGroupMessage: { type: Boolean, default: false },
    gig: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig' }, // Binds the message to a specific event
    
    content: { type: String, default: '' },
    attachmentUrl: { type: String },
    attachmentOrigName: { type: String },
    read: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);
export default Message;

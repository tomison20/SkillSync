import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: {
        type: String,
        enum: ['spam', 'harassment', 'inappropriate_content', 'fake_profile', 'scam', 'other'],
        required: true
    },
    description: { type: String, default: '' },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'dismissed'],
        default: 'pending'
    },
    adminNotes: { type: String },
    createdAt: { type: Date, default: Date.now }
});

// Prevent duplicate reports from the same user about the same person
reportSchema.index({ reporter: 1, reportedUser: 1 }, { unique: true });

const Report = mongoose.model('Report', reportSchema);
export default Report;

import mongoose from 'mongoose';

const organizationRequestSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    domain: { type: String },
    requesterName: { type: String, required: true },
    requesterEmail: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    adminNotes: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const OrganizationRequest = mongoose.model('OrganizationRequest', organizationRequestSchema);
export default OrganizationRequest;

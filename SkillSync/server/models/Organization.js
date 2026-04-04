import mongoose from 'mongoose';
import crypto from 'crypto';

const organizationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    uniqueCode: { type: String, required: true, unique: true }, // e.g., AJCE2026
    domain: { type: String }, // e.g., ajce.in
    organizerCode: { type: String, unique: true, sparse: true }, // Secret code for organizer registration
    logo: { type: String, default: '' },
    bannerImage: { type: String, default: '' },
    themeColor: { type: String, default: '#0f172a' }, // Default SkillSync Navy
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

// Auto-generate organizer code before saving if not set
organizationSchema.pre('save', function (next) {
    if (!this.organizerCode) {
        const suffix = crypto.randomBytes(4).toString('hex').toUpperCase();
        this.organizerCode = `${this.uniqueCode}-ORG-${suffix}`;
    }
    next();
});

const Organization = mongoose.model('Organization', organizationSchema);
export default Organization;

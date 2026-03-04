import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    uniqueCode: { type: String, required: true, unique: true }, // e.g., AJCE2026
    domain: { type: String }, // e.g., ajce.in
    logo: { type: String, default: '' },
    bannerImage: { type: String, default: '' },
    themeColor: { type: String, default: '#0f172a' }, // Default SkillSync Navy
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

const Organization = mongoose.model('Organization', organizationSchema);
export default Organization;

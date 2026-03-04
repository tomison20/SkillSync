import mongoose from 'mongoose';

const eventParticipationSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    hoursContributed: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['pending', 'approved', 'completed'],
        default: 'pending'
    },
    verifiedAt: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

const EventParticipation = mongoose.model('EventParticipation', eventParticipationSchema);
export default EventParticipation;

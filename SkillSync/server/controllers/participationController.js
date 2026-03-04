import EventParticipation from '../models/EventParticipation.js';

// @desc    Get participation history
// @route   GET /api/participation
export const getMyParticipation = async (req, res) => {
    try {
        const history = await EventParticipation.find({
            student: req.user._id,
            organization: req.user.organization
        }).populate('event', 'title date location');
        res.json(history);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Log participation (Organizer marks student as attended)
// @route   POST /api/participation/verify
export const verifyParticipation = async (req, res) => {
    try {
        const { studentId, eventId, hours } = req.body;

        // Ensure student and event belong to the same institution
        const participation = await EventParticipation.findOneAndUpdate(
            { student: studentId, event: eventId, organization: req.user.organization },
            {
                status: 'completed',
                hoursContributed: hours,
                verifiedAt: Date.now()
            },
            { upsert: true, new: true }
        );

        res.json(participation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get total contribution stats
// @route   GET /api/participation/stats
export const getMyStats = async (req, res) => {
    try {
        const result = await EventParticipation.aggregate([
            { $match: { student: req.user._id, status: 'completed' } },
            {
                $group: {
                    _id: null,
                    totalHours: { $sum: "$hoursContributed" },
                    count: { $sum: 1 }
                }
            }
        ]);

        const stats = result[0] || { totalHours: 0, count: 0 };
        res.json({
            totalHours: stats.totalHours,
            completedActivities: stats.count,
            contributionScore: stats.totalHours * 10 // Example formula
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

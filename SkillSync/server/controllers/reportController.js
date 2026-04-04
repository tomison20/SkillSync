import Report from '../models/Report.js';
import User from '../models/User.js';
import { sendReportNotificationEmail } from '../utils/email.js';

// @desc    Report a user
// @route   POST /api/users/:id/report
// @access  Private
export const reportUser = async (req, res) => {
    try {
        const { reason, description } = req.body;
        const reportedUserId = req.params.id;

        if (!reason) {
            return res.status(400).json({ message: 'A reason for the report is required.' });
        }

        if (reportedUserId === req.user._id.toString()) {
            return res.status(400).json({ message: 'You cannot report yourself.' });
        }

        const reportedUser = await User.findById(reportedUserId);
        if (!reportedUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Check for duplicate report
        const existingReport = await Report.findOne({ reporter: req.user._id, reportedUser: reportedUserId });
        if (existingReport) {
            return res.status(400).json({ message: 'You have already reported this user.' });
        }

        await Report.create({
            reporter: req.user._id,
            reportedUser: reportedUserId,
            reason,
            description: description || ''
        });

        // Increment report count
        reportedUser.reportCount = (reportedUser.reportCount || 0) + 1;

        // Auto-ban if reports >= 4
        if (reportedUser.reportCount >= 4 && !reportedUser.isBanned) {
            reportedUser.isBanned = true;
            reportedUser.banExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        }

        await reportedUser.save();

        // Notify admin (non-blocking)
        sendReportNotificationEmail(reportedUser.name, reason, reportedUser.reportCount)
            .catch(err => console.error('Report notification email error:', err.message));

        res.status(201).json({
            message: 'Report submitted successfully.',
            reportCount: reportedUser.reportCount,
            isBanned: reportedUser.isBanned
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'You have already reported this user.' });
        }
        res.status(500).json({ message: error.message });
    }
};

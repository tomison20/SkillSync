import User from '../models/User.js';

// @desc    Get network students
// @route   GET /api/users/network
// @access  Private (Student)
export const getNetworkStudents = async (req, res) => {
    try {
        const keyword = req.query.keyword
            ? {
                $or: [
                    { name: { $regex: req.query.keyword, $options: 'i' } },
                    { skills: { $regex: req.query.keyword, $options: 'i' } },
                    { course: { $regex: req.query.keyword, $options: 'i' } }
                ]
            }
            : {};

        const users = await User.find({
            ...keyword,
            role: 'student',
            organization: req.user.organization,
            isDiscoverable: true
        }).select('name avatar skills course github linkedin portfolioWebsite');

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get public student profile
// @route   GET /api/users/network/:id
// @access  Private (Student)
export const getPublicStudentProfile = async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.params.id,
            role: 'student',
            organization: req.user.organization,
            isDiscoverable: true
        }).select('-password -email'); // Exclude sensitive info

        if (!user) {
            res.status(404);
            throw new Error('Student not found or not discoverable');
        }

        res.json(user);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

// @desc    Follow a student
// @route   POST /api/users/:id/follow
// @access  Private (Student)
export const followUser = async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const currentUserId = req.user._id;

        if (targetUserId === currentUserId.toString()) {
            return res.status(400).json({ message: "You cannot follow yourself." });
        }

        const targetUser = await User.findById(targetUserId);
        const currentUser = await User.findById(currentUserId);

        if (!targetUser || targetUser.role !== 'student') {
            return res.status(404).json({ message: "Student not found." });
        }

        // Must be in the same org
        if (targetUser.organization.toString() !== currentUser.organization.toString()) {
            return res.status(403).json({ message: "You can only follow students in your college." });
        }

        if (!currentUser.following.includes(targetUserId)) {
            currentUser.following.push(targetUserId);
            targetUser.followers.push(currentUserId);

            await currentUser.save();
            await targetUser.save();
            return res.status(200).json({ message: "Successfully followed user." });
        } else {
            return res.status(400).json({ message: "You are already following this user." });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Unfollow a student
// @route   POST /api/users/:id/unfollow
// @access  Private (Student)
export const unfollowUser = async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const currentUserId = req.user._id;

        const targetUser = await User.findById(targetUserId);
        const currentUser = await User.findById(currentUserId);

        if (!targetUser || !currentUser) {
            return res.status(404).json({ message: "User not found." });
        }

        if (currentUser.following.includes(targetUserId)) {
            currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId);
            targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId.toString());

            await currentUser.save();
            await targetUser.save();
            return res.status(200).json({ message: "Successfully unfollowed user." });
        } else {
            return res.status(400).json({ message: "You are not following this user." });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

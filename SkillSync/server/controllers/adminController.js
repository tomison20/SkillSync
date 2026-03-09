import Organization from '../models/Organization.js';
import OrganizationRequest from '../models/OrganizationRequest.js';
import User from '../models/User.js';

// @desc    Seed Organization and Admin
// @route   POST /api/admin/seed
// @access  Public (Dev only)
export const seedData = async (req, res) => {
    try {
        const orgEncoded = {
            name: "AJCE",
            uniqueCode: "AJCE2026",
            domain: "ajce.in",
            themeColor: "#1E293B" // Slate 800
        };

        let org = await Organization.findOne({ uniqueCode: orgEncoded.uniqueCode });
        if (!org) {
            org = await Organization.create(orgEncoded);
        }

        const adminEmail = "admin@ajce.in";
        const adminExists = await User.findOne({ email: adminEmail });

        if (!adminExists) {
            const admin = await User.create({
                name: "System Administrator",
                email: adminEmail,
                password: "admin123", // Default for dev seeding
                role: "admin",
                organization: org._id
            });
            await Wallet.create({ user: admin._id });
            return res.status(201).json({
                message: 'Organization and Admin Seeding Successful',
                organization: org,
                admin: { email: adminEmail, password: "admin123" }
            });
        }

        res.status(200).json({ message: 'Seeding already complete', organization: org });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all organization requests
// @route   GET /api/admin/org-requests
// @access  Private (Admin only)
export const getOrgRequests = async (req, res) => {
    try {
        const requests = await OrganizationRequest.find().sort('-createdAt');
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve/Reject organization request
// @route   PUT /api/admin/org-requests/:id
// @access  Private (Admin only)
export const manageOrgRequest = async (req, res) => {
    try {
        const { status, adminNotes } = req.body;
        const request = await OrganizationRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        request.status = status;
        request.adminNotes = adminNotes;
        await request.save();

        if (status === 'approved') {
            // Create actual organization
            await Organization.create({
                name: request.name,
                uniqueCode: request.code,
                domain: request.domain,
                createdBy: req.user._id
            });
        }

        res.json({ message: `Request ${status} successfully`, request });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get platform stats
// @route   GET /api/admin/stats
// @access  Private (Admin only)
export const getPlatformStats = async (req, res) => {
    try {
        const students = await User.countDocuments({ role: 'student' });
        const organizers = await User.countDocuments({ role: 'organizer' });
        const organizations = await Organization.countDocuments();
        const pendingRequests = await OrganizationRequest.countDocuments({ status: 'pending' });

        res.json({
            students,
            organizers,
            organizations,
            pendingRequests
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all non-admin users
// @route   GET /api/admin/users
// @access  Private (Admin only)
export const getUsers = async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: 'admin' } })
            .select('-password')
            .populate('organization', 'name uniqueCode')
            .sort('-createdAt');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle user status (disable/enable)
// @route   PUT /api/admin/users/:id/disable
// @access  Private (Admin only)
export const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(400).json({ message: 'Cannot disable another administrator' });
        }

        user.isDisabled = !user.isDisabled;
        await user.save();

        res.json({ message: `User account has been ${user.isDisabled ? 'disabled' : 'enabled'}`, isDisabled: user.isDisabled });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

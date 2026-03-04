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

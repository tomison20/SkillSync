import User from '../models/User.js';
import Organization from '../models/Organization.js';
import OrganizationRequest from '../models/OrganizationRequest.js';
import jwt from 'jsonwebtoken';
import axios from 'axios'; // For EmailJS REST API

// ... (generateToken and sendWelcomeEmail remain unchanged)

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, instituteCode, role } = req.body;

        if (!name || !email || !password || !instituteCode) {
            return res.status(400).json({ message: 'Please provide all required fields, including Institute Code' });
        }

        // Validate Institute Code (Strict)
        const organization = await Organization.findOne({ uniqueCode: instituteCode.toUpperCase() });
        if (!organization) {
            return res.status(400).json({
                message: 'Invalid Institute Code. If your college is not registered, please submit a Request College form.'
            });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            organization: organization._id,
            role: role || 'student',
            userType: role === 'organizer' ? 'employer' : 'freelancer'
        });

        if (user) {
            const token = generateToken(res, user._id);

            sendWelcomeEmail(user);

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                organization: {
                    name: organization.name,
                    id: organization._id,
                    uniqueCode: organization.uniqueCode
                },
                token
            });
        } else {
            return res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Request a new organization
// @route   POST /api/auth/request-org
// @access  Public
export const requestOrganization = async (req, res) => {
    try {
        const { name, code, domain, requesterName, requesterEmail } = req.body;

        if (!name || !code || !requesterName || !requesterEmail) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Check if org or request already exists
        const orgExists = await Organization.findOne({ uniqueCode: code.toUpperCase() });
        if (orgExists) {
            return res.status(400).json({ message: 'An organization with this code already exists' });
        }

        const requestExists = await OrganizationRequest.findOne({ code: code.toUpperCase(), status: 'pending' });
        if (requestExists) {
            return res.status(400).json({ message: 'A request for this organization is already pending approval' });
        }

        const orgRequest = await OrganizationRequest.create({
            name,
            code: code.toUpperCase(),
            domain,
            requesterName,
            requesterEmail
        });

        res.status(201).json({ message: 'Request submitted successfully. An admin will review it soon.', request: orgRequest });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).populate('organization', 'name uniqueCode');

        if (user && (await user.matchPassword(password))) {
            const token = generateToken(res, user._id);
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                organization: user.organization,
                token
            });
        } else {
            res.status(401);
            throw new Error('Invalid email or password');
        }
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
    try {
        if (!req.user?._id) {
            res.status(401);
            throw new Error('Not authorized, no user context');
        }

        const user = await User.findById(req.user._id).select('-password').populate('organization', 'name uniqueCode');

        if (user) {
            res.json(user);
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        res.status(res.statusCode === 200 ? 404 : res.statusCode).json({ message: error.message });
    }
};

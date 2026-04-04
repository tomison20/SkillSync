import User from '../models/User.js';
import Organization from '../models/Organization.js';
import OrganizationRequest from '../models/OrganizationRequest.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../utils/email.js';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT and set as httpOnly cookie
const generateToken = (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });

    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return token;
};

// @desc    Google Authentication (Login/Register)
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = async (req, res) => {
    try {
        const { token } = req.body;
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name, picture, hd } = payload; // hd is the hosted domain

        // Check if user already exists
        let user = await User.findOne({ email });

        if (user) {
            // Log in existing user
            const jwtToken = generateToken(res, user._id);
            return res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                organization: user.organization,
                token: jwtToken
            });
        }

        // If user doesn't exist, try resolving the organization by Google hosted domain or email domain.
        const domain = hd || (email ? email.split('@')[1] : null);
        
        if (!domain) {
            return res.status(403).json({ message: 'Google Auth requires an institutional G-Suite / Workspace email with a managed domain.' });
        }

        const org = await Organization.findOne({ domain: domain.toLowerCase() });
        if (!org) {
            return res.status(404).json({ message: `Your institution domain (${domain}) is not registered yet. Please sign up manually with an invite code or request your college.` });
        }

        // Create new student user since they passed the domain check
        user = await User.create({
            name,
            email,
            password: crypto.randomBytes(16).toString('hex'), // Random secure password since they login with Google
            role: 'student',
            organization: org._id,
            avatar: picture
        });

        // Try sending welcome email
        try { await sendWelcomeEmail(user); } catch(err) { console.error('Welcome email error:', err); }

        const jwtToken = generateToken(res, user._id);
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            organization: user.organization,
            token: jwtToken
        });

    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(401).json({ message: 'Invalid Google Token' });
    }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, instituteCode, role, organizerCode } = req.body;

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

        // Domain Validation — check email domain matches organization domain
        if (organization.domain) {
            const emailDomain = email.split('@')[1]?.toLowerCase();
            const orgDomain = organization.domain.toLowerCase();
            if (emailDomain !== orgDomain) {
                return res.status(400).json({
                    message: `Please use your institutional email (@${organization.domain}) to register.`
                });
            }
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Role assignment — default to student, organizer only with valid organizer code
        let assignedRole = 'student';
        if (role === 'organizer') {
            if (!organizerCode) {
                return res.status(400).json({ message: 'Organizer Code is required to register as an organizer.' });
            }
            if (organizerCode.trim() !== organization.organizerCode) {
                return res.status(400).json({ message: 'Invalid Organizer Code. Contact your department admin for the correct code.' });
            }
            assignedRole = 'organizer';
        }
        // Admin role cannot be self-assigned — it can only be set directly in the database

        const user = await User.create({
            name,
            email,
            password,
            organization: organization._id,
            role: assignedRole,
            userType: assignedRole === 'organizer' ? 'organizer' : 'freelancer'
        });

        if (user) {
            const token = generateToken(res, user._id);

            // Send welcome email (non-blocking)
            sendWelcomeEmail(user).catch(err => console.error('Welcome email error:', err.message));

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
            if (user.isDisabled) {
                return res.status(403).json({ message: 'Your account has been disabled by an administrator.' });
            }

            // Check ban status
            if (user.isBanned) {
                if (user.banExpiry && new Date() > new Date(user.banExpiry)) {
                    // Ban expired — auto-unban
                    user.isBanned = false;
                    user.banExpiry = undefined;
                    await user.save();
                } else {
                    const expiryDate = user.banExpiry ? new Date(user.banExpiry).toLocaleDateString() : 'indefinitely';
                    return res.status(403).json({ message: `Your account is temporarily suspended until ${expiryDate} due to community reports.` });
                }
            }

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

        const user = await User.findById(req.user._id)
            .select('-password')
            .populate('organization', 'name uniqueCode')
            .populate('followers', 'name avatar course')
            .populate('following', 'name avatar course');

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

// @desc    Update user profile (social links, headline, bio, skills)
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { headline, bio, course, isDiscoverable, skills, github, linkedin, twitter, portfolioWebsite, customLinkUrl, customLinkName, avatar, resume } = req.body;

        if (headline !== undefined) user.headline = headline;
        if (bio !== undefined) user.bio = bio;
        if (course !== undefined) user.course = course;
        if (isDiscoverable !== undefined) user.isDiscoverable = isDiscoverable;
        if (skills !== undefined) user.skills = skills;
        if (github !== undefined) user.github = github;
        if (linkedin !== undefined) user.linkedin = linkedin;
        if (twitter !== undefined) user.twitter = twitter;
        if (portfolioWebsite !== undefined) user.portfolioWebsite = portfolioWebsite;
        if (customLinkUrl !== undefined) user.customLinkUrl = customLinkUrl;
        if (customLinkName !== undefined) user.customLinkName = customLinkName;
        if (avatar !== undefined) user.avatar = avatar;
        if (resume !== undefined) user.resume = resume;

        const updatedUser = await user.save();
        const populated = await User.findById(updatedUser._id).select('-password').populate('organization', 'name uniqueCode');

        res.json(populated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Forgot password — send reset link
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Please provide your email address.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            // Don't reveal if email exists
            return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
        }

        // Generate token
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
        await user.save();

        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

        await sendPasswordResetEmail(user, resetUrl);

        res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to send reset email. Please try again later.' });
    }
};

// @desc    Reset password via token
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters.' });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token.' });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiry = undefined;
        await user.save();

        res.status(200).json({ message: 'Password reset successful. You can now log in with your new password.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

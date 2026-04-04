import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.userId).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            // Check if user is banned
            if (req.user.isBanned) {
                if (req.user.banExpiry && new Date() > new Date(req.user.banExpiry)) {
                    // Ban expired — auto-unban
                    req.user.isBanned = false;
                    req.user.banExpiry = undefined;
                    await req.user.save();
                } else {
                    const expiryDate = req.user.banExpiry ? new Date(req.user.banExpiry).toLocaleDateString() : 'indefinitely';
                    return res.status(403).json({ message: `Your account is temporarily suspended until ${expiryDate} due to community reports.` });
                }
            }

            return next();
        } catch (error) {
            console.error('Auth Middleware Error (Bearer):', error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else if (req.cookies.jwt) {
        try {
            token = req.cookies.jwt;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.userId).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            // Check if user is banned
            if (req.user.isBanned) {
                if (req.user.banExpiry && new Date() > new Date(req.user.banExpiry)) {
                    req.user.isBanned = false;
                    req.user.banExpiry = undefined;
                    await req.user.save();
                } else {
                    const expiryDate = req.user.banExpiry ? new Date(req.user.banExpiry).toLocaleDateString() : 'indefinitely';
                    return res.status(403).json({ message: `Your account is temporarily suspended until ${expiryDate} due to community reports.` });
                }
            }

            return next();
        } catch (error) {
            console.error('Auth Middleware Error (Cookie):', error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access Denied' });
        }

        // Super-admin lockdown: if 'admin' role is required, verify email whitelist
        if (roles.includes('admin') && req.user.role === 'admin') {
            const superAdminEmails = (process.env.SUPER_ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
            if (superAdminEmails.length > 0 && superAdminEmails[0] !== '' && !superAdminEmails.includes(req.user.email.toLowerCase())) {
                return res.status(403).json({ message: 'Access Denied — Super Admin privileges required' });
            }
        }

        next();
    };
};

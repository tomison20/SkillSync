import nodemailer from 'nodemailer';

let transporter;

const getTransporter = () => {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
    return transporter;
};

/**
 * Send an email via SMTP
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML email body
 */
export const sendEmail = async (to, subject, html) => {
    try {
        await getTransporter().sendMail({
            from: `"SkillSync" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });
        console.log(`Email sent to: ${to}`);
    } catch (error) {
        console.error('Email send failed:', error.message);
        throw error;
    }
};

/**
 * Send welcome email to new user
 */
export const sendWelcomeEmail = async (user) => {
    const html = `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #F7F9F5; border-radius: 12px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #1A2E1D, #4A7C59); padding: 32px; text-align: center;">
                <h1 style="color: #fff; margin: 0; font-size: 28px;">Welcome to SkillSync</h1>
            </div>
            <div style="padding: 32px;">
                <p style="color: #1A2E1D; font-size: 16px;">Hi <strong>${user.name}</strong>,</p>
                <p style="color: #4A5E4D; font-size: 14px; line-height: 1.6;">
                    Your account has been created successfully. You're now part of your institution's SkillSync community.
                </p>
                <p style="color: #4A5E4D; font-size: 14px; line-height: 1.6;">
                    Start exploring gigs, events, and connect with your peers!
                </p>
                <div style="text-align: center; margin-top: 24px;">
                    <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" 
                       style="background: #4A7C59; color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
                        Get Started
                    </a>
                </div>
            </div>
            <div style="background: #E8F0E4; padding: 16px; text-align: center;">
                <p style="color: #829485; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} SkillSync — Your Academic Marketplace</p>
            </div>
        </div>
    `;
    await sendEmail(user.email, 'Welcome to SkillSync!', html);
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (user, resetUrl) => {
    const html = `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #F7F9F5; border-radius: 12px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #1A2E1D, #4A7C59); padding: 32px; text-align: center;">
                <h1 style="color: #fff; margin: 0; font-size: 28px;">Password Reset</h1>
            </div>
            <div style="padding: 32px;">
                <p style="color: #1A2E1D; font-size: 16px;">Hi <strong>${user.name}</strong>,</p>
                <p style="color: #4A5E4D; font-size: 14px; line-height: 1.6;">
                    We received a request to reset your password. Click the button below to create a new password.
                </p>
                <div style="text-align: center; margin: 28px 0;">
                    <a href="${resetUrl}" 
                       style="background: #4A7C59; color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
                        Reset Password
                    </a>
                </div>
                <p style="color: #829485; font-size: 12px; line-height: 1.6;">
                    This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.
                </p>
            </div>
            <div style="background: #E8F0E4; padding: 16px; text-align: center;">
                <p style="color: #829485; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} SkillSync — Your Academic Marketplace</p>
            </div>
        </div>
    `;
    await sendEmail(user.email, 'SkillSync — Password Reset', html);
};

/**
 * Send report notification email to admin
 */
export const sendReportNotificationEmail = async (reportedUserName, reason, reportCount) => {
    const superAdminEmails = (process.env.SUPER_ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean);
    if (superAdminEmails.length === 0) return;

    const html = `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #F7F9F5; border-radius: 12px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #C0392B, #922B21); padding: 32px; text-align: center;">
                <h1 style="color: #fff; margin: 0; font-size: 28px;">⚠️ User Report Alert</h1>
            </div>
            <div style="padding: 32px;">
                <p style="color: #1A2E1D; font-size: 16px;"><strong>${reportedUserName}</strong> has been reported.</p>
                <p style="color: #4A5E4D; font-size: 14px;"><strong>Reason:</strong> ${reason}</p>
                <p style="color: #4A5E4D; font-size: 14px;"><strong>Total reports:</strong> ${reportCount}</p>
                ${reportCount >= 4 ? '<p style="color: #C0392B; font-size: 14px; font-weight: 600;">⛔ Auto-ban triggered (7 days).</p>' : ''}
            </div>
        </div>
    `;
    for (const email of superAdminEmails) {
        await sendEmail(email, `User Report: ${reportedUserName} (${reportCount} reports)`, html);
    }
};

export default { sendEmail, sendWelcomeEmail, sendPasswordResetEmail, sendReportNotificationEmail };

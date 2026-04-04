import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post(`/auth/reset-password/${token}`, { password });
            setMessage(data.message);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Reset failed. The link may have expired.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: '6rem 0', maxWidth: '450px' }}>
            <div className="card" style={{ padding: '3rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', textAlign: 'center', color: 'var(--text-primary)' }}>
                    Create New Password
                </h1>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                    Enter your new password below.
                </p>

                {message && (
                    <div style={{
                        background: 'var(--success-bg)',
                        border: '1px solid var(--success-border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.75rem 1rem',
                        marginBottom: '1.5rem',
                        color: 'var(--success-text)',
                        fontSize: '0.85rem'
                    }}>
                        ✅ {message} — Redirecting to login...
                    </div>
                )}

                {error && (
                    <div style={{
                        background: 'var(--error-bg)',
                        border: '1px solid var(--error-border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.75rem 1rem',
                        marginBottom: '1.5rem',
                        color: 'var(--error-text)',
                        fontSize: '0.85rem'
                    }}>
                        {error}
                    </div>
                )}

                {!message && (
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label className="label">New Password</label>
                            <input
                                type="password"
                                className="input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>
                        <div className="input-group">
                            <label className="label">Confirm Password</label>
                            <input
                                type="password"
                                className="input"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginBottom: '1.5rem', opacity: loading ? 0.7 : 1 }}>
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}

                <div style={{ textAlign: 'center', fontSize: '0.9rem' }}>
                    <Link to="/login" style={{ color: 'var(--color-accent)', fontWeight: '500' }}>← Back to Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;

import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const { data } = await api.post('/auth/forgot-password', { email });
            setMessage(data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: '6rem 0', maxWidth: '450px' }}>
            <div className="card" style={{ padding: '3rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', textAlign: 'center', color: 'var(--text-primary)' }}>
                    Reset Password
                </h1>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                    Enter your registered email and we'll send you a reset link.
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
                        ✅ {message}
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

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="label">Email Address</label>
                        <input
                            type="email"
                            className="input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@college.edu"
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginBottom: '1.5rem', opacity: loading ? 0.7 : 1 }}>
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', fontSize: '0.9rem' }}>
                    <Link to="/login" style={{ color: 'var(--color-accent)', fontWeight: '500' }}>← Back to Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;

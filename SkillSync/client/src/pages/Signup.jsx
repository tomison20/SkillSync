import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        instituteCode: '',
        role: 'student',
        organizerCode: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login, user } = useAuth();

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            navigate(`/dashboard/${user.role}`);
        }
    }, [navigate, user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const { data } = await api.post('/auth/register', formData);
            login(data); // Update context
            navigate(`/dashboard/${data.role}`);
        } catch (error) {
            console.error(error);
            setError(error.response?.data?.message || 'Registration failed. Please try again.');
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const { data } = await api.post('/auth/google', { token: credentialResponse.credential });
            login(data);
            navigate(`/dashboard/${data.role}`);
        } catch (error) {
            console.error('Google Signup Error:', error);
            setError(error.response?.data?.message || 'Google Auth failed. Please sign up manually with an institute code.');
        }
    };

    return (
        <div className="container" style={{ padding: '6rem 0', maxWidth: '500px' }}>
            <div className="card" style={{ padding: '3rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', textAlign: 'center', color: 'var(--text-primary)' }}>Join SkillSync</h1>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                    Create your verified academic profile.
                </p>

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

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError('Google Login Failed')}
                        theme="filled_blue"
                        shape="rectangular"
                        text="signup_with"
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1rem 0 1.5rem' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }}></div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>OR</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }}></div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="label">Full Name</label>
                        <input className="input" name="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <label className="label">Email Address</label>
                        <input type="email" className="input" name="email" value={formData.email} onChange={handleChange} placeholder="Use your institutional email" required />
                    </div>
                    <div className="input-group">
                        <label className="label">Password</label>
                        <input type="password" className="input" name="password" value={formData.password} onChange={handleChange} required minLength={6} />
                    </div>
                    <div className="input-group">
                        <label className="label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                            Institutional Code
                            <Link to="/request-college" style={{ fontSize: '0.75rem', fontWeight: '400', textDecoration: 'underline' }}>Request My College</Link>
                        </label>
                        <input className="input" name="instituteCode" value={formData.instituteCode} onChange={handleChange} placeholder="e.g. AJCE2026" required />
                    </div>
                    <div className="input-group">
                        <label className="label">I am a...</label>
                        <select className="input" name="role" value={formData.role} onChange={handleChange} style={{ cursor: 'pointer' }}>
                            <option value="student">Student</option>
                            <option value="organizer">Organizer (Club/Dept)</option>
                        </select>
                    </div>

                    {formData.role === 'organizer' && (
                        <div className="input-group" style={{ animation: 'fadeIn 0.3s ease' }}>
                            <label className="label" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>
                                Organizer Code
                            </label>
                            <input
                                className="input"
                                name="organizerCode"
                                value={formData.organizerCode}
                                onChange={handleChange}
                                placeholder="Enter the secret organizer code from your dept"
                                required
                            />
                            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                                Contact your department admin or faculty for the organizer code.
                            </p>
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '1.5rem' }}>
                        Create Account
                    </button>
                </form>

                <div style={{ textAlign: 'center', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Already have an account? </span>
                    <Link to="/login" style={{ fontWeight: '600' }}>Sign in instead</Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;

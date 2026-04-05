import { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login, user } = useAuth();

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            navigate(`/dashboard/${user.role}`);
        }
    }, [navigate, user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const { data } = await api.post('/auth/login', { email, password });
            login(data);
            navigate(`/dashboard/${data.role}`);
        } catch (error) {
            console.error('Login Error:', error);
            setError(error.response?.data?.message || 'Login failed. Please check your credentials.');
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const { data } = await api.post('/auth/google', { token: credentialResponse.credential });
            login(data);
            navigate(`/dashboard/${data.role}`);
        } catch (error) {
            console.error('Google Login Error:', error);
            setError(error.response?.data?.message || 'Google Auth failed. Please make sure your institution is registered.');
        }
    };

    return (
        <div className="container" style={{ padding: '6rem 0', maxWidth: '450px' }}>
            <div className="card" style={{ padding: '3rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', textAlign: 'center', color: 'var(--text-primary)' }}>Welcome Back</h1>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                    Access your institutional account.
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
                        text="continue_with"
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1rem 0 1.5rem' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }}></div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>OR</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }}></div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="label">Email Address</label>
                        <input
                            type="email"
                            className="input"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setError(''); }}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label className="label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                            Password
                            <Link to="/forgot-password" style={{ fontSize: '0.75rem', fontWeight: '400', textDecoration: 'underline', color: 'var(--color-accent)' }}>
                                Forgot Password?
                            </Link>
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                className="input"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                required
                                style={{ paddingRight: '2.5rem' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    padding: '0 5px'
                                }}
                                tabIndex="-1"
                            >
                                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                            </button>
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '1.5rem' }}>
                        Sign In
                    </button>
                </form>

                <div style={{ textAlign: 'center', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>New to SkillSync? </span>
                    <Link to="/signup" style={{ fontWeight: '600' }}>Create an account</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;

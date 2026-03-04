import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
        try {
            const { data } = await api.post('/auth/login', { email, password });
            console.log('Login Success:', data);

            // 1. Update Auth Context (Handles localStorage and State)
            login(data);

            // 2. Immediate Redirect
            navigate(`/dashboard/${data.role}`);
        } catch (error) {
            console.error('Login Error:', error);
            const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
            alert(message);
        }
    };

    return (
        <div className="container" style={{ padding: '6rem 0', maxWidth: '450px' }}>
            <div className="card" style={{ padding: '3rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', textAlign: 'center' }}>Welcome Back</h1>
                <p style={{ textAlign: 'center', color: '#64748B', marginBottom: '2rem' }}>
                    Access your institutional account.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="label">Email Address</label>
                        <input
                            type="email"
                            className="input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label className="label">Password</label>
                        <input
                            type="password"
                            className="input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '1.5rem' }}>
                        Sign In
                    </button>
                </form>

                <div style={{ textAlign: 'center', fontSize: '0.9rem' }}>
                    <span style={{ color: '#64748B' }}>New to SkillSync? </span>
                    <Link to="/signup" style={{ fontWeight: '600' }}>Create an account</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;

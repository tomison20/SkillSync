import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        instituteCode: '',
        role: 'student'
    });
    const navigate = useNavigate();
    const { login, user } = useAuth();

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            navigate(`/dashboard/${user.role}`);
        }
    }, [navigate, user]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/auth/register', formData);
            login(data); // Update context
            navigate(`/dashboard/${data.role}`);
        } catch (error) {
            console.error(error);
            alert('Registration Failed: ' + (error.response?.data?.message || 'Server Error'));
        }
    };

    return (
        <div className="container" style={{ padding: '6rem 0', maxWidth: '500px' }}>
            <div className="card" style={{ padding: '3rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', textAlign: 'center' }}>Join SkillSync</h1>
                <p style={{ textAlign: 'center', color: '#64748B', marginBottom: '2rem' }}>
                    Create your verified academic profile.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="label">Full Name</label>
                        <input className="input" name="name" onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <label className="label">Email Address</label>
                        <input type="email" className="input" name="email" onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <label className="label">Password</label>
                        <input type="password" className="input" name="password" onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <label className="label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                            Institutional Code
                            <Link to="/request-college" style={{ fontSize: '0.75rem', fontWeight: '400', textDecoration: 'underline' }}>Request My College</Link>
                        </label>
                        <input className="input" name="instituteCode" onChange={handleChange} placeholder="e.g. AJCE2026" required />
                    </div>
                    <div className="input-group">
                        <label className="label">I am a...</label>
                        <select className="input" name="role" onChange={handleChange} style={{ cursor: 'pointer' }}>
                            <option value="student">Student</option>
                            <option value="organizer">Organizer (Club/Dept)</option>
                        </select>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '1.5rem' }}>
                        Create Account
                    </button>
                </form>

                <div style={{ textAlign: 'center', fontSize: '0.9rem' }}>
                    <span style={{ color: '#64748B' }}>Already have an account? </span>
                    <Link to="/login" style={{ fontWeight: '600' }}>Sign in instead</Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;

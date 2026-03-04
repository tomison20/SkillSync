import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const RequestOrganization = () => {
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        domain: '',
        requesterName: '',
        requesterEmail: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/auth/request-org', formData);
            setSubmitted(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="container" style={{ padding: '6rem 0', maxWidth: '600px', textAlign: 'center' }}>
                <div className="card" style={{ padding: '3rem' }}>
                    <div style={{ fontSize: '4rem', color: 'var(--color-primary)', marginBottom: '1rem' }}>✓</div>
                    <h2>Request Submitted</h2>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
                        Thank you for requesting <strong>{formData.name}</strong>. Our administrators will review your request and contact you at {formData.requesterEmail} once approved.
                    </p>
                    <Link to="/login" className="btn btn-primary">Back to Login</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '6rem 0', maxWidth: '600px' }}>
            <div className="card" style={{ padding: '3rem' }}>
                <h1 style={{ marginBottom: '0.5rem' }}>Register Your College</h1>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '2.5rem' }}>
                    Can't find your institution? Submit a request to add your college to SkillSync's academic network.
                </p>

                {error && <div className="badge badge-status" style={{ background: '#FEE2E2', color: '#B91C1C', marginBottom: '1.5rem', width: '100%', padding: '0.75rem' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="grid-layout" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="input-group">
                            <label className="label">College Name</label>
                            <input className="input" name="name" onChange={handleChange} placeholder="e.g. Amal Jyothi" required />
                        </div>
                        <div className="input-group">
                            <label className="label">Unique Code</label>
                            <input className="input" name="code" onChange={handleChange} placeholder="e.g. AJCE2026" required />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="label">Institutional Domain (Optional)</label>
                        <input className="input" name="domain" onChange={handleChange} placeholder="e.g. ajce.in" />
                    </div>

                    <hr style={{ margin: '2rem 0', opacity: 0.1 }} />

                    <div className="input-group">
                        <label className="label">Your Name</label>
                        <input className="input" name="requesterName" onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <label className="label">Your Institutional Email</label>
                        <input type="email" className="input" name="requesterEmail" onChange={handleChange} required />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Request'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <Link to="/signup" style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Back to Signup</Link>
                </div>
            </div>
        </div>
    );
};

export default RequestOrganization;

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const OrganizerProfile = () => {
    const { user, login } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        headline: '',
        bio: '',
        avatar: '',
        github: '',
        linkedin: '',
        twitter: '',
        portfolioWebsite: '',
        customLinkUrl: '',
        customLinkName: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await api.get('/auth/profile');
                setProfile(data);
                setForm({
                    headline: data.headline || '',
                    bio: data.bio || '',
                    avatar: data.avatar || '',
                    github: data.github || '',
                    linkedin: data.linkedin || '',
                    twitter: data.twitter || '',
                    portfolioWebsite: data.portfolioWebsite || '',
                    customLinkUrl: data.customLinkUrl || '',
                    customLinkName: data.customLinkName || ''
                });
            } catch (error) {
                console.error('Failed to fetch profile:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data } = await api.put('/auth/profile', form);
            setProfile(data);
            login({ ...data, token: user.token });
            alert('Profile updated!');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update');
        } finally {
            setSaving(false);
        }
    };

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);

        try {
            setSaving(true);
            const { data } = await api.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setForm({ ...form, avatar: data.url });
        } catch (error) {
            console.error(error);
            alert('Image upload failed');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="loading-screen">
            <div className="loader"></div>
            <p>Loading profile...</p>
        </div>
    );

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="dashboard-header organizer-header">
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                            <p style={{ opacity: 0.7, fontSize: '0.85rem', marginBottom: '0.5rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                {user?.organization?.name} • Profile Settings
                            </p>
                            <h1 style={{ color: 'white', fontSize: '2.25rem', margin: 0 }}>
                                Edit Your Profile
                            </h1>
                        </div>
                        <Link to="/dashboard/organizer" className="btn" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', textDecoration: 'none' }}>
                            ← Back to Dashboard
                        </Link>
                    </div>
                </div>
            </div>

            <div className="dashboard-body">
                <div className="container" style={{ maxWidth: '800px' }}>
                    <form onSubmit={handleSubmit}>

                        {/* Basic Info */}
                        <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid #7C3AED' }}>
                            <h3 style={{ margin: '0 0 1.25rem', fontSize: '1.1rem' }}>🖼️ Organizational Setup</h3>
                            <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                {form.avatar ? (
                                    <img
                                        src={`http://localhost:5000${form.avatar}`}
                                        alt="Avatar Preview"
                                        style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-primary)' }}
                                    />
                                ) : (
                                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '2rem' }}>
                                        👤
                                    </div>
                                )}
                                <div>
                                    <input type="file" onChange={uploadFileHandler} style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.8)' }} />
                                    <small style={{ color: 'rgba(255,255,255,0.5)' }}>Recommended: Square image / Brand Logo, max 2MB (jpg/png)</small>
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: '0 0 1.25rem', fontSize: '1.1rem' }}>📝 Organizer Context</h3>
                            <div className="input-group">
                                <label className="label">Role Title / Headline</label>
                                <input className="input" value={form.headline} onChange={e => setForm({ ...form, headline: e.target.value })} placeholder="e.g. CSR Representative | Technical Recruiter" />
                            </div>
                            <div className="input-group">
                                <label className="label">Bio</label>
                                <textarea className="input textarea" rows="3" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Tell us about the kinds of opportunities you provide..." />
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="card" style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: '0 0 1.25rem', fontSize: '1.1rem' }}>🔗 Organizational Links</h3>
                            <div className="input-group">
                                <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                                    LinkedIn Company Page
                                </label>
                                <input className="input" value={form.linkedin} onChange={e => setForm({ ...form, linkedin: e.target.value })} placeholder="https://linkedin.com/company/your-org" />
                            </div>
                            <div className="input-group" style={{ marginBottom: '1rem' }}>
                                <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>
                                    Website
                                </label>
                                <input className="input" value={form.portfolioWebsite} onChange={e => setForm({ ...form, portfolioWebsite: e.target.value })} placeholder="https://your-organization.com" />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginBottom: 0 }}>
                                <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                                    <label className="label">Custom Link Name</label>
                                    <input className="input" value={form.customLinkName} onChange={e => setForm({ ...form, customLinkName: e.target.value })} placeholder="e.g. Application Portal..." />
                                </div>
                                <div className="input-group" style={{ flex: 2, marginBottom: 0 }}>
                                    <label className="label">Custom Link URL</label>
                                    <input className="input" value={form.customLinkUrl} onChange={e => setForm({ ...form, customLinkUrl: e.target.value })} placeholder="https://..." />
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary btn-block" disabled={saving} style={{ padding: '0.85rem' }}>
                            {saving ? 'Saving...' : 'Save Profile'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default OrganizerProfile;

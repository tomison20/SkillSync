import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [stats, setStats] = useState({ students: 0, organizers: 0, organizations: 0, pendingRequests: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [reqsRes, statsRes, usersRes] = await Promise.all([
                    api.get('/admin/org-requests'),
                    api.get('/admin/stats'),
                    api.get('/admin/users')
                ]);
                setRequests(reqsRes.data);
                setStats(statsRes.data);
                setUsersList(usersRes.data);
            } catch (error) {
                console.error('Error fetching admin data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleAction = async (id, status) => {
        try {
            await api.put(`/admin/org-requests/${id}`, { status });
            // Update local state instead of doing another round trip fetch to save bandwidth and UI jumping
            setRequests(requests.map(req => req._id === id ? { ...req, status } : req));
        } catch (error) {
            alert('Action failed: ' + (error.response?.data?.message || 'Server Error'));
        }
    };

    const toggleUserStatus = async (id) => {
        try {
            const { data } = await api.put(`/admin/users/${id}/disable`);
            setUsersList(usersList.map(u => u._id === id ? { ...u, isDisabled: data.isDisabled } : u));
        } catch (error) {
            alert('Action failed: ' + (error.response?.data?.message || 'Server Error'));
        }
    };

    if (loading) return (
        <div className="loading-screen">
            <div className="loader"></div>
            <p>Loading Admin Console...</p>
        </div>
    );

    return (
        <div className="admin-dashboard animate-fade-in">
            {/* Header */}
            <div className="dashboard-header admin-header">
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <p style={{ opacity: 0.7, fontSize: '0.85rem', marginBottom: '0.5rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                SkillSync • System Administration
                            </p>
                            <h1 style={{ color: 'white', fontSize: '2.25rem', margin: 0 }}>
                                Admin Console
                            </h1>
                            <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '0.5rem', fontSize: '0.95rem' }}>
                                Manage institutional onboarding and platform settings
                            </p>
                        </div>
                        <div className="card" style={{ padding: '0.75rem 1.5rem', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}>
                            <small style={{ opacity: 0.7, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Active Node</small>
                            <div style={{ fontWeight: 600 }}>{user?.organization?.name}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="dashboard-body">
                <div className="container">
                    {/* Stats */}
                    <div className="grid-layout" style={{ marginBottom: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                        <div className="card stat-card animate-slide-up stagger-1">
                            <div className="stat-value" style={{ color: 'var(--color-primary)' }}>{stats.students}</div>
                            <div className="stat-label">Students</div>
                        </div>
                        <div className="card stat-card animate-slide-up stagger-2">
                            <div className="stat-value" style={{ color: 'var(--color-accent)' }}>{stats.organizers}</div>
                            <div className="stat-label">Organizers</div>
                        </div>
                        <div className="card stat-card animate-slide-up stagger-3">
                            <div className="stat-value" style={{ color: 'var(--color-success)' }}>{stats.organizations}</div>
                            <div className="stat-label">Verified Institutions</div>
                        </div>
                        <div className="card stat-card animate-slide-up stagger-4">
                            <div className="stat-value" style={{ color: 'var(--color-warning)' }}>{stats.pendingRequests}</div>
                            <div className="stat-label">Pending Requests</div>
                        </div>
                    </div>

                    {/* Requests Table */}
                    <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '2rem' }}>
                        <div style={{ padding: '1.5rem 1.5rem 0' }}>
                            <h2 style={{ margin: '0 0 0.5rem' }}>Institutional Onboarding Requests</h2>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                                Review and manage college registration requests
                            </p>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="table-modern">
                                <thead>
                                    <tr>
                                        <th>Institution</th>
                                        <th>Requester</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: 'right' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.map(req => (
                                        <tr key={req._id}>
                                            <td>
                                                <strong style={{ display: 'block' }}>{req.name}</strong>
                                                <code style={{ fontSize: '0.75rem', background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>{req.code}</code>
                                                {req.domain && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{req.domain}</span>}
                                            </td>
                                            <td>
                                                <span style={{ display: 'block' }}>{req.requesterName}</span>
                                                <small style={{ color: 'var(--color-text-muted)' }}>{req.requesterEmail}</small>
                                            </td>
                                            <td>
                                                <span className={`badge badge-${req.status === 'pending' ? 'warning' : req.status === 'approved' ? 'success' : 'error'}`}>
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                {req.status === 'pending' && (
                                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                        <button onClick={() => handleAction(req._id, 'approved')} className="btn btn-success btn-sm">
                                                            ✓ Approve
                                                        </button>
                                                        <button onClick={() => handleAction(req._id, 'rejected')} className="btn btn-danger btn-sm">
                                                            ✕ Decline
                                                        </button>
                                                    </div>
                                                )}
                                                {req.status === 'approved' && <span style={{ color: 'var(--color-success)', fontSize: '0.85rem', fontWeight: 600 }}>✓ Verified</span>}
                                                {req.status === 'rejected' && <span style={{ color: 'var(--color-error)', fontSize: '0.85rem', fontWeight: 600 }}>✕ Declined</span>}
                                            </td>
                                        </tr>
                                    ))}
                                    {requests.length === 0 && (
                                        <tr>
                                            <td colSpan="4">
                                                <div className="empty-state">
                                                    <div className="empty-state-icon">🏛️</div>
                                                    <p>No institutional requests at this time.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* User Management Table */}
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '1.5rem 1.5rem 0' }}>
                            <h2 style={{ margin: '0 0 0.5rem' }}>User Management</h2>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                                Manage active students and organizers across the platform
                            </p>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="table-modern">
                                <thead>
                                    <tr>
                                        <th>User Details</th>
                                        <th>Role</th>
                                        <th>Institution</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usersList.map(u => (
                                        <tr key={u._id}>
                                            <td>
                                                <strong style={{ display: 'block' }}>{u.name}</strong>
                                                <small style={{ color: 'var(--color-text-muted)' }}>{u.email}</small>
                                            </td>
                                            <td>
                                                <span className={`badge badge-${u.role === 'organizer' ? 'blue' : 'gray'}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td>
                                                {u.organization?.name}
                                                {u.organization?.uniqueCode && <code style={{ display: 'block', mt: '4px', fontSize: '0.7rem', background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px', width: 'max-content' }}>{u.organization.uniqueCode}</code>}
                                            </td>
                                            <td>
                                                {u.isDisabled ? (
                                                    <span className="badge badge-error">Disabled</span>
                                                ) : (
                                                    <span className="badge badge-success">Active</span>
                                                )}
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <button
                                                    onClick={() => toggleUserStatus(u._id)}
                                                    className={`btn btn-sm ${u.isDisabled ? 'btn-success' : 'btn-danger'}`}
                                                >
                                                    {u.isDisabled ? 'Enable' : 'Disable'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {usersList.length === 0 && (
                                        <tr>
                                            <td colSpan="5">
                                                <div className="empty-state">
                                                    <div className="empty-state-icon">👥</div>
                                                    <p>No registered users found.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

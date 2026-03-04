import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const { data } = await api.get('/api/admin/org-requests');
                setRequests(data);
            } catch (error) {
                console.error('Error fetching org requests:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, []);

    const handleAction = async (id, status) => {
        try {
            await api.put(`/api/admin/org-requests/${id}`, { status });
            alert(`Request ${status} successfully!`);
            // Update local state
            setRequests(requests.map(req => req._id === id ? { ...req, status } : req));
        } catch (error) {
            alert('Action failed: ' + (error.response?.data?.message || 'Server Error'));
        }
    };

    if (loading) return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>Loading Admin Console...</div>;

    return (
        <div className="admin-dashboard container" style={{ padding: '2rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h1>System Administration</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>Global control for SkillSync Academic Network</p>
                </div>
                <div className="card" style={{ padding: '1rem 2rem', borderLeft: '4px solid var(--color-primary)' }}>
                    <small className="label">Active Node</small>
                    <div style={{ fontWeight: 600 }}>{user?.organization?.name}</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '2rem' }}>

                {/* Organization Requests */}
                <main>
                    <section className="card">
                        <h2 style={{ marginBottom: '2rem' }}>Institutional Onboarding Requests</h2>
                        <div className="table-responsive">
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--color-border)' }}>
                                        <th style={{ padding: '1rem' }}>Institution</th>
                                        <th style={{ padding: '1rem' }}>Requester</th>
                                        <th style={{ padding: '1rem' }}>Status</th>
                                        <th style={{ padding: '1rem' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.map(req => (
                                        <tr key={req._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                            <td style={{ padding: '1rem' }}>
                                                <strong>{req.name}</strong>
                                                <br />
                                                <code style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '2px 4px', borderRadius: '4px' }}>{req.code}</code>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                {req.requesterName}
                                                <br />
                                                <small style={{ color: 'var(--color-text-muted)' }}>{req.requesterEmail}</small>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <span className={`badge badge-${req.status === 'pending' ? 'warning' : req.status === 'approved' ? 'success' : 'status'}`}>
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                {req.status === 'pending' && (
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button onClick={() => handleAction(req._id, 'approved')} className="btn btn-primary btn-sm">Approve</button>
                                                        <button onClick={() => handleAction(req._id, 'rejected')} className="btn btn-outline btn-sm">Decline</button>
                                                    </div>
                                                )}
                                                {req.status === 'approved' && <span style={{ color: 'var(--color-success)', fontSize: '0.85rem' }}>✓ Verified</span>}
                                            </td>
                                        </tr>
                                    ))}
                                    {requests.length === 0 && (
                                        <tr>
                                            <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                                No pending institutional requests.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </main>

                {/* System Controls */}
                <aside>
                    <section className="card" style={{ marginBottom: '2rem' }}>
                        <h3>Network Statistics</h3>
                        <div style={{ margin: '1.5rem 0' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <small className="label">Total Users</small>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>-</div>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <small className="label">Partner Institutions</small>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>-</div>
                            </div>
                        </div>
                    </section>

                    <section className="card">
                        <h3>Quick Config</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                            Global system settings and maintenance.
                        </p>
                        <button className="btn btn-secondary btn-block" style={{ marginBottom: '1rem' }}>Manage Organizations</button>
                        <button className="btn btn-secondary btn-block">Broadcast Message</button>
                    </section>
                </aside>

            </div>
        </div>
    );
};

export default AdminDashboard;

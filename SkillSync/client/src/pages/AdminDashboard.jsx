import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { FaCheck, FaTimes, FaBuilding, FaGlobe, FaUsers, FaExternalLinkAlt, FaExclamationTriangle } from 'react-icons/fa';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [stats, setStats] = useState({ students: 0, organizers: 0, organizations: 0, pendingRequests: 0 });
    const [loading, setLoading] = useState(true);

    // Advanced Data Sets
    const [organizations, setOrganizations] = useState([]);
    const [gigs, setGigs] = useState([]);
    const [portfolios, setPortfolios] = useState([]);

    // UI State
    const [activeTab, setActiveTab] = useState('users'); // 'users', 'organizations', 'gigs', 'portfolios'
    const [orgFilter, setOrgFilter] = useState(''); // Holds the uniqueCode to filter by

    // Modal States
    const [editingUser, setEditingUser] = useState(null);
    const [deletingUser, setDeletingUser] = useState(null);
    const [editingOrg, setEditingOrg] = useState(null);
    const [deletingOrg, setDeletingOrg] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [reqsRes, statsRes, usersRes, orgsRes, gigsRes, portsRes] = await Promise.all([
                    api.get('/admin/org-requests'),
                    api.get('/admin/stats'),
                    api.get('/admin/users'),
                    api.get('/admin/organizations'),
                    api.get('/admin/gigs'),
                    api.get('/admin/portfolios')
                ]);
                setRequests(reqsRes.data);
                setStats(statsRes.data);
                setUsersList(usersRes.data);
                setOrganizations(orgsRes.data);
                setGigs(gigsRes.data);
                setPortfolios(portsRes.data);
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

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.put(`/admin/users/${editingUser._id}`, editingUser);
            setUsersList(usersList.map(u => u._id === editingUser._id ? data : u));
            setEditingUser(null);
        } catch (error) {
            alert('Update failed: ' + (error.response?.data?.message || 'Server Error'));
        }
    };

    const handleDeleteUser = async (id) => {
        try {
            await api.delete(`/admin/users/${id}`);
            setUsersList(usersList.filter(u => u._id !== id));
            setDeletingUser(null);
        } catch (error) {
            alert('Delete failed: ' + (error.response?.data?.message || 'Server Error'));
        }
    };

    const handleUpdateOrg = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.put(`/admin/organizations/${editingOrg._id}`, editingOrg);
            setOrganizations(organizations.map(o => o._id === editingOrg._id ? data : o));
            setEditingOrg(null);
        } catch (error) {
            alert('Update failed: ' + (error.response?.data?.message || 'Server Error'));
        }
    };

    const handleDeleteOrg = async (id) => {
        try {
            await api.delete(`/admin/organizations/${id}`);
            setOrganizations(organizations.filter(o => o._id !== id));
            setDeletingOrg(null);
        } catch (error) {
            alert('Delete failed: ' + (error.response?.data?.message || 'Server Error'));
        }
    };

    const filteredUsers = orgFilter ? usersList.filter(u => u.organization?._id === orgFilter) : usersList;
    const filteredGigs = orgFilter ? gigs.filter(g => g.organization?._id === orgFilter) : gigs;
    const filteredPortfolios = orgFilter ? portfolios.filter(p => p.organizationName === organizations.find(o => o._id === orgFilter)?.name) : portfolios;

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
                                                <code style={{ fontSize: '0.75rem', background: 'var(--color-bg-elevated)', padding: '2px 6px', borderRadius: '4px' }}>{req.code}</code>
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
                                                        <button onClick={() => handleAction(req._id, 'approved')} className="btn btn-success btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <FaCheck /> Approve
                                                        </button>
                                                        <button onClick={() => handleAction(req._id, 'rejected')} className="btn btn-danger btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <FaTimes /> Decline
                                                        </button>
                                                    </div>
                                                )}
                                                {req.status === 'approved' && <span style={{ color: 'var(--color-success)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><FaCheck /> Verified</span>}
                                                {req.status === 'rejected' && <span style={{ color: 'var(--color-error)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><FaTimes /> Declined</span>}
                                            </td>
                                        </tr>
                                    ))}
                                    {requests.length === 0 && (
                                        <tr>
                                            <td colSpan="4">
                                                <div className="empty-state">
                                                    <div className="empty-state-icon"><FaBuilding size={40} /></div>
                                                    <p>No institutional requests at this time.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Main Navigation & Filters */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--color-surface)', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                            <button onClick={() => setActiveTab('users')} className={`btn btn-sm ${activeTab === 'users' ? 'btn-primary' : 'btn-ghost'}`}>Users</button>
                            <button onClick={() => setActiveTab('organizations')} className={`btn btn-sm ${activeTab === 'organizations' ? 'btn-primary' : 'btn-ghost'}`}>Institutions</button>
                            <button onClick={() => setActiveTab('gigs')} className={`btn btn-sm ${activeTab === 'gigs' ? 'btn-primary' : 'btn-ghost'}`}>Platform Gigs</button>
                            <button onClick={() => setActiveTab('portfolios')} className={`btn btn-sm ${activeTab === 'portfolios' ? 'btn-primary' : 'btn-ghost'}`}>Student Works</button>
                        </div>

                        {activeTab !== 'organizations' && (
                            <select
                                className="input"
                                style={{ width: 'auto', minWidth: '250px', margin: 0 }}
                                value={orgFilter}
                                onChange={(e) => setOrgFilter(e.target.value)}
                            >
                                <option value="">--- All Institutions ---</option>
                                {organizations.map(org => (
                                    <option key={org._id} value={org._id}>{org.name}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Tab Views */}
                    {activeTab === 'users' && (
                        <div className="card animate-fade-in" style={{ padding: 0, overflow: 'hidden' }}>
                            <div style={{ padding: '1.5rem 1.5rem 0' }}>
                                <h2 style={{ margin: '0 0 0.5rem' }}>User Management</h2>
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                                    Manage active students and organizers across the platform{orgFilter && ' (Filtered)'}
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
                                        {filteredUsers.map(u => (
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
                                                    {u.organization?.uniqueCode && <code style={{ display: 'block', mt: '4px', fontSize: '0.7rem', background: 'var(--color-bg-elevated)', padding: '2px 6px', borderRadius: '4px', width: 'max-content' }}>{u.organization.uniqueCode}</code>}
                                                </td>
                                                <td>
                                                    {u.isDisabled ? (
                                                        <span className="badge badge-error">Disabled</span>
                                                    ) : (
                                                        <span className="badge badge-success">Active</span>
                                                    )}
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                        <button
                                                            onClick={() => setEditingUser(u)}
                                                            className="btn btn-sm btn-outline"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => toggleUserStatus(u._id)}
                                                            className={`btn btn-sm ${u.isDisabled ? 'btn-success' : 'btn-warning'}`}
                                                        >
                                                            {u.isDisabled ? 'Enable' : 'Disable'}
                                                        </button>
                                                        <button
                                                            onClick={() => setDeletingUser(u)}
                                                            className="btn btn-sm btn-danger"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredUsers.length === 0 && (
                                            <tr>
                                                <td colSpan="5">
                                                    <div className="empty-state">
                                                        <div className="empty-state-icon"><FaUsers size={40} /></div>
                                                        <p>No users found matching criteria.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'organizations' && (
                        <div className="card animate-fade-in" style={{ padding: 0, overflow: 'hidden' }}>
                            <div style={{ padding: '1.5rem 1.5rem 0' }}>
                                <h2 style={{ margin: '0 0 0.5rem' }}>Verified Institutions</h2>
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                                    Manage approved colleges and organizations
                                </p>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table className="table-modern">
                                    <thead>
                                        <tr>
                                            <th>Institution</th>
                                            <th>Unique Code</th>
                                            <th>Organizer Code</th>
                                            <th>Domain</th>
                                            <th>Created By</th>
                                            <th style={{ textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {organizations.map(org => (
                                            <tr key={org._id}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: org.themeColor || 'var(--color-border-dark)' }}></div>
                                                        <strong style={{ display: 'block' }}>{org.name}</strong>
                                                    </div>
                                                </td>
                                                <td>
                                                    <code style={{ fontSize: '0.8rem', background: 'var(--color-bg-elevated)', padding: '2px 6px', borderRadius: '4px' }}>{org.uniqueCode}</code>
                                                </td>
                                                <td>
                                                    {org.organizerCode ? (
                                                        <code style={{ fontSize: '0.8rem', background: 'var(--color-bg-elevated)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                                                            {org.organizerCode}
                                                        </code>
                                                    ) : (
                                                        <span style={{ color: 'var(--color-text-muted)' }}>-</span>
                                                    )}
                                                </td>
                                                <td>{org.domain || '-'}</td>
                                                <td>
                                                    <small style={{ color: 'var(--color-text-muted)' }}>{org.createdBy?.name || 'System'}</small>
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                        <button onClick={() => setEditingOrg(org)} className="btn btn-sm btn-outline">Edit</button>
                                                        <button onClick={() => setDeletingOrg(org)} className="btn btn-sm btn-danger">Delete</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'gigs' && (
                        <div className="grid-layout animate-fade-in" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                            {filteredGigs.map(gig => (
                                <div key={gig._id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <span className={`badge badge-${gig.status === 'open' ? 'success' : 'gray'}`}>{gig.status.toUpperCase()}</span>
                                        <small style={{ color: 'var(--color-text-muted)' }}>{new Date(gig.createdAt).toLocaleDateString()}</small>
                                    </div>
                                    <h3 style={{ margin: '0 0 0.5rem' }}>{gig.title}</h3>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', flex: 1 }}>{gig.description.substring(0, 100)}...</p>
                                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)', fontSize: '0.85rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                                            <span style={{ color: 'var(--color-text-muted)' }}>Organization:</span>
                                            <strong>{gig.organization?.name}</strong>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: 'var(--color-text-muted)' }}>Organizer:</span>
                                            <span>{gig.organizer?.name}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'portfolios' && (
                        <div className="grid-layout animate-fade-in" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                            {filteredPortfolios.map(item => (
                                <div key={item.portfolioId} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.7rem' }}>
                                        {item.organizationName || 'Independent'}
                                    </div>
                                    <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem' }}>{item.title}</h4>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                                        By <strong>{item.userName}</strong> ({item.userCourse})
                                    </p>
                                    <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>{item.description}</p>
                                    {item.link && (
                                        <a href={item.link} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline" style={{ display: 'inline-block' }}>
                                            View External Link <FaExternalLinkAlt style={{ marginLeft: '4px' }} />
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                </div>
            </div>

            {/* Edit User Modal */}
            {editingUser && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0 }}>Edit User Record</h2>
                            <button onClick={() => setEditingUser(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>×</button>
                        </div>
                        <form onSubmit={handleUpdateUser} className="form-container">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input type="text" className="input" value={editingUser.name} onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input type="email" className="input" value={editingUser.email} onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Platform Role</label>
                                <select className="input" value={editingUser.role} onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}>
                                    <option value="student">Student</option>
                                    <option value="organizer">Organizer</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Academic Course</label>
                                <input type="text" className="input" value={editingUser.course || ''} onChange={(e) => setEditingUser({ ...editingUser, course: e.target.value })} />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" className="btn btn-outline" onClick={() => setEditingUser(null)} style={{ flex: 1 }}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingUser && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '450px', padding: '2rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--color-error)', display: 'flex', justifyContent: 'center' }}><FaExclamationTriangle /></div>
                        <h2 style={{ margin: '0 0 1rem' }}>Delete {deletingUser.name}?</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.5 }}>
                            Are you absolutely sure you want to permanently delete this user ({deletingUser.email}) from the database? This action cannot be undone and will orphan any associated records.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn btn-outline" onClick={() => setDeletingUser(null)} style={{ flex: 1 }}>Cancel</button>
                            <button className="btn btn-danger" onClick={() => handleDeleteUser(deletingUser._id)} style={{ flex: 1 }}>Delete Permanently</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Organization Edit Modal */}
            {editingOrg && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0 }}>Edit Institution</h2>
                            <button onClick={() => setEditingOrg(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>×</button>
                        </div>
                        <form onSubmit={handleUpdateOrg} className="form-container">
                            <div className="form-group">
                                <label>Institution Name</label>
                                <input type="text" className="input" value={editingOrg.name} onChange={(e) => setEditingOrg({ ...editingOrg, name: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Unique Code</label>
                                <input type="text" className="input" value={editingOrg.uniqueCode} onChange={(e) => setEditingOrg({ ...editingOrg, uniqueCode: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Domain (Optional)</label>
                                <input type="text" className="input" value={editingOrg.domain || ''} onChange={(e) => setEditingOrg({ ...editingOrg, domain: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Theme Color Hex</label>
                                <input type="text" className="input" value={editingOrg.themeColor || ''} onChange={(e) => setEditingOrg({ ...editingOrg, themeColor: e.target.value })} />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" className="btn btn-outline" onClick={() => setEditingOrg(null)} style={{ flex: 1 }}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Organization Delete Confirmation Modal */}
            {deletingOrg && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '450px', padding: '2rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--color-error)', display: 'flex', justifyContent: 'center' }}><FaExclamationTriangle /></div>
                        <h2 style={{ margin: '0 0 1rem' }}>Delete {deletingOrg.name}?</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.5 }}>
                            Are you absolutely sure you want to permanently delete this institution ({deletingOrg.uniqueCode})? Be incredibly careful, doing this without migrating users may orphan platform data.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn btn-outline" onClick={() => setDeletingOrg(null)} style={{ flex: 1 }}>Cancel</button>
                            <button className="btn btn-danger" onClick={() => handleDeleteOrg(deletingOrg._id)} style={{ flex: 1 }}>Delete Permanently</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminDashboard;

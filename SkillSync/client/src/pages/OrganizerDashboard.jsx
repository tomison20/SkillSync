import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const OrganizerDashboard = () => {
    const { user } = useAuth();
    const [myOpportunities, setMyOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await api.get('/api/gigs');
                // Filter gigs created by this organizer
                setMyOpportunities(data.filter(g => g.organizer?._id === user._id));
            } catch (error) {
                console.error('Error fetching organizer data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user._id]);

    if (loading) return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>Loading Management Console...</div>;

    return (
        <div className="organizer-dashboard container" style={{ padding: '2rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1>Institutional Management</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>Manage verified opportunities for {user?.organization?.name}</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link to="/gigs/create" className="btn btn-primary">+ New Opportunity</Link>
                    <Link to="/volunteering/create" className="btn btn-secondary">+ New Event</Link>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>

                {/* Active Opportunities */}
                <main>
                    <section className="card">
                        <h2 style={{ marginBottom: '1.5rem' }}>Active Opportunities</h2>
                        <div className="table-responsive">
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--color-border)' }}>
                                        <th style={{ padding: '1rem' }}>Title</th>
                                        <th style={{ padding: '1rem' }}>Status</th>
                                        <th style={{ padding: '1rem' }}>Applicants</th>
                                        <th style={{ padding: '1rem' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myOpportunities.map(gig => (
                                        <tr key={gig._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                            <td style={{ padding: '1rem' }}>
                                                <strong>{gig.title}</strong>
                                                <br />
                                                <small style={{ color: 'var(--color-text-muted)' }}>Due: {new Date(gig.deadline).toLocaleDateString()}</small>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <span className={`badge badge-${gig.status === 'open' ? 'success' : 'warning'}`}>
                                                    {gig.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>-</td>
                                            <td style={{ padding: '1rem' }}>
                                                <Link to={`/gigs/${gig._id}`} style={{ color: 'var(--color-accent)' }}>Manage</Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {myOpportunities.length === 0 && (
                                        <tr>
                                            <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                                No opportunities created yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </main>

                {/* Verification Queue (Placeholder Logic) */}
                <aside>
                    <section className="card">
                        <h3 style={{ marginBottom: '1rem' }}>Verification Queue</h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                            Approve student participation and award contribution hours.
                        </p>
                        <div style={{ padding: '1rem', background: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                            <p style={{ margin: 0, fontSize: '0.875rem' }}>All requests verified!</p>
                        </div>
                    </section>
                </aside>

            </div>
        </div>
    );
};

export default OrganizerDashboard;

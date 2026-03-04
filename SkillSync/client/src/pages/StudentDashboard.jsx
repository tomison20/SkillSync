import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [portfolio, setPortfolio] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [stats, setStats] = useState({ totalHours: 0, completedActivities: 0, contributionScore: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [portRes, achRes, statsRes] = await Promise.all([
                    api.get('/api/portfolios'),
                    api.get('/api/achievements'),
                    api.get('/api/participation/stats')
                ]);
                setPortfolio(portRes.data);
                setAchievements(achRes.data);
                setStats(statsRes.data);
            } catch (error) {
                console.error('Error fetching student dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>Loading your institutional profile...</div>;

    return (
        <div className="student-dashboard">
            {/* Institution Banner */}
            <div className="org-banner" style={{
                height: '250px',
                backgroundColor: 'var(--color-primary)',
                backgroundImage: `url(${user?.organization?.bannerImage || ''})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-end',
                padding: '2rem'
            }}>
                <div className="org-glass" style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    padding: '1.5rem',
                    borderRadius: 'var(--radius-md)',
                    color: 'white',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                    <h1 style={{ color: 'white', margin: 0 }}>{user?.organization?.name}</h1>
                    <p style={{ opacity: 0.8, margin: '0.5rem 0 0' }}>Student Achievement Portal</p>
                </div>
            </div>

            <div className="container" style={{ marginTop: '-40px', position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '2rem' }}>

                    {/* Sidebar Stats */}
                    <aside>
                        <div className="card" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                            <div style={{
                                width: '100px', height: '100px', borderRadius: '50%',
                                background: 'var(--color-bg)', margin: '0 auto 1rem',
                                border: '4px solid var(--color-primary)',
                                overflow: 'hidden'
                            }}>
                                <img src={user?.avatar || 'https://via.placeholder.com/100'} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <h3>{user?.name}</h3>
                            <p className="badge badge-success">Verified Student</p>

                            <hr style={{ margin: '1.5rem 0', opacity: 0.1 }} />

                            <div style={{ textAlign: 'left' }}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <small className="label">Contribution Hours</small>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.totalHours}h</div>
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <small className="label">Activities</small>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.completedActivities}</div>
                                </div>
                                <div>
                                    <small className="label">SkillSync Score</small>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-accent)' }}>{stats.contributionScore}</div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main>
                        {/* Portfolio Section */}
                        <section className="card" style={{ marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ margin: 0 }}>Academic Portfolio</h2>
                                <button className="btn btn-secondary btn-sm">+ Add Project</button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                                {portfolio.length > 0 ? portfolio.map(item => (
                                    <div key={item._id} className="portfolio-item" style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                                        {item.image && <img src={item.image} alt={item.title} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />}
                                        <div style={{ padding: '1rem' }}>
                                            <h4 style={{ margin: '0 0 0.5rem' }}>{item.title}</h4>
                                            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>{item.description}</p>
                                            <a href={item.link} target="_blank" rel="noreferrer" style={{ fontSize: '0.875rem' }}>View Project →</a>
                                        </div>
                                    </div>
                                )) : (
                                    <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No projects added yet.</p>
                                )}
                            </div>
                        </section>

                        {/* Achievements Section */}
                        <section className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ margin: 0 }}>Achievements & Awards</h2>
                                <button className="btn btn-secondary btn-sm">+ Add Award</button>
                            </div>

                            <div className="achievement-list">
                                {achievements.length > 0 ? achievements.map(ach => (
                                    <div key={ach._id} style={{ padding: '1rem', borderLeft: '4px solid var(--color-accent)', background: 'var(--color-bg)', marginBottom: '1rem', borderRadius: '0 4px 4px 0' }}>
                                        <h4 style={{ margin: 0 }}>{ach.title}</h4>
                                        <p style={{ fontSize: '0.875rem', margin: '0.25rem 0' }}>{ach.description}</p>
                                        <small style={{ color: 'var(--color-text-muted)' }}>{new Date(ach.date).toLocaleDateString()}</small>
                                    </div>
                                )) : (
                                    <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No achievements recorded.</p>
                                )}
                            </div>
                        </section>
                    </main>

                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;

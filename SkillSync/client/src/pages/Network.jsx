import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Network = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const { data } = await api.get('/users/network');
                setStudents(data);
            } catch (error) {
                console.error('Failed to fetch network:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    const filteredStudents = students.filter(student => {
        const term = search.toLowerCase();
        return (
            (student.name || '').toLowerCase().includes(term) ||
            (student.course || '').toLowerCase().includes(term) ||
            (student.skills || []).some(skill => skill.toLowerCase().includes(term))
        );
    });

    if (loading) return (
        <div className="loading-screen">
            <div className="loader"></div>
            <p>Loading {user?.organization?.name} network...</p>
        </div>
    );

    return (
        <div className="container animate-fade-in" style={{ padding: '4rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div>
                    <span className="badge" style={{ background: 'var(--color-border)', color: 'var(--color-secondary)', marginBottom: '0.5rem' }}>
                        {user?.organization?.name || 'Organization'} Workspace
                    </span>
                    <h1>College Directory</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Discover and connect with talented peers in your college.</p>
                </div>

                <div style={{ flex: '1 1 300px', maxWidth: '400px' }}>
                    <input
                        type="text"
                        className="input"
                        placeholder="Search by name, skills, or course..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ marginBottom: 0 }}
                    />
                </div>
            </div>

            {filteredStudents.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <h3 style={{ marginBottom: '0.5rem' }}>No Students Found</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>No discoverable profiles match your search.</p>
                </div>
            ) : (
                <div className="grid-layout">
                    {filteredStudents.map(student => (
                        <div key={student._id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                                <div style={{
                                    width: '60px', height: '60px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.5rem', fontWeight: 700, flexShrink: 0
                                }}>
                                    {student.avatar ? <img src={(student.avatar?.startsWith('http') ? student.avatar : `${import.meta.env.MODE === 'production' ? 'https://skillsync-0xug.onrender.com' : 'http://localhost:5000'}${student.avatar}`)} alt={student.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : student.name.charAt(0)}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{student.name}</h3>
                                    {student.course && (
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {student.course}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div style={{ flex: 1, marginBottom: '1.5rem' }}>
                                {student.skills && student.skills.length > 0 ? (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {student.skills.slice(0, 4).map((skill, i) => (
                                            <span key={i} className="badge badge-blue">
                                                {skill}
                                            </span>
                                        ))}
                                        {student.skills.length > 4 && (
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', alignSelf: 'center' }}>
                                                +{student.skills.length - 4} more
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-light)', fontStyle: 'italic' }}>No skills listed</p>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', alignItems: 'center' }}>
                                <Link to={`/network/student/${student._id}`} className="btn btn-outline" style={{ flex: 1, textAlign: 'center', textDecoration: 'none', padding: '0.5rem' }}>
                                    View Profile
                                </Link>
                                {(student.github || student.linkedin || student.portfolioWebsite) && (
                                    <div style={{ display: 'flex', gap: '0.7rem', padding: '0 0.5rem', alignItems: 'center' }}>
                                        {student.portfolioWebsite && (
                                            <a href={student.portfolioWebsite} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center' }} title="Portfolio">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                                            </a>
                                        )}
                                        {student.github && (
                                            <a href={student.github} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center' }} title="GitHub">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                                            </a>
                                        )}
                                        {student.linkedin && (
                                            <a href={student.linkedin} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center' }} title="LinkedIn">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Network;

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Gigs = () => {
    const [gigs, setGigs] = useState([]);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        const fetchGigs = async () => {
            try {
                const { data } = await api.get('/gigs');
                setGigs(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchGigs();
    }, []);

    return (
        <div className="container" style={{ padding: '4rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <span className="badge" style={{ background: '#E2E8F0', color: '#475569', marginBottom: '0.5rem' }}>
                        {user?.organization?.name || 'Organization'} Workspace
                    </span>
                    <h1>Verified Opportunities</h1>
                </div>
                {(user?.role === 'organizer' || user?.role === 'admin') && (
                    <Link to="/gigs/create" className="btn btn-primary">Create Opportunity</Link>
                )}
            </div>

            <div className="grid-layout">
                {gigs.map(gig => (
                    <div key={gig._id} className="card">
                        <h3>{gig.title}</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{gig.description}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className="badge badge-status">Open</span>
                            <span className="badge badge-blue">{gig.status}</span>
                        </div>
                        <Link to={`/gigs/${gig._id}`} className="btn btn-outline" style={{ marginTop: '1rem', width: '100%', display: 'block', textAlign: 'center', textDecoration: 'none' }}>View Details</Link>
                    </div>
                ))}
                {gigs.length === 0 && <p>No gigs available at the moment.</p>}
            </div>
        </div>
    );
};

export default Gigs;

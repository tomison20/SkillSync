import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { user } = useAuth();
    // Professional Academic Image (Library / Studying)
    const heroImage = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80";

    return (
        <div>
            {/* ... (Hero section setup remains unchanged) */}
            <section style={{
                position: 'relative',
                height: '85vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                color: '#fff'
            }}>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url(${heroImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    zIndex: 1
                }}></div>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(15, 23, 42, 0.65)',
                    zIndex: 2
                }}></div>

                <div className="container" style={{ position: 'relative', zIndex: 3, textAlign: 'center', maxWidth: '900px' }}>
                    <span style={{
                        display: 'inline-block',
                        padding: '0.5rem 1rem',
                        border: '1px solid rgba(255,255,255,0.3)',
                        color: '#E2E8F0',
                        borderRadius: '999px',
                        fontSize: '0.85rem',
                        fontWeight: '500',
                        marginBottom: '2rem',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        backdropFilter: 'blur(4px)'
                    }}>
                        Connect & Conquer
                    </span>

                    <h1 style={{
                        fontSize: '4.5rem',
                        marginBottom: '1.5rem',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.1,
                        color: '#FFFFFF',
                        fontFamily: 'var(--font-serif)',
                        fontWeight: '600'
                    }}>
                        Where Ambition Meets <br /> <span style={{ fontStyle: 'italic', fontFamily: 'serif' }}>Opportunity.</span>
                    </h1>

                    <p style={{
                        fontSize: '1.35rem',
                        color: '#CBD5E1',
                        marginBottom: '3.5rem',
                        lineHeight: 1.6,
                        fontWeight: '300',
                        maxWidth: '700px',
                        margin: '0 auto 3.5rem'
                    }}>
                        SkillSync is the premier platform for students to secure freelance work, engage in verified volunteering, and build an institutional portfolio.
                    </p>

                    <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                        {user ? (
                            <>
                                <Link to={`/dashboard/${user.role}`} className="btn" style={{
                                    padding: '1rem 2.5rem',
                                    fontSize: '1.1rem',
                                    background: '#fff',
                                    color: '#0F172A',
                                    fontWeight: '600',
                                    border: '1px solid #fff'
                                }}>
                                    Go to Dashboard
                                </Link>
                                <Link to="/gigs" className="btn" style={{
                                    padding: '1rem 2.5rem',
                                    fontSize: '1.1rem',
                                    background: 'transparent',
                                    color: '#fff',
                                    border: '1px solid rgba(255,255,255,0.5)',
                                    fontWeight: '500'
                                }}>
                                    View Opportunities
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/signup" className="btn" style={{
                                    padding: '1rem 2.5rem',
                                    fontSize: '1.1rem',
                                    background: '#fff',
                                    color: '#0F172A',
                                    fontWeight: '600',
                                    border: '1px solid #fff'
                                }}>
                                    Join the Network
                                </Link>
                                <Link to="/gigs" className="btn" style={{
                                    padding: '1rem 2.5rem',
                                    fontSize: '1.1rem',
                                    background: 'transparent',
                                    color: '#fff',
                                    border: '1px solid rgba(255,255,255,0.5)',
                                    fontWeight: '500'
                                }}>
                                    Explore Openings
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Institutional Trust Bar */}
            <div style={{ borderBottom: '1px solid #E2E8F0', background: '#F8FAFC', padding: '3rem 0' }}>
                <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', textAlign: 'center' }}>
                    <div style={{ padding: '0 1rem' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-primary)', fontFamily: 'var(--font-serif)', marginBottom: '0.5rem' }}>Built for Your Institution</div>
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-secondary)' }}>Verified Access</div>
                    </div>
                    <div style={{ padding: '0 1rem', borderLeft: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-primary)', fontFamily: 'var(--font-serif)', marginBottom: '0.5rem' }}>Organizer-Verified Opportunities</div>
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-secondary)' }}>Trusted Networking</div>
                    </div>
                    <div style={{ padding: '0 1rem' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-primary)', fontFamily: 'var(--font-serif)', marginBottom: '0.5rem' }}>Student Contribution Tracking</div>
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-secondary)' }}>Academic Portfolio</div>
                    </div>
                </div>
            </div>

            {/* Value Preposition */}
            <section style={{ padding: '8rem 0', background: 'white' }}>
                <div className="container">
                    <div className="grid-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4rem' }}>
                        <div>
                            <div style={{ width: 50, height: 50, background: '#EFF6FF', borderRadius: '50%', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1E3A8A' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                            </div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Verified Opportunity System</h3>
                            <p style={{ color: '#64748B', lineHeight: 1.7 }}>
                                All gigs and volunteering opportunities are verified by authorized organizers within your institution to ensure transparency and trust.
                            </p>
                        </div>
                        <div>
                            <div style={{ width: 50, height: 50, background: '#F0FDF4', borderRadius: '50%', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#14532D' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                            </div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Verified Experience</h3>
                            <p style={{ color: '#64748B', lineHeight: 1.7 }}>
                                Every completed gig and attended event is cryptographically verified and added to your permanent institutional record.
                            </p>
                        </div>
                        <div>
                            <div style={{ width: 50, height: 50, background: '#FFF7ED', borderRadius: '50%', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C2D12' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            </div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Campus Selection</h3>
                            <p style={{ color: '#64748B', lineHeight: 1.7 }}>
                                Access opportunities exclusive to your institution, fostering a trusted local community of high-achieving peers.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;

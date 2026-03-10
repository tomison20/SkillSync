import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LogoLoop from '../components/UI/LogoLoop';
import { FaGithub, FaLinkedin, FaGlobe, FaLink, FaEnvelope, FaUserPlus, FaUserCheck, FaFilePdf, FaTrophy } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

const StudentPublicProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await api.get(`/users/network/${id}`);
                setProfile(data);
                setFollowersCount(data.followers?.length || 0);

                // Determine initial follow state
                if (currentUser && data.followers) {
                    setIsFollowing(data.followers.includes(currentUser._id));
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Profile not found or not discoverable');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id, currentUser]);

    const handleFollowToggle = async () => {
        try {
            if (isFollowing) {
                await api.post(`/users/${id}/unfollow`);
                setFollowersCount(prev => prev - 1);
                setIsFollowing(false);
            } else {
                await api.post(`/users/${id}/follow`);
                setFollowersCount(prev => prev + 1);
                setIsFollowing(true);
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Action failed');
        }
    };

    if (loading) return (
        <div className="loading-screen">
            <div className="loader"></div>
            <p>Loading profile...</p>
        </div>
    );

    if (error || !profile) return (
        <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--color-error)' }}>Oops!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2rem' }}>{error}</p>
            <button onClick={() => navigate(-1)} className="btn btn-primary">Go Back</button>
        </div>
    );

    return (
        <div className="container animate-fade-in" style={{ padding: '4rem 0', maxWidth: '900px' }}>
            <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', marginBottom: '2rem', fontWeight: 500, cursor: 'pointer', fontSize: '1rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                Back
            </button>

            {/* Profile Header Card */}
            <div className="card" style={{ padding: '2.5rem', marginBottom: '2rem', display: 'flex', gap: '2.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 700, flexShrink: 0 }}>
                    {profile.avatar ? <img src={`http://localhost:5000${profile.avatar}`} alt={profile.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : profile.name.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: '300px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h1 style={{ margin: '0 0 0.5rem', fontSize: '2.5rem', fontWeight: 800 }}>{profile.name}</h1>
                            {profile.headline && (
                                <p style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', color: 'var(--color-primary)', fontWeight: 500 }}>{profile.headline}</p>
                            )}
                            {profile.course && (
                                <p style={{ margin: '0 0 1rem', fontSize: '0.95rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.7 }}><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" /></svg>
                                    {profile.course}
                                </p>
                            )}
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600, display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                <span>{followersCount} Followers</span>
                                <span>{profile.following?.length || 0} Following</span>
                            </div>
                        </div>

                        {currentUser && currentUser._id !== profile._id && currentUser.role === 'student' && (
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    onClick={handleFollowToggle}
                                    className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.6rem 1.2rem' }}
                                >
                                    {isFollowing ? <><FaUserCheck /> Following</> : <><FaUserPlus /> Follow</>}
                                </button>
                                <Link to={`/chat/${profile._id}`} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.6rem 1.2rem', backgroundColor: '#1A2E1D' }}>
                                    <FaEnvelope /> Message
                                </Link>
                            </div>
                        )}

                        {profile.resume && (
                            <div style={{ display: 'flex' }}>
                                <a href={`http://localhost:5000${profile.resume}`} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.6rem 1.2rem', backgroundColor: '#DC2626' }}>
                                    <FaFilePdf /> View Resume
                                </a>
                            </div>
                        )}
                    </div>

                    {(profile.github || profile.linkedin || profile.twitter || profile.portfolioWebsite || profile.customLinkUrl || profile.resume) && (
                        <div style={{ display: 'flex', marginTop: '1.5rem', overflow: 'hidden', padding: '10px 0' }}>
                            <div style={{ width: '100%', maxWidth: '600px', marginLeft: '-15px' }}>
                                <LogoLoop
                                    logos={[
                                        ...(profile.github ? [{ node: <FaGithub size={24} color="#2D5A3D" />, title: 'GitHub', href: profile.github }] : []),
                                        ...(profile.linkedin ? [{ node: <FaLinkedin size={24} color="#0A66C2" />, title: 'LinkedIn', href: profile.linkedin }] : []),
                                        ...(profile.twitter ? [{ node: <FaXTwitter size={24} color="#2D5A3D" />, title: 'X', href: profile.twitter }] : []),
                                        ...(profile.portfolioWebsite ? [{ node: <FaGlobe size={24} color="#059669" />, title: 'Portfolio', href: profile.portfolioWebsite }] : []),
                                        ...(profile.resume ? [{ node: <FaFilePdf size={24} color="#DC2626" />, title: 'Resume', href: `http://localhost:5000${profile.resume}` }] : []),
                                        ...(profile.customLinkUrl ? [{ node: <FaLink size={24} color="#6366F1" />, title: profile.customLinkName || 'Link', href: profile.customLinkUrl }] : [])
                                    ]}
                                    speed={120}
                                    logoHeight={30}
                                    gap={50}
                                    fadeOut={true}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                {/* About Section */}
                {profile.bio && (
                    <div className="card">
                        <h3 style={{ margin: '0 0 1rem', fontSize: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>About</h3>
                        <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{profile.bio}</p>
                    </div>
                )}

                {/* Skills Section */}
                {profile.skills && profile.skills.length > 0 && (
                    <div className="card">
                        <h3 style={{ margin: '0 0 1rem', fontSize: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>Technical Skills</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                            {profile.skills.map((skill, index) => (
                                <span key={index} className="badge badge-blue" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Portfolio / Achievements Summary */}
                {(profile.portfolio && profile.portfolio.length > 0) && (
                    <div className="card" style={{ gridColumn: '1 / -1' }}>
                        <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>Portfolio Projects</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                            {profile.portfolio.map((item, index) => (
                                <div key={item._id || index} style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', display: 'flex', flexDirection: 'column' }}>
                                    <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem' }}>{item.title}</h4>
                                    {item.description && <p style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: 'var(--text-secondary)', flex: 1 }}>{item.description}</p>}
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                                        {(item.link || item.projectLink) && <a href={item.projectLink || item.link} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 500 }}>View Project →</a>}
                                        {item.portfolioPDF && <a href={`http://localhost:5000${item.portfolioPDF}`} target="_blank" rel="noreferrer" style={{ color: '#DC2626', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 500, marginLeft: '1rem' }}><FaFilePdf /> PDF Document</a>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Achievements Summary */}
                {(profile.achievements && profile.achievements.length > 0) && (
                    <div className="card" style={{ gridColumn: '1 / -1' }}>
                        <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>Awards & Achievements</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {profile.achievements.map((ach, index) => (
                                <div key={ach._id || index} style={{ padding: '1rem', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(74, 124, 89, 0.1)', color: '#4A7C59', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <FaTrophy size={20} />
                                    </div>
                                    <div>
                                        <h4 style={{ margin: '0 0 0.3rem', fontSize: '1.1rem' }}>{ach.title}</h4>
                                        {ach.description && <p style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{ach.description}</p>}
                                        {ach.certificateLink && <a href={ach.certificateLink} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 500 }}>View Certificate →</a>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentPublicProfile;

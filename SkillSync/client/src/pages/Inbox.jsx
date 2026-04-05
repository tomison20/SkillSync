import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { FaComments, FaUsers } from 'react-icons/fa';

const Inbox = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const { data } = await api.get('/messages');
                setConversations(data);
            } catch (error) {
                console.error("Failed to load inbox", error);
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, []);

    if (loading) return (
        <div className="loading-screen">
            <div className="loader"></div>
            <p>Loading your messages...</p>
        </div>
    );

    return (
        <div className="animate-fade-in" style={{ backgroundColor: 'var(--bg-main)', minHeight: 'calc(100vh - 70px)' }}>
            {/* Header */}
            <div className="dashboard-header student-header">
                <div className="container" style={{ position: 'relative' }}>
                    <button
                        onClick={() => navigate(user?.role === 'student' ? '/dashboard/student' : user?.role === 'organizer' ? '/dashboard/organizer' : '/dashboard/admin')}
                        style={{ position: 'absolute', top: '10px', right: '15px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 500, transition: 'all 0.2s ease' }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                        Back to Dashboard
                    </button>
                    <p style={{ opacity: 0.7, fontSize: '0.85rem', marginBottom: '0.5rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        {user?.organization?.name} • Communications
                    </p>
                    <h1 style={{ color: 'white', fontSize: '2.25rem', margin: 0 }}>
                        Direct Messages
                    </h1>
                </div>
            </div>

            <div className="dashboard-body">
                <div className="container" style={{ maxWidth: '800px' }}>
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>

                        {conversations.length === 0 ? (
                            <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                <div style={{ fontSize: '3.5rem', marginBottom: '1rem', opacity: 0.5, display: 'flex', justifyContent: 'center' }}><FaComments /></div>
                                <h3 style={{ margin: '0 0 0.5rem', color: 'var(--color-primary)' }}>No Messages Yet</h3>
                                <p style={{ margin: '0 auto', maxWidth: '400px' }}>
                                    Your inbox is empty. Connect with other students from your college in the Network directory to start a conversation!
                                </p>
                                <Link to="/network" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
                                    Browse Network
                                </Link>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {conversations.map((conv, index) => {
                                    const isGroup = conv.type === 'group';
                                    const targetId = isGroup ? conv.gig._id : conv.partner._id;
                                    const displayName = isGroup ? `${conv.gig.title} Group Info` : conv.partner.name;
                                    const avatar = isGroup ? null : conv.partner.avatar;
                                    const initials = isGroup ? <FaUsers size={24} /> : conv.partner.name.charAt(0);
                                    const linkTo = isGroup ? `/chat/group/${targetId}` : `/chat/${targetId}`;

                                    return (
                                        <div
                                            key={isGroup ? `group_${targetId}` : targetId}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: '1.25rem 1.5rem',
                                                borderBottom: index < conversations.length - 1 ? '1px solid var(--color-border)' : 'none',
                                                transition: 'background-color 0.2s',
                                            }}
                                            className="chat-list-item"
                                        >
                                            <Link to={linkTo} style={{ display: 'flex', alignItems: 'center', flex: 1, textDecoration: 'none', color: 'inherit', minWidth: 0 }}>
                                                <div style={{
                                                    width: '56px',
                                                    height: '56px',
                                                    borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                                                    color: 'white',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: 'bold',
                                                    fontSize: '1.5rem',
                                                    overflow: 'hidden',
                                                    flexShrink: 0
                                                }}>
                                                    {avatar ? (
                                                        <img src={(avatar?.startsWith('http') ? avatar : `${import.meta.env.MODE === 'production' ? 'https://skillsync-0xug.onrender.com' : 'http://localhost:5000'}${avatar}`)} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        initials
                                                    )}
                                                </div>

                                                <div style={{ flex: 1, marginLeft: '1rem', minWidth: 0 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: conv.unreadCount > 0 ? 700 : 500, color: 'var(--color-primary)' }}>
                                                            {displayName}
                                                        </h3>
                                                        <span style={{ fontSize: '0.75rem', color: conv.unreadCount > 0 ? 'var(--color-accent)' : 'var(--text-secondary)', fontWeight: conv.unreadCount > 0 ? 600 : 400 }}>
                                                            {new Date(conv.latestMessageAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                        </span>
                                                    </div>
                                                    <p style={{
                                                        margin: 0,
                                                        fontSize: '0.9rem',
                                                        color: conv.unreadCount > 0 ? 'var(--color-primary)' : 'var(--text-secondary)',
                                                        fontWeight: conv.unreadCount > 0 ? 600 : 400,
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}>
                                                        {isGroup && conv.latestMessage !== 'Start a group conversation!' && <span style={{ opacity: 0.7 }}>New message: </span>}
                                                        {conv.latestMessage}
                                                    </p>
                                                </div>
                                            </Link>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '1rem' }}>
                                                {conv.unreadCount > 0 && (
                                                    <div style={{
                                                        background: 'var(--color-accent)',
                                                        color: 'white',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 'bold',
                                                        height: '24px',
                                                        minWidth: '24px',
                                                        padding: '0 8px',
                                                        borderRadius: '12px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        {conv.unreadCount}
                                                    </div>
                                                )}

                                                {!isGroup && (
                                                    <Link
                                                        to={`/network/student/${targetId}`}
                                                        className="btn btn-outline"
                                                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                                                        title={`View Profile`}
                                                    >
                                                        Profile
                                                    </Link>
                                                )}
                                                {isGroup && (
                                                    <Link
                                                        to={`/gigs/${targetId}`}
                                                        className="btn btn-outline"
                                                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                                                        title={`View Event`}
                                                    >
                                                        Event
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .chat-list-item:hover {
                    background-color: var(--color-surface);
                }
            `}</style>
        </div>
    );
};

export default Inbox;

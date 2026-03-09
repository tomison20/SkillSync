import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Inbox = () => {
    const { user } = useAuth();
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
                <div className="container">
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
                                <div style={{ fontSize: '3.5rem', marginBottom: '1rem', opacity: 0.5 }}>💬</div>
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
                                {conversations.map((conv, index) => (
                                    <Link
                                        key={conv.partner._id}
                                        to={`/chat/${conv.partner._id}`}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '1.25rem 1.5rem',
                                            borderBottom: index < conversations.length - 1 ? '1px solid var(--color-border)' : 'none',
                                            textDecoration: 'none',
                                            color: 'inherit',
                                            transition: 'background-color 0.2s',
                                            position: 'relative'
                                        }}
                                        className="chat-list-item"
                                    >
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
                                            {conv.partner.avatar ? (
                                                <img src={`http://localhost:5000${conv.partner.avatar}`} alt={conv.partner.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                conv.partner.name.charAt(0)
                                            )}
                                        </div>

                                        <div style={{ flex: 1, marginLeft: '1rem', minWidth: 0 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: conv.unreadCount > 0 ? 700 : 500, color: 'var(--color-primary)' }}>
                                                    {conv.partner.name}
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
                                                {conv.latestMessage}
                                            </p>
                                        </div>

                                        {conv.unreadCount > 0 && (
                                            <div style={{
                                                marginLeft: '1rem',
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
                                    </Link>
                                ))}
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

import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Chat = () => {
    const { id: receiverId } = useParams();
    const { user: currentUser } = useAuth();

    const [messages, setMessages] = useState([]);
    const [receiver, setReceiver] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const fetchChatData = async () => {
            try {
                const [messagesRes, userRes] = await Promise.all([
                    api.get(`/messages/${receiverId}`),
                    api.get(`/users/network/${receiverId}`)
                ]);
                setMessages(messagesRes.data);
                setReceiver(userRes.data);
            } catch (error) {
                console.error("Failed to load chat data", error);
            } finally {
                setLoading(false);
            }
        };

        if (receiverId) {
            fetchChatData();
        }

        // Polling for new messages (Alternative to WebSockets for this scope)
        const intervalId = setInterval(async () => {
            try {
                const { data } = await api.get(`/messages/${receiverId}`);
                if (data.length > messages.length) {
                    setMessages(data);
                }
            } catch (error) {
                console.error("Polling error", error);
            }
        }, 5000);

        return () => clearInterval(intervalId);
    }, [receiverId, messages.length]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const { data } = await api.post(`/messages/${receiverId}`, { content: newMessage });
            setMessages([...messages, data]);
            setNewMessage('');
        } catch (error) {
            console.error("Error sending message", error);
            alert("Failed to send message");
        }
    };

    if (loading) return (
        <div className="loading-screen">
            <div className="loader"></div>
            <p>Loading conversation...</p>
        </div>
    );

    if (!receiver) return (
        <div className="container" style={{ textAlign: 'center', padding: '4rem 1.5rem', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--color-error)' }}>User not found</h2>
            <Link to="/network" className="btn btn-primary">Back to Directory</Link>
        </div>
    );

    return (
        <div className="animate-fade-in" style={{ height: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)' }}>
            {/* Header */}
            <div style={{ padding: '1rem 1.5rem', backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 10 }}>
                <Link to={`/network/${receiver._id}`} style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                </Link>

                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', overflow: 'hidden' }}>
                    {receiver.avatar ? <img src={`http://localhost:5000${receiver.avatar}`} alt={receiver.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : receiver.name.charAt(0)}
                </div>

                <div style={{ flex: 1 }}>
                    <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>{receiver.name}</h2>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{receiver.course || 'Student'}</p>
                </div>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {messages.length === 0 ? (
                    <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>👋</div>
                        <p style={{ margin: 0 }}>No messages yet.</p>
                        <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Say hi to {receiver.name.split(' ')[0]}!</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = msg.sender === currentUser._id;
                        return (
                            <div key={index} style={{
                                alignSelf: isMe ? 'flex-end' : 'flex-start',
                                maxWidth: '75%',
                                padding: '0.75rem 1rem',
                                borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                backgroundColor: isMe ? 'var(--color-primary)' : 'var(--color-surface)',
                                color: isMe ? 'white' : 'var(--color-text)',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                            }}>
                                <p style={{ margin: 0, wordBreak: 'break-word', lineHeight: 1.4 }}>{msg.content}</p>
                                <div style={{ fontSize: '0.65rem', opacity: 0.6, marginTop: '4px', textAlign: isMe ? 'right' : 'left' }}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ padding: '1rem 1.5rem', backgroundColor: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}>
                <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.75rem', maxWidth: '1000px', margin: '0 auto' }}>
                    <input
                        className="input"
                        style={{ margin: 0, borderRadius: '24px', paddingLeft: '1.25rem' }}
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Message..."
                    />
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ borderRadius: '50%', width: '45px', height: '45px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                        disabled={!newMessage.trim()}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'translateX(-1px)' }}><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chat;

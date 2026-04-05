import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { FaUsers, FaRegSmileBeam } from 'react-icons/fa';

const Chat = ({ isGroup = false }) => {
    const { id: targetId } = useParams();
    const { user: currentUser } = useAuth();

    const [messages, setMessages] = useState([]);
    const [targetEntity, setTargetEntity] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [contextMenu, setContextMenu] = useState(null); // { x, y, messageId }

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const fetchChatData = async () => {
            try {
                if (isGroup) {
                    const [messagesRes, targetRes] = await Promise.all([
                        api.get(`/messages/group/${targetId}`),
                        api.get(`/gigs/${targetId}`)
                    ]);
                    setMessages(messagesRes.data);
                    setTargetEntity(targetRes.data);
                } else {
                    const [messagesRes, targetRes] = await Promise.all([
                        api.get(`/messages/${targetId}`),
                        api.get(`/users/network/${targetId}`)
                    ]);
                    setMessages(messagesRes.data);
                    setTargetEntity(targetRes.data);
                }
            } catch (error) {
                console.error("Failed to load chat data", error);
            } finally {
                setLoading(false);
            }
        };

        if (targetId) {
            fetchChatData();
        }

        const intervalId = setInterval(async () => {
            try {
                const endpoint = isGroup ? `/messages/group/${targetId}` : `/messages/${targetId}`;
                const { data } = await api.get(endpoint);
                if (data.length > messages.length) {
                    setMessages(data);
                }
            } catch (error) {
                console.error("Polling error", error);
            }
        }, 5000);

        return () => clearInterval(intervalId);
    }, [targetId, isGroup, messages.length]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const endpoint = isGroup ? `/messages/group/${targetId}` : `/messages/${targetId}`;
            const { data } = await api.post(endpoint, { content: newMessage });

            if (isGroup) {
                data.sender = { _id: currentUser._id, name: currentUser.name, avatar: currentUser.avatar, role: currentUser.role };
            }

            setMessages([...messages, data]);
            setNewMessage('');
        } catch (error) {
            console.error("Error sending message", error);
            alert("Failed to send message");
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            setUploading(true);
            const uploadRes = await api.post('/upload/chat', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const endpoint = isGroup ? `/messages/group/${targetId}` : `/messages/${targetId}`;
            const { data } = await api.post(endpoint, {
                content: '',
                attachmentUrl: uploadRes.data.url,
                attachmentOrigName: uploadRes.data.originalName
            });

            if (isGroup) {
                data.sender = { _id: currentUser._id, name: currentUser.name, avatar: currentUser.avatar, role: currentUser.role };
            }

            setMessages([...messages, data]);
        } catch (error) {
            console.error("Error uploading file", error);
            alert("Failed to upload file");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDeleteMessage = async (messageId) => {
        if (!window.confirm('Delete this message?')) return;
        try {
            await api.delete(`/messages/delete/${messageId}`);
            setMessages(messages.map(m =>
                m._id === messageId ? { ...m, isDeleted: true, content: '' } : m
            ));
        } catch (error) {
            console.error("Error deleting message", error);
            alert(error.response?.data?.message || "Failed to delete message");
        }
    };

    if (loading) return (
        <div className="loading-screen">
            <div className="loader"></div>
            <p>Loading conversation...</p>
        </div>
    );

    if (!targetEntity) return (
        <div className="container" style={{ textAlign: 'center', padding: '4rem 1.5rem', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--color-error)' }}>{isGroup ? "Group Chat not found" : "User not found"}</h2>
            <Link to="/messages" className="btn btn-primary">Back to Inbox</Link>
        </div>
    );

    const displayName = isGroup ? `${targetEntity.title} Volunteers` : targetEntity.name;
    const subtitle = isGroup ? targetEntity.organization?.name : (targetEntity.course || 'Student');
    const displayAvatar = isGroup ? null : targetEntity.avatar;
    const displayInitials = isGroup ? <FaUsers size={20} /> : targetEntity.name.charAt(0);

    return (
        <div className="animate-fade-in" style={{ height: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)' }}>
            {/* Header */}
            <div style={{ padding: '1rem 1.5rem', backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 10 }}>
                <Link to="/messages" style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                </Link>

                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', overflow: 'hidden' }}>
                    {displayAvatar ? <img src={(displayAvatar?.startsWith('http') ? displayAvatar : `${import.meta.env.MODE === 'production' ? 'https://skillsync-0xug.onrender.com' : 'http://localhost:5000'}${displayAvatar}`)} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : displayInitials}
                </div>

                <div style={{ flex: 1 }}>
                    <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>{displayName}</h2>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{subtitle}</p>
                </div>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {messages.length === 0 ? (
                    <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5, display: 'flex', justifyContent: 'center' }}><FaRegSmileBeam /></div>
                        <p style={{ margin: 0 }}>No messages yet.</p>
                        <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>{isGroup ? "Start the conversation with your volunteers!" : `Say hi to ${targetEntity.name.split(' ')[0]}!`}</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const senderId = (msg.sender && msg.sender._id) ? msg.sender._id : msg.sender;
                        const isMe = senderId === currentUser._id;
                        const isImage = msg.attachmentUrl && msg.attachmentUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i);

                        return (
                            <div key={index} style={{
                                alignSelf: isMe ? 'flex-end' : 'flex-start',
                                maxWidth: '75%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: isMe ? 'flex-end' : 'flex-start'
                            }}>
                                {isGroup && !isMe && msg.sender && msg.sender.name && (
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '0.5rem', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        {msg.sender.role === 'organizer' && <span style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>[Organizer]</span>}
                                        {msg.sender.name}
                                    </span>
                                )}

                                {/* Deleted message */}
                                {msg.isDeleted ? (
                                    <div style={{
                                        padding: '0.6rem 1rem',
                                        borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                        backgroundColor: 'var(--color-bg-elevated)',
                                        color: 'var(--text-muted)',
                                        fontStyle: 'italic',
                                        fontSize: '0.85rem',
                                        border: '1px dashed var(--color-border)'
                                    }}>
                                        This message was deleted
                                    </div>
                                ) : (
                                    <div
                                        onContextMenu={(e) => {
                                            if (isMe) {
                                                e.preventDefault();
                                                setContextMenu({ x: e.clientX, y: e.clientY, messageId: msg._id });
                                            }
                                        }}
                                        style={{
                                            padding: '0.75rem 1rem',
                                            borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                            backgroundColor: isMe ? 'var(--color-accent)' : 'var(--color-surface)',
                                            color: isMe ? 'white' : 'var(--color-text-main)',
                                            boxShadow: 'var(--shadow-xs)',
                                            border: isMe ? 'none' : '1px solid var(--color-border)',
                                            cursor: isMe ? 'context-menu' : 'default'
                                        }}
                                    >
                                        {msg.attachmentUrl && (
                                            <div style={{ marginBottom: msg.content ? '0.5rem' : '0' }}>
                                                {isImage ? (
                                                    <a href={(msg.attachmentUrl?.startsWith('http') ? msg.attachmentUrl : `${import.meta.env.MODE === 'production' ? 'https://skillsync-0xug.onrender.com' : 'http://localhost:5000'}${msg.attachmentUrl}`)} target="_blank" rel="noopener noreferrer">
                                                        <img src={(msg.attachmentUrl?.startsWith('http') ? msg.attachmentUrl : `${import.meta.env.MODE === 'production' ? 'https://skillsync-0xug.onrender.com' : 'http://localhost:5000'}${msg.attachmentUrl}`)} alt="attachment" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', display: 'block' }} />
                                                    </a>
                                                ) : (
                                                    <a href={(msg.attachmentUrl?.startsWith('http') ? msg.attachmentUrl : `${import.meta.env.MODE === 'production' ? 'https://skillsync-0xug.onrender.com' : 'http://localhost:5000'}${msg.attachmentUrl}`)} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'inherit', textDecoration: 'underline', wordBreak: 'break-all' }}>
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                                                        {msg.attachmentOrigName || 'Download File'}
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                        {msg.content && <p style={{ margin: 0, wordBreak: 'break-word', lineHeight: 1.4 }}>{msg.content}</p>}
                                        <div style={{ fontSize: '0.65rem', opacity: 0.6, marginTop: '4px', textAlign: isMe ? 'right' : 'left' }}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Right-click context menu */}
            {contextMenu && (
                <div onClick={() => setContextMenu(null)} style={{ position: 'fixed', inset: 0, zIndex: 9998 }}>
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            position: 'fixed',
                            left: contextMenu.x,
                            top: contextMenu.y,
                            background: 'var(--color-bg-card)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            boxShadow: 'var(--shadow-lg)',
                            zIndex: 9999,
                            minWidth: 160,
                            overflow: 'hidden'
                        }}
                    >
                        <button
                            onClick={() => {
                                handleDeleteMessage(contextMenu.messageId);
                                setContextMenu(null);
                            }}
                            style={{
                                width: '100%',
                                padding: '0.6rem 1rem',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--color-error)',
                                fontSize: '0.85rem',
                                fontWeight: 500,
                                textAlign: 'left',
                                fontFamily: 'var(--font-sans)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'var(--color-bg-elevated)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            Delete Message
                        </button>
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div style={{ padding: '1rem 1.5rem', backgroundColor: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}>
                <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.75rem', maxWidth: '1000px', margin: '0 auto', alignItems: 'center' }}>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem' }}
                        disabled={uploading}
                        title="Attach file"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                    />

                    <input
                        className="input"
                        style={{ margin: 0, borderRadius: '24px', paddingLeft: '1.25rem' }}
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={uploading ? "Uploading attachment..." : "Message..."}
                        disabled={uploading}
                    />
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ borderRadius: '50%', width: '45px', height: '45px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                        disabled={!newMessage.trim() || uploading}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'translateX(-1px)' }}><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chat;

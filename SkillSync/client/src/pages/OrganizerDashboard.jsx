import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { FaClipboardList, FaCalendarAlt, FaComments, FaTrash, FaCheck, FaTimes, FaEnvelope, FaUsers, FaMapMarkerAlt, FaChevronDown, FaChevronUp, FaFolderOpen, FaBriefcase, FaFilePdf, FaLink } from 'react-icons/fa';

const OrganizerDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('opportunities');
    const [myOpportunities, setMyOpportunities] = useState([]);
    const [myEvents, setMyEvents] = useState([]);
    const [expandedGig, setExpandedGig] = useState(null);
    const [gigApplications, setGigApplications] = useState({});
    const [studentWorks, setStudentWorks] = useState([]);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [gigsRes, eventsRes, worksRes, profileRes] = await Promise.all([
                    api.get('/gigs'),
                    api.get('/events'),
                    api.get('/portfolios/organization'),
                    api.get('/auth/profile')
                ]);
                // Filter gigs created by this organizer
                setMyOpportunities(gigsRes.data.filter(g => g.organizer?._id === user._id));
                setMyEvents(eventsRes.data.filter(e => e.organizer?._id === user._id || e.organizer === user._id));
                setStudentWorks(worksRes.data);
                setUserProfile(profileRes.data);
            } catch (error) {
                console.error('Organizer dashboard fetch error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user._id]);

    const toggleApplications = async (gigId) => {
        if (expandedGig === gigId) {
            setExpandedGig(null);
            return;
        }
        setExpandedGig(gigId);
        if (!gigApplications[gigId]) {
            try {
                const { data } = await api.get(`/gigs/${gigId}/applications`);
                setGigApplications(prev => ({ ...prev, [gigId]: data }));
            } catch (error) {
                console.error('Failed to fetch applications:', error);
            }
        }
    };

    const handleApprove = async (gigId, bidId) => {
        try {
            await api.put(`/gigs/${gigId}/approve-app/${bidId}`);
            // Refresh applications
            const { data } = await api.get(`/gigs/${gigId}/applications`);
            setGigApplications(prev => ({ ...prev, [gigId]: data }));
            // Refresh gigs
            const gigsRes = await api.get('/gigs');
            setMyOpportunities(gigsRes.data.filter(g => g.organizer?._id === user._id));
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to approve');
        }
    };

    const handleReject = async (gigId, bidId) => {
        try {
            await api.put(`/gigs/${gigId}/reject-app/${bidId}`);
            const { data } = await api.get(`/gigs/${gigId}/applications`);
            setGigApplications(prev => ({ ...prev, [gigId]: data }));
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to reject');
        }
    };

    const handleDeleteGig = async (gigId) => {
        if (!window.confirm('Delete this opportunity? This cannot be undone.')) return;
        try {
            await api.delete(`/gigs/${gigId}`);
            setMyOpportunities(myOpportunities.filter(g => g._id !== gigId));
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete');
        }
    };

    if (loading) return (
        <div className="loading-screen">
            <div className="loader"></div>
            <p>Loading management console...</p>
        </div>
    );

    const statusColor = (status) => {
        switch (status) {
            case 'open': return 'success';
            case 'assigned': return 'blue';
            case 'submitted': return 'warning';
            case 'completed': return 'purple';
            default: return 'status';
        }
    };

    const totalApplicants = myOpportunities.reduce((acc, g) => acc + (gigApplications[g._id]?.length || 0), 0);

    const tabs = [
        { id: 'opportunities', label: <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FaClipboardList /> Opportunities</span>, count: myOpportunities.length },
        { id: 'events', label: <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FaCalendarAlt /> Events</span>, count: myEvents.length },
        { id: 'works', label: <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FaFolderOpen /> Student Works</span>, count: studentWorks.length },
    ];

    return (
        <div className="organizer-dashboard animate-fade-in">
            {/* Header */}
            <div className="dashboard-header organizer-header">
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                            <p style={{ opacity: 0.7, fontSize: '0.85rem', marginBottom: '0.5rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                {user?.organization?.name} • Organizer Console
                            </p>
                            <h1 style={{ color: 'white', fontSize: '2.25rem', margin: 0 }}>
                                Management Dashboard
                            </h1>
                            <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '0.5rem', fontSize: '0.95rem' }}>
                                Create opportunities, manage applications, and track student participation
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <Link to="/gigs/create" className="btn" style={{ background: 'linear-gradient(135deg, #2D5A3D, #1E3D2A)', color: 'white', boxShadow: '0 2px 8px rgba(124,58,237,0.3)' }}>
                                + New Opportunity
                            </Link>
                            <Link to="/volunteering/create" className="btn" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
                                + New Event
                            </Link>
                            <Link to="/dashboard/organizer/profile" className="btn" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', textDecoration: 'none' }}>
                                Edit Profile
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="dashboard-body">
                <div className="container">
                    {/* Profile Card */}
                    {userProfile && (
                        <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid #2D5A3D' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #2D5A3D, #1E3D2A)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem', fontWeight: 700, flexShrink: 0, overflow: 'hidden' }}>
                                    {userProfile.avatar ? <img src={`http://localhost:5000${userProfile.avatar}`} alt={userProfile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : userProfile.name?.charAt(0)}
                                </div>
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{userProfile.name}</h3>
                                        <span className="badge badge-success" style={{ fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '4px' }}><FaCheck /> Verified Organizer</span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                        {userProfile.headline || 'Opportunity Provider'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stats Row */}
                    <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
                        <div className="card stat-card animate-slide-up stagger-1">
                            <div className="stat-value" style={{ color: '#2D5A3D' }}>{myOpportunities.length}</div>
                            <div className="stat-label">Total Opportunities</div>
                        </div>
                        <div className="card stat-card animate-slide-up stagger-2">
                            <div className="stat-value" style={{ color: 'var(--color-accent)' }}>{totalApplicants}</div>
                            <div className="stat-label">Applications Received</div>
                        </div>
                        <div className="card stat-card animate-slide-up stagger-3">
                            <div className="stat-value" style={{ color: 'var(--color-success)' }}>{myEvents.length}</div>
                            <div className="stat-label">Events Created</div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="tabs">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                                <span style={{
                                    marginLeft: '0.4rem',
                                    background: activeTab === tab.id ? '#E0EDDA' : '#F1F5F9',
                                    color: activeTab === tab.id ? '#2D5A3D' : '#829485',
                                    padding: '0.1rem 0.5rem',
                                    borderRadius: '9999px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700
                                }}>{tab.count}</span>
                            </button>
                        ))}
                    </div>

                    <div className="animate-fade-in" key={activeTab}>

                        {/* OPPORTUNITIES TAB */}
                        {activeTab === 'opportunities' && (
                            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                <table className="table-modern">
                                    <thead>
                                        <tr>
                                            <th>Opportunity</th>
                                            <th>Status</th>
                                            <th>Deadline</th>
                                            <th>Assigned To</th>
                                            <th style={{ textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {myOpportunities.map(gig => (
                                            <>
                                                <tr key={gig._id}>
                                                    <td>
                                                        <strong style={{ display: 'block', marginBottom: '0.2rem' }}>{gig.title}</strong>
                                                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                                            {gig.skillsRequired?.slice(0, 3).join(', ')}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`badge badge-${statusColor(gig.status)}`}>{gig.status}</span>
                                                    </td>
                                                    <td style={{ fontSize: '0.875rem' }}>
                                                        {new Date(gig.deadline).toLocaleDateString()}
                                                    </td>
                                                    <td style={{ fontSize: '0.875rem' }}>
                                                        {gig.assignedTo?.name || '—'}
                                                    </td>
                                                    <td style={{ textAlign: 'right' }}>
                                                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                                                            <button
                                                                className="btn btn-outline btn-sm"
                                                                onClick={() => toggleApplications(gig._id)}
                                                                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                                                            >
                                                                {expandedGig === gig._id ? <><FaChevronUp /> Hide</> : <><FaChevronDown /> Applications</>}
                                                            </button>
                                                            <Link to={`/chat/group/${gig._id}`} className="btn btn-primary btn-sm" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                <FaComments /> Group Chat
                                                            </Link>
                                                            <Link to={`/gigs/${gig._id}`} className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
                                                                View
                                                            </Link>
                                                            <button
                                                                className="btn btn-danger btn-sm btn-icon"
                                                                onClick={() => handleDeleteGig(gig._id)}
                                                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                            ><FaTrash /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                                {/* Expanded Applications Panel */}
                                                {expandedGig === gig._id && (
                                                    <tr key={`${gig._id}-apps`}>
                                                        <td colSpan="5" style={{ background: '#F0F5EC', padding: '1.25rem' }}>
                                                            <h4 style={{ margin: '0 0 1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <FaEnvelope /> Student Applications for "{gig.title}"
                                                            </h4>
                                                            {gigApplications[gig._id]?.length > 0 ? (
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                                    {gigApplications[gig._id].map(app => (
                                                                        <div key={app._id} className="applicant-card">
                                                                            <Link to={`/network/student/${app.freelancer?._id}`} className="applicant-avatar" style={{ textDecoration: 'none', color: 'inherit' }}>
                                                                                {app.freelancer?.name?.charAt(0) || '?'}
                                                                            </Link>
                                                                            <div style={{ flex: 1 }}>
                                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                                                    <div>
                                                                                        <Link to={`/network/student/${app.freelancer?._id}`} style={{ fontWeight: 700, color: 'var(--color-primary)', textDecoration: 'none' }}>{app.freelancer?.name || 'Student'}</Link>
                                                                                        <span style={{ marginLeft: '0.5rem' }} className={`badge badge-${app.status === 'pending' ? 'warning' : app.status === 'accepted' ? 'success' : 'error'}`}>
                                                                                            {app.status}
                                                                                        </span>
                                                                                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '0.4rem 0 0.2rem' }}>
                                                                                            {app.freelancer?.email}
                                                                                        </p>
                                                                                        {app.freelancer?.resume && (
                                                                                            <a href={`http://localhost:5000${app.freelancer.resume}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', color: '#DC2626', textDecoration: 'none', fontWeight: 600, marginTop: '0.2rem' }}>
                                                                                                <FaFilePdf /> View Resume
                                                                                            </a>
                                                                                        )}
                                                                                    </div>
                                                                                    {app.status === 'pending' && (
                                                                                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                                                                                            <button className="btn btn-success btn-sm" onClick={() => handleApprove(gig._id, app._id)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                                                <FaCheck /> Approve
                                                                                            </button>
                                                                                            <button className="btn btn-danger btn-sm" onClick={() => handleReject(gig._id, app._id)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                                                <FaTimes /> Reject
                                                                                            </button>
                                                                                        </div>
                                                                                    )}
                                                                                    {app.freelancer?._id && (
                                                                                        <Link to={`/chat/${app.freelancer._id}`} className="btn btn-outline btn-sm" style={{ padding: '0.3rem 0.6rem', marginTop: app.status === 'pending' ? '0' : '0.2rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                                                            <FaComments /> Message
                                                                                        </Link>
                                                                                    )}
                                                                                </div>
                                                                                <p style={{ fontSize: '0.85rem', margin: '0.5rem 0 0', padding: '0.75rem', background: 'white', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                                                                                    {app.proposal}
                                                                                </p>
                                                                                {app.freelancer?.skills?.length > 0 && (
                                                                                    <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                                                                                        {app.freelancer.skills.map((s, i) => (
                                                                                            <span key={i} style={{ background: '#F0F5EC', color: '#1E3D2A', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600 }}>{s}</span>
                                                                                        ))}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem' }}>
                                                                    No applications yet for this opportunity.
                                                                </p>
                                                            )}
                                                        </td>
                                                    </tr>
                                                )}
                                            </>
                                        ))}
                                        {myOpportunities.length === 0 && (
                                            <tr>
                                                <td colSpan="5">
                                                    <div className="empty-state">
                                                        <div className="empty-state-icon"><FaClipboardList size={40} /></div>
                                                        <p>No opportunities created yet. Create your first one!</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* EVENTS TAB */}
                        {activeTab === 'events' && (
                            <div>
                                {myEvents.length > 0 ? (
                                    <div className="grid-layout">
                                        {myEvents.map(event => (
                                            <div key={event._id} className="card card-interactive">
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{event.title}</h3>
                                                    <span className={`badge badge-${event.status === 'upcoming' ? 'blue' : event.status === 'completed' ? 'success' : 'status'}`}>
                                                        {event.status}
                                                    </span>
                                                </div>
                                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                    {event.description}
                                                </p>
                                                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FaCalendarAlt /> {new Date(event.date).toLocaleDateString()}</span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FaMapMarkerAlt /> {event.location}</span>
                                                </div>
                                                <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#F0F5EC', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                                                    <strong>Volunteers:</strong> {event.volunteers?.length || 0}
                                                    {event.roles?.length > 0 && (
                                                        <span style={{ marginLeft: '1rem' }}>
                                                            <strong>Roles:</strong> {event.roles.map(r => r.name).join(', ')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="empty-state">
                                        <div className="empty-state-icon"><FaCalendarAlt size={40} /></div>
                                        <p>No events created yet. Create a volunteering event!</p>
                                    </div>
                                )}
                            </div>
                        )}
                        {/* END EVENTS TAB */}

                        {/* STUDENT WORKS TAB */}
                        {activeTab === 'works' && (
                            <div className="custom-grid">
                                {studentWorks.length === 0 ? (
                                    <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem' }}>
                                        <div className="empty-state-icon"><FaBriefcase size={40} /></div>
                                        <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>No specific works uploaded yet</h3>
                                        <p style={{ color: 'var(--text-secondary)' }}>Students within your organization haven't published any portfolio items.</p>
                                    </div>
                                ) : (
                                    studentWorks.map(item => (
                                        <div key={item._id} className="card project-card hover-glow" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                            {item.image ? (
                                                <div style={{ height: '180px', width: '100%', overflow: 'hidden' }}>
                                                    <img
                                                        src={item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`}
                                                        alt={item.title}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                                                    />
                                                </div>
                                            ) : (
                                                <div style={{ height: '80px', width: '100%', background: 'linear-gradient(135deg, var(--color-surface-hover), var(--color-surface))' }}></div>
                                            )}
                                            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                {/* Author Context */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 600, overflow: 'hidden', flexShrink: 0 }}>
                                                        {item.student?.avatar ? (
                                                            <img src={`http://localhost:5000${item.student.avatar}`} alt={item.student.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        ) : (
                                                            item.student?.name?.charAt(0) || 'S'
                                                        )}
                                                    </div>
                                                    <div>
                                                        <Link to={`/network/student/${item.student?._id}`} style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>
                                                            <strong style={{ display: 'block', fontSize: '0.95rem' }}>{item.student?.name}</strong>
                                                        </Link>
                                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.student?.headline || 'Student Contributor'}</span>
                                                    </div>
                                                </div>

                                                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', color: 'var(--text-primary)' }}>{item.title}</h3>
                                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', flex: 1 }}>{item.description}</p>
                                                
                                                <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
                                                    {item.projectLink && (
                                                        <a href={item.projectLink} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                                            <FaLink /> Web
                                                        </a>
                                                    )}
                                                    {item.link && (
                                                        <a href={item.link.startsWith('http') ? item.link : `http://localhost:5000${item.link}`} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                                            <FaLink /> Proof
                                                        </a>
                                                    )}
                                                    {item.portfolioPDF && (
                                                        <a href={`http://localhost:5000${item.portfolioPDF}`} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--color-error)' }}>
                                                            <FaFilePdf /> PDF
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                        {/* END STUDENT WORKS TAB */}

                    </div>

                    {/* Volunteer Management Section */}
                    <div className="card" style={{ marginTop: '1.5rem', borderLeft: '4px solid #2D5A3D' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: '0 0 0.3rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><FaUsers /> Volunteer Management</h3>
                                <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                                    View applications, approve volunteers, export lists, and send duty leave emails
                                </p>
                            </div>
                            <Link
                                to="/dashboard/organizer/applications"
                                className="btn"
                                style={{
                                    background: 'linear-gradient(135deg, #2D5A3D, #1E3D2A)',
                                    color: 'white',
                                    boxShadow: '0 2px 8px rgba(124,58,237,0.3)',
                                    textDecoration: 'none'
                                }}
                            >
                                Manage Volunteers →
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default OrganizerDashboard;

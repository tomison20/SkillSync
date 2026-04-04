import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaEnvelope, FaDownload, FaCamera, FaTimes } from 'react-icons/fa';

const EventDetails = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [user, setUser] = useState(null);
    const [selectedRole, setSelectedRole] = useState('');
    const [studentClass, setStudentClass] = useState('');
    const [teacherName, setTeacherName] = useState('');
    const [teacherEmail, setTeacherEmail] = useState('');
    const [loading, setLoading] = useState(true);

    // Photo gallery state
    const [photos, setPhotos] = useState([]);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [photoFile, setPhotoFile] = useState(null);
    const [photoCaption, setPhotoCaption] = useState('');
    const [uploading, setUploading] = useState(false);
    const [viewingPhoto, setViewingPhoto] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const userRes = await api.get('/auth/profile');
                setUser(userRes.data);

                const eventRes = await api.get(`/events/${id}`);
                setEvent(eventRes.data);
                
                if (eventRes.data.roles && eventRes.data.roles.length > 0) {
                    setSelectedRole(eventRes.data.roles[0].name);
                }

                // Fetch photos
                try {
                    const photosRes = await api.get(`/events/${id}/photos`);
                    setPhotos(photosRes.data);
                } catch (e) { /* no photos yet */ }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    const handleApply = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/events/${id}/register`, { 
                role: selectedRole,
                studentClass,
                teacherName,
                teacherEmail
            });
            alert('Registered for event successfully!');
            window.location.reload();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to register');
        }
    };

    const handleDeleteEvent = async () => {
        if (!window.confirm('Are you sure you want to completely cancel and delete this event? This action cannot be undone.')) return;
        try {
            await api.delete(`/events/${id}`);
            alert('Event successfully deleted.');
            window.location.href = '/volunteering';
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete event');
        }
    };

    const handleRemoveVolunteer = async (volunteerId) => {
        if (!window.confirm('Are you sure you want to remove this volunteer from the event?')) return;
        try {
            await api.delete(`/events/${id}/volunteers/${volunteerId}`);
            alert('Volunteer removed.');
            window.location.reload();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to remove volunteer');
        }
    };

    const handlePhotoUpload = async (e) => {
        e.preventDefault();
        if (!photoFile) return alert('Select a photo first');
        setUploading(true);
        try {
            // Upload image first
            const formData = new FormData();
            formData.append('file', photoFile);
            const uploadRes = await api.post('/upload/event-photo', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

            // Try geolocation
            let geoData = {};
            try {
                const pos = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 }));
                geoData = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
            } catch (_) { /* geolocation unavailable or denied */ }

            // Post photo metadata
            const { data } = await api.post(`/events/${id}/photos`, {
                imageUrl: uploadRes.data.url,
                caption: photoCaption,
                geolocation: geoData.latitude ? geoData : undefined
            });

            setPhotos(prev => [...prev, ...(Array.isArray(data) ? data.slice(-1) : [data])]);
            setPhotoFile(null);
            setPhotoCaption('');
            setShowUploadForm(false);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to upload photo');
        } finally {
            setUploading(false);
        }
    };

    if (loading || !event || !user) return <div className="container" style={{ padding: '4rem' }}>Loading details...</div>;

    const isOrganizer = user._id === (event.organizer?._id || event.organizer) || event.coOrganizers?.some(co => (co._id || co) === user._id);
    
    // Check if user is already registered in event.volunteers
    const isRegistered = event.volunteers?.some(v => (v.user?._id || v.user) === user._id);
    
    // Find user's volunteer record if registered to show their status/QR
    const userRegistration = isRegistered ? event.volunteers.find(v => (v.user?._id || v.user) === user._id) : null;

    return (
        <div className="container animate-fade-in" style={{ padding: '4rem 0' }}>
            <div style={{ marginBottom: '2rem' }}>
                <span className="badge badge-success" style={{ marginBottom: '1rem' }}>
                    VOLUNTEER EVENT
                </span>
                <h1 style={{ fontSize: '3rem', margin: '0 0 1rem' }}>{event.title}</h1>
                <div style={{ display: 'flex', gap: '2rem', color: 'var(--color-text-muted)', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FaCalendarAlt /> <strong>{new Date(event.date).toLocaleDateString()}</strong></span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FaMapMarkerAlt /> <strong>{event.location}</strong></span>
                    <span>Institutional Event</span>
                </div>
            </div>

            <div className="grid-layout" style={{ gridTemplateColumns: '2fr 1fr' }}>
                <div className="card">
                    <h3>Description</h3>
                    <p style={{ whiteSpace: 'pre-wrap', marginBottom: '2rem', color: 'var(--color-accent-hover)' }}>{event.description}</p>

                    <h3>Available Roles</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                        {event.roles?.map((role, idx) => (
                            <div key={idx} style={{ padding: '1.5rem', background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4 style={{ margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {role.name}
                                    </h4>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <FaUsers /> {role.filled} / {role.capacity} Volunteers
                                    </p>
                                </div>
                                <div>
                                    {role.filled >= role.capacity ? (
                                        <span className="badge badge-status">Full</span>
                                    ) : (
                                        <span className="badge badge-success">Open</span>
                                    )}
                                </div>
                            </div>
                        ))}
                        {(!event.roles || event.roles.length === 0) && (
                            <p style={{ color: 'var(--color-text-muted)' }}>No specific roles defined for this event.</p>
                        )}
                    </div>
                </div>

                <div className="card">
                    {event.organizer && (
                        <>
                            <h3>Organizer</h3>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem', fontWeight: 'bold' }}>
                                    {event.organizer.name?.charAt(0) || '?'}
                                </div>
                                <div>
                                    <Link to={`/network/student/${event.organizer._id}`} style={{ fontWeight: 600, margin: 0, color: 'var(--color-primary)', textDecoration: 'none' }}>{event.organizer.name || 'Unknown'}</Link>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>{user?.organization?.name || 'Administrator'}</p>
                                </div>
                            </div>
                        </>
                    )}

                    {event.coOrganizers && event.coOrganizers.length > 0 && (
                        <>
                            <h3 style={{ marginTop: '1rem' }}>Co-Organizers</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                                {event.coOrganizers.map(coOrg => (
                                    <div key={coOrg._id} style={{ display: 'flex', alignItems: 'center' }}>
                                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem', fontWeight: 'bold', fontSize: '0.8rem' }}>
                                            {coOrg.name?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <Link to={`/network/student/${coOrg._id}`} style={{ fontWeight: 600, margin: 0, fontSize: '0.9rem', color: 'var(--color-primary)', textDecoration: 'none' }}>{coOrg.name || 'Unknown'}</Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Student View: Apply */}
                    {!isOrganizer && !isRegistered && (
                        <form onSubmit={handleApply} style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--color-border)' }}>
                            <h4>Register as Volunteer</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>Select a role to participate in this event.</p>
                            
                            <div className="input-group">
                                <label className="label">Select Role</label>
                                <select 
                                    className="input" 
                                    value={selectedRole} 
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    required
                                >
                                    {event.roles?.map((role, idx) => (
                                        <option key={idx} value={role.name} disabled={role.filled >= role.capacity}>
                                            {role.name} {role.filled >= role.capacity ? '(Full)' : `(${role.capacity - role.filled} left)`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="input-group">
                                <label className="label">Class / Section</label>
                                <input className="input" value={studentClass} onChange={e => setStudentClass(e.target.value)} placeholder="e.g. S6 CSE C" required />
                            </div>
                            <div className="input-group">
                                <label className="label">Class Teacher Name</label>
                                <input className="input" value={teacherName} onChange={e => setTeacherName(e.target.value)} placeholder="Class Teacher Name" required />
                            </div>
                            <div className="input-group">
                                <label className="label">Class Teacher Email</label>
                                <input type="email" className="input" value={teacherEmail} onChange={e => setTeacherEmail(e.target.value)} placeholder="Teacher's Email for Duty Leave" required />
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={!selectedRole || event.roles?.every(r => r.filled >= r.capacity)}>
                                Confirm Registration
                            </button>
                        </form>
                    )}

                    {/* Student View: Already Registered */}
                    {!isOrganizer && isRegistered && (
                        <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: 'var(--radius-md)' }}>
                            <h4 style={{ color: 'var(--success-text)', margin: '0 0 1rem' }}>You're Registered!</h4>
                            <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}><strong>Role:</strong> {userRegistration?.role || 'Volunteer'}</p>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <p style={{ fontSize: '0.9rem', margin: 0 }}><strong>Status:</strong> {userRegistration?.status === 'attended' ? 'Attended ✓' : 'Registered / Pending Attendance'}</p>
                                {event.organizer?.email && (
                                    <a 
                                        href={`mailto:${event.organizer.email}?subject=Question regarding Event: ${event.title}`} 
                                        className="btn btn-outline btn-sm" 
                                        style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success-text)', borderColor: 'var(--success-border)', backgroundColor: 'var(--color-bg-card)' }}
                                    >
                                        <FaEnvelope /> Contact Organizer
                                    </a>
                                )}
                            </div>
                            
                            {userRegistration?.certificateUrl && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <a 
                                        href={`http://localhost:5000${userRegistration.certificateUrl}`} 
                                        download
                                        target="_blank" 
                                        rel="noreferrer" 
                                        className="btn btn-primary btn-sm" 
                                        style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--color-accent)', borderColor: 'var(--color-accent)' }}
                                    >
                                        <FaDownload /> Download Certificate
                                    </a>
                                </div>
                            )}

                            {userRegistration?.attendanceHash && (
                                <div style={{ background: 'var(--color-bg-card)', padding: '1rem', borderRadius: '8px', border: '1px dashed var(--color-accent)', textAlign: 'center' }}>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Your Attendance Hash</p>
                                    <code style={{ background: 'var(--color-bg-elevated)', padding: '0.5rem', borderRadius: '4px', wordBreak: 'break-all', fontSize: '0.8rem', display: 'block' }}>
                                        {userRegistration.attendanceHash}
                                    </code>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Organizer View */}
                    {isOrganizer && (
                        <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--color-border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h4>Event Management</h4>
                                <button onClick={handleDeleteEvent} className="btn btn-outline" style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
                                    Delete Event
                                </button>
                            </div>
                            
                            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                                Total Registered: {event.volunteers?.length || 0}
                            </p>

                            {event.volunteers && event.volunteers.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                    {event.volunteers.map((vol, index) => (
                                        <div key={index} style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '6px', background: 'var(--color-bg-card)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                <div>
                                                    <Link to={`/network/student/${vol.user?._id}`} style={{ fontWeight: 600, margin: 0, color: 'var(--color-primary)', textDecoration: 'none' }}>{vol.user?.name || 'Student'}</Link>
                                                    <p style={{ fontSize: '0.75rem', margin: 0, color: 'var(--color-text-muted)' }}>Role: {vol.role}</p>
                                                </div>
                                                <Link to={`/network/student/${vol.user?._id}`} className="btn btn-outline btn-sm" style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem', textDecoration: 'none' }}>Profile</Link>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px dashed var(--color-border)', paddingTop: '0.5rem' }}>
                                                <span className={`badge ${vol.status === 'attended' ? 'badge-success' : 'badge-status'}`} style={{ fontSize: '0.65rem' }}>
                                                    {vol.status.toUpperCase()}
                                                </span>
                                                <button onClick={() => handleRemoveVolunteer(vol._id)} style={{ background: 'none', border: 'none', color: 'var(--color-error)', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}>
                                                    Remove Student
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textAlign: 'center', padding: '1rem', background: 'var(--color-bg-elevated)', borderRadius: '4px' }}>
                                    No volunteers have registered yet.
                                </p>
                            )}

                            <Link to="/dashboard/organizer" className="btn btn-outline" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', width: '100%' }}>
                                Back to Dashboard
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* ─── Event Photo Gallery ─── */}
            <div className="card" style={{ marginTop: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><FaCamera /> Event Photos</h3>
                    {(isOrganizer || isRegistered) && (
                        <button className="btn btn-accent btn-sm" onClick={() => setShowUploadForm(!showUploadForm)}>
                            {showUploadForm ? 'Cancel' : '+ Upload Photo'}
                        </button>
                    )}
                </div>

                {showUploadForm && (
                    <form onSubmit={handlePhotoUpload} style={{ padding: '1rem', background: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid var(--color-border)' }}>
                        <div className="input-group">
                            <label className="label">Photo *</label>
                            <input type="file" accept="image/*" className="input" style={{ padding: '0.5rem' }} onChange={e => setPhotoFile(e.target.files[0])} required />
                        </div>
                        <div className="input-group">
                            <label className="label">Caption (optional)</label>
                            <input className="input" value={photoCaption} onChange={e => setPhotoCaption(e.target.value)} placeholder="Add a caption..." />
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 0.75rem' }}>Location will be auto-tagged if browser permission is granted.</p>
                        <button type="submit" className="btn btn-primary" disabled={uploading || !photoFile}>
                            {uploading ? 'Uploading...' : 'Upload Photo'}
                        </button>
                    </form>
                )}

                {photos.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
                        {photos.map((photo, idx) => (
                            <div key={idx} onClick={() => setViewingPhoto(photo)} style={{ cursor: 'pointer', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-border)', position: 'relative', aspectRatio: '1' }}>
                                <img src={`http://localhost:5000${photo.imageUrl}`} alt={photo.caption || 'Event photo'} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                {photo.caption && (
                                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0.5rem', background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', color: 'white', fontSize: '0.75rem' }}>
                                        {photo.caption}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>No photos uploaded yet.</p>
                )}
            </div>

            {/* Photo Lightbox Modal */}
            {viewingPhoto && (
                <div onClick={() => setViewingPhoto(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, cursor: 'pointer' }}>
                    <button onClick={() => setViewingPhoto(null)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}><FaTimes /></button>
                    <div onClick={e => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '85vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <img src={`http://localhost:5000${viewingPhoto.imageUrl}`} alt={viewingPhoto.caption || ''} style={{ maxWidth: '100%', maxHeight: '75vh', borderRadius: '8px', objectFit: 'contain' }} />
                        {viewingPhoto.caption && <p style={{ color: 'white', marginTop: '1rem', fontSize: '0.95rem', textAlign: 'center' }}>{viewingPhoto.caption}</p>}
                        {viewingPhoto.geolocation?.latitude && (
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                Location: {viewingPhoto.geolocation.latitude.toFixed(4)}, {viewingPhoto.geolocation.longitude.toFixed(4)}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventDetails;

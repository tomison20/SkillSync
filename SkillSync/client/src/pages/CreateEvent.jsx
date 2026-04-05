import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const CreateEvent = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        location: '',
        roleName: 'Volunteer',
        roleCapacity: 10,
        roleDescription: 'General volunteering tasks'
    });

    const [members, setMembers] = useState([]);
    const [selectedCoOrganizers, setSelectedCoOrganizers] = useState([]);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const res = await api.get('/users/organization/members');
                setMembers(res.data);
            } catch (error) {
                console.error("Failed to fetch organization members", error);
            }
        };
        fetchMembers();
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleCoOrganizerToggle = (memberId) => {
        setSelectedCoOrganizers(prev => 
            prev.includes(memberId) 
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Construct the roles array from the single role input for now
            const eventData = {
                title: formData.title,
                description: formData.description,
                date: formData.date,
                location: formData.location,
                coOrganizers: selectedCoOrganizers,
                roles: [{
                    name: formData.roleName,
                    capacity: parseInt(formData.roleCapacity),
                    description: formData.roleDescription
                }]
            };

            await api.post('/events', eventData);
            navigate('/dashboard/organizer');
        } catch (error) {
            alert('Error creating event: ' + (error.response?.data?.message || 'Server Error'));
        }
    };

    return (
        <div className="container" style={{ padding: '4rem 0', maxWidth: '800px' }}>
            <h1 style={{ marginBottom: '2rem' }}>Create Volunteer Event</h1>
            <div className="card">
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="label">Event Title</label>
                        <input className="input" name="title" onChange={handleChange} required placeholder="e.g. Campus Cleanup" />
                    </div>

                    <div className="input-group">
                        <label className="label">Description</label>
                        <textarea className="input" name="description" rows="4" onChange={handleChange} required />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div className="input-group">
                            <label className="label">Date</label>
                            <input type="date" className="input" name="date" onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                            <label className="label">Location</label>
                            <input className="input" name="location" onChange={handleChange} required placeholder="e.g. Student Center" />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="label">Co-Organizers (Optional)</label>
                        <div className="input" style={{ height: 'auto', maxHeight: '200px', overflowY: 'auto', padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', backgroundColor: 'var(--color-bg)' }}>
                            {members.length === 0 ? (
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted, #829485)', margin: 0, padding: '0.5rem' }}>No other organizers found in your institution.</p>
                            ) : (
                                members.map(member => (
                                    <label key={member._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'background 0.2s', backgroundColor: selectedCoOrganizers.includes(member._id) ? 'var(--color-bg-elevated)' : 'transparent' }}>
                                        <input 
                                            type="checkbox" 
                                            checked={selectedCoOrganizers.includes(member._id)}
                                            onChange={() => handleCoOrganizerToggle(member._id)}
                                            style={{ width: '16px', height: '16px', accentColor: 'var(--color-accent)' }}
                                        />
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {member.avatar ? (
                                                <img src={member.avatar.startsWith('http') ? member.avatar : (member.avatar?.startsWith('http') ? member.avatar : `${import.meta.env.MODE === 'production' ? 'https://skillsync-0xug.onrender.com' : 'http://localhost:5000'}${member.avatar}`)} alt={member.name} style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--color-accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>
                                                    {member.name?.charAt(0)}
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontSize: '0.95rem', fontWeight: selectedCoOrganizers.includes(member._id) ? '600' : '400', color: 'var(--color-text-main)' }}>{member.name}</span>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #829485)' }}>{member.email}</span>
                                            </div>
                                        </div>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>

                    <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', fontSize: '1.2rem' }}>Primary Volunteer Role</h3>
                    <div className="input-group">
                        <label className="label">Role Name</label>
                        <input className="input" name="roleName" value={formData.roleName} onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <label className="label">Role Description</label>
                        <input className="input" name="roleDescription" value={formData.roleDescription} onChange={handleChange} required />
                    </div>
                    <div className="input-group">
                        <label className="label">Capacity</label>
                        <input type="number" className="input" name="roleCapacity" value={formData.roleCapacity} onChange={handleChange} required min="1" />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                        Create Event
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateEvent;

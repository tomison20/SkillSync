import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { FaEdit, FaPlus, FaTrophy, FaTimes, FaLink, FaFilePdf, FaTrash, FaBriefcase, FaCalendarAlt } from 'react-icons/fa';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) => currentYear - i);

const Profile = () => {
    const [user, setUser] = useState(null);
    const [portfolio, setPortfolio] = useState([]);
    const [achievements, setAchievements] = useState([]);

    // Portfolio Modal
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [projectForm, setProjectForm] = useState({
        title: '', description: '', projectLink: '', image: '',
        skills: [], startMonth: '', startYear: '', endMonth: '', endYear: '',
        currentlyWorking: false, contributors: []
    });
    const [skillInput, setSkillInput] = useState('');
    const [contributorInput, setContributorInput] = useState('');
    const [pdfFile, setPdfFile] = useState(null);

    // Achievement Modal
    const [showAchModal, setShowAchModal] = useState(false);
    const [editingAch, setEditingAch] = useState(null);
    const [achForm, setAchForm] = useState({ title: '', description: '', date: '', certificateLink: '' });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const userRes = await api.get('/auth/profile');
                setUser(userRes.data);

                const [portRes, achRes] = await Promise.all([
                    api.get('/portfolios'),
                    api.get('/achievements')
                ]);
                setPortfolio(portRes.data);
                setAchievements(achRes.data);
            } catch (error) { console.error(error); }
        };
        fetchProfile();
    }, []);

    // --- Portfolio CRUD ---
    const openProjectModal = (item = null) => {
        if (item) {
            setEditingProject(item);
            const sd = item.startDate ? new Date(item.startDate) : null;
            const ed = item.endDate ? new Date(item.endDate) : null;
            setProjectForm({
                title: item.title || '', description: item.description || '',
                projectLink: item.projectLink || item.link || '', image: item.image || '',
                skills: item.skills || [],
                startMonth: sd ? MONTHS[sd.getMonth()] : '',
                startYear: sd ? sd.getFullYear().toString() : '',
                endMonth: ed ? MONTHS[ed.getMonth()] : '',
                endYear: ed ? ed.getFullYear().toString() : '',
                currentlyWorking: item.currentlyWorking || false,
                contributors: item.contributors || []
            });
        } else {
            setEditingProject(null);
            setProjectForm({
                title: '', description: '', projectLink: '', image: '',
                skills: [], startMonth: '', startYear: '', endMonth: '', endYear: '',
                currentlyWorking: false, contributors: []
            });
        }
        setPdfFile(null);
        setSkillInput('');
        setContributorInput('');
        setShowProjectModal(true);
    };

    const handleProjectSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', projectForm.title);
            formData.append('description', projectForm.description);
            formData.append('projectLink', projectForm.projectLink);
            formData.append('image', projectForm.image);
            formData.append('skills', JSON.stringify(projectForm.skills));
            formData.append('contributors', JSON.stringify(projectForm.contributors));
            formData.append('currentlyWorking', projectForm.currentlyWorking);

            if (projectForm.startMonth && projectForm.startYear) {
                const mi = MONTHS.indexOf(projectForm.startMonth);
                formData.append('startDate', new Date(parseInt(projectForm.startYear), mi, 1).toISOString());
            }
            if (!projectForm.currentlyWorking && projectForm.endMonth && projectForm.endYear) {
                const mi = MONTHS.indexOf(projectForm.endMonth);
                formData.append('endDate', new Date(parseInt(projectForm.endYear), mi, 1).toISOString());
            }
            if (pdfFile) formData.append('portfolioPDF', pdfFile);

            const config = { headers: { 'Content-Type': 'multipart/form-data' } };
            if (editingProject) {
                const { data } = await api.put(`/portfolios/${editingProject._id}`, formData, config);
                setPortfolio(portfolio.map(p => p._id === editingProject._id ? data : p));
            } else {
                const { data } = await api.post('/portfolios', formData, config);
                setPortfolio([data, ...portfolio]);
            }
            setShowProjectModal(false);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save project');
        }
    };

    const handleDeleteProject = async (id) => {
        if (!window.confirm('Delete this project?')) return;
        try {
            await api.delete(`/portfolios/${id}`);
            setPortfolio(portfolio.filter(p => p._id !== id));
        } catch { alert('Failed to delete'); }
    };

    const addSkill = () => {
        const s = skillInput.trim();
        if (s && !projectForm.skills.includes(s)) {
            setProjectForm({ ...projectForm, skills: [...projectForm.skills, s] });
        }
        setSkillInput('');
    };

    const removeSkill = (skill) => {
        setProjectForm({ ...projectForm, skills: projectForm.skills.filter(s => s !== skill) });
    };

    const addContributor = () => {
        const c = contributorInput.trim();
        if (c && !projectForm.contributors.includes(c)) {
            setProjectForm({ ...projectForm, contributors: [...projectForm.contributors, c] });
        }
        setContributorInput('');
    };

    const removeContributor = (name) => {
        setProjectForm({ ...projectForm, contributors: projectForm.contributors.filter(c => c !== name) });
    };

    // --- Achievement CRUD ---
    const openAchModal = (item = null) => {
        if (item) {
            setEditingAch(item);
            setAchForm({ title: item.title, description: item.description || '', date: item.date ? item.date.substring(0, 10) : '', certificateLink: item.certificateLink || '' });
        } else {
            setEditingAch(null);
            setAchForm({ title: '', description: '', date: '', certificateLink: '' });
        }
        setShowAchModal(true);
    };

    const handleAchSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingAch) {
                const { data } = await api.put(`/achievements/${editingAch._id}`, achForm);
                setAchievements(achievements.map(a => a._id === editingAch._id ? data : a));
            } else {
                const { data } = await api.post('/achievements', achForm);
                setAchievements([data, ...achievements]);
            }
            setShowAchModal(false);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save achievement');
        }
    };

    const handleDeleteAch = async (id) => {
        if (!window.confirm('Delete this achievement?')) return;
        try {
            await api.delete(`/achievements/${id}`);
            setAchievements(achievements.filter(a => a._id !== id));
        } catch { alert('Failed to delete'); }
    };

    if (!user) return <div className="container" style={{ padding: '4rem' }}>Loading Institutional Profile...</div>;

    // -- Modal styles (light theme) --
    const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' };
    const modalStyle = { background: '#ffffff', borderRadius: '12px', width: '100%', maxWidth: '560px', maxHeight: '85vh', overflow: 'auto', border: '1px solid var(--color-border)', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' };
    const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)' };
    const bodyStyle = { padding: '1.5rem' };
    const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#2D5A3D', marginBottom: '0.4rem' };
    const inputStyle = { width: '100%', padding: '0.6rem 0.75rem', background: '#F0F5EC', border: '1px solid #B8D4AE', borderRadius: '6px', color: '#1A2E1D', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' };
    const textareaStyle = { ...inputStyle, resize: 'vertical', minHeight: '80px' };
    const selectStyle = { ...inputStyle, cursor: 'pointer', appearance: 'auto' };
    const fieldGap = { marginBottom: '1.25rem' };
    const requiredStar = { color: '#EF4444', marginLeft: '2px' };
    const tagStyle = { display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '0.25rem 0.6rem', background: '#F0F5EC', color: '#2D5A3D', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 500 };

    return (
        <div className="container" style={{ padding: '4rem 0', maxWidth: '900px' }}>
            {/* Profile Header Card */}
            <div className="card" style={{ marginBottom: '2rem', borderTop: `8px solid var(--color-primary)` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '2rem' }}>
                        <div style={{
                            width: 100, height: 100, borderRadius: 'var(--radius-sm)',
                            background: 'var(--color-primary)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            fontSize: '2.5rem', color: '#fff', fontWeight: 'bold',
                            overflow: 'hidden'
                        }}>
                            {user.avatar ? <img src={`http://localhost:5000${user.avatar}`} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : user.name.charAt(0)}
                        </div>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '2.25rem' }}>{user.name}</h1>
                            <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>{user.headline || user.role.toUpperCase()}</p>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <span className="badge badge-success">Verified Student Member</span>
                                <span className="badge badge-status">{user.organization?.name}</span>
                            </div>
                        </div>
                    </div>
                    <Link to={user.role === 'organizer' ? '/dashboard/organizer/profile' : '/dashboard/student/profile'} className="btn btn-outline" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', alignSelf: 'flex-start', fontSize: '0.85rem' }}>
                        <FaEdit /> Edit Profile
                    </Link>
                </div>

                <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                    <div>
                        <h3>Academic Bio</h3>
                        <p style={{ lineHeight: 1.6, color: '#3D6B4A' }}>
                            {user.bio || 'No academic bio provided.'}
                        </p>
                    </div>
                    <div>
                        <h3>Key Skills</h3>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {user.skills && user.skills.length > 0 ? user.skills.map((skill, i) => (
                                <span key={i} className="badge" style={{ background: '#F0F5EC', color: '#2D5A3D' }}>{skill}</span>
                            )) : <p style={{ color: '#999' }}>No skills listed.</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Academic Portfolio */}
            <section style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                    <h2 style={{ fontSize: '1.75rem', margin: 0 }}>Academic Portfolio</h2>
                    {user.role === 'student' && (
                        <button onClick={() => openProjectModal()} className="btn btn-accent btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}><FaPlus /> Add Project</button>
                    )}
                </div>
                <div className="grid-layout">
                    {portfolio.length > 0 ? portfolio.map((item) => (
                        <div key={item._id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            {item.image ? (
                                <img src={item.image} alt={item.title} style={{ width: '100%', height: '160px', objectFit: 'cover', borderBottom: '1px solid var(--color-border)' }} />
                            ) : (
                                <div style={{ height: '120px', background: 'linear-gradient(135deg, #F0F5EC, #C7EABB)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', borderBottom: '1px solid var(--color-border)' }}>
                                    <FaBriefcase />
                                </div>
                            )}
                            <div style={{ padding: '1rem' }}>
                                <h4 style={{ margin: '0 0 0.3rem' }}>{item.title}</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.description || 'No description'}</p>
                                
                                {/* Date Range */}
                                {(item.startDate || item.currentlyWorking) && (
                                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <FaCalendarAlt />
                                        {item.startDate && new Date(item.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                        {' - '}
                                        {item.currentlyWorking ? 'Present' : (item.endDate ? new Date(item.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '')}
                                    </p>
                                )}
                                
                                {/* Skills tags */}
                                {item.skills && item.skills.length > 0 && (
                                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                                        {item.skills.slice(0, 4).map((s, i) => (
                                            <span key={i} className="badge" style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', background: '#F0F5EC', color: '#2D5A3D' }}>{s}</span>
                                        ))}
                                        {item.skills.length > 4 && <span className="badge" style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}>+{item.skills.length - 4}</span>}
                                    </div>
                                )}

                                {/* Contributors */}
                                {item.contributors && item.contributors.length > 0 && (
                                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '0 0 0.5rem' }}>
                                        Contributors: {item.contributors.join(', ')}
                                    </p>
                                )}

                                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                    {(item.link || item.projectLink) && (
                                        <a href={item.projectLink || item.link} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ textDecoration: 'none', flex: 1, fontSize: '0.75rem' }}>
                                            <FaLink /> View
                                        </a>
                                    )}
                                    {item.portfolioPDF && (
                                        <a href={`http://localhost:5000${item.portfolioPDF}`} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ textDecoration: 'none', flex: 1, color: '#DC2626', borderColor: '#FECACA', fontSize: '0.75rem' }}>
                                            <FaFilePdf /> PDF
                                        </a>
                                    )}
                                    <button className="btn btn-secondary btn-sm" onClick={() => openProjectModal(item)} style={{ flex: 1, fontSize: '0.75rem' }}>Edit</button>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteProject(item._id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaTrash /></button>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
                            <p style={{ color: '#999' }}>No portfolio projects showcased yet.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Following / Followers */}
            <section style={{ marginBottom: '3rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '0.5rem' }}>Following ({user.following?.length || 0})</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {user.following && user.following.length > 0 ? user.following.map(f => (
                            <div key={f._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', overflow: 'hidden' }}>
                                    {f.avatar ? <img src={`http://localhost:5000${f.avatar}`} alt={f.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : f.name.charAt(0)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: '0 0 0.2rem' }}>{f.name}</h4>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{f.course || 'Student'}</p>
                                </div>
                                <Link to={`/network/student/${f._id}`} className="btn btn-outline" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>Profile</Link>
                            </div>
                        )) : (
                            <p style={{ color: '#999', fontStyle: 'italic' }}>You aren&apos;t following anyone yet.</p>
                        )}
                    </div>
                </div>

                <div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '0.5rem' }}>Followers ({user.followers?.length || 0})</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {user.followers && user.followers.length > 0 ? user.followers.map(f => (
                            <div key={f._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', overflow: 'hidden' }}>
                                    {f.avatar ? <img src={`http://localhost:5000${f.avatar}`} alt={f.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : f.name.charAt(0)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: '0 0 0.2rem' }}>{f.name}</h4>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{f.course || 'Student'}</p>
                                </div>
                                <Link to={`/network/student/${f._id}`} className="btn btn-outline" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>Profile</Link>
                            </div>
                        )) : (
                            <p style={{ color: '#999', fontStyle: 'italic' }}>You don&apos;t have any followers yet.</p>
                        )}
                    </div>
                </div>
            </section>

            {/* Achievements */}
            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                    <h2 style={{ fontSize: '1.75rem', margin: 0 }}>Achievements</h2>
                    {user.role === 'student' && (
                        <button onClick={() => openAchModal()} className="btn btn-accent btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}><FaTrophy /> Add Achievement</button>
                    )}
                </div>
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {achievements.length > 0 ? achievements.map((ach) => (
                        <div key={ach._id} className="card" style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ flex: 1 }}>
                                <h4 style={{ margin: '0 0 0.2rem' }}>{ach.title}</h4>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{ach.description}</p>
                                {ach.certificateLink && (
                                    <a href={ach.certificateLink} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.3rem' }}>
                                        <FaLink /> View Certificate
                                    </a>
                                )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                                <div style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>
                                    {ach.date ? new Date(ach.date).getFullYear() : ''}
                                </div>
                                <button className="btn btn-secondary btn-sm" onClick={() => openAchModal(ach)} style={{ fontSize: '0.75rem' }}>Edit</button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteAch(ach._id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaTrash /></button>
                            </div>
                        </div>
                    )) : (
                        <p style={{ textAlign: 'center', color: '#999' }}>No achievements recorded.</p>
                    )}
                </div>
            </section>

            {/* ===================== ADD/EDIT PROJECT MODAL ===================== */}
            {showProjectModal && (
                <div style={overlayStyle} onClick={() => setShowProjectModal(false)}>
                    <div style={modalStyle} onClick={e => e.stopPropagation()}>
                        <div style={headerStyle}>
                            <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#1A2E1D' }}>{editingProject ? 'Edit project' : 'Add project'}</h3>
                            <button onClick={() => setShowProjectModal(false)} style={{ background: 'none', border: 'none', color: '#829485', cursor: 'pointer', fontSize: '1.2rem' }}><FaTimes /></button>
                        </div>
                        <form onSubmit={handleProjectSubmit} style={bodyStyle}>
                            <p style={{ fontSize: '0.75rem', color: '#829485', margin: '0 0 1.25rem' }}>* Indicates required</p>

                            {/* Project Name */}
                            <div style={fieldGap}>
                                <label style={labelStyle}>Project name<span style={requiredStar}>*</span></label>
                                <input style={inputStyle} value={projectForm.title} onChange={e => setProjectForm({ ...projectForm, title: e.target.value })} required placeholder="e.g. SkillSync Platform" />
                            </div>

                            {/* Description */}
                            <div style={fieldGap}>
                                <label style={labelStyle}>Description</label>
                                <textarea style={textareaStyle} value={projectForm.description} onChange={e => setProjectForm({ ...projectForm, description: e.target.value.slice(0, 2000) })} placeholder="Describe your project, its goals, and your contributions..." rows={4} />
                                <p style={{ textAlign: 'right', fontSize: '0.7rem', color: '#829485', margin: '0.2rem 0 0' }}>{projectForm.description.length}/2,000</p>
                            </div>

                            {/* Skills */}
                            <div style={fieldGap}>
                                <label style={labelStyle}>Skills</label>
                                <p style={{ fontSize: '0.75rem', color: '#829485', margin: '0 0 0.5rem' }}>We recommend adding your top 5 used in this project.</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: projectForm.skills.length > 0 ? '0.5rem' : 0 }}>
                                    {projectForm.skills.map((skill, i) => (
                                        <span key={i} style={tagStyle}>
                                            {skill}
                                            <FaTimes style={{ cursor: 'pointer', fontSize: '0.65rem' }} onClick={() => removeSkill(skill)} />
                                        </span>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input style={{ ...inputStyle, flex: 1 }} value={skillInput} onChange={e => setSkillInput(e.target.value)} placeholder="e.g. React, Node.js..." onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} />
                                    <button type="button" onClick={addSkill} className="btn btn-outline btn-sm" style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}>+ Add skill</button>
                                </div>
                            </div>

                            {/* Media - Project Link & Image */}
                            <div style={fieldGap}>
                                <label style={labelStyle}>Media</label>
                                <p style={{ fontSize: '0.75rem', color: '#829485', margin: '0 0 0.5rem' }}>Add links, images, or documents related to your project.</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                    <input style={inputStyle} value={projectForm.projectLink} onChange={e => setProjectForm({ ...projectForm, projectLink: e.target.value })} placeholder="Project URL (https://github.com/...)" />
                                    <input style={inputStyle} value={projectForm.image} onChange={e => setProjectForm({ ...projectForm, image: e.target.value })} placeholder="Image URL (https://...)" />
                                    <div>
                                        <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '6px' }}><FaFilePdf /> Upload PDF</label>
                                        <input type="file" accept=".pdf" onChange={e => setPdfFile(e.target.files[0])} style={{ fontSize: '0.8rem', color: '#3D6B4A' }} />
                                    </div>
                                </div>
                            </div>

                            {/* Additional details */}
                            <div style={{ ...fieldGap, borderTop: '1px solid #D8EAD0', paddingTop: '1.25rem' }}>
                                <label style={{ ...labelStyle, fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>Additional details</label>
                                
                                {/* Currently working */}
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', marginBottom: '1rem', fontSize: '0.85rem', color: '#2D5A3D' }}>
                                    <input type="checkbox" checked={projectForm.currentlyWorking} onChange={e => setProjectForm({ ...projectForm, currentlyWorking: e.target.checked })} style={{ width: '16px', height: '16px', accentColor: '#4A7C59' }} />
                                    I am currently working on this project
                                </label>

                                {/* Start Date */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label style={labelStyle}>Start date</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                            <select style={selectStyle} value={projectForm.startMonth} onChange={e => setProjectForm({ ...projectForm, startMonth: e.target.value })}>
                                                <option value="">Month</option>
                                                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                            </select>
                                            <select style={selectStyle} value={projectForm.startYear} onChange={e => setProjectForm({ ...projectForm, startYear: e.target.value })}>
                                                <option value="">Year</option>
                                                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    {!projectForm.currentlyWorking && (
                                        <div>
                                            <label style={labelStyle}>End date</label>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                                <select style={selectStyle} value={projectForm.endMonth} onChange={e => setProjectForm({ ...projectForm, endMonth: e.target.value })}>
                                                    <option value="">Month</option>
                                                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                                </select>
                                                <select style={selectStyle} value={projectForm.endYear} onChange={e => setProjectForm({ ...projectForm, endYear: e.target.value })}>
                                                    <option value="">Year</option>
                                                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Contributors */}
                            <div style={fieldGap}>
                                <label style={labelStyle}>Contributors</label>
                                <p style={{ fontSize: '0.75rem', color: '#829485', margin: '0 0 0.5rem' }}>Add connections who contributed to the project.</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: projectForm.contributors.length > 0 ? '0.5rem' : 0 }}>
                                    {projectForm.contributors.map((c, i) => (
                                        <span key={i} style={{ ...tagStyle, background: '#ECFDF5', color: '#059669' }}>
                                            {c}
                                            <FaTimes style={{ cursor: 'pointer', fontSize: '0.65rem' }} onClick={() => removeContributor(c)} />
                                        </span>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input style={{ ...inputStyle, flex: 1 }} value={contributorInput} onChange={e => setContributorInput(e.target.value)} placeholder="Contributor name..." onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addContributor(); } }} />
                                    <button type="button" onClick={addContributor} className="btn btn-outline btn-sm" style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}>+ Add contributor</button>
                                </div>
                            </div>

                            {/* Save Button */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid #D8EAD0' }}>
                                <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 2rem' }}>
                                    {editingProject ? 'Save' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ===================== ADD/EDIT ACHIEVEMENT MODAL ===================== */}
            {showAchModal && (
                <div style={overlayStyle} onClick={() => setShowAchModal(false)}>
                    <div style={modalStyle} onClick={e => e.stopPropagation()}>
                        <div style={headerStyle}>
                            <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#1A2E1D' }}>{editingAch ? 'Edit achievement' : 'Add achievement'}</h3>
                            <button onClick={() => setShowAchModal(false)} style={{ background: 'none', border: 'none', color: '#829485', cursor: 'pointer', fontSize: '1.2rem' }}><FaTimes /></button>
                        </div>
                        <form onSubmit={handleAchSubmit} style={bodyStyle}>
                            <div style={fieldGap}>
                                <label style={labelStyle}>Title<span style={requiredStar}>*</span></label>
                                <input style={inputStyle} value={achForm.title} onChange={e => setAchForm({ ...achForm, title: e.target.value })} required placeholder="e.g. Best Project Award" />
                            </div>
                            <div style={fieldGap}>
                                <label style={labelStyle}>Description</label>
                                <textarea style={textareaStyle} value={achForm.description} onChange={e => setAchForm({ ...achForm, description: e.target.value })} placeholder="What was the achievement about?" rows={3} />
                            </div>
                            <div style={fieldGap}>
                                <label style={labelStyle}>Date</label>
                                <input type="date" style={inputStyle} value={achForm.date} onChange={e => setAchForm({ ...achForm, date: e.target.value })} />
                            </div>
                            <div style={fieldGap}>
                                <label style={labelStyle}>Certificate Link</label>
                                <input style={inputStyle} value={achForm.certificateLink} onChange={e => setAchForm({ ...achForm, certificateLink: e.target.value })} placeholder="https://..." />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid #D8EAD0' }}>
                                <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 2rem' }}>
                                    {editingAch ? 'Save' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;

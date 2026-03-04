import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (err) {
            console.error('Logout failed', err);
        } finally {
            logout(); // Context update
            navigate('/login');
        }
    };

    // Don't show Navbar on Login/Signup pages for a cleaner "Focus" mode? 
    // User requested "accessible from a clean top navigation bar", so we KEEP it.

    return (
        <nav style={{
            background: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)',
            padding: '1rem 0', // Tighter padding for cleaner look
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
        }}>
            <div className="container" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                {/* Brand */}
                <Link to="/" style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: 'var(--color-primary)',
                    letterSpacing: '-0.025em',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <span style={{ fontSize: '1.75rem' }}>❖</span> SkillSync.
                </Link>

                {/* Navigation Links */}
                <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>

                    {user ? (
                        /* Authenticated State */
                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                            <Link to="/gigs" style={{
                                textDecoration: 'none',
                                color: location.pathname === '/gigs' ? 'var(--color-primary)' : 'var(--color-secondary)',
                                fontWeight: location.pathname === '/gigs' ? '600' : '500',
                                fontSize: '0.9rem',
                                transition: 'color 0.2s'
                            }}>Opportunities</Link>

                            <Link to="/volunteering" style={{
                                textDecoration: 'none',
                                color: location.pathname === '/volunteering' ? 'var(--color-primary)' : 'var(--color-secondary)',
                                fontWeight: location.pathname === '/volunteering' ? '600' : '500',
                                fontSize: '0.9rem',
                                transition: 'color 0.2s'
                            }}>Volunteering</Link>

                            <div style={{ width: '1px', height: '24px', background: '#E2E8F0', margin: '0 0.5rem' }}></div>

                            <Link to="/dashboard" style={{
                                textDecoration: 'none',
                                color: location.pathname === '/dashboard' ? 'var(--color-primary)' : 'var(--color-secondary)',
                                fontWeight: location.pathname === '/dashboard' ? '600' : '500',
                                fontSize: '0.9rem'
                            }}>
                                Dashboard
                            </Link>

                            <button onClick={handleLogout} style={{
                                background: 'none',
                                border: '1px solid var(--color-border)',
                                borderRadius: '4px',
                                padding: '0.4rem 0.8rem',
                                color: 'var(--color-error)',
                                cursor: 'pointer',
                                fontWeight: '500',
                                fontSize: '0.85rem'
                            }}>Sign Out</button>
                        </div>
                    ) : (
                        /* Unauthenticated State */
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <Link to="/login" style={{
                                color: 'var(--color-secondary)',
                                fontWeight: '500',
                                textDecoration: 'none',
                                fontSize: '0.9rem'
                            }}>Log In</Link>
                            <Link to="/signup" className="btn btn-primary" style={{
                                padding: '0.5rem 1.25rem',
                                fontSize: '0.9rem',
                                background: 'var(--color-primary)',
                                color: '#fff'
                            }}>
                                Get Started
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

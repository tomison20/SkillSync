import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

/* ─── Theme Toggle (unchanged) ─── */
const ThemeToggle = ({ theme, onToggle }) => (
    <button
        onClick={onToggle}
        aria-label="Toggle theme"
        style={{
            position: 'relative',
            width: '52px',
            height: '28px',
            borderRadius: '9999px',
            border: 'none',
            cursor: 'pointer',
            padding: '3px',
            transition: 'background 300ms ease',
            background: theme === 'dark'
                ? 'var(--color-accent)'
                : 'var(--color-border-dark)',
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0
        }}
    >
        <span style={{
            position: 'absolute',
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            background: '#FFFFFF',
            transition: 'transform 300ms var(--ease-spring)',
            transform: theme === 'dark' ? 'translateX(24px)' : 'translateX(0px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        }}>
            {theme === 'dark' ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                          fill="#1A2E1D" stroke="#1A2E1D" strokeWidth="2"
                          strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="5" fill="#4A7C59" stroke="#4A7C59" strokeWidth="2"/>
                    <line x1="12" y1="1" x2="12" y2="3" stroke="#4A7C59" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="12" y1="21" x2="12" y2="23" stroke="#4A7C59" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="#4A7C59" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="#4A7C59" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="1" y1="12" x2="3" y2="12" stroke="#4A7C59" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="21" y1="12" x2="23" y2="12" stroke="#4A7C59" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="#4A7C59" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="#4A7C59" strokeWidth="2" strokeLinecap="round"/>
                </svg>
            )}
        </span>
    </button>
);

/* ─── Navbar ─── */
const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [theme, setTheme] = useState(localStorage.getItem('skillsync-theme') || 'light');
    const [mobileOpen, setMobileOpen] = useState(false);

    // Refs for GSAP
    const overlayRef = useRef(null);
    const panelRef = useRef(null);
    const cardRefs = useRef([]);
    const tlRef = useRef(null);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('skillsync-theme', theme);
    }, [theme]);

    // Close on route change
    useEffect(() => {
        if (mobileOpen) closeMobileMenu();
    }, [location.pathname]);

    // Lock body scroll when open
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    /* ─── GSAP open / close ─── */
    const openMobileMenu = useCallback(() => {
        setMobileOpen(true);

        requestAnimationFrame(() => {
            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

            tl.fromTo(overlayRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.3 }
            );
            tl.fromTo(panelRef.current,
                { y: -20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.35 },
                '-=0.2'
            );
            tl.fromTo(cardRefs.current.filter(Boolean),
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.4, stagger: 0.08 },
                '-=0.15'
            );

            tlRef.current = tl;
        });
    }, []);

    const closeMobileMenu = useCallback(() => {
        if (!panelRef.current) { setMobileOpen(false); return; }

        const tl = gsap.timeline({
            defaults: { ease: 'power2.in' },
            onComplete: () => setMobileOpen(false)
        });

        tl.to(cardRefs.current.filter(Boolean), {
            y: 20, opacity: 0, duration: 0.2, stagger: 0.04
        });
        tl.to(panelRef.current, { y: -15, opacity: 0, duration: 0.2 }, '-=0.1');
        tl.to(overlayRef.current, { opacity: 0, duration: 0.2 }, '-=0.1');
    }, []);

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    const handleLogout = async () => {
        closeMobileMenu();
        try { await api.post('/auth/logout'); } catch (err) { console.error('Logout failed', err); }
        finally { logout(); navigate('/login'); }
    };

    const isActive = (path) => location.pathname.startsWith(path);

    const navLinkStyle = (path) => ({
        textDecoration: 'none',
        color: isActive(path) ? 'var(--color-primary)' : 'var(--color-secondary)',
        fontWeight: isActive(path) ? '600' : '500',
        fontSize: '0.875rem',
        transition: 'color 0.2s',
        padding: '0.3rem 0',
        borderBottom: isActive(path) ? '2px solid var(--color-accent)' : '2px solid transparent',
    });

    const getDashboardPath = () => {
        if (!user) return '/dashboard';
        return `/dashboard/${user.role}`;
    };

    const avatarSrc = user?.avatar
        ? (user.avatar.startsWith('http') ? user.avatar : `${import.meta.env.MODE === 'production' ? 'https://skillsync-0xug.onrender.com' : 'http://localhost:5000'}${user.avatar}`)
        : null;

    /* ─── Build card items based on user state ─── */
    const getMobileCards = () => {
        if (!user) {
            return [
                {
                    label: 'Get Started',
                    bgColor: 'var(--accent-700, #2D5A3D)',
                    links: [
                        { label: 'Log In', to: '/login' },
                        { label: 'Sign Up', to: '/signup' },
                    ]
                }
            ];
        }

        const cards = [
            {
                label: 'Navigate',
                bgColor: 'var(--accent-800, #1A2E1D)',
                links: [
                    { label: 'Dashboard', to: getDashboardPath() },
                    { label: 'Opportunities', to: '/gigs' },
                    { label: 'Volunteering', to: '/volunteering' },
                ]
            },
            {
                label: 'Connect',
                bgColor: 'var(--accent-700, #2D5A3D)',
                links: [
                    ...(user.role === 'student' ? [{ label: 'College Network', to: '/network' }] : []),
                    ...((user.role === 'student' || user.role === 'organizer') ? [{ label: 'Inbox', to: '/messages' }] : []),
                    { label: 'Edit Profile', to: '/profile' },
                ]
            },
            {
                label: 'Account',
                bgColor: 'var(--color-accent, #4A7C59)',
                links: [
                    { label: 'Sign Out', action: handleLogout },
                ]
            },
        ];

        return cards;
    };

    return (
        <nav style={{
            background: 'var(--color-bg-card)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid var(--color-border)',
            padding: '0.85rem 0',
            position: 'sticky',
            top: 0,
            zIndex: 200,
            boxShadow: 'var(--shadow-sm)'
        }}>
            <div className="container" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                {/* Brand */}
                <Link to="/" style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.4rem',
                    fontWeight: '700',
                    color: 'var(--color-accent)',
                    letterSpacing: '-0.025em',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    flexShrink: 0
                }}>
                    SkillSync
                </Link>

                {/* ═══ Desktop Navigation ═══ */}
                <div className="nav-desktop" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                    {user ? (
                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                            <Link to="/gigs" style={navLinkStyle('/gigs')}>Opportunities</Link>
                            <Link to="/volunteering" style={navLinkStyle('/volunteering')}>Volunteering</Link>
                            {user.role === 'student' && (
                                <Link to="/network" style={navLinkStyle('/network')}>College Network</Link>
                            )}
                            {(user.role === 'student' || user.role === 'organizer') && (
                                <Link to="/messages" style={navLinkStyle('/messages')}>Inbox</Link>
                            )}
                            <div style={{ width: '1px', height: '20px', background: 'var(--color-border)' }}></div>
                            <Link to={getDashboardPath()} style={navLinkStyle('/dashboard')}>Dashboard</Link>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <ThemeToggle theme={theme} onToggle={toggleTheme} />
                                <Link to="/profile" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{
                                        width: 30, height: 30, borderRadius: '50%',
                                        background: user.role === 'organizer'
                                            ? 'linear-gradient(135deg, var(--accent-700), var(--accent-800))'
                                            : user.role === 'admin'
                                                ? 'linear-gradient(135deg, #1A2E1D, #2D5A3D)'
                                                : 'linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))',
                                        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.8rem', fontWeight: 700, overflow: 'hidden'
                                    }}>
                                        {avatarSrc
                                            ? <img src={avatarSrc} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                            : user.name?.charAt(0)?.toUpperCase()
                                        }
                                    </div>
                                </Link>
                                <button onClick={handleLogout} style={{
                                    background: 'none', border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-sm)', padding: '0.35rem 0.75rem',
                                    color: 'var(--color-error)', cursor: 'pointer', fontWeight: '500',
                                    fontSize: '0.8rem', transition: 'all 0.2s', fontFamily: 'var(--font-sans)'
                                }}>Sign Out</button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <ThemeToggle theme={theme} onToggle={toggleTheme} />
                            <Link to="/login" style={{
                                color: 'var(--color-secondary)', fontWeight: '500',
                                textDecoration: 'none', fontSize: '0.875rem'
                            }}>Log In</Link>
                            <Link to="/signup" className="btn btn-primary" style={{
                                padding: '0.45rem 1.1rem', fontSize: '0.85rem',
                            }}>Get Started</Link>
                        </div>
                    )}
                </div>

                {/* ═══ Mobile Controls: Theme + Avatar + Hamburger ═══ */}
                <div className="nav-mobile-controls" style={{ display: 'none', alignItems: 'center', gap: '0.5rem' }}>
                    <ThemeToggle theme={theme} onToggle={toggleTheme} />

                    {user && (
                        <Link to="/profile" style={{ textDecoration: 'none', display: 'flex' }}>
                            <div style={{
                                width: 30, height: 30, borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))',
                                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.8rem', fontWeight: 700, overflow: 'hidden'
                            }}>
                                {avatarSrc
                                    ? <img src={avatarSrc} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                    : user.name?.charAt(0)?.toUpperCase()
                                }
                            </div>
                        </Link>
                    )}

                    {/* Hamburger / Close */}
                    <button
                        onClick={mobileOpen ? closeMobileMenu : openMobileMenu}
                        aria-label="Toggle menu"
                        style={{
                            background: 'none',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '0.4rem',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: '36px', height: '36px',
                            color: 'var(--color-primary)',
                            transition: 'all 0.2s'
                        }}
                    >
                        {mobileOpen ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <line x1="3" y1="12" x2="21" y2="12" />
                                <line x1="3" y1="18" x2="21" y2="18" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* ═══ Mobile CardNav Overlay ═══ */}
            {mobileOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        ref={overlayRef}
                        onClick={closeMobileMenu}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            top: 0,
                            background: 'rgba(26, 46, 29, 0.4)',
                            backdropFilter: 'blur(4px)',
                            WebkitBackdropFilter: 'blur(4px)',
                            zIndex: 198,
                            opacity: 0,
                        }}
                    />

                    {/* Panel */}
                    <div
                        ref={panelRef}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            background: 'var(--color-bg-card)',
                            borderRadius: '0 0 var(--radius-xl, 16px) var(--radius-xl, 16px)',
                            boxShadow: 'var(--shadow-elevated)',
                            zIndex: 199,
                            opacity: 0,
                            overflow: 'hidden',
                        }}
                    >
                        {/* Panel header bar */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.85rem 1rem',
                            borderBottom: '1px solid var(--color-border)',
                        }}>
                            <Link to="/" onClick={closeMobileMenu} style={{
                                fontFamily: 'var(--font-serif)',
                                fontSize: '1.4rem',
                                fontWeight: '700',
                                color: 'var(--color-accent)',
                                letterSpacing: '-0.025em',
                                textDecoration: 'none',
                            }}>
                                SkillSync
                            </Link>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {user && (
                                    <Link to={getDashboardPath()} onClick={closeMobileMenu}
                                        className="btn btn-primary"
                                        style={{
                                            padding: '0.4rem 1rem',
                                            fontSize: '0.8rem',
                                            textDecoration: 'none',
                                            fontFamily: 'var(--font-sans)',
                                        }}
                                    >
                                        Dashboard
                                    </Link>
                                )}
                                {!user && (
                                    <Link to="/signup" onClick={closeMobileMenu}
                                        className="btn btn-primary"
                                        style={{
                                            padding: '0.4rem 1rem',
                                            fontSize: '0.8rem',
                                            textDecoration: 'none',
                                            fontFamily: 'var(--font-sans)',
                                        }}
                                    >
                                        Get Started
                                    </Link>
                                )}
                                <button
                                    onClick={closeMobileMenu}
                                    aria-label="Close menu"
                                    style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: 'var(--color-primary)', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                        width: '36px', height: '36px',
                                        fontSize: '1.4rem', fontWeight: 300,
                                    }}
                                >
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Card grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${getMobileCards().length}, 1fr)`,
                            gap: '0.75rem',
                            padding: '1rem',
                        }}>
                            {getMobileCards().map((card, i) => (
                                <div
                                    key={card.label}
                                    ref={el => cardRefs.current[i] = el}
                                    style={{
                                        background: card.bgColor,
                                        borderRadius: 'var(--radius-lg, 12px)',
                                        padding: '1.25rem 1rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        minHeight: '160px',
                                        opacity: 0,
                                    }}
                                >
                                    <h4 style={{
                                        color: '#fff',
                                        fontFamily: 'var(--font-serif)',
                                        fontSize: '1.1rem',
                                        fontWeight: 600,
                                        margin: '0 0 auto 0',
                                        letterSpacing: '-0.01em',
                                    }}>
                                        {card.label}
                                    </h4>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                        {card.links.map(link => (
                                            link.action ? (
                                                <button
                                                    key={link.label}
                                                    onClick={link.action}
                                                    style={{
                                                        background: 'none', border: 'none', cursor: 'pointer',
                                                        color: 'rgba(255,255,255,0.85)', fontFamily: 'var(--font-sans)',
                                                        fontSize: '0.85rem', fontWeight: 500, textAlign: 'left',
                                                        padding: '0.2rem 0',
                                                        display: 'flex', alignItems: 'center', gap: '0.35rem',
                                                        transition: 'color 0.15s ease',
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                                                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.85)'}
                                                >
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                                        <line x1="7" y1="17" x2="17" y2="7" />
                                                        <polyline points="7 7 17 7 17 17" />
                                                    </svg>
                                                    {link.label}
                                                </button>
                                            ) : (
                                                <Link
                                                    key={link.label}
                                                    to={link.to}
                                                    onClick={closeMobileMenu}
                                                    style={{
                                                        color: isActive(link.to) ? '#fff' : 'rgba(255,255,255,0.85)',
                                                        fontFamily: 'var(--font-sans)',
                                                        fontSize: '0.85rem',
                                                        fontWeight: isActive(link.to) ? 600 : 500,
                                                        textDecoration: 'none',
                                                        padding: '0.2rem 0',
                                                        display: 'flex', alignItems: 'center', gap: '0.35rem',
                                                        transition: 'color 0.15s ease',
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                                                    onMouseLeave={e => e.currentTarget.style.color = isActive(link.to) ? '#fff' : 'rgba(255,255,255,0.85)'}
                                                >
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                                        <line x1="7" y1="17" x2="17" y2="7" />
                                                        <polyline points="7 7 17 7 17 17" />
                                                    </svg>
                                                    {link.label}
                                                </Link>
                                            )
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </nav>
    );
};

export default Navbar;

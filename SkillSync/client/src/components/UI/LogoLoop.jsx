import React from 'react';
import './LogoLoop.css';

const LogoLoop = ({
    logos,
    speed = 100,
    direction = 'left',
    logoHeight = 60,
    gap = 60,
    scaleOnHover = true,
    fadeOut = true,
    fadeOutColor = 'var(--color-bg-card)',
    ariaLabel = 'Interactive logo marquee'
}) => {
    const duration = speed / 10;
    return (
        <div
            className={`logo-loop-container ${fadeOut ? 'has-fade-out' : ''}`}
            style={{
                '--logo-height': `${logoHeight}px`,
                '--gap': `${gap}px`,
                '--duration': `${duration}s`,
                '--fade-color': fadeOutColor
            }}
            aria-label={ariaLabel}
        >
            <div className={`logo-marquee ${direction}`}>
                {/* We duplicate the logos array a few times to ensure smooth infinite looping */}
                {[...logos, ...logos, ...logos, ...logos].map((logo, index) => {
                    return (
                        <a
                            key={index}
                            href={logo.href || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`logo-item ${scaleOnHover ? 'scale-on-hover' : ''}`}
                            title={logo.title || logo.alt}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                textDecoration: 'none',
                                color: 'inherit'
                            }}
                        >
                            {logo.node ? (
                                <span className="logo-node" style={{ height: logoHeight, width: logoHeight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {logo.node}
                                </span>
                            ) : (
                                <img src={logo.src} alt={logo.alt} style={{ height: logoHeight, objectFit: 'contain' }} />
                            )}
                            {logo.title && <span className="logo-title">{logo.title}</span>}
                        </a>
                    );
                })}
            </div>
        </div>
    );
};

export default LogoLoop;

const Footer = () => {
    return (
        <footer style={{
            background: '#1E3D2A',
            borderTop: '1px solid #2D5A3D',
            padding: '2rem 0',
            marginTop: 'auto'
        }}>
            <div className="container" style={{ textAlign: 'center', fontSize: '0.9rem', color: 'rgba(255,255,255,0.75)' }}>
                <p style={{ color: 'rgba(255,255,255,0.75)' }}>&copy; {new Date().getFullYear()} SkillSync All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && user) {
            // Redirect based on role
            switch (user.role) {
                case 'student':
                    navigate('/dashboard/student', { replace: true });
                    break;
                case 'organizer':
                    navigate('/dashboard/organizer', { replace: true });
                    break;
                case 'admin':
                    navigate('/dashboard/admin', { replace: true });
                    break;
                default:
                    navigate('/', { replace: true });
            }
        }
    }, [user, loading, navigate]);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '80vh',
            color: '#64748B'
        }}>
            <div className="loader"></div>
            <p style={{ marginLeft: '1rem' }}>Redirecting to your institutional dashboard...</p>
        </div>
    );
};

export default Dashboard;

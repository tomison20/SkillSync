import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const userInfo = localStorage.getItem('userInfo');

            if (userInfo) {
                try {
                    const parsedUser = JSON.parse(userInfo);
                    if (parsedUser?.token) {
                        try {
                            const { data } = await api.get('/auth/profile');
                            const fullUser = { ...data, token: parsedUser.token };
                            setUser(fullUser);
                            applyBranding(fullUser.organization);
                        } catch (err) {
                            console.error("AuthContext: Token verification failed", err);
                            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                                localStorage.removeItem('userInfo');
                                setUser(null);
                            } else {
                                setUser(parsedUser);
                                if (parsedUser.organization) applyBranding(parsedUser.organization);
                            }
                        }
                    } else {
                        setUser(null);
                    }
                } catch (error) {
                    console.error('AuthContext: Failed to parse user info', error);
                    localStorage.removeItem('userInfo');
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const applyBranding = (org) => {
        if (!org) return;
        const root = document.documentElement;
        // Institutional theme color
        root.style.setProperty('--primary-color', org.themeColor || '#0f172a');
        // Add more dynamic variables if needed (e.g., banner height, specific accents)
    };

    const login = (userData) => {
        localStorage.setItem('userInfo', JSON.stringify(userData));
        setUser(userData);
        if (userData.organization) applyBranding(userData.organization);
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
        // Reset to default branding
        const root = document.documentElement;
        root.style.setProperty('--primary-color', '#0f172a');
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, applyBranding }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};

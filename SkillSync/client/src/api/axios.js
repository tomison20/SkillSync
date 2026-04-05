import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.MODE === 'production' ? 'https://skillsync-0xug.onrender.com/api' : 'http://localhost:5000/api',
    withCredentials: true, // Important for cookies if used
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
    (config) => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const { token } = JSON.parse(userInfo);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle 401 & Errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('userInfo');
            // window.location.href = '/login'; // <--- DISABLED: This causes hard reloads and context loss. 
            // We rely on the AuthContext or Component (via error catch) to handle the redirect cleanly.
        }
        return Promise.reject(error);
    }
);

export default api;

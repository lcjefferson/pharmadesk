import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://pharmadesk-backend-324m.onrender.com',
});

// Interceptor para adicionar token JWT
api.interceptors.request.use(config => {
    const user = localStorage.getItem('user');
    if (user) {
        const { token } = JSON.parse(user);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export default api;

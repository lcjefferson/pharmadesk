import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000',
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

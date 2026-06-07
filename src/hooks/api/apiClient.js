import axios from 'axios';
import { supabase } from '../../utils/supabase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach auth token to every request, refreshing expired sessions
apiClient.interceptors.request.use(async (config) => {
    let { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();
        session = refreshedSession;
    }
    if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// On 401, clear stale user state so the app knows the session is gone
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('tce_user');
        }
        return Promise.reject(error);
    }
);

export default apiClient;

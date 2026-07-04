import axios from 'axios';
import { supabase } from '../../utils/supabase';
import { clearUser, clearAuthToken } from '../../utils/storage';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach the LIVE Supabase session token on every request.
// getSession() returns the persisted session and (with autoRefreshToken on, the
// default) transparently refreshes an expired access token. Previously this sent a
// STATIC token captured at login, which expired after ~1h and forced a re-login on
// every refresh / return visit.
apiClient.interceptors.request.use(
  async (config) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — on a genuine 401, clear ONLY the admin session state (not
// the whole localStorage, which used to nuke the Supabase auth token too) and send
// the user to login. Guard against redirect loops when already on /login.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearUser();
      clearAuthToken();
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;

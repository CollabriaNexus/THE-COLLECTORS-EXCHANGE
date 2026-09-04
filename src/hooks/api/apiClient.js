import axios from 'axios';
import { hasStoredSupabaseSession } from '../../utils/session';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the auth token to every request. getSession() reads the persisted
// session and (with autoRefreshToken on, the default) transparently refreshes an
// expired one — so we must NOT force refreshSession() here: for guests it fires a
// pointless Supabase network round-trip on every single request, which is what made
// the shop/product pages sit on skeletons for seconds.
//
// The Supabase client is imported DYNAMICALLY, and only when this browser
// actually has a persisted session. Importing it at module scope pulled the
// whole auth/realtime/postgrest SDK into the entry chunk, because this client is
// used by the eagerly-bundled Home and Category routes. An anonymous visitor has
// no `sb-*-auth-token` in localStorage, so they never download it at all; a
// signed-in user pays for one extra chunk fetch on their first request, after
// which the module is cached by the ES module registry.
apiClient.interceptors.request.use(
  async (config) => {
    if (!hasStoredSupabaseSession()) return config;
    const { supabase } = await import('../../utils/supabase');
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// On 401, clear stale user state so the app knows the session is gone
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('tce_user');
    }
    return Promise.reject(error);
  },
);

export default apiClient;

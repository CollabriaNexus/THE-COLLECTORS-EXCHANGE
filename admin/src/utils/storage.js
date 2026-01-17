// localStorage utility functions for Admin Dashboard
const STORAGE_KEYS = {
    ADMIN_USER: 'tce_admin_user',
};

// ============== USER ==============
export const getUser = () => {
    const user = localStorage.getItem(STORAGE_KEYS.ADMIN_USER);
    return user ? JSON.parse(user) : null;
};

export const setUser = (userData) => {
    localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(userData));
};

export const clearUser = () => {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_USER);
};

// ============== ADMIN AUTH TOKEN ==============
export const getAuthToken = () => {
    return localStorage.getItem('tce_admin_token');
};

export const setAuthToken = (token) => {
    localStorage.setItem('tce_admin_token', token);
};

export const clearAuthToken = () => {
    localStorage.removeItem('tce_admin_token');
};

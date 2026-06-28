// localStorage utility functions for Admin Dashboard
import { supabase } from './supabase';

const STORAGE_KEYS = {
    ADMIN_USER: 'tce_admin_user',
};

// ============== USER ==============
export const getUser = () => {
    const user = localStorage.getItem(STORAGE_KEYS.ADMIN_USER);
    try {
        return user ? JSON.parse(user) : null;
    } catch {
        return null;
    }
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

// ============== IMAGE UPLOAD ==============
export const uploadProductImage = async (file) => {
    try {
        if (!file) throw new Error('No file selected');
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;
        const { error } = await supabase.storage.from('product-images').upload(filePath, file);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(filePath);
        return publicUrl;
    } catch (error) {
        console.error('Error uploading product image:', error);
        throw error;
    }
};

export const uploadGalleryImage = async (file) => {
    try {
        if (!file) throw new Error('No file selected');
        const fileExt = file.name.split('.').pop();
        const fileName = `gallery/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const { error } = await supabase.storage.from('product-images').upload(fileName, file);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
        return publicUrl;
    } catch (error) {
        console.error('Error uploading gallery image:', error);
        throw error;
    }
};

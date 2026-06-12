// localStorage utility functions for The Collectors' Exchange
import { supabase } from './supabase';

const STORAGE_KEYS = {
    USER: 'tce_user',
};

// ============== USER ==============
export const getUser = () => {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
};

export const setUser = (userData) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
};

export const clearUser = () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
};



// ============== STORAGE / IMAGES ==============

export const uploadProductImage = async (file) => {
    try {
        if (!file) throw new Error('No file selected');

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error } = await supabase.storage
            .from('product-images')
            .upload(filePath, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath);

        return publicUrl;
    } catch (error) {
        console.error('Error uploading product image:', error);
        throw error;
    }
};

export const uploadKycDocument = async (file, docType) => {
    try {
        if (!file) throw new Error('No file selected');

        const fileExt = file.name.split('.').pop();
        const fileName = `kyc/${docType}-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error } = await supabase.storage
            .from('kyc-documents')
            .upload(filePath, file);

        if (error) {
            console.warn('kyc-documents bucket may not exist, falling back to product-images:', error.message);
            const fallbackPath = `kyc-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const { error: fallbackErr } = await supabase.storage
                .from('product-images')
                .upload(fallbackPath, file);
            if (fallbackErr) throw fallbackErr;
            const { data: { publicUrl } } = supabase.storage
                .from('product-images')
                .getPublicUrl(fallbackPath);
            return publicUrl;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('kyc-documents')
            .getPublicUrl(filePath);

        return publicUrl;
    } catch (error) {
        console.error('Error uploading KYC document:', error);
        throw error;
    }
};

export const uploadTestimonialImage = async (file) => {
    try {
        if (!file) throw new Error('No file selected');

        const fileExt = file.name.split('.').pop();
        const fileName = `testimonials/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error } = await supabase.storage
            .from('product-images')
            .upload(filePath, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath);

        return publicUrl;
    } catch (error) {
        console.error('Error uploading testimonial image:', error);
        throw error;
    }
};


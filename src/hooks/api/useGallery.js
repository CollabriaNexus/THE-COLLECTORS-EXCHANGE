import { useQuery } from '@tanstack/react-query';
import apiClient from './apiClient';

/**
 * Hook to fetch all gallery items
 */
export const useGallery = () => {
    return useQuery({
        queryKey: ['gallery'],
        queryFn: async () => {
            const { data } = await apiClient.get('/gallery');
            return data;
        },
    });
};

/**
 * Hook to fetch a gallery item by ID
 * @param {string} id 
 */
export const useGalleryItem = (id) => {
    return useQuery({
        queryKey: ['gallery', id],
        queryFn: async () => {
            const { data } = await apiClient.get(`/gallery/${id}`);
            return data;
        },
        enabled: !!id,
    });
};

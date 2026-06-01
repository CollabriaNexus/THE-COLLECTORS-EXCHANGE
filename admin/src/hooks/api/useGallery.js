import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './apiClient';

export const useGalleryItems = () => {
    return useQuery({
        queryKey: ['adminGallery'],
        queryFn: async () => {
            const { data } = await apiClient.get('/gallery');
            return data;
        },
    });
};

export const useCreateGalleryItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (itemData) => {
            const { data } = await apiClient.post('/gallery', itemData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminGallery'] });
        },
    });
};

export const useUpdateGalleryItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...itemData }) => {
            const { data } = await apiClient.put(`/gallery/${id}`, itemData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminGallery'] });
        },
    });
};

export const useDeleteGalleryItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            await apiClient.delete(`/gallery/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminGallery'] });
        },
    });
};
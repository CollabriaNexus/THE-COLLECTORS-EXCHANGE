import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './apiClient';

export const useTestimonials = () => {
    return useQuery({
        queryKey: ['testimonials'],
        queryFn: async () => {
            const { data } = await apiClient.get('/testimonials');
            return data;
        },
    });
};

export const useSubmitTestimonial = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ authorName, content, rating, images }) => {
            const { data } = await apiClient.post('/testimonials', { authorName, content, rating, images });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['testimonials'] });
        },
    });
};

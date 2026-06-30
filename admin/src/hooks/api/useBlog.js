import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './apiClient';

export const useBlogPosts = (params = {}) => {
    return useQuery({
        queryKey: ['adminBlog', params],
        queryFn: async () => {
            const searchParams = new URLSearchParams();
            if (params.status) searchParams.set('status', params.status);
            if (params.category) searchParams.set('category', params.category);
            if (params.search) searchParams.set('search', params.search);
            const qs = searchParams.toString();
            const { data } = await apiClient.get(`/blog/admin/all${qs ? `?${qs}` : ''}`);
            return data;
        },
    });
};

export const useBlogPost = (id) => {
    return useQuery({
        queryKey: ['adminBlog', id],
        queryFn: async () => {
            const { data } = await apiClient.get(`/blog/admin/all`);
            const posts = data;
            return posts.find(p => p.id === id) || null;
        },
        enabled: !!id,
    });
};

export const useCreateBlogPost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (postData) => {
            const { data } = await apiClient.post('/blog', postData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminBlog'] });
        },
    });
};

export const useUpdateBlogPost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...postData }) => {
            const { data } = await apiClient.put(`/blog/${id}`, postData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminBlog'] });
        },
    });
};

export const useUpdateBlogStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, status }) => {
            const { data } = await apiClient.patch(`/blog/${id}/status`, { status });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminBlog'] });
        },
    });
};

export const useDeleteBlogPost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            await apiClient.delete(`/blog/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminBlog'] });
        },
    });
};

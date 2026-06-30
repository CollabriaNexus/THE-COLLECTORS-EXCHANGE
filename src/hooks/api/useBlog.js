import { useQuery } from '@tanstack/react-query';
import apiClient from './apiClient';

export const usePublishedBlogs = (params = {}) => {
    return useQuery({
        queryKey: ['publishedBlogs', params],
        queryFn: async () => {
            const searchParams = new URLSearchParams();
            if (params.category) searchParams.set('category', params.category);
            if (params.tag) searchParams.set('tag', params.tag);
            if (params.search) searchParams.set('search', params.search);
            if (params.page) searchParams.set('page', params.page);
            if (params.limit) searchParams.set('limit', params.limit);
            const qs = searchParams.toString();
            const { data } = await apiClient.get(`/blog${qs ? `?${qs}` : ''}`);
            return data;
        },
    });
};

export const useBlogBySlug = (slug) => {
    return useQuery({
        queryKey: ['blog', slug],
        queryFn: async () => {
            const { data } = await apiClient.get(`/blog/${slug}`);
            return data;
        },
        enabled: !!slug,
    });
};

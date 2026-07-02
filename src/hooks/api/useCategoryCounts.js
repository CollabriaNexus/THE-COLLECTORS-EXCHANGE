import { useQuery } from '@tanstack/react-query';
import apiClient from './apiClient';

export const useCategoryCounts = () => {
    return useQuery({
        queryKey: ['products', 'category-counts'],
        queryFn: async () => {
            const { data } = await apiClient.get('/products/category-counts');
            return data;
        },
        staleTime: 30000,
    });
};

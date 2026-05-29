import { useQuery } from '@tanstack/react-query';
import apiClient from './apiClient';

/**
 * Hook to fetch the current user's orders
 */
export const useMyOrders = () => {
    return useQuery({
        queryKey: ['orders', 'me'],
        queryFn: async () => {
            const { data } = await apiClient.get('/users/orders');
            return data;
        },
        retry: false,
    });
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './apiClient';

/**
 * Hook to fetch cart items for a user
 * @param {string} userId 
 */
export const useCart = (userId) => {
    return useQuery({
        queryKey: ['cart', userId],
        queryFn: async () => {
            const { data } = await apiClient.get(`/cart/${userId}`);
            return data;
        },
        enabled: !!userId,
    });
};

/**
 * Hook to add an item to the cart
 */
export const useAddToCart = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ userId, productId }) => {
            const { data } = await apiClient.post('/cart', { userId, productId });
            return data;
        },
        onSuccess: (_, { userId }) => {
            queryClient.invalidateQueries({ queryKey: ['cart', userId] });
        },
    });
};

/**
 * Hook to remove an item from the cart
 */
export const useRemoveFromCart = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ userId, productId }) => {
            const { data } = await apiClient.delete('/cart', { data: { userId, productId } });
            return data;
        },
        onSuccess: (_, { userId }) => {
            queryClient.invalidateQueries({ queryKey: ['cart', userId] });
        },
    });
};

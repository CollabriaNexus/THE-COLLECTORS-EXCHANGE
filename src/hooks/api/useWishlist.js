import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './apiClient';

/**
 * Hook to fetch wishlist items for a user
 * @param {string} userId 
 */
export const useWishlist = (userId) => {
    return useQuery({
        queryKey: ['wishlist', userId],
        queryFn: async () => {
            const { data } = await apiClient.get(`/wishlist/${userId}`);
            return data;
        },
        enabled: !!userId,
    });
};

/**
 * Hook to add an item to the wishlist
 */
export const useAddToWishlist = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ userId, productId }) => {
            const { data } = await apiClient.post('/wishlist', { userId, productId });
            return data;
        },
        onSuccess: (_, { userId }) => {
            queryClient.invalidateQueries({ queryKey: ['wishlist', userId] });
        },
    });
};

/**
 * Hook to remove an item from the wishlist
 */
export const useRemoveFromWishlist = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ userId, productId }) => {
            const { data } = await apiClient.delete('/wishlist', { data: { userId, productId } });
            return data;
        },
        onSuccess: (_, { userId }) => {
            queryClient.invalidateQueries({ queryKey: ['wishlist', userId] });
        },
    });
};

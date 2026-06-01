import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './apiClient';

/**
 * Hook to create a checkout order
 */
export const useCreateOrder = () => {
    return useMutation({
        mutationFn: async (orderData) => {
            const { data } = await apiClient.post('/checkout/create-order', orderData);
            return data;
        },
    });
};

/**
 * Hook to verify order payment signature
 */
export const useVerifyPayment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (paymentDetails) => {
            const { data } = await apiClient.post('/checkout/verify-payment', paymentDetails);
            return data;
        },
        onSuccess: () => {
            // Invalidate all cart queries (regardless of userId key) and orders
            queryClient.invalidateQueries({ queryKey: ['cart'], exact: false });
            queryClient.invalidateQueries({ queryKey: ['orders', 'me'] });
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
};

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
 * Hook to apply a coupon code to an order
 */
export const useApplyCoupon = () => {
    return useMutation({
        mutationFn: async ({ code, orderId }) => {
            const { data } = await apiClient.post('/apply-coupon', { code, orderId });
            return data;
        },
    });
};

/**
 * Hook to validate a coupon code against cart items before placing order
 */
export const useValidateCoupon = () => {
    return useMutation({
        mutationFn: async ({ code, items }) => {
            const { data } = await apiClient.post('/checkout/validate-coupon', { code, items });
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

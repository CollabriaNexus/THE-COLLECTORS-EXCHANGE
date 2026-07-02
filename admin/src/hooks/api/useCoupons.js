import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './apiClient';

export const useProductCoupon = (productId) => {
    return useQuery({
        queryKey: ['adminCoupons', productId],
        queryFn: async () => {
            const { data } = await apiClient.get(`/admin/coupons?productId=${productId}`);
            return data.coupons?.[0] || null;
        },
        enabled: !!productId,
    });
};

export const useCreateCoupon = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (couponData) => {
            const { data } = await apiClient.post('/admin/coupons', couponData);
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
            if (variables.productId) {
                queryClient.invalidateQueries({ queryKey: ['adminCoupons', variables.productId] });
            }
        },
    });
};

export const useUpdateCoupon = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...fields }) => {
            const { data } = await apiClient.patch(`/admin/coupons/${id}`, fields);
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
            if (variables.productId) {
                queryClient.invalidateQueries({ queryKey: ['adminCoupons', variables.productId] });
            }
        },
    });
};

export const useGenerateCoupon = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ productId, discountPercent }) => {
            const { data } = await apiClient.post('/admin/coupons/generate', { productId, discountPercent });
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
            if (variables.productId) {
                queryClient.invalidateQueries({ queryKey: ['adminCoupons', variables.productId] });
            }
        },
    });
};

export const useDeleteCoupon = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id }) => {
            const { data } = await apiClient.delete(`/admin/coupons/${id}`);
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
            if (variables.productId) {
                queryClient.invalidateQueries({ queryKey: ['adminCoupons', variables.productId] });
            }
        },
    });
};

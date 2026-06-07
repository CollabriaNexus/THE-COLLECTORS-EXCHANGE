import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './apiClient';

/**
 * Hook to fetch all users who have a vendor profile (via admin users endpoint with vendor include)
 * We reuse the admin users endpoint and filter client-side, or use a dedicated vendor list.
 */
export const useVendors = (filters = {}) => {
    return useQuery({
        queryKey: ['vendors', filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            // Fetch all users and filter those with vendor profiles
            const { data } = await apiClient.get(`/admin/users?${params.toString()}`);
            // Filter to only users who have gone through KYC (verified or pending)
            return data.filter(u => u.kycStatus === 'verified' || u.kycStatus === 'pending');
        },
    });
};

/**
 * Hook to toggle vendor type (BULK / SINGLE)
 */
export const useToggleVendorType = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ userId, type }) => {
            const { data } = await apiClient.patch(`/admin/vendor/${userId}/type`, { type });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vendors'] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};

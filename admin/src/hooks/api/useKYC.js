import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './apiClient';

/**
 * Hook to fetch all KYC requests
 * @param {Object} filters - Filter options (status, search)
 */
export const useKYCRequests = (filters = {}) => {
    return useQuery({
        queryKey: ['kycRequests', filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters.status) params.append('status', filters.status);
            if (filters.search) params.append('search', filters.search);

            const { data } = await apiClient.get(`/admin/kyc/requests?${params.toString()}`);
            return data;
        },
    });
};

/**
 * Hook to fetch single KYC request detail
 * @param {string} id - User ID
 */
export const useKYCDetail = (id) => {
    return useQuery({
        queryKey: ['kycRequest', id],
        queryFn: async () => {
            const { data } = await apiClient.get(`/admin/kyc/requests/${id}`);
            return data;
        },
        enabled: !!id,
    });
};

/**
 * Hook to approve KYC request
 */
export const useApproveKYC = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, notes }) => {
            const { data } = await apiClient.patch(`/admin/kyc/requests/${id}/approve`, { notes });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['kycRequests'] });
            queryClient.invalidateQueries({ queryKey: ['kycRequest'] });
        },
    });
};

/**
 * Hook to reject KYC request
 */
export const useRejectKYC = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, reason }) => {
            const { data } = await apiClient.patch(`/admin/kyc/requests/${id}/reject`, { reason });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['kycRequests'] });
            queryClient.invalidateQueries({ queryKey: ['kycRequest'] });
        },
    });
};

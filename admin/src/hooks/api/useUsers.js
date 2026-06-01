import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './apiClient';

/**
 * Hook to fetch all users
 */
export const useUsers = (filters = {}) => {
    return useQuery({
        queryKey: ['users', filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters.role) params.append('role', filters.role);
            if (filters.search) params.append('search', filters.search);

            const { data } = await apiClient.get(`/admin/users?${params.toString()}`);
            return data;
        },
    });
};

/**
 * Hook to fetch single user
 */
export const useUserDetail = (id) => {
    return useQuery({
        queryKey: ['user', id],
        queryFn: async () => {
            const { data } = await apiClient.get(`/admin/users/${id}`);
            return data;
        },
        enabled: !!id,
    });
};

/**
 * Hook to update user role
 */
export const useUpdateUserRole = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, role }) => {
            const { data } = await apiClient.patch(`/admin/users/${id}/role`, { role });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['user'] });
        },
    });
};

/**
 * Hook to fetch admin dashboard stats overview
 */
/**
 * Hook to fetch admin analytics data for dashboard charts
 */
export const useAdminAnalytics = () => {
    return useQuery({
        queryKey: ['admin', 'analytics'],
        queryFn: async () => {
            const { data } = await apiClient.get('/admin/stats/analytics');
            return data;
        },
        refetchInterval: 60000,
    });
};

export const useAdminStats = () => {
    return useQuery({
        queryKey: ['admin', 'stats'],
        queryFn: async () => {
            const { data } = await apiClient.get('/admin/stats/overview');
            return data;
        },
    });
};

/**
 * Hook to whitelist a vendor
 */
export const useWhitelistVendor = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ userId, plan }) => {
            const { data } = await apiClient.post(`/admin/vendor/${userId}/whitelist`, { plan });
            return data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
        },
    });
};

/**
 * Hook to ban a user
 */
export const useBanUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const { data } = await apiClient.patch(`/admin/users/${id}/ban`);
            return data;
        },
        onSuccess: (data, id) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['user', id] });
        },
    });
};

/**
 * Hook to unban a user
 */
export const useUnbanUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const { data } = await apiClient.patch(`/admin/users/${id}/unban`);
            return data;
        },
        onSuccess: (data, id) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['user', id] });
        },
    });
};



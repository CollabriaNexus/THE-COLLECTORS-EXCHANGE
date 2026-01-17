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

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './apiClient';

/**
 * Hook to fetch the current user's notifications
 */
export const useNotifications = (enabled = true) => {
    return useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const { data } = await apiClient.get('/users/notifications');
            return data;
        },
        enabled,
        refetchInterval: 30000, // Poll every 30 seconds for new notifications
        retry: false,
    });
};

/**
 * Hook to mark a single notification as read
 */
export const useMarkNotificationRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const { data } = await apiClient.patch(`/users/notifications/${id}/read`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
};

/**
 * Hook to mark all notifications as read
 */
export const useMarkAllNotificationsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            const { data } = await apiClient.patch('/users/notifications/read-all');
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
};

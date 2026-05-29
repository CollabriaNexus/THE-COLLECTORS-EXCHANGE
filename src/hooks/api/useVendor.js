import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './apiClient';

/**
 * Hook to fetch the current user's vendor profile
 */
export const useVendorProfile = () => {
    return useQuery({
        queryKey: ['vendor', 'profile'],
        queryFn: async () => {
            const { data } = await apiClient.get('/vendor/profile');
            return data;
        },
        retry: false, // Don't retry if not registered yet
    });
};

/**
 * Hook to fetch the vendor's statistics
 */
export const useVendorStats = () => {
    return useQuery({
        queryKey: ['vendor', 'stats'],
        queryFn: async () => {
            const { data } = await apiClient.get('/vendor/stats');
            return data;
        },
    });
};

/**
 * Hook to subscribe/upgrade to bulk vendor plan
 */
/**
 * Hook to fetch vendor analytics overview
 */
export const useVendorAnalyticsOverview = (period = '30d') => {
    return useQuery({
        queryKey: ['vendor', 'analytics', 'overview', period],
        queryFn: async () => {
            const { data } = await apiClient.get(`/vendor/analytics/overview?period=${period}`);
            return data;
        },
    });
};

/**
 * Hook to fetch customer interest funnel data
 */
export const useVendorAnalyticsInterest = (period = '30d') => {
    return useQuery({
        queryKey: ['vendor', 'analytics', 'interest', period],
        queryFn: async () => {
            const { data } = await apiClient.get(`/vendor/analytics/interest?period=${period}`);
            return data;
        },
    });
};

/**
 * Hook to fetch sales graph data (time-series)
 */
export const useVendorSalesGraph = (period = '30d') => {
    return useQuery({
        queryKey: ['vendor', 'analytics', 'sales-graph', period],
        queryFn: async () => {
            const { data } = await apiClient.get(`/vendor/analytics/sales-graph?period=${period}`);
            return data;
        },
    });
};

/**
 * Hook to fetch top-selling products
 */
export const useVendorTopProducts = (period = '30d') => {
    return useQuery({
        queryKey: ['vendor', 'analytics', 'top-products', period],
        queryFn: async () => {
            const { data } = await apiClient.get(`/vendor/analytics/top-products?period=${period}`);
            return data;
        },
    });
};

/**
 * Hook to fetch vendor payouts
 */
export const useVendorPayouts = (params = {}) => {
    const { status, page = 1, limit = 20 } = params;
    const queryParams = new URLSearchParams({ page, limit });
    if (status) queryParams.set('status', status);

    return useQuery({
        queryKey: ['vendor', 'payouts', params],
        queryFn: async () => {
            const { data } = await apiClient.get(`/vendor/payouts?${queryParams.toString()}`);
            return data;
        },
    });
};

export const useVendorSubscribe = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ paymentId, plan }) => {
            const { data } = await apiClient.post('/vendor/subscribe', { paymentId, plan });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vendor', 'profile'] });
            queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
        },
    });
};

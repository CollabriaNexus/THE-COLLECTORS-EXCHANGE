import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './apiClient';

export const useAuctions = (status) => {
    return useQuery({
        queryKey: ['auctions', status],
        queryFn: async () => {
            const params = status ? `?status=${status}` : '';
            const { data } = await apiClient.get(`/auctions${params}`);
            return data;
        },
    });
};

export const useAuction = (id) => {
    return useQuery({
        queryKey: ['auctions', id],
        queryFn: async () => {
            const { data } = await apiClient.get(`/auctions/${id}`);
            return data;
        },
        enabled: !!id,
    });
};

export const usePlaceBid = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ auctionId, amount }) => {
            const { data } = await apiClient.post(`/auctions/${auctionId}/bid`, { amount });
            return data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['auctions', variables.auctionId] });
            queryClient.invalidateQueries({ queryKey: ['auctions'] });
        },
    });
};
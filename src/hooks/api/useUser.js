import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './apiClient';

/**
 * Hook to fetch a user profile
 * @param {string} id 
 */
export const useUser = (id) => {
    return useQuery({
        queryKey: ['users', id],
        queryFn: async () => {
            const { data } = await apiClient.get(`/users/${id}`);
            return data;
        },
        enabled: !!id,
    });
};

/**
 * Hook to register a new user
 */
export const useRegisterUser = () => {
    return useMutation({
        mutationFn: async (userData) => {
            const { data } = await apiClient.post('/users/register', userData);
            return data;
        },
    });
};

/**
 * Hook to submit KYC documents
 */
export const useSubmitKyc = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ userId, kycData }) => {
            const { data } = await apiClient.post('/users/kyc', { userId, kycData });
            return data;
        },
        onSuccess: (_, { userId }) => {
            queryClient.invalidateQueries({ queryKey: ['users', userId] });
        },
    });
};

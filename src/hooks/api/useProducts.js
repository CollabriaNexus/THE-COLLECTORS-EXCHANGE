import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './apiClient';

/**
 * Hook to fetch all products
 * @param {string} category
 */
export const useProducts = (category) => {
    return useQuery({
        queryKey: ['products', category],
        queryFn: async () => {
            const url = category && category !== 'all' ? `/products?category=${category}` : '/products';
            const { data } = await apiClient.get(url);
            return data;
        },
    });
};

/**
 * Hook to fetch a single product by ID
 * @param {string} id 
 */
export const useProduct = (id) => {
    return useQuery({
        queryKey: ['products', id],
        queryFn: async () => {
            const { data } = await apiClient.get(`/products/${id}`);
            return data;
        },
        enabled: !!id,
    });
};

/**
 * Hook to add a new product
 */
export const useAddProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (productData) => {
            const { data } = await apiClient.post('/products', productData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
};

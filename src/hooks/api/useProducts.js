import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './apiClient';

/**
 * Hook to fetch all products
 * @param {string} category
 * @param {string} search
 * @param {number} page
 * @param {number} pageSize
 * @param {string} listingCategory
 */
export const useProducts = (category, search, page = 1, pageSize = 12, listingCategory) => {
    return useQuery({
        queryKey: ['products', category, search, page, pageSize, listingCategory],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (category && category !== 'all') params.append('category', category);
            if (search) params.append('search', search);
            if (listingCategory) params.append('listingCategory', listingCategory);
            params.append('page', page);
            params.append('limit', pageSize);
            const { data } = await apiClient.get(`/products?${params.toString()}`);
            return data;
        },
        placeholderData: (prev) => prev,
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

/**
 * Hook to update an existing product
 */
export const useUpdateProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, productData }) => {
            const { data } = await apiClient.put(`/products/${id}`, productData);
            return data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['products', variables.id] });
        },
    });
};

/**
 * Hook to delete a product
 */
export const useDeleteProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const { data } = await apiClient.delete(`/products/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
};

/**
 * Hook to bulk create products (for BULK vendors)
 */
export const useAddBulkProducts = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (products) => {
            const { data } = await apiClient.post('/products/bulk', { products });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
        },
    });
};

/**
 * Hook to mark a product as sold
 */
export const useMarkAsSold = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const { data } = await apiClient.patch(`/products/${id}/sold`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
            queryClient.invalidateQueries({ queryKey: ['vendor', 'stats'] });
        },
    });
};


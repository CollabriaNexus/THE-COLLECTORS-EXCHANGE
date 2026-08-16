import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './apiClient';

/**
 * Hook to fetch all products
 */
export const useProducts = (filters = {}) => {
  return useQuery({
    queryKey: ['adminProducts', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      const { data } = await apiClient.get(`/admin/products?${params.toString()}`);
      return data;
    },
  });
};

/**
 * Hook to fetch single product
 */
export const useProductDetail = (id) => {
  return useQuery({
    queryKey: ['adminProduct', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/admin/products/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

/**
 * Hook to start review
 */
export const useReviewProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { data } = await apiClient.patch(`/admin/products/${id}/review`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['adminProduct'] });
    },
  });
};

/**
 * Hook to approve product (Publish)
 */
export const useApproveProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { data } = await apiClient.patch(`/admin/products/${id}/approve`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['adminProduct'] });
    },
  });
};

/**
 * Hook to reject product
 */
export const useRejectProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }) => {
      const { data } = await apiClient.patch(`/admin/products/${id}/reject`, { reason });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['adminProduct'] });
    },
  });
};

/**
 * Hook to delete product
 */
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { data } = await apiClient.delete(`/admin/products/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['adminProduct'] });
    },
  });
};

/**
 * Hook to update product (brand, listingCategory, category)
 */
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...fields }) => {
      const { data } = await apiClient.patch(`/admin/products/${id}`, fields);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['adminProduct'] });
    },
  });
};

/**
 * Hook to fetch all unique brands
 */
export const useBrands = () => {
  return useQuery({
    queryKey: ['adminBrands'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/brands');
      return data;
    },
    staleTime: 60000,
  });
};

/**
 * Hook to update authenticity status
 */
export const useUpdateAuthenticityStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }) => {
      const { data } = await apiClient.patch(`/admin/products/${id}/authenticity`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['adminProduct'] });
    },
  });
};

/**
 * Hook to fetch TCE Store products
 */
export const useTCEProducts = () => {
  return useQuery({
    queryKey: ['adminTCEProducts'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/products/tce-store');
      return data;
    },
  });
};

/**
 * Hook to create a TCE Store product
 */
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productData) => {
      const { data } = await apiClient.post('/admin/products', productData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['adminTCEProducts'] });
    },
  });
};

/**
 * Hook to edit a TCE Store product (full update)
 */
export const useEditProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...fields }) => {
      const { data } = await apiClient.patch(`/admin/products/${id}`, fields);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['adminTCEProducts'] });
      queryClient.invalidateQueries({ queryKey: ['adminProduct'] });
    },
  });
};

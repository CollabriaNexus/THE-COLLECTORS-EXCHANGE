import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './apiClient';

export const useVendorReviews = (vendorId, params = {}) => {
  return useQuery({
    queryKey: ['vendorReviews', vendorId, params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.limit) searchParams.set('limit', params.limit);
      if (params.offset) searchParams.set('offset', params.offset);
      const qs = searchParams.toString();
      const { data } = await apiClient.get(`/reviews/vendor/${vendorId}${qs ? `?${qs}` : ''}`);
      return data;
    },
    enabled: !!vendorId,
  });
};

export const useProductReviews = (productId, params = {}) => {
  return useQuery({
    queryKey: ['productReviews', productId, params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.limit) searchParams.set('limit', params.limit);
      if (params.offset) searchParams.set('offset', params.offset);
      const qs = searchParams.toString();
      const { data } = await apiClient.get(`/reviews/product/${productId}${qs ? `?${qs}` : ''}`);
      return data;
    },
    enabled: !!productId,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reviewData) => {
      const { data } = await apiClient.post('/reviews', reviewData);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendorReviews'] });
      queryClient.invalidateQueries({ queryKey: ['productReviews', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

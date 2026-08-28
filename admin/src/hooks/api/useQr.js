import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './apiClient';

export const useQrCodes = () => {
  return useQuery({
    queryKey: ['qrCodes'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/qr/codes');
      return data.data;
    },
  });
};

export const useCreateQrCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post('/admin/qr/codes', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qrCodes'] });
    },
  });
};

export const useUpdateQrCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data } = await apiClient.patch(`/admin/qr/codes/${id}`, updates);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qrCodes'] });
    },
  });
};

export const useDeleteQrCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await apiClient.delete(`/admin/qr/codes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qrCodes'] });
      queryClient.removeQueries({ queryKey: ['qrStats'] });
    },
  });
};

const buildParams = (params) => {
  const search = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.append(key, value);
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
};

export const useQrStats = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['qrStats', params],
    queryFn: async () => {
      const { data } = await apiClient.get(`/admin/qr/stats${buildParams(params)}`);
      return data;
    },
    placeholderData: (prev) => prev,
    ...options,
  });
};

export const useQrFilterValues = () => {
  return useQuery({
    queryKey: ['qrFilterValues'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/qr/filters');
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

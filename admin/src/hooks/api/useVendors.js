import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './apiClient';

/**
 * Hook to fetch all users who have a vendor profile (via admin users endpoint with vendor include)
 * We reuse the admin users endpoint and filter client-side, or use a dedicated vendor list.
 */
export const useVendors = (filters = {}) => {
  return useQuery({
    queryKey: ['vendors', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      // Fetch all users and filter those with vendor profiles
      const { data } = await apiClient.get(`/admin/users?${params.toString()}`);
      // Filter to only users who have gone through KYC (verified or pending)
      return data.filter((u) => u.kycStatus === 'verified' || u.kycStatus === 'pending');
    },
  });
};

/**
 * Hook to fetch vendor rankings with sortable metrics (H3: Super Admin Dashboard)
 */
export const useVendorRankings = (sortBy = 'listings', limit = 20) => {
  return useQuery({
    queryKey: ['vendor-rankings', sortBy, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        sortBy,
        limit: String(limit),
      });
      const { data } = await apiClient.get(`/admin/stats/vendor-rankings?${params.toString()}`);
      return data;
    },
    refetchInterval: 120000,
  });
};

/**
 * Hook to toggle vendor type (BULK / SINGLE)
 */
export const useToggleVendorType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, type }) => {
      const { data } = await apiClient.patch(`/admin/vendor/${userId}/type`, { type });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-rankings'] });
    },
  });
};

/**
 * Hook to manage contact messages (M1: Admin inbox)
 */
export const useContactMessages = (filters = {}) => {
  return useQuery({
    queryKey: ['contact-messages', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.limit) params.append('limit', String(filters.limit));
      if (filters.offset) params.append('offset', String(filters.offset));
      const { data } = await apiClient.get(`/admin/contact-messages?${params.toString()}`);
      return data;
    },
    refetchInterval: 90000,
  });
};

export const useContactMessageDetail = (id) => {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['contact-message', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/admin/contact-messages/${id}`);
      return data;
    },
    enabled: !!id,
  });

  // GET /admin/contact-messages/:id marks the message read as a SIDE EFFECT,
  // so the inbox list and the dashboard's unread counter go stale the moment a
  // message is opened. `onSuccess` on useQuery was removed in TanStack Query
  // v5 — it never fired here — so the invalidation runs from an effect keyed on
  // the fetched row instead.
  const fetchedId = query.data?.id;
  useEffect(() => {
    if (!fetchedId) return;
    queryClient.invalidateQueries({ queryKey: ['contact-messages'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
  }, [fetchedId, queryClient]);

  return query;
};

export const useUpdateContactMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }) => {
      const { data } = await apiClient.patch(`/admin/contact-messages/${id}`, patch);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-messages'] });
      queryClient.invalidateQueries({ queryKey: ['contact-message'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
};

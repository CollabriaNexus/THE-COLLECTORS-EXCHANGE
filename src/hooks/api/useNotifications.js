import { useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './apiClient';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export const useNotifications = (enabled = true) => {
  const prevCount = useRef(0);

  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await apiClient.get('/users/notifications');
      if (
        prevCount.current > 0 &&
        data.length > prevCount.current &&
        'Notification' in window &&
        Notification.permission === 'granted'
      ) {
        const newOnes = data.slice(0, data.length - prevCount.current);
        for (const n of newOnes) {
          if (!n.read) {
            new Notification(n.title || 'The Collectors Exchange', {
              body: n.message,
              icon: '/vite.svg',
            });
          }
        }
      }
      prevCount.current = data.length;
      return data;
    },
    enabled,
    refetchInterval: 30000,
    retry: false,
  });
};

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

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
};

export const usePushSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        return { message: 'Push not supported' };
      }
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        return { message: 'Push not configured: missing VAPID public key' };
      }
      const registration = await navigator.serviceWorker.register('/sw.js');
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
      const { data } = await apiClient.post('/users/push-subscribe', sub.toJSON());
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['push-status'] });
    },
  });
};

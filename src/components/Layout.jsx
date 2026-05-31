import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { requestNotificationPermission } from '../hooks/api/useNotifications';
import { getUser } from '../utils/storage';
import apiClient from '../hooks/api/apiClient';

const Layout = () => {
    useEffect(() => {
        const initPush = async () => {
            if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
            const user = getUser();
            if (!user) return;
            const granted = await requestNotificationPermission();
            if (!granted) return;
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                const existingSub = await registration.pushManager.getSubscription();
                if (!existingSub) {
                    const sub = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: null,
                    });
                    await apiClient.post('/users/push-subscribe', sub.toJSON());
                }
            } catch {
                // Push subscription is best-effort
            }
        };
        initPush();
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-secondary-bg">
            <Header />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default Layout;

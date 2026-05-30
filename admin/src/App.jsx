import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { getUser } from './utils/storage';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import KYCRequests from './pages/KYCRequests';
import KYCDetail from './pages/KYCDetail';
import Users from './pages/Users';
import UserDetail from './pages/UserDetail';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Vendors from './pages/Vendors';
import GalleryManager from './pages/GalleryManager';
import Payouts from './pages/Payouts';
import TCEStore from './pages/TCEStore';
import Testimonials from './pages/Testimonials';
import AdminLayout from './components/AdminLayout';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
    const user = getUser();

    if (!user || user.role !== 'admin') {
        return <Navigate to="/login" replace />;
    }

    return <AdminLayout>{children}</AdminLayout>;
};

function ScrollToTop() {
    const { pathname } = useLocation();
    useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
    return null;
}

function App() {
    return (
        <ErrorBoundary>
        <ScrollToTop />
        <Routes>
            <Route path="/login" element={<Login />} />

            {/* Protected Admin Routes */}
            <Route path="/" element={
                <ProtectedRoute>
                    <Dashboard />
                </ProtectedRoute>
            } />

            <Route path="/kyc" element={
                <ProtectedRoute>
                    <KYCRequests />
                </ProtectedRoute>
            } />

            <Route path="/kyc/:id" element={
                <ProtectedRoute>
                    <KYCDetail />
                </ProtectedRoute>
            } />

            <Route path="/users" element={
                <ProtectedRoute>
                    <Users />
                </ProtectedRoute>
            } />

            <Route path="/users/:id" element={
                <ProtectedRoute>
                    <UserDetail />
                </ProtectedRoute>
            } />

            <Route path="/products" element={
                <ProtectedRoute>
                    <Products />
                </ProtectedRoute>
            } />

            <Route path="/products/:id" element={
                <ProtectedRoute>
                    <ProductDetail />
                </ProtectedRoute>
            } />

            <Route path="/orders" element={
                <ProtectedRoute>
                    <Orders />
                </ProtectedRoute>
            } />

            <Route path="/orders/:id" element={
                <ProtectedRoute>
                    <OrderDetail />
                </ProtectedRoute>
            } />

            <Route path="/vendors" element={
                <ProtectedRoute>
                    <Vendors />
                </ProtectedRoute>
            } />

            <Route path="/gallery" element={
                <ProtectedRoute>
                    <GalleryManager />
                </ProtectedRoute>
            } />

            <Route path="/payouts" element={
                <ProtectedRoute>
                    <Payouts />
                </ProtectedRoute>
            } />

            <Route path="/tce-store" element={
                <ProtectedRoute>
                    <TCEStore />
                </ProtectedRoute>
            } />

            <Route path="/testimonials" element={
                <ProtectedRoute>
                    <Testimonials />
                </ProtectedRoute>
            } />

            {/* Redirect to dashboard by default */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </ErrorBoundary>
    );
}

export default App;

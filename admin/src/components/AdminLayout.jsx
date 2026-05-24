import React from 'react';
import Sidebar from './Sidebar';
import { LogOut, User } from 'lucide-react';
import { getUser, clearUser, clearAuthToken } from '../utils/storage';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';

function AdminLayout({ children }) {
    const user = getUser();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
        } catch (err) {
            console.error('Logout error:', err);
        }
        clearUser();
        clearAuthToken();
        navigate('/login', { replace: true });
    };

    return (
        <div className="min-h-screen bg-secondary-bg flex">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-serif font-bold text-heritage-charcoal">
                                Admin Dashboard
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Welcome back, {user?.name || user?.email}
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-4 py-2 bg-heritage-beige rounded-md">
                                <User size={18} className="text-heritage-dark" />
                                <span className="text-sm font-medium text-heritage-dark">
                                    {user?.email}
                                </span>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                            >
                                <LogOut size={18} />
                                <span className="text-sm font-medium">Logout</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default AdminLayout;

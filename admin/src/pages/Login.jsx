import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { setUser, setAuthToken, getUser } from '../utils/storage';
import apiClient from '../hooks/api/apiClient';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Check for existing session or OAuth callback
    useEffect(() => {
        const checkSession = async () => {
            try {
                const existingUser = getUser();
                if (existingUser && existingUser.role === 'admin') {
                    navigate('/', { replace: true });
                    return;
                }

                const { data: { session } } = await supabase.auth.getSession();

                if (session) {
                    const token = session.access_token;
                    setAuthToken(token);

                    try {
                        const { data: userData } = await apiClient.get(`/users/me`);

                        if (!userData) {
                            setError('User not found. Please contact an administrator to set up your account.');
                            await supabase.auth.signOut();
                            return;
                        }

                        if (userData.role !== 'admin') {
                            setError('Access denied. Admin privileges required.');
                            await supabase.auth.signOut();
                            return;
                        }

                        setUser(userData);
                        navigate('/', { replace: true });
                    } catch (userError) {
                        if (userError.response?.status === 404) {
                            setError('Account not found in database. Please register on the main app first, then contact an administrator to grant admin access.');
                        } else {
                            setError('Failed to verify account. Please try again.');
                        }
                        await supabase.auth.signOut();
                    }
                }
            } catch (err) {
                console.error('Session check error:', err);
            }
        };

        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            checkSession();
        });

        const handleStorage = (e) => {
            if (e.key && e.key.startsWith('sb-')) {
                checkSession();
            }
        };
        window.addEventListener('storage', handleStorage);

        return () => {
            subscription.unsubscribe();
            window.removeEventListener('storage', handleStorage);
        };
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 1. Authenticate with Supabase
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            // 2. Get JWT token
            const token = authData.session.access_token;
            setAuthToken(token);

            // 3. Fetch user data from backend to verify admin role
            const { data: userData } = await apiClient.get(`/users/me`);

            // 4. Verify user is admin
            if (userData.role !== 'admin') {
                throw new Error('Access denied. Admin privileges required.');
            }

            // 5. Store user data
            setUser(userData);

            // 6. Navigate to dashboard
            navigate('/', { replace: true });
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Failed to login. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/login`,
                },
            });

            if (error) throw error;

            if (data?.url) {
                window.location.href = data.url;
            }
        } catch (err) {
            console.error('Google login error:', err);
            setError(err.message || 'Failed to login with Google.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-heritage-charcoal via-heritage-dark to-heritage-brown flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-serif font-bold text-luxury-gold mb-2">
                        THE COLLECTORS EXCHANGE
                    </h1>
                    <p className="text-heritage-beige text-sm tracking-wider uppercase">
                        Admin Dashboard
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-lg shadow-heritage p-8">
                    <div className="flex items-center justify-center mb-6">
                        <div className="bg-luxury-gold/10 p-3 rounded-full">
                            <LogIn className="w-8 h-8 text-luxury-gold" />
                        </div>
                    </div>

                    <h2 className="text-2xl font-serif text-center mb-6 text-heritage-charcoal">
                        Admin Login
                    </h2>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-heritage-dark mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-luxury-gold focus:border-transparent outline-none"
                                placeholder="admin@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-heritage-dark mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-luxury-gold focus:border-transparent outline-none"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-luxury-gold text-white py-3 rounded-md font-medium hover:bg-luxury-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    {/* Google Sign-in Button */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        type="button"
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        <span className="font-medium text-gray-700">Sign in with Google</span>
                    </button>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        <p>Authorized admin access only</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;

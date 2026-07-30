import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, LoaderCircle } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { setUser, setAuthToken, getUser } from '../utils/storage';
import apiClient from '../hooks/api/apiClient';

function Login() {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Check for existing session or OAuth callback
  useEffect(() => {
    const checkSession = async () => {
      setChecking(true);
      try {
        const existingUser = getUser();
        if (existingUser && existingUser.role === 'admin') {
          navigate('/', { replace: true });
          return;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

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
              try {
                const { data: newUser } = await apiClient.post('/users/register', {
                  email: session.user.email,
                  name: session.user.email.split('@')[0],
                });

                if (newUser.role !== 'admin') {
                  setError('Access denied. Admin privileges required.');
                  await supabase.auth.signOut();
                  return;
                }

                setUser(newUser);
                navigate('/', { replace: true });
                return;
              } catch {
                setError('Account not found. Please register on the main app first.');
              }
            } else {
              setError('Failed to verify account. Please try again.');
            }
            await supabase.auth.signOut();
          }
        }
      } catch (err) {
        console.error('Session check error:', err);
      } finally {
        setChecking(false);
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
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

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-heritage-charcoal via-heritage-dark to-heritage-brown flex items-center justify-center p-4">
        <div className="text-center">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-8 shadow-heritage">
            <LoaderCircle className="w-10 h-10 text-luxury-gold animate-spin mx-auto mb-4" />
            <p className="text-heritage-beige text-sm tracking-wider uppercase">
              Verifying session...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-heritage-charcoal via-heritage-dark to-heritage-brown flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-luxury-gold mb-2">
            THE COLLECTORS EXCHANGE
          </h1>
          <p className="text-heritage-beige text-sm tracking-wider uppercase">Admin Dashboard</p>
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

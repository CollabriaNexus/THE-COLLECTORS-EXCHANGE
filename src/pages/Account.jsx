import React, { useState, useEffect } from 'react';
import { User, FileText, Package, LogOut, Plus, ShieldCheck, Trash2, Image as ImageIcon, Tag, Info, Loader2, Mail, X } from 'lucide-react';
import { getUser, setUser as setLocalUser, clearUser } from '../utils/storage';
import { useUser, useRegisterUser, useSubmitKyc } from '../hooks/api/useUser';
import { useAddProduct } from '../hooks/api/useProducts';
import { supabase } from '../utils/supabase';
import apiClient from '../hooks/api/apiClient';

// Helper Component for Phone Verification
const PhoneVerification = ({ user, onVerified }) => {
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('input'); // 'input', 'verify'
    const [loading, setLoading] = useState(false);
    const { token } = user; // Assuming we can get token or we use supabase session. 
    // Actually `useUser` hook might not provide the token needed for backend calls if we are using headers.
    // The previous code uses `registerMutation` which likely uses axios with headers.
    // I need to check `useUser` or `api/client`. 
    // For now, I'll use `supabase.auth.getSession()` to get token or assume global interceptor?
    // Let's assume we can use `fetch` with the session token.

    const sendOtp = async () => {
        if (!phone || phone.length < 10) return alert("Please enter a valid phone number");
        setLoading(true);
        try {
            await apiClient.post('/users/otp/send', { phone });
            alert(`OTP Sent! (Simulation: Check Backend Console)`);
            setStep('verify');
        } catch (err) {
            alert(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async () => {
        if (!otp) return alert("Please enter OTP");
        setLoading(true);
        try {
            const { data } = await apiClient.post('/users/otp/verify', { phone, code: otp });
            alert("Phone Verified Successfully!");
            onVerified(phone);
        } catch (err) {
            alert(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 border border-gray-100 p-4">
            {step === 'input' ? (
                <div className="flex gap-2">
                    <input
                        type="tel"
                        placeholder="Enter Phone Number"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="flex-grow p-3 border border-gray-200 focus:outline-none focus:border-luxury-gold text-sm"
                    />
                    <button
                        onClick={sendOtp}
                        disabled={loading}
                        className="bg-black text-white px-4 py-2 text-xs uppercase tracking-widest hover:bg-luxury-gold transition-colors"
                    >
                        {loading ? 'Sending...' : 'Send OTP'}
                    </button>
                </div>
            ) : (
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={e => setOtp(e.target.value)}
                        className="flex-grow p-3 border border-gray-200 focus:outline-none focus:border-luxury-gold text-sm"
                    />
                    <button
                        onClick={verifyOtp}
                        disabled={loading}
                        className="bg-heritage-charcoal text-white px-4 py-2 text-xs uppercase tracking-widest hover:bg-green-600 transition-colors"
                    >
                        {loading ? 'Verifying...' : 'Verify'}
                    </button>
                    <button
                        onClick={() => setStep('input')}
                        className="text-gray-400 text-xs hover:text-gray-600"
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
};

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('email'); // 'email', 'otp'
    const [loading, setLoading] = useState(false);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                // Removing shouldCreateUser: false to allow new users to sign up via OTP
            });
            if (error) throw error;
            alert('Login Code sent to your email!');
            setStep('otp');
        } catch (error) {
            alert(error.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.verifyOtp({
                email,
                token: otp,
                type: 'email'
            });
            if (error) throw error;
            // Success handled by onAuthStateChange in parent
        } catch (error) {
            alert(error.message || 'Invalid Code');
        } finally {
            setLoading(false);
        }
    };

    if (step === 'email') {
        return (
            <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Email Address</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-4 bg-gray-50 border border-gray-200 focus:outline-none focus:border-luxury-gold transition-colors"
                        placeholder="vip@example.com"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black text-white py-4 text-sm uppercase tracking-widest hover:bg-luxury-gold transition-colors duration-300 flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                    Send Login Code
                </button>
            </form>
        );
    }

    return (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="text-center mb-4">
                <p className="text-sm text-gray-600">Enter the code sent to <span className="font-semibold">{email}</span></p>
                <button type="button" onClick={() => setStep('email')} className="text-xs text-luxury-gold hover:underline mt-1">Change Email</button>
            </div>
            <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">6-Digit Code</label>
                <input
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full p-4 bg-gray-50 border border-gray-200 focus:outline-none focus:border-luxury-gold transition-colors text-center text-lg tracking-widest"
                    placeholder="123456"
                />
            </div>
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-4 text-sm uppercase tracking-widest hover:bg-luxury-gold transition-colors duration-300 flex items-center justify-center gap-2"
            >
                {loading ? <Loader2 size={16} className="animate-spin" /> : 'Verify & Sign In'}
            </button>
        </form>
    );
};

const CATEGORIES = ['Timepieces', 'Sneakers', 'Collectables', 'Currencies', 'Pop Collection', 'Toys', 'Antiques', 'Limited Editions'];
const CONDITIONS = ['Mint', 'Like New', 'Excellent', 'Good', 'Fair'];

const Account = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [localUser, setLocalUserState] = useState(null);
    const [isRegistering, setIsRegistering] = useState(false);
    const [showCompanyPopup, setShowCompanyPopup] = useState(false);
    const [regForm, setRegForm] = useState({ name: '', email: '', phone: '', password: '', type: 'individual' });
    const [kycForm, setKycForm] = useState({ aadhaar: '', pan: '', companyName: '', gst: '', founderName: '' });
    const [productForm, setProductForm] = useState({
        title: '',
        category: CATEGORIES[0],
        description: '',
        condition: 'Good',
        price: '',
        imageUrls: [''],
        keywords: '',
    });

    // API Hooks
    const { data: user, isLoading: isUserLoading } = useUser(localUser?.id);
    const registerMutation = useRegisterUser();
    const kycMutation = useSubmitKyc();
    const addProductMutation = useAddProduct();

    useEffect(() => {
        // Initial session check
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                handleAuthChange(session);
            } else {
                const storedUser = getUser();
                if (storedUser) setLocalUserState(storedUser);
            }
        };

        checkSession();

        // Auth listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            handleAuthChange(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleAuthChange = async (session) => {
        if (session) {
            // sync with backend
            try {
                const syncData = {
                    email: session.user.email,
                    name: session.user.user_metadata.full_name || session.user.email.split('@')[0],
                    supabaseId: session.user.id,
                };
                const user = await registerMutation.mutateAsync({ ...syncData, type: 'individual' });
                setLocalUser(user);
                setLocalUserState(user);
            } catch (error) {
                console.error('Auth sync failed', error);
            }
        } else {
            setLocalUserState(null);
            clearUser();
        }
    };

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + '/THE-COLLECTORS-EXCHANGE/account'
            }
        });
        if (error) alert(error.message);
    };

    const userProducts = user?.products || [];

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const newUser = await registerMutation.mutateAsync(regForm);
            setLocalUser(newUser);
            setLocalUserState(newUser);
            setIsRegistering(false);
        } catch (error) {
            alert('Registration failed. Please try again.');
        }
    };

    const handleKycSubmit = async (e) => {
        e.preventDefault();
        const kycData = user.type === 'individual'
            ? { aadhaar: kycForm.aadhaar, pan: kycForm.pan }
            : { companyName: kycForm.companyName, gst: kycForm.gst, founderName: kycForm.founderName };

        try {
            await kycMutation.mutateAsync({ userId: user.id, kycData });
            alert('Verification documents submitted successfully!');
        } catch (error) {
            alert('KYC submission failed.');
        }
    };

    const handlePhoneVerified = (newPhone) => {
        // Update local state immediately for UI feedback
        // In a real app, react-query invalidation would re-fetch user
        setLocalUser(prev => ({ ...prev, phone: newPhone }));
        setLocalUserState(prev => ({ ...prev, phone: newPhone }));
    };

    // Image URL handling
    const handleImageUrlChange = (index, value) => {
        const newUrls = [...productForm.imageUrls];
        newUrls[index] = value;
        setProductForm({ ...productForm, imageUrls: newUrls });
    };

    const addImageField = () => {
        if (productForm.imageUrls.length < 10) {
            setProductForm({ ...productForm, imageUrls: [...productForm.imageUrls, ''] });
        }
    };

    const removeImageField = (index) => {
        const newUrls = productForm.imageUrls.filter((_, i) => i !== index);
        setProductForm({ ...productForm, imageUrls: newUrls });
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();

        // 1. Validate User Type Limit
        if (user.type === 'individual' && userProducts.length >= 5) {
            alert('Individual sellers are limited to 5 products. Please upgrade to a Company account for unlimited listings.');
            return;
        }

        // 2. Validate Images (Min 4)
        const validImages = productForm.imageUrls.filter(url => url.trim() !== '');
        if (validImages.length < 4) {
            alert('Authenticity Requirement: Please provide at least 4 high-quality images of the item.');
            return;
        }

        // 3. Process Keywords
        const keywordsArray = productForm.keywords.split(',').map(k => k.trim()).filter(k => k !== '');
        if (keywordsArray.length === 0) {
            alert('Please provide at least one keyword for categorization.');
            return;
        }

        try {
            await addProductMutation.mutateAsync({
                title: productForm.title,
                category: productForm.category,
                description: productForm.description,
                condition: productForm.condition,
                price: parseFloat(productForm.price),
                sellerId: user.id,
                images: validImages,
                image: validImages[0],
                keywords: keywordsArray,
            });

            setProductForm({
                title: '',
                category: CATEGORIES[0],
                description: '',
                condition: 'Good',
                price: '',
                imageUrls: [''],
                keywords: '',
            });
            alert('Product listed successfully! Your item is now live in The Exchange.');
        } catch (error) {
            alert('Failed to list product.');
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        clearUser();
        setLocalUserState(null);
        setActiveTab('profile');
    };

    if (isUserLoading && localUser) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-secondary-bg">
                <Loader2 className="animate-spin text-luxury-gold mb-4" size={64} />
                <p className="text-gray-500 font-serif text-xl italic">Authenticating Profile...</p>
            </div>
        );
    }

    if (!localUser) {
        return (
            <div className="container mx-auto py-20 px-6 max-w-xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-serif mb-4">{isRegistering ? 'Membership Application' : 'Welcome Back'}</h1>
                    <p className="text-gray-500 font-light">Access The Collectors' Exchange secure portal.</p>
                </div>

                {isRegistering ? (
                    <form onSubmit={handleRegister} className="bg-white p-10 shadow-heritage border border-gray-100 space-y-6">
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 py-4 text-sm font-medium hover:bg-gray-50 transition-colors mb-4"
                        >
                            <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                            Continue with Google
                        </button>

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-100"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase tracking-widest">
                                <span className="bg-white px-2 text-gray-400">Or Register with Email</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Full Name</label>
                            <input
                                type="text"
                                required
                                value={regForm.name}
                                onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                                className="w-full p-4 bg-gray-50 border border-gray-200 focus:outline-none focus:border-luxury-gold transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Email Address</label>
                            <input
                                type="email"
                                required
                                value={regForm.email}
                                onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                                className="w-full p-4 bg-gray-50 border border-gray-200 focus:outline-none focus:border-luxury-gold transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Phone Number</label>
                            <input
                                type="tel"
                                required
                                value={regForm.phone}
                                onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                                className="w-full p-4 bg-gray-50 border border-gray-200 focus:outline-none focus:border-luxury-gold transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Account Type</label>
                            <div className="grid grid-cols-2 gap-4">
                                <label className={`cursor-pointer p-4 border transition-all ${regForm.type === 'individual' ? 'border-luxury-gold bg-luxury-gold/5' : 'border-gray-200'}`}>
                                    <input
                                        type="radio"
                                        name="type"
                                        value="individual"
                                        checked={regForm.type === 'individual'}
                                        onChange={(e) => setRegForm({ ...regForm, type: e.target.value })}
                                        className="hidden"
                                    />
                                    <div className="font-serif font-medium">Individual</div>
                                    <div className="text-xs text-gray-500 mt-1">For private collectors</div>
                                </label>
                                <label className={`cursor-pointer p-4 border transition-all border-gray-200 hover:border-luxury-gold/50`}>
                                    <input
                                        type="radio"
                                        name="type"
                                        value="company"
                                        checked={false}
                                        onChange={() => setShowCompanyPopup(true)}
                                        className="hidden"
                                    />
                                    <div className="font-serif font-medium">Company</div>
                                    <div className="text-xs text-gray-500 mt-1">For businesses</div>
                                </label>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={registerMutation.isPending}
                            className="w-full bg-black text-white py-5 text-sm uppercase tracking-widest hover:bg-luxury-gold transition-colors duration-300 flex items-center justify-center gap-2"
                        >
                            {registerMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                            Create Account
                        </button>
                        <p className="text-center text-gray-500 text-sm">
                            Already a member?{' '}
                            <button type="button" onClick={() => setIsRegistering(false)} className="text-luxury-gold hover:underline font-semibold">
                                Sign In
                            </button>
                        </p>
                    </form>
                ) : (
                    <div className="bg-white p-10 shadow-heritage border border-gray-100 space-y-6">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-serif text-heritage-charcoal mb-2">Member Sign In</h2>
                            <p className="text-gray-500 font-light text-sm">Welcome back to The Exchange.</p>
                        </div>

                        <LoginForm onLoginSuccess={() => { }} />

                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-100"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase tracking-widest">
                                <span className="bg-white px-2 text-gray-400">New Collector?</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsRegistering(true)}
                            className="w-full bg-black text-white py-4 text-sm uppercase tracking-widest hover:bg-luxury-gold transition-colors duration-300 shadow-sm"
                        >
                            Create Application
                        </button>
                    </div>
                )}

                {/* Company Registration Popup */}
                {showCompanyPopup && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-in fade-in duration-200">
                        <div className="bg-white p-8 max-w-md w-full shadow-2xl border border-gray-100 relative">
                            <button
                                onClick={() => setShowCompanyPopup(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
                            >
                                <X size={20} />
                            </button>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-luxury-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Info size={24} className="text-luxury-gold" />
                                </div>
                                <h3 className="font-serif text-xl mb-3 text-heritage-charcoal">Company Registration</h3>
                                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                                    To register as a company please connect with us on the following email. We will get back to you within the next 2 working days.
                                </p>
                                <a href="mailto:partnerships@thecollectors.exchange" className="flex items-center justify-center w-full bg-black text-white py-3 text-sm uppercase tracking-widest hover:bg-luxury-gold transition-colors gap-2">
                                    <Mail size={16} />
                                    partnerships@thecollectors.exchange
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="bg-white p-10 shadow-sm border border-gray-100">
                        <h3 className="text-3xl font-serif mb-8 text-heritage-charcoal">Collector Profile</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Full Name</label>
                                <div className="p-4 bg-gray-50 border border-gray-100 text-gray-800 font-serif">{user.name}</div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Email Address</label>
                                <div className="p-4 bg-gray-50 border border-gray-100 text-gray-800">{user.email}</div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Phone</label>
                                {user.phone ? (
                                    <div className="p-4 bg-green-50 border border-green-100 text-green-800 flex justify-between items-center">
                                        <span>{user.phone}</span>
                                        <span className="text-xs uppercase tracking-widest font-bold flex items-center gap-1">
                                            <ShieldCheck size={14} /> Verified
                                        </span>
                                    </div>
                                ) : (
                                    <PhoneVerification user={user} onVerified={handlePhoneVerified} />
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Membership Type</label>
                                <div className="p-4 bg-gray-50 border border-gray-100 text-gray-800 capitalize flex items-center gap-2">
                                    {user.type}
                                    {user.kycStatus === 'verified' && <ShieldCheck size={16} className="text-luxury-gold" />}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'seller':
                return (
                    <div className="bg-white p-10 shadow-sm border border-gray-100">
                        <h3 className="text-3xl font-serif mb-8 text-heritage-charcoal">Identity Verification</h3>

                        {user.kycStatus === 'verified' ? (
                            <div className="bg-green-50 text-green-800 p-6 border border-green-100 flex items-start gap-4">
                                <ShieldCheck size={32} className="text-green-600 mt-1" />
                                <div>
                                    <h4 className="font-serif text-lg font-medium mb-1">Verified Status: Active</h4>
                                    <p className="text-sm opacity-80">Your identity has been verified. You have full access to list items on The Exchange.</p>
                                </div>
                            </div>
                        ) : user.kycStatus === 'pending' ? (
                            <div className="bg-yellow-50 text-yellow-800 p-6 border border-yellow-100 flex items-start gap-4">
                                <ShieldCheck size={32} className="text-yellow-600 mt-1" />
                                <div>
                                    <h4 className="font-serif text-lg font-medium mb-1">Application Submitted</h4>
                                    <p className="text-sm opacity-80">
                                        Your application has been submitted successfully. Verification will be completed within 48 hours.
                                        <br />
                                        Our internal team is currently reviewing your documents.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="max-w-2xl">
                                <p className="text-gray-500 mb-8 font-light">
                                    To maintain the integrity of our marketplace, all sellers must complete improved verification.
                                    Your data is encrypted and permanently deleted after verification.
                                </p>
                                <form onSubmit={handleKycSubmit} className="space-y-6">
                                    {user.type === 'individual' ? (
                                        <>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Aadhaar Number</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={kycForm.aadhaar}
                                                    onChange={(e) => setKycForm({ ...kycForm, aadhaar: e.target.value })}
                                                    className="w-full p-4 border border-gray-300 focus:outline-none focus:border-luxury-gold"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">PAN Number</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={kycForm.pan}
                                                    onChange={(e) => setKycForm({ ...kycForm, pan: e.target.value })}
                                                    className="w-full p-4 border border-gray-300 focus:outline-none focus:border-luxury-gold"
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Registered Company Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={kycForm.companyName}
                                                    onChange={(e) => setKycForm({ ...kycForm, companyName: e.target.value })}
                                                    className="w-full p-4 border border-gray-300 focus:outline-none focus:border-luxury-gold"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">GST Number</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={kycForm.gst}
                                                    onChange={(e) => setKycForm({ ...kycForm, gst: e.target.value })}
                                                    className="w-full p-4 border border-gray-300 focus:outline-none focus:border-luxury-gold"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Founder / Director Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={kycForm.founderName}
                                                    onChange={(e) => setKycForm({ ...kycForm, founderName: e.target.value })}
                                                    className="w-full p-4 border border-gray-300 focus:outline-none focus:border-luxury-gold"
                                                />
                                            </div>
                                        </>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={kycMutation.isPending}
                                        className="bg-black text-white px-10 py-4 text-sm uppercase tracking-widest hover:bg-luxury-gold transition-colors flex items-center justify-center gap-2"
                                    >
                                        {kycMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                                        Submit Verification Documents
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                );

            case 'listings':
                return (
                    <div className="space-y-12">
                        {/* Add New Product Form */}
                        {user.kycStatus === 'verified' && (
                            <div className="bg-white p-10 shadow-sm border border-gray-100">
                                <div className="mb-8 pb-8 border-b border-gray-100">
                                    <h3 className="text-3xl font-serif mb-2 text-heritage-charcoal">Broker a New Item</h3>
                                    <p className="text-gray-500 font-light text-sm">
                                        All listings are subject to administrator approval. Please provide accurate, detailed information to ensure swift verification.
                                    </p>
                                </div>

                                <form onSubmit={handleProductSubmit} className="space-y-8">
                                    {/* Essential Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="col-span-1 md:col-span-2">
                                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                                                Item Title <span className="text-luxury-gold">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g., 1950s Hans Wegner Papa Bear Chair"
                                                value={productForm.title}
                                                onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                                                className="w-full p-4 border border-gray-200 focus:outline-none focus:border-luxury-gold font-serif text-lg"
                                            />
                                            <p className="text-xs text-gray-400 mt-2">Use the official name or a factual description. No decorative adjectives in title.</p>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                                                Primary Category <span className="text-luxury-gold">*</span>
                                            </label>
                                            <select
                                                value={productForm.category}
                                                onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                                                className="w-full p-4 border border-gray-200 focus:outline-none focus:border-luxury-gold bg-white"
                                            >
                                                {CATEGORIES.map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                                                Listing Price (USD) <span className="text-luxury-gold">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                required
                                                min="1"
                                                value={productForm.price}
                                                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                                                className="w-full p-4 border border-gray-200 focus:outline-none focus:border-luxury-gold"
                                            />
                                        </div>
                                    </div>

                                    {/* Story & Provenance */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                                            Provenance & Description <span className="text-luxury-gold">*</span>
                                        </label>
                                        <textarea
                                            required
                                            rows={6}
                                            placeholder="Describe the history, condition, and provenance of the item. This text will be displayed as the main storytelling element on the product page."
                                            value={productForm.description}
                                            onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                                            className="w-full p-4 border border-gray-200 focus:outline-none focus:border-luxury-gold leading-relaxed"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                                                Condition Grade <span className="text-luxury-gold">*</span>
                                            </label>
                                            <select
                                                value={productForm.condition}
                                                onChange={(e) => setProductForm({ ...productForm, condition: e.target.value })}
                                                className="w-full p-4 border border-gray-200 focus:outline-none focus:border-luxury-gold bg-white"
                                            >
                                                {CONDITIONS.map(cond => (
                                                    <option key={cond} value={cond}>{cond}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                                                Keywords / Tags <span className="text-luxury-gold">*</span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Separate with commas (e.g., vintage, gold, 1980s)"
                                                    value={productForm.keywords}
                                                    onChange={(e) => setProductForm({ ...productForm, keywords: e.target.value })}
                                                    className="w-full p-4 pl-10 border border-gray-200 focus:outline-none focus:border-luxury-gold"
                                                />
                                                <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Image Upload Section */}
                                    <div className="bg-gray-50 p-6 border border-gray-100 rounded-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-600">
                                                Image Gallery (Min 4 Required) <span className="text-luxury-gold">*</span>
                                            </label>
                                            <span className="text-xs text-gray-500">{productForm.imageUrls.filter(u => u).length} / 10 Images</span>
                                        </div>

                                        <div className="space-y-4">
                                            {productForm.imageUrls.map((url, index) => (
                                                <div key={index} className="flex gap-4 items-center">
                                                    <div className="w-8 text-xs text-gray-400 font-mono text-center">
                                                        {index === 0 ? 'MAIN' : `#${index + 1}`}
                                                    </div>
                                                    <div className="flex-grow relative">
                                                        <input
                                                            type="url"
                                                            placeholder={index === 0 ? "Primary image URL..." : "Additional image URL..."}
                                                            value={url}
                                                            onChange={(e) => handleImageUrlChange(index, e.target.value)}
                                                            className="w-full p-3 pl-10 border border-gray-200 focus:outline-none focus:border-luxury-gold text-sm"
                                                        />
                                                        <ImageIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                    </div>
                                                    {productForm.imageUrls.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImageField(index)}
                                                            className="text-gray-400 hover:text-red-500 p-2"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {productForm.imageUrls.length < 10 && (
                                            <button
                                                type="button"
                                                onClick={addImageField}
                                                className="mt-4 flex items-center gap-2 text-sm text-luxury-gold font-semibold hover:underline"
                                            >
                                                <Plus size={16} /> Add Another Image
                                            </button>
                                        )}

                                        <div className="mt-4 flex items-start gap-2 text-xs text-gray-400 bg-white p-3 border border-gray-100">
                                            <Info size={14} className="mt-0.5 flex-shrink-0" />
                                            <p>Use direct image URLs (e.g., from Unsplash or hosted assets). The first image will be the primary detailed view and card thumbnail.</p>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={addProductMutation.isPending}
                                            className="bg-heritage-charcoal text-white px-12 py-4 text-sm uppercase tracking-widest hover:bg-heritage-brown transition-colors shadow-lg flex items-center justify-center gap-2"
                                        >
                                            {addProductMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                                            Submit for Brokerage
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* User's Listings */}
                        <div className="bg-white p-10 shadow-sm border border-gray-100">
                            <h3 className="text-3xl font-serif mb-8 text-heritage-charcoal">My Collection</h3>
                            {userProducts.length > 0 ? (
                                <div className="space-y-6">
                                    {userProducts.map(product => (
                                        <div key={product.id} className="border border-gray-100 p-6 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
                                            <img
                                                src={product.image || 'https://via.placeholder.com/150'}
                                                alt={product.title}
                                                className="w-full md:w-40 h-40 object-cover bg-gray-50"
                                            />
                                            <div className="flex-grow">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-serif text-xl mb-2">{product.title}</h4>
                                                        <div className="flex items-center gap-4 text-xs text-gray-500 uppercase tracking-wider mb-4">
                                                            <span>{product.category}</span>
                                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                            <span>{product.condition}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-serif text-lg font-medium">${product.price?.toLocaleString()}</p>
                                                        {product.authenticityStatus === 'Verified' ? (
                                                            <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 mt-2">
                                                                <ShieldCheck size={12} /> Authenticated
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-1 mt-2">
                                                                Pending Review
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                                                    {product.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-gray-50 border border-gray-100 border-dashed">
                                    <Package size={48} className="mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-500 font-serif text-lg">Your portfolio is empty.</p>
                                    <p className="text-gray-400 text-sm mt-1">List items to see them appear here.</p>
                                    {user.kycStatus !== 'verified' && (
                                        <button
                                            onClick={() => setActiveTab('seller')}
                                            className="text-luxury-gold font-semibold hover:underline mt-4 text-sm uppercase tracking-widest"
                                        >
                                            Complete Verification to List Items
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-secondary-bg">
            <div className="container mx-auto py-16 px-6">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar */}
                    <div className="w-full lg:w-1/4">
                        <div className="bg-white shadow-sm border border-gray-100 sticky top-24">
                            <div className="p-8 border-b border-gray-100 text-center">
                                <div className="w-20 h-20 rounded-full bg-heritage-cream mx-auto flex items-center justify-center mb-4 text-heritage-bronze">
                                    <User size={32} />
                                </div>
                                <h2 className="font-serif text-xl mb-1">{user.name}</h2>
                                <p className="text-xs text-gray-500 uppercase tracking-widest border px-2 py-0.5 inline-block rounded-sm border-gray-200">{user.type}</p>
                            </div>
                            <nav className="p-4 space-y-1">
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`flex items-center gap-4 w-full p-4 text-sm font-medium transition-all ${activeTab === 'profile' ? 'bg-heritage-charcoal text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <User size={18} /> Profile
                                </button>
                                <button
                                    onClick={() => setActiveTab('seller')}
                                    className={`flex items-center gap-4 w-full p-4 text-sm font-medium transition-all ${activeTab === 'seller' ? 'bg-heritage-charcoal text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <FileText size={18} /> Verification
                                </button>
                                <button
                                    onClick={() => setActiveTab('listings')}
                                    className={`flex items-center gap-4 w-full p-4 text-sm font-medium transition-all ${activeTab === 'listings' ? 'bg-heritage-charcoal text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <Package size={18} /> Portfolio
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-4 w-full p-4 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors mt-8 border-t border-gray-100"
                                >
                                    <LogOut size={18} /> Sign Out
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="w-full lg:w-3/4">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Account;

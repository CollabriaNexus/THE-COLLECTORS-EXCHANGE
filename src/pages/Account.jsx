import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { User, FileText, Package, LogOut, Plus, ShieldCheck, Trash2, Image as ImageIcon, Tag, Info, Loader2, Mail, X, ShoppingBag, Store, Crown, Check, CreditCard, Upload, Bell, BarChart3, Eye, Edit3, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Papa from 'papaparse';
import { getUser, setUser as setLocalUser, clearUser } from '../utils/storage';
import { useMe, useRegisterUser, useSubmitKyc, useUpdateProfile } from '../hooks/api/useUser';
import { useAddProduct, useDeleteProduct, useAddBulkProducts, useUpdateProduct, useMarkAsSold } from '../hooks/api/useProducts';
import { useMyOrders } from '../hooks/api/useOrders';
import { useWishlist, useAddToWishlist, useRemoveFromWishlist } from '../hooks/api/useWishlist';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '../hooks/api/useNotifications';
import { supabase } from '../utils/supabase';
import { uploadProductImage, uploadKycDocument, uploadTestimonialImage } from '../utils/storage';
import apiClient from '../hooks/api/apiClient';
import { useToast } from '../components/Toast';
import { useVendorProfile, useVendorStats, useVendorPayouts, useVendorOrders, useShipOrderItem, useVendorSubscribe } from '../hooks/api/useVendor';
import { useTestimonials, useSubmitTestimonial } from '../hooks/api/useTestimonials';

// Helper Component for Phone Verification (Manual WhatsApp flow)
const WhatsAppNumber = '+919999999999'; // <-- Replace with actual WhatsApp number

const PhoneVerification = ({ onVerified }) => {
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async () => {
        if (!phone || phone.length < 10) return alert("Please enter a valid phone number");
        setLoading(true);
        try {
            await apiClient.post('/users/phone/submit', { phone });
            setSubmitted(true);
        } catch (err) {
            alert(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="bg-amber-50 border border-amber-200 p-4">
                <p className="text-sm text-amber-800 font-medium mb-1">Phone Submitted for Verification</p>
                <p className="text-xs text-amber-700">Our team will verify your number shortly. This usually takes a few hours.</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 border border-gray-100 p-4 space-y-3">
            <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Your Phone Number</label>
                <input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full p-3 border border-gray-200 focus:outline-none focus:border-luxury-gold text-sm"
                />
            </div>
            <div className="bg-blue-50 border border-blue-100 p-3">
                <p className="text-xs text-blue-700 font-medium mb-1">Step 1: Send us a WhatsApp message</p>
                <p className="text-xs text-blue-600 mb-2">
                    Send a message to <strong>{WhatsAppNumber}</strong> on WhatsApp with your name and the phone number above so we can verify you.
                </p>
                <a
                    href={`https://wa.me/${WhatsAppNumber.replace(/\D/g, '')}?text=Hi%2C%20I%20want%20to%20verify%20my%20phone%20number%3A%20${encodeURIComponent(phone)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-3 py-1.5 rounded border border-green-200 hover:bg-green-100 transition-colors"
                >
                    Open WhatsApp
                </a>
            </div>
            <p className="text-[11px] text-gray-400">Step 2: After sending the message, click submit below.</p>
            <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3 bg-heritage-charcoal text-white text-xs uppercase tracking-widest hover:bg-luxury-gold transition-colors"
            >
                {loading ? 'Submitting...' : 'I\'ve Sent the Message — Submit for Verification'}
            </button>
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

const NotificationsPanel = () => {
    const { data: notifications = [], isLoading } = useNotifications(!!getUser());
    const markReadMutation = useMarkNotificationRead();
    const markAllReadMutation = useMarkAllNotificationsRead();

    if (isLoading) {
        return (
            <div className="bg-white p-8 shadow-sm border border-gray-100 flex justify-center">
                <Loader2 className="animate-spin text-luxury-gold" size={32} />
            </div>
        );
    }

    return (
        <div className="bg-white p-8 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-serif mb-1">Notifications</h2>
                    <p className="text-gray-500 text-sm">Stay informed about your account and listings</p>
                </div>
                {notifications.some(n => !n.read) && (
                    <button
                        onClick={() => markAllReadMutation.mutate()}
                        className="text-xs text-luxury-gold hover:underline uppercase tracking-wider"
                    >
                        Mark All Read
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className="text-center py-16">
                    <Bell size={48} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-gray-400 font-serif text-lg">No notifications yet.</p>
                    <p className="text-gray-400 text-sm mt-1">We'll notify you about orders, verification updates, and more.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`p-4 border transition-colors ${notification.read ? 'bg-white border-gray-100' : 'bg-luxury-gold/5 border-luxury-gold/20'}`}
                            onClick={() => { if (!notification.read) markReadMutation.mutate(notification.id); }}
                        >
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1 min-w-0">
                                    <h4 className={`text-sm font-medium ${notification.read ? 'text-gray-600' : 'text-heritage-charcoal'}`}>
                                        {notification.title}
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <span className="text-xs text-gray-400 whitespace-nowrap">
                                        {new Date(notification.createdAt).toLocaleDateString()}
                                    </span>
                                    {!notification.read && <div className="w-2 h-2 rounded-full bg-luxury-gold" />}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const DocUploadField = ({ label, placeholder, value, docUrl, docType, uploading, onValueChange, onFileUpload }) => (
    <div className="mb-6 last:mb-0">
        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">{label}</label>
        <div className="flex gap-3 items-start">
            <div className="flex-grow space-y-2">
                {placeholder && (
                    <input
                        type="text"
                        placeholder={placeholder}
                        value={value || ''}
                        onChange={(e) => onValueChange(e.target.value)}
                        className="w-full p-4 border border-gray-300 focus:outline-none focus:border-luxury-gold"
                    />
                )}
                <div className="flex gap-2 items-center">
                    <label className={`flex items-center gap-2 px-4 py-3 border border-dashed border-gray-300 cursor-pointer hover:border-luxury-gold transition-colors text-sm ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                        <Upload size={16} className="text-gray-400" />
                        <span className="text-gray-500">{uploading ? 'Uploading...' : docUrl ? 'Replace Scan' : 'Upload Scanned Copy'}</span>
                        <input
                            type="file"
                            accept="image/*,application/pdf"
                            className="hidden"
                            disabled={uploading}
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) onFileUpload(file);
                                e.target.value = '';
                            }}
                        />
                    </label>
                    {docUrl && (
                        <a href={docUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-luxury-gold hover:underline flex items-center gap-1">
                            <ImageIcon size={14} /> View
                        </a>
                    )}
                </div>
            </div>
        </div>
    </div>
);

const CATEGORIES = ['Timepieces', 'Accessories', 'Sneakers', 'Collectables', 'Currencies', 'Pop Collection', 'Toys', 'Antiques', 'Limited Editions'];
const CONDITIONS = ['Mint', 'Like New', 'Excellent', 'Good', 'Fair'];

const Account = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [localUser, setLocalUserState] = useState(null);
    const [isRegistering, setIsRegistering] = useState(false);
    const [showCompanyPopup, setShowCompanyPopup] = useState(false);
    const [regForm, setRegForm] = useState({ name: '', email: '', phone: '', password: '', type: 'individual' });
    const [kycForm, setKycForm] = useState({ aadhaar: '', pan: '', companyName: '', gst: '', founderName: '', aadhaarDoc: '', panDoc: '', gstDoc: '', incorporationDoc: '', signedByName: '' });
    const [productForm, setProductForm] = useState({
        title: '',
        category: CATEGORIES[0],
        description: '',
        condition: 'Good',
        price: '',
        imageUrls: [''],
        keywords: '',
    });
    const descRef = useRef(null);

    const insertMarkdown = (before, after = '') => {
        const textarea = descRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = textarea.value.substring(start, end);
        const newText = textarea.value.substring(0, start) + before + selected + after + textarea.value.substring(end);
        setProductForm({ ...productForm, description: newText });
        setTimeout(() => {
            textarea.focus();
            textarea.selectionStart = start + before.length;
            textarea.selectionEnd = start + before.length + selected.length;
        }, 0);
    };

    const toolbarItems = [
        { label: 'B', action: () => insertMarkdown('**', '**'), title: 'Bold' },
        { label: 'I', action: () => insertMarkdown('*', '*'), title: 'Italic' },
        { label: 'H', action: () => insertMarkdown('## ', ''), title: 'Heading' },
        { label: '•', action: () => insertMarkdown('- ', ''), title: 'Bullet List' },
        { label: '1.', action: () => insertMarkdown('1. ', ''), title: 'Numbered List' },
        { label: '🔗', action: () => insertMarkdown('[', '](url)'), title: 'Link' },
        { label: '❝', action: () => insertMarkdown('> ', ''), title: 'Quote' },
    ];

    // API Hooks
    const queryClient = useQueryClient();
    const [descPreview, setDescPreview] = useState(false);
    const { data: user, isLoading: isUserLoading } = useMe();
    const { data: vendorProfile } = useVendorProfile();
    const { data: vendorStats } = useVendorStats();
    const { data: vendorPayoutsData } = useVendorPayouts();
    const { data: vendorOrderItems } = useVendorOrders();
    const shipOrderItem = useShipOrderItem();
    const [shippingTracking, setShippingTracking] = useState({});
    const submitTestimonial = useSubmitTestimonial();
    const [testimonialForm, setTestimonialForm] = useState({ content: '', authorName: '', rating: 5, images: [] });
    const [testimonialSubmitted, setTestimonialSubmitted] = useState(false);
    const [testimonialImageUploading, setTestimonialImageUploading] = useState(false);
    const subscribeMutation = useVendorSubscribe();
    const { mutateAsync: registerUser, isPending: isRegisterPending } = useRegisterUser();
    const kycMutation = useSubmitKyc();
    const addProductMutation = useAddProduct();
    const deleteProductMutation = useDeleteProduct();
    const bulkAddProductsMutation = useAddBulkProducts();
    const markAsSoldMutation = useMarkAsSold();
    const [bulkResults, setBulkResults] = useState(null);
    const { data: myOrders = [], isLoading: ordersLoading } = useMyOrders();
    const showToast = useToast();
    const [editingProfile, setEditingProfile] = useState(false);
    const [editProfileForm, setEditProfileForm] = useState({ name: '', phone: '' });
    const updateProfileMutation = useUpdateProfile();
    const updateProductMutation = useUpdateProduct();
    const [editingProductId, setEditingProductId] = useState(null);
    const [editProductForm, setEditProductForm] = useState({ title: '', description: '', price: '', condition: '', category: '', keywords: '' });

    const handleAuthChange = useCallback(async (session) => {
        if (session) {
            try {
                const pendingReg = window.__tce_pendingReg || {};
                const syncData = {
                    email: session.user.email,
                    name: session.user.user_metadata?.full_name || pendingReg.name || session.user.email.split('@')[0],
                    supabaseId: session.user.id,
                    phone: pendingReg.phone || session.user.phone || undefined,
                    type: pendingReg.type || 'individual',
                };
            const user = await registerUser(syncData);
            window.__tce_pendingReg = null;
            setLocalUser(user);
            setLocalUserState(user);
            queryClient.invalidateQueries({ queryKey: ['user'] });
            } catch (error) {
                console.error('Auth sync failed', error);
            }
        } else {
            setLocalUserState(null);
            clearUser();
        }
    }, [registerUser, queryClient]);

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
    }, [handleAuthChange]);

    const handleGoogleLogin = async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + '/account'
            }
        });
        if (error) alert(error.message);
        if (data?.url) {
            window.location.href = data.url;
        }
    };

    const userProducts = user?.products || [];

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const { error } = await supabase.auth.signUp({
                email: regForm.email,
                password: regForm.password,
                options: {
                    data: {
                        full_name: regForm.name,
                        phone: regForm.phone,
                    }
                }
            });
            if (error) throw error;
            window.__tce_pendingReg = {
                name: regForm.name,
                phone: regForm.phone,
                type: regForm.type,
            };
            setIsRegistering(false);
        } catch (err) {
            alert(err.message || 'Registration failed. Please try again.');
        }
    };

    const handleKycSubmit = async (e) => {
        e.preventDefault();
        const base = user.type === 'individual'
            ? { aadhaar: kycForm.aadhaar, pan: kycForm.pan, aadhaarDoc: kycForm.aadhaarDoc, panDoc: kycForm.panDoc }
            : { companyName: kycForm.companyName, gst: kycForm.gst, founderName: kycForm.founderName, aadhaarDoc: kycForm.aadhaarDoc, panDoc: kycForm.panDoc, gstDoc: kycForm.gstDoc, incorporationDoc: kycForm.incorporationDoc };

        if (!kycForm.signedByName.trim()) {
            showToast('Please enter your full name to digitally sign the Seller Agreement.', 'error');
            return;
        }

        const kycData = {
            ...base,
            agreementAccepted: true,
            agreementSignedByName: kycForm.signedByName.trim(),
            agreementSignedAt: new Date().toISOString(),
        };

        try {
            await kycMutation.mutateAsync({ userId: user.id, kycData });
            showToast('Verification documents submitted successfully!', 'success');
        } catch {
            showToast('KYC submission failed.', 'error');
        }
    };

    const handleKycDocUpload = async (docType, file) => {
        if (!file) return;
        setKycDocUploading(prev => ({ ...prev, [docType]: true }));
        try {
            const url = await uploadKycDocument(file, docType);
            const fieldMap = { aadhaar: 'aadhaarDoc', pan: 'panDoc', gst: 'gstDoc', incorporation: 'incorporationDoc' };
            setKycForm(prev => ({ ...prev, [fieldMap[docType]]: url }));
            showToast(`${docType.charAt(0).toUpperCase() + docType.slice(1)} document uploaded successfully`, 'success');
        } catch (err) {
            console.error('KYC doc upload failed:', err);
            showToast(`Failed to upload ${docType} document. Please try again.`, 'error');
        } finally {
            setKycDocUploading(prev => ({ ...prev, [docType]: false }));
        }
    };

    const handlePhoneVerified = (newPhone) => {
        setLocalUser(prev => ({ ...prev, phone: newPhone, phoneVerificationStatus: 'pending' }));
        setLocalUserState(prev => ({ ...prev, phone: newPhone, phoneVerificationStatus: 'pending' }));
    };

    const handleVendorSubscribe = async (plan) => {
        const proceed = window.confirm(`Subscribe to ${plan.replace('_', ' ')}? In mock mode, this simulates a successful payment.`);
        if (!proceed) return;

        try {
            await subscribeMutation.mutateAsync({
                paymentId: `pay_mock_${Date.now()}`,
                plan,
            });
            showToast(`Successfully upgraded to ${plan.replace('_', ' ')}!`, 'success');
        } catch {
            showToast('Subscription failed. Please try again.', 'error');
        }
    };

    // Image URL handling
    const [imageUploading, setImageUploading] = useState(false);
    const [kycDocUploading, setKycDocUploading] = useState({ aadhaar: false, pan: false, gst: false, incorporation: false });

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

    const handleFileUpload = async (index, file) => {
        if (!file) return;
        setImageUploading(true);
        try {
            const url = await uploadProductImage(file);
            handleImageUrlChange(index, url);
        } catch (err) {
            console.error('Upload failed:', err);
            alert('Failed to upload image. Please try again or use a URL directly.');
        } finally {
            setImageUploading(false);
        }
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();

        // 1. Validate User Type Limit
        if (user.type === 'individual' && userProducts.length >= 5) {
            showToast('Individual sellers are limited to 5 products. Upgrade to a Company account for unlimited listings.', 'error');
            return;
        }

        // 2. Validate Images (Min 4)
        const validImages = productForm.imageUrls.filter(url => url.trim() !== '');
        if (validImages.length < 4) {
            showToast('Please provide at least 4 high-quality images of the item.', 'error');
            return;
        }

        // 3. Process Keywords
        const keywordsArray = productForm.keywords.split(',').map(k => k.trim()).filter(k => k !== '');
        if (keywordsArray.length === 0) {
            showToast('Please provide at least one keyword for categorization.', 'error');
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
            showToast('Product listed successfully! Your item is now live in The Exchange.', 'success');
        } catch {
            showToast('Failed to list product.', 'error');
        }
    };

    const handleBulkCsvUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                if (results.errors.length > 0) {
                    showToast('CSV parsing error. Check your file format.', 'error');
                    return;
                }
                try {
                    const res = await bulkAddProductsMutation.mutateAsync(results.data);
                    setBulkResults(res);
                    queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
                    if (res.created > 0) {
                        showToast(`${res.created} products created successfully!`, 'success');
                    }
                } catch (err) {
                    showToast(err?.response?.data?.error || 'Bulk upload failed.', 'error');
                }
            },
            error: () => {
                showToast('Failed to read CSV file.', 'error');
            },
        });
        e.target.value = '';
    };

    const handleDownloadCsvTemplate = () => {
        const headers = ['title', 'category', 'description', 'condition', 'price', 'image', 'keywords'];
        const sampleRow = ['Example Item', 'Timepieces', 'A detailed description of the item.', 'Excellent', '999', 'https://example.com/image.jpg', 'vintage, luxury, rare'];
        const csv = Papa.unparse({ fields: headers, data: [sampleRow] });
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tce-bulk-upload-template.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleExportPortfolioCsv = () => {
        const headers = ['title', 'category', 'description', 'condition', 'price', 'status', 'authenticityStatus', 'keywords', 'image'];
        const data = userProducts.map(p => ({
            title: p.title,
            category: p.category,
            description: p.description?.replace(/"/g, '""'),
            condition: p.condition,
            price: p.price || 0,
            status: p.status || 'Pending',
            authenticityStatus: p.authenticityStatus || 'Pending',
            keywords: (p.keywords || []).join(', '),
            image: p.image || '',
        }));
        const csv = Papa.unparse({ fields: headers, data });
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'my-portfolio-export.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this listing?')) return;
        try {
            await deleteProductMutation.mutateAsync(productId);
            showToast('Product deleted.', 'success');
            queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
        } catch {
            showToast('Failed to delete product.', 'error');
        }
    };

    const handleStartEdit = (product) => {
        setEditingProductId(product.id);
        setEditProductForm({
            title: product.title || '',
            description: product.description || '',
            price: product.price?.toString() || '',
            condition: product.condition || '',
            category: product.category || '',
            keywords: (product.keywords || []).join(', '),
        });
    };

    const handleCancelEdit = () => {
        setEditingProductId(null);
        setEditProductForm({ title: '', description: '', price: '', condition: '', category: '', keywords: '' });
    };

    const handleSaveEdit = async (productId) => {
        try {
            await updateProductMutation.mutateAsync({
                id: productId,
                productData: {
                    title: editProductForm.title,
                    description: editProductForm.description,
                    price: parseFloat(editProductForm.price),
                    condition: editProductForm.condition,
                    category: editProductForm.category,
                    keywords: editProductForm.keywords.split(',').map(k => k.trim()).filter(Boolean),
                },
            });
            showToast('Product updated! It will be re-reviewed.', 'success');
            handleCancelEdit();
            queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
        } catch {
            showToast('Failed to update product.', 'error');
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
                <Helmet><title>My Account — The Collectors Exchange</title></Helmet>
                <Loader2 className="animate-spin text-luxury-gold mb-4" size={64} />
                <p className="text-gray-500 font-serif text-xl italic">Authenticating Profile...</p>
            </div>
        );
    }

    if (!localUser) {
        return (
            <div className="container mx-auto py-20 px-6 max-w-xl">
                <Helmet><title>My Account — The Collectors Exchange</title></Helmet>
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
                            disabled={isRegisterPending}
                            className="w-full bg-black text-white py-5 text-sm uppercase tracking-widest hover:bg-luxury-gold transition-colors duration-300 flex items-center justify-center gap-2"
                        >
                            {isRegisterPending && <Loader2 size={16} className="animate-spin" />}
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

                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 py-4 text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                            <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                            Continue with Google
                        </button>

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-100"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase tracking-widest">
                                <span className="bg-white px-2 text-gray-400">Or Sign In with Email</span>
                            </div>
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
                        <div className="flex justify-between items-start mb-8">
                            <h3 className="text-3xl font-serif text-heritage-charcoal">Collector Profile</h3>
                            <button onClick={() => {
                                if (editingProfile) {
                                    setEditingProfile(false);
                                    setEditProfileForm({ name: '', phone: '' });
                                } else {
                                    setEditProfileForm({ name: user.name || '', phone: user.phone || '' });
                                    setEditingProfile(true);
                                }
                            }}
                                className="text-sm text-luxury-gold hover:underline font-medium uppercase tracking-wider">
                                {editingProfile ? 'Cancel' : 'Edit Profile'}
                            </button>
                        </div>
                        {editingProfile ? (
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                try {
                                    await updateProfileMutation.mutateAsync(editProfileForm);
                                    showToast('Profile updated successfully!', 'success');
                                    setEditingProfile(false);
                                } catch {
                                    showToast('Failed to update profile.', 'error');
                                }
                            }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Full Name</label>
                                    <input type="text" required value={editProfileForm.name}
                                        onChange={e => setEditProfileForm({ ...editProfileForm, name: e.target.value })}
                                        className="w-full p-4 bg-gray-50 border border-gray-200 focus:outline-none focus:border-luxury-gold" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Email</label>
                                    <div className="p-4 bg-gray-100 border border-gray-200 text-gray-500 cursor-not-allowed">{user.email}</div>
                                    <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Phone</label>
                                    <input type="tel" value={editProfileForm.phone}
                                        onChange={e => setEditProfileForm({ ...editProfileForm, phone: e.target.value })}
                                        className="w-full p-4 bg-gray-50 border border-gray-200 focus:outline-none focus:border-luxury-gold" />
                                </div>
                                <div className="flex items-end">
                                    <button type="submit" disabled={updateProfileMutation.isPending}
                                        className="bg-heritage-charcoal text-white px-8 py-4 text-sm uppercase tracking-widest hover:bg-heritage-brown transition-colors flex items-center gap-2">
                                        {updateProfileMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        ) : (
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
                                        <div className={`p-4 border flex justify-between items-center ${user.phoneVerificationStatus === 'verified' ? 'bg-green-50 border-green-100 text-green-800' : user.phoneVerificationStatus === 'pending' ? 'bg-amber-50 border-amber-200 text-amber-800' : user.phoneVerificationStatus === 'rejected' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-gray-50 border-gray-100 text-gray-800'}`}>
                                            <span>{user.phone}</span>
                                            <span className="text-xs uppercase tracking-widest font-bold flex items-center gap-1">
                                                {user.phoneVerificationStatus === 'verified' ? <><ShieldCheck size={14} /> Verified</> : user.phoneVerificationStatus === 'pending' ? <>Pending Verification</> : user.phoneVerificationStatus === 'rejected' ? <>Rejected</> : <ShieldCheck size={14} />}
                                            </span>
                                        </div>
                                    ) : (
                                        <PhoneVerification onVerified={handlePhoneVerified} />
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
                        )}
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
                                    To maintain the integrity of our marketplace, all sellers must complete identity verification
                                    and accept the Seller Agreement. Your data is encrypted and handled per our Privacy Policy.
                                </p>
                                <form onSubmit={handleKycSubmit} className="space-y-6">

                                    {/* ── Section 1: Identity Documents ── */}
                                    <div className="bg-gray-50 p-6 border border-gray-100">
                                        <h4 className="font-serif text-lg font-medium mb-6 text-heritage-charcoal">1. Upload Identity Documents</h4>

                                        {user.type === 'individual' ? (
                                            <>
                                                <DocUploadField
                                                    label="Aadhaar Number"
                                                    placeholder="Enter 12-digit Aadhaar number"
                                                    value={kycForm.aadhaar}
                                                    docUrl={kycForm.aadhaarDoc}
                                                    docType="aadhaar"
                                                    uploading={kycDocUploading.aadhaar}
                                                    onValueChange={(v) => setKycForm({ ...kycForm, aadhaar: v })}
                                                    onFileUpload={(f) => handleKycDocUpload('aadhaar', f)}
                                                />
                                                <DocUploadField
                                                    label="PAN Number"
                                                    placeholder="Enter 10-digit PAN"
                                                    value={kycForm.pan}
                                                    docUrl={kycForm.panDoc}
                                                    docType="pan"
                                                    uploading={kycDocUploading.pan}
                                                    onValueChange={(v) => setKycForm({ ...kycForm, pan: v })}
                                                    onFileUpload={(f) => handleKycDocUpload('pan', f)}
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <DocUploadField
                                                    label="Aadhaar Number (Director/Authorised Signatory)"
                                                    placeholder="Enter 12-digit Aadhaar number"
                                                    value={kycForm.aadhaar}
                                                    docUrl={kycForm.aadhaarDoc}
                                                    docType="aadhaar"
                                                    uploading={kycDocUploading.aadhaar}
                                                    onValueChange={(v) => setKycForm({ ...kycForm, aadhaar: v })}
                                                    onFileUpload={(f) => handleKycDocUpload('aadhaar', f)}
                                                />
                                                <DocUploadField
                                                    label="PAN Number (Company / Director)"
                                                    placeholder="Enter 10-digit PAN"
                                                    value={kycForm.pan}
                                                    docUrl={kycForm.panDoc}
                                                    docType="pan"
                                                    uploading={kycDocUploading.pan}
                                                    onValueChange={(v) => setKycForm({ ...kycForm, pan: v })}
                                                    onFileUpload={(f) => handleKycDocUpload('pan', f)}
                                                />
                                                <div className="space-y-4 pt-4 border-t border-gray-200">
                                                    <h5 className="text-xs font-bold uppercase tracking-widest text-gray-500">Company Details</h5>
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
                                                    <DocUploadField
                                                        label="GST Registration Certificate"
                                                        placeholder="Enter GST number"
                                                        value={kycForm.gst}
                                                        docUrl={kycForm.gstDoc}
                                                        docType="gst"
                                                        uploading={kycDocUploading.gst}
                                                        onValueChange={(v) => setKycForm({ ...kycForm, gst: v })}
                                                        onFileUpload={(f) => handleKycDocUpload('gst', f)}
                                                    />
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
                                                    <DocUploadField
                                                        label="Certificate of Incorporation / LLP Registration"
                                                        docUrl={kycForm.incorporationDoc}
                                                        docType="incorporation"
                                                        uploading={kycDocUploading.incorporation}
                                                        onFileUpload={(f) => handleKycDocUpload('incorporation', f)}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* ── Section 2: Seller Agreement ── */}
                                    <div className="bg-gray-50 p-6 border border-gray-100">
                                        <h4 className="font-serif text-lg font-medium mb-4 text-heritage-charcoal">2. Seller Agreement</h4>

                                        <div className="bg-white p-6 border border-gray-200 max-h-80 overflow-y-auto text-sm text-gray-700 leading-relaxed space-y-3">
                                            <p className="font-semibold text-heritage-charcoal">Seller Agreement — The Collectors Exchange</p>
                                            <p>
                                                By listing items on The Collectors Exchange, you agree to the following terms:
                                            </p>
                                            <ul className="list-disc pl-5 space-y-2">
                                                <li><strong>Verification:</strong> All items are subject to verification by our curation team before listing. We reserve the right to reject any item that does not meet our standards of authenticity, condition, or provenance.</li>
                                                <li><strong>Authenticity:</strong> You warrant that every item you list is genuine, authentic, and accurately described. Misrepresentation of any item will result in immediate suspension and legal action.</li>
                                                <li><strong>Fraudulent Listings:</strong> Knowingly listing counterfeit, stolen, or misrepresented items is strictly prohibited. Violators will be permanently banned and reported to relevant authorities.</li>
                                                <li><strong>Payment Hold:</strong> Payments for sold items are held for 7 days after delivery to allow for buyer inspection and verification.</li>
                                                <li><strong>Identity Privacy:</strong> The Collectors Exchange prioritizes collector privacy. For individual sellers, your identity remains anonymous to buyers unless you choose otherwise.</li>
                                                <li><strong>Suspension:</strong> We reserve the right to suspend or terminate your seller account at any time for violations of these terms.</li>
                                            </ul>
                                            <p className="text-xs text-gray-400 mt-2">
                                                This agreement is governed by the laws of India. By signing below, you acknowledge that you have read, understood, and agree to be bound by these terms.
                                            </p>
                                        </div>

                                        <div className="mt-4">
                                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Digital Signature</label>
                                            <p className="text-xs text-gray-400 mb-2">Type your full legal name as your electronic signature</p>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Enter your full name as digital signature"
                                                value={kycForm.signedByName}
                                                onChange={(e) => setKycForm({ ...kycForm, signedByName: e.target.value })}
                                                className="w-full p-4 border border-gray-300 focus:outline-none focus:border-luxury-gold font-serif"
                                            />
                                            <p className="text-xs text-gray-400 mt-1">
                                                By typing your name above, you electronically sign the Seller Agreement.
                                            </p>
                                        </div>
                                    </div>

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
                                        <div className="border border-gray-200">
                                            <div className="flex items-center border-b border-gray-200">
                                                <button
                                                    type="button"
                                                    onClick={() => setDescPreview(false)}
                                                    className={`px-4 py-2 text-xs uppercase tracking-widest font-medium flex items-center gap-1.5 transition-colors ${!descPreview ? 'bg-luxury-gold text-black' : 'text-gray-500 hover:text-gray-800'}`}
                                                >
                                                    <Edit3 size={12} />
                                                    Write
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setDescPreview(true)}
                                                    className={`px-4 py-2 text-xs uppercase tracking-widest font-medium flex items-center gap-1.5 transition-colors ${descPreview ? 'bg-luxury-gold text-black' : 'text-gray-500 hover:text-gray-800'}`}
                                                >
                                                    <Eye size={12} />
                                                    Preview
                                                </button>
                                                {!descPreview && (
                                                    <div className="flex items-center gap-0.5 ml-auto px-2 border-l border-gray-200">
                                                        {toolbarItems.map((item) => (
                                                            <button
                                                                key={item.label}
                                                                type="button"
                                                                onClick={item.action}
                                                                title={item.title}
                                                                className="w-7 h-7 flex items-center justify-center text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors font-bold"
                                                            >
                                                                {item.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            {descPreview ? (
                                                <div className="p-4 min-h-[150px] prose prose-sm max-w-none">
                                                    {productForm.description ? (
                                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                            {productForm.description}
                                                        </ReactMarkdown>
                                                    ) : (
                                                        <p className="text-gray-400 italic">Nothing to preview</p>
                                                    )}
                                                </div>
                                            ) : (
                                                <textarea
                                                    ref={descRef}
                                                    required
                                                    rows={8}
                                                    placeholder="Describe your item... Supports Markdown (use the toolbar above for formatting)"
                                                    value={productForm.description}
                                                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                                                    className="w-full p-4 border-0 focus:outline-none focus:ring-0 leading-relaxed resize-y"
                                                />
                                            )}
                                        </div>
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
                                                    {url && (
                                                        <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                                                            <img src={url} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none' }} />
                                                        </div>
                                                    )}
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
                                                    <label className="cursor-pointer p-2 text-gray-400 hover:text-luxury-gold transition-colors" title="Upload file">
                                                        <Upload size={16} />
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            disabled={imageUploading}
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) handleFileUpload(index, file);
                                                                e.target.value = '';
                                                            }}
                                                        />
                                                    </label>
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
                                            <p>Upload images directly or paste image URLs. The first image will be the primary detailed view and card thumbnail. {imageUploading && <span className="text-luxury-gold font-medium">Uploading...</span>}</p>
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

                        {/* User's Listings / Portfolio */}
                        <div className="bg-white p-10 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-3xl font-serif text-heritage-charcoal">My Collection</h3>
                                    {vendorProfile ? (
                                        <p className="text-sm text-gray-500 mt-1">
                                            {vendorProfile.type === 'BULK' ? (
                                                <span className="text-luxury-gold font-medium">Bulk Vendor — Unlimited Listings</span>
                                            ) : (
                                                <span>{vendorProfile.activeCount ?? userProducts.length} of {vendorProfile.maxListings || 5} listings used</span>
                                            )}
                                        </p>
                                    ) : (
                                        <p className="text-sm text-gray-500 mt-1">
                                            {userProducts.length} of {user.type === 'company' ? '∞' : '5'} listings used
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    {vendorProfile?.type === 'BULK' && (
                                        <>
                                            <button type="button" onClick={handleDownloadCsvTemplate} className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors font-medium">
                                                <Download size={16} /> Template
                                            </button>
                                            <button type="button" onClick={() => document.getElementById('bulk-csv-input')?.click()} className="flex items-center gap-2 px-4 py-2 text-sm border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-black transition-colors font-medium">
                                                <Upload size={16} /> Bulk Upload
                                            </button>
                                        </>
                                    )}
                                    {userProducts.length > 0 && (
                                        <button type="button" onClick={handleExportPortfolioCsv} className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors font-medium">
                                            <Download size={16} /> Export CSV
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Slot usage bar for single vendors */}
                            {(!vendorProfile || vendorProfile.type !== 'BULK') && (
                                <div className="w-full bg-gray-100 h-2 mb-6 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-luxury-gold transition-all rounded-full"
                                        style={{ width: `${Math.min((userProducts.length / (vendorProfile?.maxListings || 5)) * 100, 100)}%` }}
                                    />
                                </div>
                            )}

                            {/* CSV Bulk Upload Section (hidden file input) */}
                            <input
                                id="bulk-csv-input"
                                type="file"
                                accept=".csv"
                                className="hidden"
                                onChange={handleBulkCsvUpload}
                            />

                            {/* Bulk upload progress / results */}
                            {bulkResults && (
                                <div className={`mb-6 p-4 border ${bulkResults.errors?.length > 0 ? 'border-amber-200 bg-amber-50' : 'border-green-200 bg-green-50'}`}>
                                    <p className="text-sm font-medium mb-1">
                                        {bulkResults.created > 0 ? `✓ ${bulkResults.created} products created` : 'No products created'}
                                    </p>
                                    {bulkResults.errors?.length > 0 && (
                                        <div className="text-xs text-red-600 mt-2">
                                            {bulkResults.errors.map((err, i) => (
                                                <p key={i}>Row {err.row} ({err.title}): {err.error}</p>
                                            ))}
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setBulkResults(null)}
                                        className="text-xs text-gray-500 underline mt-2"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            )}

                            {userProducts.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                                    <div className="bg-gray-50 p-4 border border-gray-100">
                                        <p className="text-2xl font-serif font-bold text-heritage-charcoal">{userProducts.length}</p>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Total Listings</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 border border-gray-100">
                                        <p className="text-2xl font-serif font-bold text-green-700">{userProducts.filter(p => p.status === 'Approved').length}</p>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Live / Published</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 border border-gray-100">
                                        <p className="text-2xl font-serif font-bold text-heritage-charcoal">{userProducts.filter(p => p.status !== 'Approved').length}</p>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Pending Review</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 border border-gray-100">
                                        <p className="text-2xl font-serif font-bold text-luxury-gold">{vendorStats ? `₹${(vendorStats.totalSales || 0).toLocaleString()}` : '₹0'}</p>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Total Sales</p>
                                    </div>
                                </div>
                            )}

                            {userProducts.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {userProducts.map(product => (
                                        editingProductId === product.id ? (
                                            <div key={product.id} className="border border-luxury-gold bg-white col-span-1 sm:col-span-2 lg:col-span-3">
                                                <div className="p-6">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h4 className="font-serif text-lg font-medium">Edit: {product.title}</h4>
                                                        <button type="button" onClick={handleCancelEdit} className="text-gray-400 hover:text-black"><X size={18} /></button>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="md:col-span-2">
                                                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Title</label>
                                                            <input value={editProductForm.title} onChange={e => setEditProductForm({...editProductForm, title: e.target.value})} className="w-full p-3 border border-gray-200 text-sm" />
                                                        </div>
                                                        <div className="md:col-span-2">
                                                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Description</label>
                                                            <textarea rows={4} value={editProductForm.description} onChange={e => setEditProductForm({...editProductForm, description: e.target.value})} className="w-full p-3 border border-gray-200 text-sm" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Price (₹)</label>
                                                            <input type="number" value={editProductForm.price} onChange={e => setEditProductForm({...editProductForm, price: e.target.value})} className="w-full p-3 border border-gray-200 text-sm" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Condition</label>
                                                            <select value={editProductForm.condition} onChange={e => setEditProductForm({...editProductForm, condition: e.target.value})} className="w-full p-3 border border-gray-200 text-sm bg-white">
                                                                {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Category</label>
                                                            <select value={editProductForm.category} onChange={e => setEditProductForm({...editProductForm, category: e.target.value})} className="w-full p-3 border border-gray-200 text-sm bg-white">
                                                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Keywords (comma separated)</label>
                                                            <input value={editProductForm.keywords} onChange={e => setEditProductForm({...editProductForm, keywords: e.target.value})} className="w-full p-3 border border-gray-200 text-sm" />
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                                                        <button type="button" onClick={handleCancelEdit} className="px-6 py-2 text-sm border border-gray-300 text-gray-600 hover:bg-gray-50">Cancel</button>
                                                        <button type="button" onClick={() => handleSaveEdit(product.id)} disabled={updateProductMutation.isPending} className="px-6 py-2 text-sm bg-heritage-charcoal text-white hover:bg-heritage-brown flex items-center gap-2">
                                                            {updateProductMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                                                            Save Changes
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div key={product.id} className="border border-gray-100 hover:shadow-md transition-shadow group bg-white">
                                                <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
                                                    <img src={product.image || 'https://via.placeholder.com/300'} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                    <div className="absolute top-2 right-2">
                                                        {product.status === 'Sold' ? (
                                                            <span className="inline-flex items-center gap-1 text-[10px] text-gray-700 bg-gray-100 px-2 py-1 rounded"><Tag size={10} /> Sold</span>
                                                        ) : product.status === 'Rejected' ? (
                                                            <span className="inline-flex items-center gap-1 text-[10px] text-red-700 bg-red-50 px-2 py-1 rounded"><XCircle size={10} /> Rejected</span>
                                                        ) : product.authenticityStatus === 'Verified' ? (
                                                            <span className="inline-flex items-center gap-1 text-[10px] text-green-700 bg-green-50 px-2 py-1 rounded"><ShieldCheck size={10} /> Authenticated</span>
                                                        ) : product.status === 'Approved' ? (
                                                            <span className="inline-flex items-center gap-1 text-[10px] text-blue-700 bg-blue-50 px-2 py-1 rounded">Published</span>
                                                        ) : product.status === 'In Review' ? (
                                                            <span className="inline-flex items-center gap-1 text-[10px] text-purple-700 bg-purple-50 px-2 py-1 rounded">In Review</span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 px-2 py-1 rounded">Pending</span>
                                                        )}
                                                    </div>
                                                    {product.status === 'Approved' && (
                                                        <div className="absolute top-2 left-2"><span className="text-[10px] bg-green-600 text-white px-2 py-0.5 rounded">Live</span></div>
                                                    )}
                                                </div>
                                                <div className="p-4">
                                                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">{product.category}</span>
                                                    <h4 className="font-serif text-base font-medium text-heritage-charcoal line-clamp-1 mt-0.5">{product.title}</h4>
                                                    <p className="text-luxury-gold font-sans text-sm font-medium mt-1">₹{product.price?.toLocaleString()}</p>
                                                    <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">{product.description}</p>
                                                    {product.status === 'Rejected' && product.rejectionReason && (
                                                        <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded">
                                                            <p className="text-[10px] font-bold text-red-700 uppercase tracking-wider mb-1">Reason for Rejection</p>
                                                            <p className="text-xs text-red-600 leading-relaxed">{product.rejectionReason}</p>
                                                            <p className="text-[10px] text-red-500 mt-2">Edit your listing to fix the issues and it will be sent for review again. For queries, contact <a href="mailto:support@collectorsexchange.in" className="underline font-medium">support@collectorsexchange.in</a>.</p>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                                        <span className="text-[10px] text-gray-400">{product.condition}</span>
                                                        <div className="flex items-center gap-1">
                                                            <button type="button" onClick={() => handleStartEdit(product)} className={`transition-colors p-1 ${product.status === 'Rejected' ? 'text-orange-500 hover:text-orange-700 bg-orange-50 rounded' : 'text-gray-400 hover:text-luxury-gold'}`} title="Edit listing"><Edit3 size={14} /></button>
                                                            <button type="button" onClick={() => markAsSoldMutation.mutate(product.id)} className="text-gray-400 hover:text-green-600 transition-colors p-1" title="Mark as sold"><Tag size={14} /></button>
                                                            <button type="button" onClick={() => handleDeleteProduct(product.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Delete listing"><Trash2 size={14} /></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
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

        case 'orders':
            return (
                <div className="bg-white p-8 shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-serif mb-2">My Orders</h2>
                    <p className="text-gray-500 text-sm mb-8">Track your purchases and shipments</p>
                    {ordersLoading ? (
                        <div className="flex justify-center py-16">
                            <Loader2 className="animate-spin text-luxury-gold" size={32} />
                        </div>
                    ) : myOrders.length === 0 ? (
                        <div className="text-center py-16 bg-gray-50 border border-gray-100 border-dashed">
                            <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500 font-serif text-lg">No orders yet.</p>
                            <p className="text-gray-400 text-sm mt-1">When you make a purchase, your orders will appear here.</p>
                            <Link to="/category" className="inline-block mt-6 text-luxury-gold font-semibold hover:underline text-sm uppercase tracking-widest">
                                Browse The Exchange
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {myOrders.map(order => (
                                <div key={order.id} className="border border-gray-100 p-6 hover:shadow-md transition-shadow">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wider">Order #{order.id.slice(-8).toUpperCase()}</p>
                                            <p className="text-xs text-gray-400 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' : order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' : order.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    {order.items?.map(item => (
                                        <div key={item.id} className="flex items-center gap-4 py-3 border-t border-gray-50">
                                            <img src={item.product?.image || 'https://via.placeholder.com/60'} alt={item.product?.title} className="w-14 h-14 object-cover bg-gray-50" />
                                            <div className="flex-grow min-w-0">
                                                <p className="text-sm font-medium truncate">{item.product?.title}</p>
                                                <p className="text-xs text-gray-500">Qty: {item.quantity} &middot; ${item.price?.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-3">
                                        <p className="text-sm text-gray-600">Total: <span className="font-semibold">${order.totalAmount?.toLocaleString()}</span></p>
                                        {order.trackingID && (
                                            <span className="text-xs text-gray-500">Tracking: {order.trackingID}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-10 pt-8 border-t border-gray-100">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Share Your Experience</h3>
                        {testimonialSubmitted ? (
                            <p className="text-green-700 bg-green-50 p-4 text-sm">Thank you! Your testimonial has been submitted for review.</p>
                        ) : (
                            <div className="max-w-lg">
                                <div className="mb-4">
                                    <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Rating</label>
                                    <div className="flex gap-1">
                                        {[1,2,3,4,5].map(i => (
                                            <button key={i} type="button" onClick={() => setTestimonialForm(prev => ({ ...prev, rating: i }))} className={`text-2xl ${i <= testimonialForm.rating ? 'text-amber-400' : 'text-gray-200'} hover:text-amber-300 transition-colors`}>★</button>
                                        ))}
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Name</label>
                                    <input type="text" value={testimonialForm.authorName} onChange={e => setTestimonialForm(prev => ({ ...prev, authorName: e.target.value }))} placeholder="Your name" className="w-full p-3 border border-gray-200 text-sm" />
                                </div>
                                <div className="mb-4">
                                    <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Your Testimonial</label>
                                    <textarea rows={4} value={testimonialForm.content} onChange={e => setTestimonialForm(prev => ({ ...prev, content: e.target.value }))} placeholder="Share your experience with The Collectors Exchange..." className="w-full p-3 border border-gray-200 text-sm resize-none" />
                                </div>
                                <div className="mb-4">
                                    <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Images (optional)</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={async (e) => {
                                            const files = Array.from(e.target.files);
                                            if (!files.length) return;
                                            setTestimonialImageUploading(true);
                                            try {
                                                const urls = await Promise.all(files.map(f => uploadTestimonialImage(f)));
                                                setTestimonialForm(prev => ({ ...prev, images: [...prev.images, ...urls] }));
                                            } catch {
                                                alert('Failed to upload one or more images');
                                            }
                                            setTestimonialImageUploading(false);
                                        }}
                                        className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:border-0 file:text-xs file:bg-gray-100 file:hover:bg-gray-200 file:cursor-pointer"
                                    />
                                    {testimonialImageUploading && <p className="text-xs text-gray-400 mt-1">Uploading...</p>}
                                    {testimonialForm.images.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {testimonialForm.images.map((url, i) => (
                                                <div key={i} className="relative w-16 h-16">
                                                    <img src={url} alt="" className="w-full h-full object-cover rounded border" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setTestimonialForm(prev => ({ ...prev, images: prev.images.filter((_, j) => j !== i) }))}
                                                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                                                    >&times;</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={async () => {
                                        if (!testimonialForm.content || testimonialForm.content.length < 10) { alert('Please write at least 10 characters.'); return; }
                                        try {
                                            await submitTestimonial.mutateAsync(testimonialForm);
                                            setTestimonialSubmitted(true);
                                        } catch (err) {
                                            const msg = err?.response?.data?.error || 'Failed to submit testimonial';
                                            alert(msg);
                                        }
                                    }}
                                    disabled={submitTestimonial.isPending || testimonialImageUploading}
                                    className="px-6 py-3 bg-heritage-charcoal text-white text-xs uppercase tracking-widest hover:bg-heritage-brown transition-colors"
                                >
                                    {submitTestimonial.isPending ? 'Submitting...' : 'Submit Testimonial'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            );
        case 'notifications':
            return <NotificationsPanel />;
        case 'payouts':
            return null;
        default:
            return null;
        }
    };

    return (
        <div className="min-h-screen bg-secondary-bg">
            <Helmet><title>My Account — The Collectors Exchange</title></Helmet>
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
                                    onClick={() => setActiveTab('orders')}
                                    className={`flex items-center gap-4 w-full p-4 text-sm font-medium transition-all ${activeTab === 'orders' ? 'bg-heritage-charcoal text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <ShoppingBag size={18} /> My Orders
                                </button>
                                <button
                                    onClick={() => setActiveTab('notifications')}
                                    className={`flex items-center gap-4 w-full p-4 text-sm font-medium transition-all ${activeTab === 'notifications' ? 'bg-heritage-charcoal text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <Bell size={18} /> Notifications
                                </button>

                                {vendorProfile?.status === 'APPROVED' && (
                                    <Link
                                        to="/vendor-dashboard"
                                        className="flex items-center gap-4 w-full p-4 text-sm font-medium transition-all text-gray-600 hover:bg-gray-50"
                                    >
                                        <BarChart3 size={18} /> Vendor Dashboard
                                    </Link>
                                )}
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

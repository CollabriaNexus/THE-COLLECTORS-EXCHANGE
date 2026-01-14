import { User, FileText, Package, LogOut, Plus, ShieldCheck, Trash2, Image as ImageIcon, Tag, Info, Loader2 } from 'lucide-react';
import { getUser, setUser as setLocalUser, clearUser } from '../utils/storage';
import { useUser, useRegisterUser, useSubmitKyc } from '../hooks/api/useUser';
import { useAddProduct } from '../hooks/api/useProducts';

const CATEGORIES = ['Timepieces', 'Sneakers', 'Collectables', 'Currencies', 'Pop Collection', 'Toys', 'Antiques', 'Limited Editions'];
const CONDITIONS = ['Mint', 'Like New', 'Excellent', 'Good', 'Fair'];

const Account = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [localUser, setLocalUserState] = useState(null);
    const [isRegistering, setIsRegistering] = useState(false);

    // API Hooks
    const { data: user, isLoading: isUserLoading } = useUser(localUser?.id);
    const registerMutation = useRegisterUser();
    const kycMutation = useSubmitKyc();
    const addProductMutation = useAddProduct();

    useEffect(() => {
        const storedUser = getUser();
        if (storedUser) {
            setLocalUserState(storedUser);
        }
    }, []);

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

    const handleLogout = () => {
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
                                <label className={`cursor-pointer p-4 border transition-all ${regForm.type === 'company' ? 'border-luxury-gold bg-luxury-gold/5' : 'border-gray-200'}`}>
                                    <input
                                        type="radio"
                                        name="type"
                                        value="company"
                                        checked={regForm.type === 'company'}
                                        onChange={(e) => setRegForm({ ...regForm, type: e.target.value })}
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
                    <div className="bg-white p-10 shadow-heritage border border-gray-100 text-center">
                        <User size={48} strokeWidth={1} className="mx-auto text-luxury-gold mb-6" />
                        <h3 className="font-serif text-xl mb-2">Private Access</h3>
                        <p className="text-gray-500 mb-8 font-light">Join the community of verified collectors and sellers.</p>
                        <button
                            onClick={() => setIsRegistering(true)}
                            className="w-full bg-black text-white py-5 text-sm uppercase tracking-widest hover:bg-luxury-gold transition-colors duration-300"
                        >
                            Apply for Membership
                        </button>
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
                                <div className="p-4 bg-gray-50 border border-gray-100 text-gray-800">{user.phone}</div>
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

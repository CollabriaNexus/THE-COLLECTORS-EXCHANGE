// localStorage utility functions for The Collectors' Exchange
import { supabase } from './supabase';

const STORAGE_KEYS = {
    USER: 'tce_user',
    PRODUCTS: 'tce_products',
    WISHLIST: 'tce_wishlist',
    CART: 'tce_cart',
};

// ============== USER ==============
export const getUser = () => {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
};

export const setUser = (userData) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
};

export const clearUser = () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
};

// ============== PRODUCTS ==============
export const getProducts = () => {
    const products = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return products ? JSON.parse(products) : getInitialProducts();
};

export const getProductById = (id) => {
    const products = getProducts();
    // specific check for numeric vs string id
    return products.find(p => p.id == id);
};

export const addProduct = (product) => {
    const products = getProducts();
    const newProduct = {
        ...product,
        id: Date.now(),
        isVerified: false, // Admin would verify
        // Ensure new array fields are initialized if missing
        images: product.images || (product.image ? [product.image] : []),
        keywords: product.keywords || [],
        authenticityStatus: 'Pending',
        createdAt: new Date().toISOString(),
    };
    products.push(newProduct);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    return newProduct;
};

export const getProductsByUser = (userId) => {
    const products = getProducts();
    return products.filter(p => p.sellerId === userId);
};

export const getProductsByCategory = (category) => {
    const products = getProducts();
    if (!category || category === 'all') return products;
    return products.filter(p => p.category.toLowerCase() === category.toLowerCase());
};

// ============== WISHLIST ==============
export const getWishlist = () => {
    const wishlist = localStorage.getItem(STORAGE_KEYS.WISHLIST);
    return wishlist ? JSON.parse(wishlist) : [];
};

export const addToWishlist = (productId) => {
    const wishlist = getWishlist();
    if (!wishlist.includes(productId)) {
        wishlist.push(productId);
        localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
    }
};

export const removeFromWishlist = (productId) => {
    let wishlist = getWishlist();
    wishlist = wishlist.filter(id => id !== productId);
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
};

export const isInWishlist = (productId) => {
    const wishlist = getWishlist();
    return wishlist.includes(productId);
};

// ============== CART ==============
export const getCart = () => {
    const cart = localStorage.getItem(STORAGE_KEYS.CART);
    return cart ? JSON.parse(cart) : [];
};

export const addToCart = (productId) => {
    const cart = getCart();
    if (!cart.includes(productId)) {
        cart.push(productId);
        localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    }
};

export const removeFromCart = (productId) => {
    let cart = getCart();
    cart = cart.filter(id => id !== productId);
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
};

export const isInCart = (productId) => {
    const cart = getCart();
    return cart.includes(productId);
};

export const clearCart = () => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
};

// ============== INITIAL SEED DATA ==============
const getInitialProducts = () => {
    const initialProducts = [
        {
            id: 1,
            title: 'Vintage 1920s Art Deco Vase',
            category: 'Collectables',
            description: 'A rare porcelain vase from the Art Deco era, featuring geometric patterns and gold leaf accents. This piece has been preserved in excellent condition for over a century. The craftsmanship is typical of the early 20th century European ateliers, likely French in origin.',
            condition: 'Excellent',
            price: 1200,
            image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&q=80&w=1000',
            images: [
                'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&q=80&w=1000',
                'https://images.unsplash.com/photo-1616423640778-2cfd2b99330a?auto=format&fit=crop&q=80&w=1000',
                'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&q=80&w=1000',
                'https://images.unsplash.com/photo-1578320490805-7798703ed83e?auto=format&fit=crop&q=80&w=1000'
            ],
            keywords: ['art deco', 'porcelain', 'vintage', '1920s', 'french'],
            isVerified: true,
            authenticityStatus: 'Verified',
            sellerId: 'system',
            createdAt: '2025-01-01T00:00:00Z',
        },
        {
            id: 2,
            title: 'Limited Edition Chronograph 1998',
            category: 'Timepieces',
            description: 'Swiss-made limited edition chronograph from 1998. Only 500 pieces were produced. This watch features a stainless steel case, sapphire crystal, and an automatic movement known for its precision.',
            condition: 'Like New',
            price: 4500,
            image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=1000',
            images: [
                'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=1000',
                'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&q=80&w=1000',
                'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?auto=format&fit=crop&q=80&w=1000',
                'https://images.unsplash.com/photo-1619134778706-c27e06184a44?auto=format&fit=crop&q=80&w=1000'
            ],
            keywords: ['chronograph', 'swiss', 'limited edition', 'automatic', 'steel'],
            isVerified: true,
            authenticityStatus: 'Verified',
            sellerId: 'system',
            createdAt: '2025-01-01T00:00:00Z',
        },
        {
            id: 3,
            title: 'Rare Air Jordan 1985 Original',
            category: 'Sneakers',
            description: 'Original 1985 Air Jordan 1 in collector condition. A piece of basketball history, these sneakers have been kept in a climate-controlled environment.',
            condition: 'Good',
            price: 8500,
            image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1000',
            images: [
                'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1000',
                'https://images.unsplash.com/photo-1514989940723-e8875ea6ab7d?auto=format&fit=crop&q=80&w=1000',
                'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=1000',
                'https://images.unsplash.com/photo-1520256862855-398228c41684?auto=format&fit=crop&q=80&w=1000'
            ],
            keywords: ['jordan', '1985', 'vintage', 'sneakers', 'nike'],
            isVerified: true,
            authenticityStatus: 'Verified',
            sellerId: 'system',
            createdAt: '2025-01-01T00:00:00Z',
        },
        {
            id: 4,
            title: '18th Century Colonial Map of India',
            category: 'Collectables',
            description: 'Authentic hand-drawn map of colonial India from the late 18th century. Shows detailed cartography of the period.',
            condition: 'Fair',
            price: 3200,
            image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1000',
            images: [
                'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1000',
                'https://images.unsplash.com/photo-1582560475093-d09bc33d07d1?auto=format&fit=crop&q=80&w=1000',
                'https://images.unsplash.com/photo-1569335443872-84f98101c673?auto=format&fit=crop&q=80&w=1000',
                'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1000'
            ],
            keywords: ['map', 'antique', 'india', 'colonial', 'cartography'],
            isVerified: true,
            authenticityStatus: 'Verified',
            sellerId: 'system',
            createdAt: '2025-01-01T00:00:00Z',
        }
    ];
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(initialProducts));
    return initialProducts;
};

// Initialize products on first load
if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    getInitialProducts();
}

// ============== STORAGE / IMAGES ==============

export const uploadProductImage = async (file) => {
    try {
        if (!file) throw new Error('No file selected');

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error } = await supabase.storage
            .from('product-images')
            .upload(filePath, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath);

        return publicUrl;
    } catch (error) {
        console.error('Error uploading product image:', error);
        throw error;
    }
};

export const uploadBlogImage = async (file) => {
    try {
        if (!file) throw new Error('No file selected');

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error } = await supabase.storage
            .from('blog-images')
            .upload(filePath, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from('blog-images')
            .getPublicUrl(filePath);

        return publicUrl;
    } catch (error) {
        console.error('Error uploading blog image:', error);
        throw error;
    }
};

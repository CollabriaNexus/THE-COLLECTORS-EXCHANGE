import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, User, Heart, Menu, X } from 'lucide-react';
import { getCart, getWishlist } from '../utils/storage';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);

    useEffect(() => {
        const updateCounts = () => {
            setCartCount(getCart().length);
            setWishlistCount(getWishlist().length);
        };
        updateCounts();

        // Update counts periodically (simple polling for demo)
        const interval = setInterval(updateCounts, 1000);
        return () => clearInterval(interval);
    }, []);

    const navItems = [
        { name: 'About Us', path: '/THE-COLLECTORS-EXCHANGE/about' },
        { name: 'The Exchange', path: '/THE-COLLECTORS-EXCHANGE/category' },
        { name: 'The Gallery', path: '/THE-COLLECTORS-EXCHANGE/gallery' },
        { name: 'Auction', path: '/THE-COLLECTORS-EXCHANGE/auction' },
        { name: 'Vision', path: '/THE-COLLECTORS-EXCHANGE/vision' },
    ];

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm text-text-main">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                {/* Logo */}
                <Link to="/THE-COLLECTORS-EXCHANGE/" className="text-[13px] sm:text-lg md:text-xl lg:text-2xl font-serif font-bold tracking-tight sm:tracking-wide shrink-0">
                    THE COLLECTORS EXCHANGE
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex space-x-6 xl:space-x-8">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            className="text-[10px] xl:text-xs font-medium hover:text-luxury-gold transition-colors uppercase tracking-[0.2em]"
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* Icons */}
                <div className="flex items-center space-x-3 sm:space-x-6">
                    <Link to="/THE-COLLECTORS-EXCHANGE/wishlist" className="relative hover:text-luxury-gold transition-colors" aria-label="Wishlist">
                        <Heart size={20} />
                        {wishlistCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-luxury-gold text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                {wishlistCount}
                            </span>
                        )}
                    </Link>
                    <Link to="/THE-COLLECTORS-EXCHANGE/account" className="hover:text-luxury-gold transition-colors" aria-label="Account">
                        <User size={20} />
                    </Link>
                    <Link to="/THE-COLLECTORS-EXCHANGE/cart" className="relative hover:text-luxury-gold transition-colors" aria-label="Cart">
                        <ShoppingBag size={20} />
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="lg:hidden"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="lg:hidden bg-white border-t border-gray-100 px-6 py-4 shadow-inner">
                    <nav className="flex flex-col space-y-4">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                onClick={() => setIsMenuOpen(false)}
                                className="text-[11px] font-medium hover:text-luxury-gold transition-colors uppercase tracking-[0.2em] py-2 border-b border-gray-50 last:border-0"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;

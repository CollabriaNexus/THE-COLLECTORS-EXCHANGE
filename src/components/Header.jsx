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
        <header className="sticky top-0 z-50 bg-primary-bg text-text-main border-b border-gray-100 shadow-sm">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                {/* Logo */}
                <Link to="/THE-COLLECTORS-EXCHANGE/" className="text-xl md:text-2xl font-serif font-bold tracking-wide">
                    THE COLLECTORS EXCHANGE
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex space-x-8">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            className="text-sm font-medium hover:text-luxury-gold transition-colors uppercase tracking-wider"
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* Icons */}
                <div className="flex items-center space-x-6">
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
                        className="md:hidden"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4">
                    <nav className="flex flex-col space-y-4">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                onClick={() => setIsMenuOpen(false)}
                                className="text-sm font-medium hover:text-luxury-gold transition-colors uppercase tracking-wider"
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

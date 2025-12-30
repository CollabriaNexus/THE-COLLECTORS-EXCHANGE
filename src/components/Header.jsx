import React from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingBag, User, Heart } from 'lucide-react';

const Header = () => {
    const navItems = [
        { name: 'About Us', path: '/about' },
        { name: 'Category', path: '/category' },
        { name: 'Auction', path: '/auction' },
        { name: 'Vision', path: '/vision' },
    ];

    return (
        <header className="sticky top-0 z-50 bg-primary-bg text-text-main border-b border-gray-100 shadow-sm">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="text-2xl font-serif font-bold tracking-wide">
                    THE COLLECTORS EXCHANGE
                </Link>

                {/* Navigation */}
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
                    <Link to="/wishlist" className="hover:text-luxury-gold transition-colors" aria-label="Wishlist">
                        <Heart size={20} />
                    </Link>
                    <Link to="/account" className="hover:text-luxury-gold transition-colors" aria-label="Account">
                        <User size={20} />
                    </Link>
                    <Link to="/cart" className="hover:text-luxury-gold transition-colors" aria-label="Cart">
                        <ShoppingBag size={20} />
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Header;

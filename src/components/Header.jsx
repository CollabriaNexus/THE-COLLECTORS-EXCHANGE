import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Heart, Menu, X, Store } from 'lucide-react';
import { getUser } from '../utils/storage';
import { useCart } from '../hooks/api/useCart';
import { useWishlist } from '../hooks/api/useWishlist';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(true);
    const [videoEnded, setVideoEnded] = useState(false);
    const [headerHeight, setHeaderHeight] = useState(0);
    const headerRef = useRef(null);
    const location = useLocation();
    const user = getUser();

    const { data: cartItems = [] } = useCart(user?.id);
    const { data: wishlistItems = [] } = useWishlist(user?.id);

    const wishlistCount = wishlistItems.length;

    const isHomePage = ['/'].includes(location.pathname);
    const showNav = !isHomePage || scrolled || videoEnded;

    useEffect(() => {
        const handleVideoEnded = () => setVideoEnded(true);
        window.addEventListener('homeVideoEnded', handleVideoEnded);
        return () => window.removeEventListener('homeVideoEnded', handleVideoEnded);
    }, []);

    useEffect(() => {
        if (!isHomePage) {
            setScrolled(true);
            return;
        }
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isHomePage]);

    useEffect(() => {
        if (headerRef.current) {
            setHeaderHeight(headerRef.current.offsetHeight);
        }
    }, []);

    const navItems = [
        { name: 'About Us', path: '/about' },
        { name: 'The Exchange', path: '/category' },
        { name: 'The Gallery', path: '/gallery' },
        { name: 'Auction', path: '/auction' },
        { name: 'Vision', path: '/vision' },
    ];

    const bottomNav = [
        { name: 'Shop', path: '/category', icon: Store },
        { name: 'Wishlist', path: '/wishlist', icon: Heart, count: wishlistCount },
        { name: 'Cart', path: '/cart', icon: ShoppingBag, count: cartItems.length },
        { name: 'Account', path: '/account', icon: User },
    ];

    return (
        <>
            <div style={{ height: showNav ? headerHeight : 0 }} className="transition-[height] duration-300" />
            <header ref={headerRef} className={`fixed top-0 left-0 right-0 z-50 bg-white text-text-main transition-transform duration-300 ${showNav ? 'translate-y-0 border-b border-gray-100 shadow-sm' : '-translate-y-full'}`}>
                <div className="container mx-auto px-4 sm:px-6 py-2 sm:py-3 flex items-center justify-center lg:justify-between relative">
                    {/* Logo - centered on mobile, left-aligned on desktop */}
                    <Link to="/" className="text-[11px] xs:text-[13px] sm:text-lg md:text-xl lg:text-2xl font-serif font-bold tracking-tight sm:tracking-wide shrink-0 leading-tight text-center lg:text-left">
                        THE COLLECTORS<br className="hidden xs:block sm:hidden" /> EXCHANGE
                    </Link>

                    {/* Desktop Navigation */}
                    <nav aria-label="Main navigation" className="hidden lg:flex space-x-4 xl:space-x-8">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className="text-[9px] xl:text-xs font-medium hover:text-luxury-gold transition-colors uppercase tracking-[0.15em] whitespace-nowrap"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Desktop Icons (hidden on mobile) */}
                    <div className="hidden lg:flex items-center space-x-6">
                        <Link to="/wishlist" className="relative hover:text-luxury-gold transition-colors" aria-label="Wishlist">
                            <Heart size={20} />
                            {wishlistCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-luxury-gold text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                                    {wishlistCount}
                                </span>
                            )}
                        </Link>
                        <Link to="/account" className="hover:text-luxury-gold transition-colors" aria-label="Account">
                            <User size={20} />
                        </Link>
                        <Link to="/cart" className="relative hover:text-luxury-gold transition-colors" aria-label="Cart">
                            <ShoppingBag size={20} />
                            {cartItems.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                                    {cartItems.length}
                                </span>
                            )}
                        </Link>
                    </div>

                    {/* Mobile hamburger - absolute positioned right */}
                    <button
                        className="lg:hidden absolute right-4 sm:right-6"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                        aria-expanded={isMenuOpen}
                    >
                        {isMenuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="lg:hidden bg-white border-t border-gray-100 px-4 sm:px-6 py-4 shadow-inner">
                        <nav className="flex flex-col space-y-3">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="text-xs font-medium hover:text-luxury-gold transition-colors uppercase tracking-[0.2em] py-2 border-b border-gray-50 last:border-0"
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </div>
                )}
            </header>

            {/* Mobile Bottom Navigation Bar */}
            <nav aria-label="Mobile navigation" className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg flex items-center justify-around py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] transition-transform duration-300 ${showNav ? 'translate-y-0' : 'translate-y-full'}`}>
                {bottomNav.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className="flex flex-col items-center gap-0.5 px-4 py-1 text-gray-500 hover:text-luxury-gold transition-colors relative"
                        >
                            <div className="relative">
                                <Icon size={20} aria-hidden="true" />
                                {item.count > 0 && (
                                    <span className="absolute -top-1.5 -right-2 bg-luxury-gold text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                                        {item.count > 9 ? '9+' : item.count}
                                    </span>
                                )}
                            </div>
                            <span className="text-[10px] uppercase tracking-wider font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Spacer for mobile bottom nav (hidden, now on footer) */}
        </>
    );
};

export default Header;

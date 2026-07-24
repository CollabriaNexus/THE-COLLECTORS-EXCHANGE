import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Heart, Menu, X, Store } from 'lucide-react';
import { getUser } from '../utils/storage';
import { useCart } from '../hooks/api/useCart';
import { useWishlist } from '../hooks/api/useWishlist';
import { PRIMARY_NAV } from '../config/seo-pages';

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

  const navItems = PRIMARY_NAV;

  const bottomNav = [
    { name: 'Shop', path: '/category', icon: Store },
    { name: 'Wishlist', path: '/wishlist', icon: Heart, count: wishlistCount },
    { name: 'Cart', path: '/cart', icon: ShoppingBag, count: cartItems.length },
    { name: 'Account', path: '/account', icon: User },
  ];

  return (
    <>
      <div
        style={{ height: showNav ? headerHeight : 0 }}
        className="transition-[height] duration-300"
      />
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-50 bg-white text-text-main transition-transform duration-300 ${showNav ? 'translate-y-0 border-b border-gray-100 shadow-sm' : '-translate-y-full'}`}
      >
        <div className="px-3 sm:px-6 lg:container lg:mx-auto lg:px-8 xl:px-10 pt-2 pb-2 md:py-4">
          {/* Mobile layout */}
          <div className="flex items-center justify-between lg:hidden min-h-[40px]">
            <div className="flex-1" />
            <Link
              to="/"
              className="text-[15px] xs:text-[16px] sm:text-base md:text-lg font-serif font-bold tracking-tight leading-snug text-center shrink-0 inline-flex items-center justify-center px-2"
            >
              THE COLLECTORS
              <br className="hidden xs:block sm:hidden" /> EXCHANGE
            </Link>
            <div className="flex-1 flex justify-end">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
                aria-expanded={isMenuOpen}
                className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                {isMenuOpen ? (
                  <X size={20} aria-hidden="true" />
                ) : (
                  <Menu size={20} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {/* Desktop layout */}
          <div className="hidden lg:flex items-center justify-between">
            <Link
              to="/"
              className="text-lg lg:text-xl xl:text-2xl font-serif font-bold tracking-wide shrink-0 leading-tight"
            >
              THE COLLECTORS EXCHANGE
            </Link>
            <nav aria-label="Main navigation" className="flex items-center space-x-8 xl:space-x-12">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="text-[10px] xl:text-xs font-medium hover:text-luxury-gold transition-colors uppercase tracking-[0.15em] whitespace-nowrap"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="flex items-center space-x-5 xl:space-x-7">
              <Link
                to="/wishlist"
                className="relative hover:text-luxury-gold transition-colors"
                aria-label="Wishlist"
              >
                <Heart size={20} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-luxury-gold text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link
                to="/account"
                className="hover:text-luxury-gold transition-colors"
                aria-label="Account"
              >
                <User size={20} />
              </Link>
              <Link
                to="/cart"
                className="relative hover:text-luxury-gold transition-colors"
                aria-label="Cart"
              >
                <ShoppingBag size={20} />
                {cartItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu — slide-in drawer (outside header for correct z-stacking) */}
      <>
        {/* Backdrop overlay */}
        <div
          className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] transition-opacity duration-500 lg:hidden ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
        {/* Drawer panel */}
        <div
          className={`fixed top-0 right-0 h-full w-[280px] max-w-[80vw] bg-white shadow-2xl z-[70] lg:hidden transition-transform duration-500 ease-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div className="flex flex-col h-full pt-12">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <span className="text-xs uppercase tracking-[0.25em] text-heritage-bronze/60 font-sans font-medium">
                Navigation
              </span>
              <button
                onClick={() => setIsMenuOpen(false)}
                aria-label="Close menu"
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            {/* Nav items */}
            <nav className="flex-1 overflow-y-auto py-4 px-5">
              <div className="flex flex-col space-y-1">
                {navItems.map((item, index) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      style={{ transitionDelay: `${index * 60}ms` }}
                      className={`group relative text-sm font-medium uppercase tracking-[0.2em] py-3.5 px-4 rounded-sm transition-all duration-400 ease-out ${
                        isActive
                          ? 'text-luxury-gold bg-luxury-gold/5'
                          : 'text-heritage-charcoal hover:text-luxury-gold hover:bg-heritage-cream'
                      } ${isMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`}
                    >
                      <span className="relative z-10">{item.name}</span>
                      {/* Left gold accent line on hover/active */}
                      <span
                        className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-0 transition-all duration-300 rounded-full ${isActive ? 'bg-luxury-gold h-3/5' : 'group-hover:bg-luxury-gold/50 group-hover:h-2/5'}`}
                      />
                    </Link>
                  );
                })}
              </div>
              <div className="border-t border-luxury-gold/20 my-5" />
              {/* Links entry */}
              <Link
                to="/links"
                onClick={() => setIsMenuOpen(false)}
                className={`group relative flex items-center text-sm font-medium uppercase tracking-[0.2em] py-3.5 px-4 rounded-sm transition-all duration-400 ease-out ${
                  location.pathname === '/links'
                    ? 'text-luxury-gold bg-luxury-gold/5'
                    : 'text-heritage-charcoal hover:text-luxury-gold hover:bg-heritage-cream'
                } ${isMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`}
              >
                <span className="relative z-10">Links</span>
                <span
                  className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-0 transition-all duration-300 rounded-full ${location.pathname === '/links' ? 'bg-luxury-gold h-3/5' : 'group-hover:bg-luxury-gold/50 group-hover:h-2/5'}`}
                />
              </Link>
            </nav>
            {/* Drawer footer */}
            <div className="px-5 py-4 border-t border-gray-100">
              <p className="text-[10px] text-heritage-bronze/40 uppercase tracking-[0.15em] font-sans text-center">
                The Collectors Exchange
              </p>
            </div>
          </div>
        </div>
      </>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile navigation"
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-t border-gray-200 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] flex items-center justify-around pt-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom))] transition-transform duration-500 ease-out ${showNav ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {bottomNav.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`group relative flex min-w-0 flex-1 flex-col items-center gap-0.5 px-2 py-1 transition-all duration-300 ease-out ${isActive ? 'text-luxury-gold' : 'text-gray-500 hover:text-luxury-gold'}`}
            >
              {/* Active indicator dot */}
              <span
                className={`absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full transition-all duration-300 ${isActive ? 'bg-luxury-gold opacity-100 scale-100' : 'opacity-0 scale-0'}`}
              />
              <div className="relative transition-transform duration-300 ease-out group-hover:scale-110">
                <Icon
                  size={20}
                  aria-hidden="true"
                  className={`transition-all duration-300 ${isActive ? 'scale-110' : ''}`}
                />
                {item.count > 0 && (
                  <span
                    className={`absolute -top-1.5 -right-2 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${isActive ? 'bg-luxury-gold scale-110' : 'bg-luxury-gold'}`}
                  >
                    {item.count > 9 ? '9+' : item.count}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] uppercase tracking-wider font-medium leading-none transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-60 group-hover:opacity-100'}`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Spacer for mobile bottom nav (hidden, now on footer) */}
    </>
  );
};

export default Header;

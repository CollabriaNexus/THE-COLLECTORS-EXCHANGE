import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Heart, Menu, X, Store } from 'lucide-react';
import { getUser } from '../utils/storage';
import { useCart } from '../hooks/api/useCart';
import { useWishlist } from '../hooks/api/useWishlist';
import { PRIMARY_NAV } from '../config/seo-pages';
import crestMark from '../assets/brand/crest-mark-160.webp';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef(null);
  const location = useLocation();
  const user = getUser();

  const { data: cartItems = [] } = useCart(user?.id);
  const { data: wishlistItems = [] } = useWishlist(user?.id);

  const wishlistCount = wishlistItems.length;

  // Nav is always visible — the old hide-until-scroll-or-video-ends behavior
  // existed for the full-bleed video hero, which the homepage no longer has.
  const showNav = true;

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
        className={`fixed top-0 left-0 right-0 z-50 pt-3 px-3 lg:pt-4 lg:px-6 transition-transform duration-300 ${showNav ? 'translate-y-0' : '-translate-y-full'}`}
      >
        <div
          className="rounded-2xl lg:rounded-full text-cream/90 border border-white/[0.07]"
          style={{
            background: 'rgba(9,8,6,0.82)',
            backdropFilter: 'blur(22px) saturate(140%)',
            WebkitBackdropFilter: 'blur(22px) saturate(140%)',
          }}
        >
          <div className="px-3 sm:px-6 lg:mx-auto lg:max-w-7xl lg:px-8 xl:px-10 pt-2 pb-2 md:py-3.5">
            {/* Mobile layout */}
            <div className="flex items-center justify-between lg:hidden min-h-[40px]">
              <Link to="/" className="flex items-center gap-2 shrink-0">
                <img src={crestMark} alt="" className="h-8 w-auto" />
              </Link>
              <Link
                to="/"
                className="text-[15px] xs:text-[16px] sm:text-base font-serif font-bold tracking-tight leading-snug text-center inline-flex items-center justify-center px-2 text-cream"
              >
                THE COLLECTORS
                <br className="hidden xs:block sm:hidden" /> EXCHANGE
              </Link>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
                aria-expanded={isMenuOpen}
                className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10 transition-colors shrink-0"
              >
                {isMenuOpen ? (
                  <X size={20} aria-hidden="true" />
                ) : (
                  <Menu size={20} aria-hidden="true" />
                )}
              </button>
            </div>

            {/* Desktop layout */}
            <div className="hidden lg:flex items-center justify-between">
              <Link to="/" className="flex items-center gap-3 shrink-0 group">
                <img
                  src={crestMark}
                  alt=""
                  className="h-9 w-auto transition-transform duration-500 group-hover:scale-110"
                />
                <span className="text-lg lg:text-xl xl:text-2xl font-serif font-bold tracking-wide leading-tight text-cream">
                  THE COLLECTORS EXCHANGE
                </span>
              </Link>
              <nav
                aria-label="Main navigation"
                className="flex items-center space-x-5 xl:space-x-7"
              >
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="text-[10px] xl:text-xs font-medium text-cream/60 hover:text-luxury-gold transition-colors uppercase tracking-[0.15em] whitespace-nowrap"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
              <div className="flex items-center space-x-5 xl:space-x-7 text-cream/70">
                <Link
                  to="/wishlist"
                  className="relative hover:text-luxury-gold transition-colors"
                  aria-label="Wishlist"
                >
                  <Heart size={20} />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-luxury-gold text-obsidian text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
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
                    <span className="absolute -top-2 -right-2 bg-cream text-obsidian text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                      {cartItems.length}
                    </span>
                  )}
                </Link>
              </div>
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
          className={`fixed top-0 right-0 h-full w-[280px] max-w-[80vw] rounded-l-3xl bg-white shadow-2xl z-[70] lg:hidden transition-transform duration-500 ease-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
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
        style={{
          bottom: 'calc(0.75rem + env(safe-area-inset-bottom))',
          background: 'rgba(9,8,6,0.86)',
          backdropFilter: 'blur(22px) saturate(140%)',
          WebkitBackdropFilter: 'blur(22px) saturate(140%)',
        }}
        className={`lg:hidden fixed left-3 right-3 z-50 rounded-2xl border border-white/[0.07] flex items-center justify-around py-2 transition-transform duration-500 ease-out ${showNav ? 'translate-y-0' : 'translate-y-[150%]'}`}
      >
        {bottomNav.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`group relative flex min-w-0 flex-1 flex-col items-center gap-0.5 px-2 py-1 transition-all duration-300 ease-out ${isActive ? 'text-luxury-gold' : 'text-cream/50 hover:text-luxury-gold'}`}
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
                    className={`absolute -top-1.5 -right-2 text-obsidian text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${isActive ? 'bg-luxury-gold scale-110' : 'bg-luxury-gold'}`}
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

import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { ShoppingBag, User, Heart, Menu, X, Store } from 'lucide-react';
import { getUser } from '../utils/storage';
import { useCart } from '../hooks/api/useCart';
import { useWishlist } from '../hooks/api/useWishlist';
import { PRIMARY_NAV } from '../config/seo-pages';
import crestMark from '../assets/brand/crest-mark-160.webp';

// Everything focusable we ever render inside the drawer. Kept in one place so
// the "move focus in" step and the Tab-cycle trap can never disagree about
// what counts as focusable.
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// How long the exit animation runs — must match .animate-drawer-out in index.css.
const DRAWER_EXIT_MS = 300;

const Header = () => {
  // 'closed' | 'open' | 'closing'. The drawer is mounted only for the last
  // two. A permanently-mounted drawer moved off-screen by a transform keeps
  // its four links and its close button in the tab order on every page below
  // 1024px — i.e. for the entire mobile audience — with the focus ring landing
  // on nothing.
  const [menuState, setMenuState] = useState('closed');
  const isMenuOpen = menuState === 'open';
  const isDrawerMounted = menuState !== 'closed';

  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef(null);
  const drawerRef = useRef(null);
  const menuButtonRef = useRef(null);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const user = getUser();

  // On mobile, the Account page has its own in-page section index/drill-down
  // nav (back chevron included) once a section is open — keeping the bottom
  // tab bar visible on top of that duplicates the "back to Account" action
  // and eats vertical space. Hide it only for that specific state.
  const isAccountSectionOpen = location.pathname === '/account' && searchParams.has('tab');

  const { data: cartItems = [] } = useCart(user?.id);
  const { data: wishlistItems = [] } = useWishlist(user?.id);

  const wishlistCount = wishlistItems.length;

  // Nav is always visible — the old hide-until-scroll-or-video-ends behavior
  // existed for the full-bleed video hero, which the homepage no longer has.
  const showNav = true;

  const openMenu = useCallback(() => setMenuState('open'), []);
  const closeMenu = useCallback(
    () => setMenuState((prev) => (prev === 'open' ? 'closing' : prev)),
    [],
  );

  // Keep the reserved spacer height (and the --header-h custom property that
  // pages use to bleed their hero background up behind the floating nav) in
  // sync with the nav's actual rendered height — not just on mount. The pill
  // changes height across the lg breakpoint (mobile bar vs desktop row) and
  // can reflow when fonts finish loading, so a one-time measurement drifts.
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const applyHeight = (height) => {
      setHeaderHeight(height);
      document.documentElement.style.setProperty('--header-h', `${height}px`);
    };

    applyHeight(el.offsetHeight);

    // ResizeObserver isn't available in every environment (jsdom/test
    // runners, very old browsers) — fall back to the one-time measurement
    // above rather than throwing and taking the whole tree down with it.
    if (typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver((entries) => {
      const height = entries[0]?.contentRect?.height;
      if (height) applyHeight(Math.round(height));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Unmount the drawer once its exit animation has played out.
  useEffect(() => {
    if (menuState !== 'closing') return;
    const timer = setTimeout(() => setMenuState('closed'), DRAWER_EXIT_MS);
    return () => clearTimeout(timer);
  }, [menuState]);

  // Modal behaviour for the open drawer: focus moves in, Tab cycles inside it,
  // Escape closes it, the page behind it can't scroll, and focus returns to
  // the hamburger that opened it.
  useEffect(() => {
    if (!isMenuOpen) return;
    const panel = drawerRef.current;
    if (!panel) return;
    // Captured now so the cleanup below doesn't read a ref that may already
    // point somewhere else by the time it runs.
    const opener = menuButtonRef.current;

    const focusables = () => Array.from(panel.querySelectorAll(FOCUSABLE));

    // Move focus into the drawer. The close button is first in DOM order, so
    // the first thing a keyboard user lands on is the way back out.
    const first = focusables()[0];
    (first || panel).focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu();
        return;
      }
      if (event.key !== 'Tab') return;

      const items = focusables();
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      const active = document.activeElement;

      if (event.shiftKey) {
        if (active === firstEl || !panel.contains(active)) {
          event.preventDefault();
          lastEl.focus();
        }
      } else if (active === lastEl || !panel.contains(active)) {
        event.preventDefault();
        firstEl.focus();
      }
    };

    // Each drawer link closes the drawer itself, but a hardware/gesture Back
    // while it is open would otherwise leave it hanging over the new page.
    const handlePopState = () => closeMenu();

    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('popstate', handlePopState);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);
      document.body.style.overflow = previousOverflow;
      // Return focus to the control that opened the drawer, so keyboard users
      // resume where they left off instead of at the top of the document.
      opener?.focus();
    };
  }, [isMenuOpen, closeMenu]);

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
          className="rounded-2xl text-cream/90 border border-white/[0.07]"
          style={{
            background: 'rgba(9,8,6,0.82)',
            backdropFilter: 'blur(22px) saturate(140%)',
            WebkitBackdropFilter: 'blur(22px) saturate(140%)',
          }}
        >
          <div className="px-3 sm:px-6 lg:mx-auto lg:max-w-7xl lg:px-8 xl:px-10 pt-2 pb-2 md:py-3.5">
            {/* Mobile layout */}
            <div className="flex items-center justify-between lg:hidden min-h-[40px]">
              {/* The crest is decorative (alt=""), so the link needs its own
                  accessible name — otherwise this is an unnamed link at the
                  very top of the tab order. The desktop version below gets its
                  name from the wordmark span inside the same Link. */}
              <Link
                to="/"
                aria-label="The Collectors Exchange — home"
                className="flex items-center gap-2 shrink-0"
              >
                <img src={crestMark} alt="" className="h-8 w-auto" />
              </Link>
              <Link
                to="/"
                className="font-serif tracking-[0.14em] text-[13px] uppercase leading-snug text-center inline-flex items-center justify-center px-2 text-cream/90"
              >
                THE COLLECTORS
                <br className="hidden xs:block sm:hidden" /> EXCHANGE
              </Link>
              <button
                ref={menuButtonRef}
                onClick={() => (isMenuOpen ? closeMenu() : openMenu())}
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
                <span className="font-serif tracking-[0.14em] text-sm uppercase leading-tight text-cream/90">
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
                    className="text-[11px] font-medium text-cream/60 hover:text-luxury-gold transition-colors uppercase tracking-[0.18em] whitespace-nowrap"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
              <div className="flex items-center space-x-5 xl:space-x-7 text-cream/70">
                <Link
                  to="/wishlist"
                  className="relative hover:text-luxury-gold transition-colors"
                  aria-label={wishlistCount > 0 ? `Wishlist, ${wishlistCount} items` : 'Wishlist'}
                >
                  <Heart size={20} />
                  {wishlistCount > 0 && (
                    <span
                      aria-hidden="true"
                      className="absolute -top-2 -right-2 bg-luxury-gold text-obsidian text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold"
                    >
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
                  aria-label={cartItems.length > 0 ? `Cart, ${cartItems.length} items` : 'Cart'}
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

      {/* Mobile Menu — slide-in drawer (outside the header for correct
          z-stacking). Mounted only while open or animating out. */}
      {isDrawerMounted && (
        <>
          {/* Backdrop overlay */}
          <div
            className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] transition-opacity duration-300 lg:hidden ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={closeMenu}
            aria-hidden="true"
          />
          {/* Drawer panel */}
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            tabIndex={-1}
            // During the ~300ms exit the panel is still painted but must not
            // be reachable — focus has already gone back to the hamburger.
            inert={isMenuOpen ? undefined : ''}
            aria-hidden={isMenuOpen ? undefined : 'true'}
            className={`fixed top-0 right-0 h-full w-[280px] max-w-[80vw] rounded-l-3xl bg-white shadow-2xl z-[70] lg:hidden focus:outline-none ${
              isMenuOpen ? 'animate-drawer-in' : 'animate-drawer-out pointer-events-none'
            }`}
          >
            <div className="flex flex-col h-full pt-12">
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <span className="text-xs uppercase tracking-[0.25em] text-heritage-bronze font-sans font-medium">
                  Navigation
                </span>
                <button
                  onClick={closeMenu}
                  aria-label="Close menu"
                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>
              {/* Nav items */}
              <nav aria-label="Mobile menu" className="flex-1 overflow-y-auto py-4 px-5">
                <div className="flex flex-col space-y-1">
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={closeMenu}
                        aria-current={isActive ? 'page' : undefined}
                        className={`group relative text-sm font-medium uppercase tracking-[0.2em] py-3.5 px-4 rounded-sm transition-colors duration-300 ease-out ${
                          isActive
                            ? 'text-luxury-gold bg-luxury-gold/5'
                            : 'text-heritage-charcoal hover:text-luxury-gold hover:bg-heritage-cream'
                        }`}
                      >
                        <span className="relative z-10">{item.name}</span>
                        {/* Left gold accent line on hover/active */}
                        <span
                          aria-hidden="true"
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
                  onClick={closeMenu}
                  aria-current={location.pathname === '/links' ? 'page' : undefined}
                  className={`group relative flex items-center text-sm font-medium uppercase tracking-[0.2em] py-3.5 px-4 rounded-sm transition-colors duration-300 ease-out ${
                    location.pathname === '/links'
                      ? 'text-luxury-gold bg-luxury-gold/5'
                      : 'text-heritage-charcoal hover:text-luxury-gold hover:bg-heritage-cream'
                  }`}
                >
                  <span className="relative z-10">Links</span>
                  <span
                    aria-hidden="true"
                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-0 transition-all duration-300 rounded-full ${location.pathname === '/links' ? 'bg-luxury-gold h-3/5' : 'group-hover:bg-luxury-gold/50 group-hover:h-2/5'}`}
                  />
                </Link>
              </nav>
              {/* Drawer footer */}
              <div className="px-5 py-4 border-t border-gray-100">
                <p className="text-[10px] text-heritage-bronze uppercase tracking-[0.15em] font-sans text-center">
                  The Collectors Exchange
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile navigation"
        style={{
          bottom: 'calc(0.75rem + env(safe-area-inset-bottom))',
          background: 'rgba(9,8,6,0.86)',
          backdropFilter: 'blur(22px) saturate(140%)',
          WebkitBackdropFilter: 'blur(22px) saturate(140%)',
        }}
        className={`lg:hidden fixed left-3 right-3 z-50 rounded-2xl border border-white/[0.07] flex items-center justify-around py-2 transition-transform duration-500 ease-out ${showNav && !isAccountSectionOpen ? 'translate-y-0' : 'translate-y-[150%]'}`}
      >
        {bottomNav.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              aria-current={isActive ? 'page' : undefined}
              // Inactive tabs used to be text-cream/50 with a further
              // opacity-60 on the label span; the two compounded to ~30%
              // effective alpha (2.60:1 on the bar). One step of transparency
              // only, and enough of it to pass.
              className={`group relative flex min-w-0 flex-1 flex-col items-center gap-0.5 px-2 py-1 transition-all duration-300 ease-out ${isActive ? 'text-luxury-gold' : 'text-cream/70 hover:text-luxury-gold'}`}
            >
              {/* Active indicator dot */}
              <span
                aria-hidden="true"
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
              <span className="text-[10px] uppercase tracking-wider font-medium leading-none">
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

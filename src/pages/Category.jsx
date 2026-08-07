import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import SEO, { PageSchema, BreadcrumbSchema } from '../components/SEO';
import { CORE_PAGES } from '../config/seo-pages';
import {
  Watch,
  Gem,
  Landmark,
  Gamepad2,
  ShieldCheck,
  Award,
  Heart,
  ShoppingBag,
  Loader2,
  Sparkles,
  Box,
  XCircle,
  Check,
} from 'lucide-react';
import { useProducts } from '../hooks/api/useProducts';
import { useCategoryCounts } from '../hooks/api/useCategoryCounts';
import { getUser } from '../utils/storage';
import { useWishlist, useAddToWishlist, useRemoveFromWishlist } from '../hooks/api/useWishlist';
import { useCart, useAddToCart } from '../hooks/api/useCart';
import apiClient from '../hooks/api/apiClient';
import { useToast } from '../components/Toast';
import Bullet from '../components/Bullet';
import { Reveal, Stagger, Tilt } from '../components/Motion';

const CATEGORIES = [
  {
    id: 'timepieces',
    name: 'Timepieces',
    icon: Watch,
    tagline: 'The Mechanical Heartbeat',
    description:
      'Your phone tells the time. A mechanical watch tells a story. In a world of flickering screens and disposable tech, we choose the "Mechanical Truth." We don\'t sell battery-powered fashion; we rescue 17-jewel heartbeats that never need a plug or an algorithm to live.',
  },
  {
    id: 'accessories',
    name: 'Accessories',
    icon: Sparkles,
    tagline: 'The Perfect Finish',
    description:
      'An outfit is a statement. The right accessory makes it iconic. In a world of fast fashion and disposable trends, we choose the "Enduring Truth." We rescue the definitive finishing pieces — the cufflinks, the bags, the belts, and the heirlooms that transform the ordinary into the extraordinary.',
  },
  {
    id: 'collectables',
    name: 'Collectibles',
    icon: Box,
    tagline: 'The Curated Pulse',
    description:
      'A trend lasts a season. A collectible lasts a lifetime. In a world of digital clutter and "fast-consumption," we choose the "Physical Truth." We don\'t deal in landfill-ready trinkets; we rescue the rare, the nostalgic, and the culturally significant.',
  },
  {
    id: 'antiques',
    name: 'Antiques',
    icon: Landmark,
    tagline: 'The Ancestral Anchor',
    description:
      'A replica fills a space. An antique commands it. In a world of flat-pack furniture and mass-produced "vintage-look" decor, we choose the "Ancestral Truth." We rescue the weathered survivors of our history, solid objects that carry the craftsman\'s soul and the weight of the generations before us.',
  },
  {
    id: 'toys',
    name: 'Toys & Pop Culture',
    icon: Gamepad2,
    tagline: 'The Nostalgic Truth',
    description:
      'A plaything is for a moment. A pop icon is for the ages. In a world of disposable plastic and "over-hyped" trends, we choose the "Cultural Truth." We rescue the definitive pieces — the action figures, the limited figurines, and the media artifacts that shaped our childhoods.',
  },
  {
    id: 'jewelry',
    name: 'Jewelry',
    icon: Gem,
    tagline: 'The TCE Original',
    description:
      'A brand sells you a status. A TCE Original gives you a legacy. In a world of hollow "luxury" and gold-plated illusions, we choose the "Absolute Truth." After years of studying the ancestors and master artisans, we have moved from protecting history to creating it.',
  },
];

// Standard Product Card Component (Archive-style)
const ArchiveProductCard = ({ product }) => {
  const user = getUser();
  const navigate = useNavigate();
  const showToast = useToast();
  const { data: wishlistItems = [] } = useWishlist(user?.id);
  const addToWishlistMutation = useAddToWishlist();
  const removeFromWishlistMutation = useRemoveFromWishlist();
  const { data: cartItems = [] } = useCart(user?.id);
  const addToCartMutation = useAddToCart();
  const [cartFeedback, setCartFeedback] = useState(false);
  const [wishPulse, setWishPulse] = useState(false);
  const cartFeedbackTimer = useRef(null);

  const inCart = cartItems.some((item) => item.productId === product.id);
  const inWishlist = wishlistItems.some(
    (item) => item.product?.id === product.id || item.productId === product.id,
  );

  useEffect(() => {
    return () => clearTimeout(cartFeedbackTimer.current);
  }, []);

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      showToast('Please sign in to add to wishlist', 'error');
      return;
    }
    // Guard against the double-click race and swallowed failures: await the
    // mutation, surface errors, and ignore clicks while one is in flight.
    if (addToWishlistMutation.isPending || removeFromWishlistMutation.isPending) return;

    setWishPulse(true);
    setTimeout(() => setWishPulse(false), 200);

    try {
      if (inWishlist) {
        await removeFromWishlistMutation.mutateAsync({ userId: user.id, productId: product.id });
      } else {
        await addToWishlistMutation.mutateAsync({ userId: user.id, productId: product.id });
      }
    } catch (err) {
      showToast(
        err?.response?.data?.error || err?.response?.data?.message || 'Could not update wishlist',
        'error',
      );
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      showToast('Please sign in to add items to cart', 'error');
      return;
    }
    if (inCart) return;
    try {
      await addToCartMutation.mutateAsync({ userId: user.id, productId: product.id });
      apiClient.post('/analytics/cart', { productId: product.id, action: 'ADD' }).catch(() => {});
      setCartFeedback(true);
      clearTimeout(cartFeedbackTimer.current);
      cartFeedbackTimer.current = setTimeout(() => setCartFeedback(false), 2000);
    } catch (err) {
      if (err?.response?.status === 401) {
        showToast('Please sign in to add items to cart', 'error');
      } else {
        showToast(
          err?.response?.data?.message || err?.response?.data?.error || 'Failed to add to cart',
          'error',
        );
      }
    }
  };

  const title = product.title || product.name;
  const CategoryIcon =
    CATEGORIES.find((c) => c.name.toLowerCase() === product.category?.toLowerCase())?.icon || Gem;

  return (
    <div className="bg-white border border-gray-100 group hover:shadow-heritage transition-all duration-500 flex flex-col h-full">
      <Link
        to={`/product/${product.id}`}
        className="block relative aspect-square bg-heritage-beige overflow-hidden shrink-0"
      >
        {product.image ? (
          <img
            src={product.image}
            alt={title}
            loading="lazy"
            width="400"
            height="400"
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-heritage-bronze/30 bg-heritage-cream">
            <CategoryIcon size={28} strokeWidth={1} className="sm:w-10 sm:h-10" />
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          disabled={addToWishlistMutation.isPending || removeFromWishlistMutation.isPending}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-1.5 right-1.5 sm:top-3 sm:right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm transition-all duration-300 z-10 cursor-pointer active:scale-90 disabled:opacity-60 ${inWishlist ? 'text-heritage-bronze opacity-100' : 'text-heritage-charcoal/40 hover:text-heritage-bronze sm:opacity-0 sm:group-hover:opacity-100'} ${wishPulse ? 'scale-125' : 'scale-100'}`}
        >
          <Heart size={16} fill={inWishlist ? 'currentColor' : 'none'} />
        </button>

        {/* Condition Badge */}
        <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 bg-white/90 backdrop-blur-sm text-heritage-charcoal/70 text-[10px] sm:text-xs px-1 sm:px-2.5 py-0.5 sm:py-1 font-sans tracking-widest uppercase">
          {product.condition || 'Excellent'}
        </div>

        {/* Sold Badge */}
        {product.status === 'Sold' && (
          <div className="absolute inset-0 bg-heritage-charcoal/40 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-white/90 text-heritage-charcoal text-[10px] sm:text-xs font-bold px-3 sm:px-4 py-1 sm:py-1.5 uppercase tracking-widest shadow-lg">
              Sold Out
            </span>
          </div>
        )}

        {/* Verified Badge */}
        {product.isVerified && (
          <div className="absolute bottom-1.5 left-1.5 sm:bottom-3 sm:left-3 bg-heritage-charcoal/90 backdrop-blur-sm text-white text-[10px] px-1.5 sm:px-2.5 py-0.5 sm:py-1 font-sans tracking-widest uppercase flex items-center gap-1">
            <ShieldCheck size={10} />
            <span className="inline">Verified</span>
          </div>
        )}
      </Link>

      <div className="p-3 sm:p-5 flex flex-col flex-grow">
        {/* Meta and title absorb the slack so price and CTA align across the grid
            regardless of how many lines the title runs to. */}
        <div className="flex-grow">
          <div className="flex items-center gap-0.5 sm:gap-2 mb-0.5 sm:mb-1">
            <span className="text-[10px] sm:text-xs text-heritage-bronze/80 uppercase tracking-widest truncate">
              {product.category}
            </span>
          </div>
          {product.seller?.name && (
            <p className="text-[10px] sm:text-xs text-heritage-charcoal/50 truncate mb-0.5 sm:mb-1">
              by {product.seller.name}
            </p>
          )}
          <Link
            to={`/product/${product.id}`}
            className="block hover:text-heritage-bronze transition-colors"
          >
            <h3 className="font-serif text-sm sm:text-base md:text-lg text-heritage-charcoal leading-tight sm:leading-snug line-clamp-2">
              {title}
            </h3>
          </Link>
        </div>
        <p className="text-heritage-gold-muted font-sans text-xs sm:text-base lg:text-lg font-semibold mt-1.5 sm:mt-2">
          ₹{product.price?.toLocaleString()}
        </p>
        <p className="flex items-center gap-1 text-[9px] sm:text-[10px] text-heritage-bronze/60 uppercase tracking-wider mt-0.5">
          <ShieldCheck size={10} className="shrink-0" />
          Authenticity Guaranteed · 48-Hr Returns
        </p>

        {/* Add to Cart / Sold Button */}
        {product.status === 'Sold' ? (
          <div className="w-full py-2 sm:py-2.5 md:py-3 text-[10px] sm:text-xs md:text-sm uppercase tracking-[0.12em] sm:tracking-[0.15em] flex items-center justify-center gap-1 sm:gap-2 bg-gray-100 text-gray-400 cursor-default mt-1.5 sm:mt-2">
            <XCircle size={11} className="sm:w-4 sm:h-4" />
            Sold Out
          </div>
        ) : (
          <button
            onClick={inCart ? () => navigate('/cart') : cartFeedback ? undefined : handleAddToCart}
            disabled={addToCartMutation.isPending || cartFeedback}
            className={`w-full py-2 sm:py-2.5 md:py-3 text-[10px] sm:text-xs md:text-sm uppercase tracking-widest transition-colors duration-300 flex items-center justify-center gap-1 sm:gap-2 active:scale-[0.97] mt-1.5 sm:mt-2 ${
              cartFeedback || inCart
                ? 'bg-luxury-gold text-white cursor-pointer hover:bg-luxury-gold/90'
                : 'bg-heritage-charcoal text-white hover:bg-heritage-brown'
            }`}
          >
            {cartFeedback ? (
              <Check size={11} className="sm:w-4 sm:h-4" />
            ) : (
              <ShoppingBag size={11} className="sm:w-4 sm:h-4" />
            )}
            {addToCartMutation.isPending
              ? 'Adding...'
              : cartFeedback
                ? 'Added'
                : inCart
                  ? 'In Cart →'
                  : 'Add to Cart'}
          </button>
        )}
      </div>
    </div>
  );
};

const CONDITION_OPTIONS = ['Excellent', 'Good', 'Fair', 'Like New'];

const Category = () => {
  // Filter state is mirrored to the URL (?cat=&q=&condition=&page=) below so
  // filtered views are crawlable, indexable, and shareable — not just client state.
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(
    () => searchParams.get('cat') || 'Timepieces',
  );
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || '');
  const [condition, setCondition] = useState(() => searchParams.get('condition') || '');
  const [page, setPage] = useState(() => Number(searchParams.get('page')) || 1);
  const { data, isLoading } = useProducts(selectedCategory, searchQuery, page, 20, null, condition);
  const showToast = useToast();
  const { data: categoryCounts } = useCategoryCounts();

  useEffect(() => {
    const params = {};
    if (selectedCategory) params.cat = selectedCategory;
    if (searchQuery) params.q = searchQuery;
    if (condition) params.condition = condition;
    if (page > 1) params.page = String(page);
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, searchQuery, condition, page]);

  const products = data?.products || [];
  const totalPages = data?.totalPages || 1;
  const activeCategory = CATEGORIES.find((c) => c.name === selectedCategory);
  const ActiveCategoryIcon = activeCategory?.icon;

  useEffect(() => {
    if (categoryCounts && selectedCategory) {
      const count = categoryCounts[selectedCategory] ?? 0;
      if (count === 0) {
        const firstWithItems = CATEGORIES.find((c) => (categoryCounts[c.name] ?? 0) > 0);
        setSelectedCategory(firstWithItems?.name || null);
      }
    }
  }, [categoryCounts]);

  const prevCategory = useRef(selectedCategory);
  const prevSearch = useRef(searchQuery);
  const prevCondition = useRef(condition);
  useEffect(() => {
    if (
      prevCategory.current !== selectedCategory ||
      prevSearch.current !== searchQuery ||
      prevCondition.current !== condition
    ) {
      setPage(1);
      prevCategory.current = selectedCategory;
      prevSearch.current = searchQuery;
      prevCondition.current = condition;
    }
  }, [selectedCategory, searchQuery, condition]);

  const productsRef = useRef(null);

  const handleCategoryClick = (categoryName) => {
    const count = categoryCounts?.[categoryName] ?? 0;
    if (count === 0) {
      showToast(`${categoryName} collection coming soon: new pieces are being authenticated.`);
      return;
    }
    const isSelected = selectedCategory === categoryName;
    setSelectedCategory(isSelected ? null : categoryName);

    // Scroll to products section when selecting a category
    if (!isSelected) {
      setTimeout(() => {
        productsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const categorySeo = CORE_PAGES['/category'];
  const qs = searchParams.toString();
  const canonicalPath = qs ? `/category?${qs}` : '/category';
  const filteredTitle =
    selectedCategory && selectedCategory !== 'Timepieces'
      ? `${selectedCategory} — ${categorySeo.title}`
      : categorySeo.title;

  return (
    <div className="min-h-screen bg-heritage-cream">
      <SEO
        title={filteredTitle}
        description={categorySeo.description}
        keywords={categorySeo.keywords}
        canonical={canonicalPath}
      />
      <PageSchema
        type="CollectionPage"
        name={categorySeo.h1}
        description={categorySeo.description}
        path="/category"
      />
      <BreadcrumbSchema items={categorySeo.breadcrumb} />
      {/* Accessible page-level H1 for SEO (design uses the category rail as the visual header) */}
      <h1 className="sr-only">Shop Vintage Watches, Watch Collections & Rare Collectibles</h1>
      {/* Category Icons Navigation - Polished with shadow and border */}
      <section className="py-4 md:py-10 px-6 bg-white border-b border-heritage-beige shadow-sm z-20 relative">
        <div className="container mx-auto max-w-5xl">
          <Stagger
            step={80}
            className="flex justify-start md:justify-center gap-4 md:gap-8 overflow-x-auto md:overflow-visible scrollbar-hide snap-x snap-mandatory md:snap-none -mx-6 md:mx-0 px-6 md:px-0"
            childClassName="snap-start shrink-0"
          >
            {CATEGORIES.map((category) => {
              const IconComponent = category.icon;
              const isSelected = selectedCategory === category.name;
              const count = categoryCounts?.[category.name] ?? 0;
              const isEmpty = count === 0;
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.name)}
                  className={`group flex flex-col items-center text-center snap-start shrink-0 w-[72px] md:w-auto transition-opacity duration-300 ${isEmpty ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                  title={isEmpty ? `${category.name} — coming soon` : category.tagline}
                >
                  <div
                    className={`w-12 h-12 md:w-20 md:h-20 rounded-full border-2 md:border-2 flex items-center justify-center transition-all duration-300 mb-2 md:mb-3 ${
                      isSelected
                        ? 'border-heritage-gold-muted bg-luxury-gold/10 shadow-heritage-hover'
                        : 'border-heritage-beige bg-heritage-cream/50 hover:border-heritage-bronze hover:shadow-heritage group-hover:bg-heritage-cream'
                    } ${isEmpty ? 'hover:border-heritage-beige hover:shadow-none group-hover:bg-heritage-cream/50' : ''}`}
                  >
                    <IconComponent
                      size={20}
                      strokeWidth={1.2}
                      className={`md:w-7 md:h-7 transition-colors duration-300 ${
                        isSelected
                          ? 'text-luxury-gold'
                          : 'text-heritage-bronze/60 group-hover:text-heritage-bronze'
                      }`}
                    />
                  </div>
                  <div className="relative">
                    <span
                      className={`text-[10px] md:text-xs tracking-widest uppercase font-sans transition-colors duration-300 leading-tight ${
                        isSelected
                          ? 'text-heritage-charcoal font-semibold'
                          : 'text-heritage-charcoal/60 group-hover:text-heritage-charcoal'
                      }`}
                    >
                      {category.name}
                    </span>
                    {isSelected && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 md:w-6 h-0.5 bg-luxury-gold rounded-full" />
                    )}
                  </div>
                  <span className="hidden md:block text-[8px] text-heritage-bronze/50 uppercase tracking-[0.15em] mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {isEmpty ? 'Coming Soon' : category.tagline}
                  </span>
                </button>
              );
            })}
          </Stagger>
        </div>
      </section>

      {/* All Products Grid */}
      <section ref={productsRef} className="py-8 md:py-20 px-3 sm:px-4 lg:px-6 bg-white">
        <div className="w-full max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 md:mb-10 gap-2 sm:gap-3 md:gap-4 px-0 sm:px-0">
            <Reveal className="flex flex-col min-w-0 w-full sm:w-auto">
              <div className="flex items-center gap-2 md:gap-3">
                {selectedCategory ? (
                  <div className="flex items-center gap-2 md:gap-3">
                    {ActiveCategoryIcon && (
                      <ActiveCategoryIcon
                        size={22}
                        strokeWidth={1.2}
                        className="text-luxury-gold shrink-0 md:w-7 md:h-7"
                      />
                    )}
                    <div>
                      <h2 className="text-xl sm:text-3xl lg:text-4xl font-serif text-heritage-charcoal font-normal tracking-wide truncate">
                        {selectedCategory}
                      </h2>
                      {activeCategory && (
                        <p className="text-[10px] sm:text-xs text-heritage-bronze/70 uppercase tracking-[0.2em] mt-0.5 font-sans">
                          {activeCategory.tagline}
                          {categoryCounts?.[selectedCategory] != null &&
                            ` · ${categoryCounts[selectedCategory]} in stock`}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <h2 className="text-xl sm:text-3xl lg:text-4xl font-serif text-heritage-charcoal font-normal tracking-wide truncate">
                    All Listings
                  </h2>
                )}
              </div>
              {activeCategory && (
                <p className="mt-2 sm:mt-3 max-w-2xl text-xs sm:text-sm text-heritage-charcoal/60 leading-relaxed">
                  {activeCategory.description}
                </p>
              )}
            </Reveal>

            <div className="flex gap-2 w-full sm:w-auto">
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-28 sm:w-32 shrink-0 px-2.5 py-2 md:px-3 md:py-2.5 border border-heritage-beige bg-white text-[11px] md:text-sm text-heritage-charcoal focus:outline-none focus:border-heritage-bronze transition-colors appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394826e%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_8px_center] bg-no-repeat pr-7"
              >
                <option value="">All</option>
                {CONDITION_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <div className="flex-1 sm:w-40 md:w-48">
                <input
                  type="text"
                  placeholder="Search listings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 md:px-4 md:py-2.5 border border-heritage-beige bg-white text-[11px] md:text-sm text-heritage-charcoal placeholder-heritage-bronze/40 focus:outline-none focus:border-heritage-bronze transition-colors"
                />
              </div>
            </div>
          </div>

          {isLoading && products.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-100 flex flex-col animate-pulse"
                >
                  <div className="aspect-square bg-heritage-beige/60" />
                  <div className="p-2 sm:p-5 space-y-2 sm:space-y-3">
                    <div className="h-2 sm:h-2.5 bg-heritage-beige/60 rounded w-1/3" />
                    <div className="h-3 sm:h-4 bg-heritage-beige/60 rounded w-3/4" />
                    <div className="h-2 sm:h-3 bg-heritage-beige/60 rounded w-1/4" />
                    <div className="h-6 sm:h-10 bg-heritage-beige/60 rounded mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              {(() => {
                const sorted = [...products].sort((a, b) => {
                  if (a.status === 'Sold' && b.status !== 'Sold') return 1;
                  if (a.status !== 'Sold' && b.status === 'Sold') return -1;
                  return 0;
                });
                return (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                    {sorted.map((product, i) => (
                      <Reveal key={product.id} delay={i * 120} className="h-full">
                        <Tilt className="h-full">
                          <ArchiveProductCard product={product} />
                        </Tilt>
                      </Reveal>
                    ))}
                  </div>
                );
              })()}
              {totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto max-w-full pb-2 scrollbar-hide">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1 || isLoading}
                      className="px-4 py-2.5 border border-heritage-charcoal/20 text-heritage-charcoal text-xs uppercase tracking-[0.15em] font-medium hover:bg-heritage-charcoal hover:text-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Prev
                    </button>
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 7) {
                        pageNum = i + 1;
                      } else if (page <= 4) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 3) {
                        pageNum = totalPages - 6 + i;
                      } else {
                        pageNum = page - 3 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          disabled={isLoading}
                          className={`w-10 h-10 text-xs font-medium transition-all duration-300 ${
                            page === pageNum
                              ? 'bg-heritage-charcoal text-white'
                              : 'border border-heritage-charcoal/20 text-heritage-charcoal/70 hover:bg-heritage-cream'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    {totalPages > 7 && page < totalPages - 3 && (
                      <>
                        <span className="text-heritage-charcoal/40 text-xs">...</span>
                        <button
                          onClick={() => setPage(totalPages)}
                          disabled={isLoading}
                          className="w-10 h-10 text-xs font-medium border border-heritage-charcoal/20 text-heritage-charcoal/70 hover:bg-heritage-cream transition-all duration-300"
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages || isLoading}
                      className="px-4 py-2.5 border border-heritage-charcoal/20 text-heritage-charcoal text-xs uppercase tracking-[0.15em] font-medium hover:bg-heritage-charcoal hover:text-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 md:py-24 bg-heritage-cream border border-heritage-beige">
              <Gem
                size={32}
                strokeWidth={1}
                className="md:w-12 md:h-12 mx-auto text-heritage-bronze/30 mb-3 md:mb-4"
              />
              <p className="text-heritage-charcoal/60 font-serif text-sm sm:text-base lg:text-lg">
                No items found in this collection.
              </p>
              <p className="text-heritage-bronze/50 font-sans text-xs sm:text-sm mt-1 md:mt-2">
                Check back soon for new additions.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Category;

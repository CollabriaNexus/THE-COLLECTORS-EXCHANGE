import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
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
import { Reveal, Tilt } from '../components/Motion';

const CATEGORIES = [
  {
    id: 'timepieces',
    slug: 'timepieces',
    name: 'Timepieces',
    icon: Watch,
    tagline: 'The Mechanical Heartbeat',
    description:
      'Your phone tells the time. A mechanical watch tells a story. In a world of flickering screens and disposable tech, we choose the "Mechanical Truth." We don\'t sell battery-powered fashion; we rescue 17-jewel heartbeats that never need a plug or an algorithm to live.',
    metaDescription:
      'Shop authenticated vintage watches and timepieces at The Collectors Exchange. Rolex, Omega, HMT, Seiko & more, expert-verified, mid-range to rare, secure transactions across India.',
    metaKeywords:
      'vintage watches for men, vintage watches india, rolex vintage watches, omega vintage watches, hmt vintage watches, mechanical watches, pre-owned watches india',
  },
  {
    id: 'accessories',
    slug: 'accessories',
    name: 'Accessories',
    icon: Sparkles,
    tagline: 'The Perfect Finish',
    description:
      'An outfit is a statement. The right accessory makes it iconic. In a world of fast fashion and disposable trends, we choose the "Enduring Truth." We rescue the definitive finishing pieces: the cufflinks, the bags, the belts, and the heirlooms that transform the ordinary into the extraordinary.',
    metaDescription:
      'Shop authenticated vintage accessories at The Collectors Exchange: cufflinks, bags, belts, and heirloom pieces. Every piece expert-verified, secure transactions across India.',
    metaKeywords:
      'vintage accessories india, vintage cufflinks, vintage leather bags, heirloom accessories, pre-owned accessories india',
  },
  {
    id: 'collectibles',
    slug: 'collectibles',
    name: 'Collectibles',
    icon: Box,
    tagline: 'The Curated Pulse',
    description:
      'A trend lasts a season. A collectible lasts a lifetime. In a world of digital clutter and "fast-consumption," we choose the "Physical Truth." We don\'t deal in landfill-ready trinkets; we rescue the rare, the nostalgic, and the culturally significant.',
    metaDescription:
      'Shop rare, curated collectibles at The Collectors Exchange: nostalgic and culturally significant pieces, expert-verified. Secure transactions across India.',
    metaKeywords:
      'rare collectibles india, curated collectibles, vintage collectibles, pre-owned collectibles india',
  },
  {
    id: 'antiques',
    slug: 'antiques',
    name: 'Antiques',
    icon: Landmark,
    tagline: 'The Ancestral Anchor',
    description:
      'A replica fills a space. An antique commands it. In a world of flat-pack furniture and mass-produced "vintage-look" decor, we choose the "Ancestral Truth." We rescue the weathered survivors of our history, solid objects that carry the craftsman\'s soul and the weight of the generations before us.',
    metaDescription:
      'Shop authenticated antiques at The Collectors Exchange: heritage furniture, decor, and historical pieces, expert-verified. Secure transactions across India.',
    metaKeywords: 'antiques india, vintage antiques, heritage antiques, pre-owned antiques india',
  },
  {
    id: 'toys',
    slug: 'toys-and-pop-culture',
    name: 'Toys & Pop Culture',
    icon: Gamepad2,
    tagline: 'The Nostalgic Truth',
    description:
      'A plaything is for a moment. A pop icon is for the ages. In a world of disposable plastic and "over-hyped" trends, we choose the "Cultural Truth." We rescue the definitive pieces: the action figures, the limited figurines, and the media artifacts that shaped our childhoods.',
    metaDescription:
      'Shop vintage toys and pop culture collectibles at The Collectors Exchange: action figures, limited figurines, and media artifacts, expert-verified.',
    metaKeywords:
      'vintage toys india, pop culture collectibles, vintage action figures, collectible figurines india',
  },
  {
    id: 'jewelry',
    slug: 'jewelry',
    name: 'Jewelry',
    icon: Gem,
    tagline: 'The TCE Original',
    description:
      'A brand sells you a status. A TCE Original gives you a legacy. In a world of hollow "luxury" and gold-plated illusions, we choose the "Absolute Truth." After years of studying the ancestors and master artisans, we have moved from protecting history to creating it.',
    metaDescription:
      'Shop authenticated vintage jewelry at The Collectors Exchange: expert-verified craftsmanship, secure transactions across India.',
    metaKeywords: 'vintage jewelry india, pre-owned jewelry, antique jewelry india',
  },
];

// Temporary: only Accessories is being showcased for now (Timepieces hidden)
// — the other category tabs are hidden from the rail below (routes/data
// lookups still use the full CATEGORIES list, so nothing else breaks). To
// bring the rest back, change this back to `CATEGORIES`.
const VISIBLE_CATEGORIES = CATEGORIES.filter((category) => category.id === 'accessories');

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
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden group hover:shadow-heritage transition-all duration-500 flex flex-col h-full">
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
        <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 bg-white/90 backdrop-blur-sm text-heritage-charcoal/70 text-[10px] sm:text-xs px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-sans tracking-widest uppercase">
          {product.condition || 'Excellent'}
        </div>

        {/* Sold Badge */}
        {product.status === 'Sold' && (
          <div className="absolute inset-0 bg-heritage-charcoal/40 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-white/90 text-heritage-charcoal text-[10px] sm:text-xs font-bold px-3 sm:px-4 py-1 sm:py-1.5 rounded-full uppercase tracking-widest shadow-lg">
              Sold Out
            </span>
          </div>
        )}

        {/* Verified Badge */}
        {product.isVerified && (
          <div className="absolute bottom-1.5 left-1.5 sm:bottom-3 sm:left-3 bg-heritage-charcoal/90 backdrop-blur-sm text-white text-[10px] px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-sans tracking-widest uppercase flex items-center gap-1">
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
        <span
          className="inline-flex items-center mt-1 text-heritage-bronze/60"
          title="Authenticity Guaranteed · 48-Hr Returns"
        >
          <ShieldCheck size={13} strokeWidth={1.5} className="shrink-0" />
          <span className="sr-only">Authenticity guaranteed · 48-hour returns</span>
        </span>

        {/* Add to Cart / Sold Button */}
        {product.status === 'Sold' ? (
          <div className="w-full py-2 sm:py-2.5 md:py-3 rounded-full text-[10px] sm:text-xs md:text-sm uppercase tracking-[0.12em] sm:tracking-[0.15em] flex items-center justify-center gap-1 sm:gap-2 bg-gray-100 text-gray-400 cursor-default mt-1.5 sm:mt-2">
            <XCircle size={11} className="sm:w-4 sm:h-4" />
            Sold Out
          </div>
        ) : (
          <button
            onClick={inCart ? () => navigate('/cart') : cartFeedback ? undefined : handleAddToCart}
            disabled={addToCartMutation.isPending || cartFeedback}
            className={`w-full py-2 sm:py-2.5 md:py-3 rounded-full text-[10px] sm:text-xs md:text-sm uppercase tracking-widest transition-colors duration-300 flex items-center justify-center gap-1 sm:gap-2 active:scale-[0.97] mt-1.5 sm:mt-2 ${
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
  // Filter state is mirrored to the URL (?cat=&q=&condition=&page=) so views
  // remain shareable. Query views are noindex and canonicalize to the matching
  // clean category landing when the category vocabulary is recognized.
  const { categorySlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const routeCategory = CATEGORIES.find(
    (category) => category.slug === categorySlug?.toLowerCase(),
  );
  const requestedQueryCategory = searchParams.get('cat');
  const queryCategory = CATEGORIES.find(
    (category) => category.name.toLowerCase() === requestedQueryCategory?.toLowerCase(),
  );
  const initialCategory = routeCategory?.name || queryCategory?.name || requestedQueryCategory;
  // Whether this load explicitly requested a category via the URL (a real
  // link, a crawler, a shared URL) — as opposed to landing on the bare
  // default. Captured once at mount so the empty-category redirect below
  // never overrides an explicit choice, only the un-parameterized default.
  const hadExplicitCategory = useRef(Boolean(routeCategory || requestedQueryCategory));
  const [selectedCategory, setSelectedCategory] = useState(() => initialCategory || 'Accessories');
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || '');
  const [condition, setCondition] = useState(() => searchParams.get('condition') || '');
  const [page, setPage] = useState(() => Number(searchParams.get('page')) || 1);
  const { data, isLoading } = useProducts(selectedCategory, searchQuery, page, 20, null, condition);
  const { data: categoryCounts } = useCategoryCounts();

  useEffect(() => {
    // Keep unknown facets/sort keys in place so they remain explicit
    // noindex query views rather than silently becoming a clean URL.
    const params = new URLSearchParams(searchParams);
    if (
      !routeCategory &&
      selectedCategory &&
      (hadExplicitCategory.current || selectedCategory !== 'Accessories')
    ) {
      params.set('cat', selectedCategory);
    } else {
      params.delete('cat');
    }
    if (searchQuery) params.set('q', searchQuery);
    else params.delete('q');
    if (condition) params.set('condition', condition);
    else params.delete('condition');
    if (page > 1) params.set('page', String(page));
    else params.delete('page');

    if (params.toString() !== searchParams.toString()) {
      setSearchParams(params, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, searchQuery, condition, page]);

  const products = data?.products || [];
  const totalPages = data?.totalPages || 1;
  const activeCategory = CATEGORIES.find((c) => c.name === selectedCategory);
  const ActiveCategoryIcon = activeCategory?.icon;

  useEffect(() => {
    if (routeCategory) setSelectedCategory(routeCategory.name);
  }, [routeCategory]);

  useEffect(() => {
    if (hadExplicitCategory.current) return;
    if (categoryCounts && selectedCategory) {
      const count = categoryCounts[selectedCategory] ?? 0;
      if (count === 0) {
        const firstWithItems = CATEGORIES.find((c) => (categoryCounts[c.name] ?? 0) > 0);
        setSelectedCategory(firstWithItems?.name || null);
      }
    }
  }, [categoryCounts, selectedCategory]);

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

  const categorySeo = CORE_PAGES['/category'];
  const canonicalCategory = routeCategory || (!categorySlug ? queryCategory : null);
  const hasTransientQueryState =
    searchParams.toString().length > 0 || Boolean(categorySlug && !routeCategory);
  const canonicalPath = canonicalCategory ? `/category/${canonicalCategory.slug}` : '/category';
  const filteredTitle = canonicalCategory
    ? `${canonicalCategory.name} | ${categorySeo.title}`
    : categorySeo.title;
  const breadcrumbItems = canonicalCategory
    ? [
        ...categorySeo.breadcrumb,
        { name: canonicalCategory.name, url: `/category/${canonicalCategory.slug}` },
      ]
    : categorySeo.breadcrumb;
  const pageHeading = canonicalCategory
    ? `Shop ${canonicalCategory.name}`
    : 'Shop Vintage Watches, Watch Collections & Rare Collectibles';

  return (
    // hero-bleed pulls the page's own background up behind the floating nav
    // so the generic layout background doesn't show through as a seam.
    <div className="hero-bleed min-h-screen bg-heritage-cream">
      <SEO
        title={filteredTitle}
        description={activeCategory?.metaDescription || categorySeo.description}
        keywords={activeCategory?.metaKeywords || categorySeo.keywords}
        canonical={canonicalPath}
        noindex={hasTransientQueryState}
        nofollow={false}
      />
      <PageSchema
        type="CollectionPage"
        name={filteredTitle}
        description={activeCategory?.metaDescription || categorySeo.description}
        path={canonicalPath}
      />
      <BreadcrumbSchema items={breadcrumbItems} />
      {/* Accessible page-level H1 for SEO (design uses the category rail as the visual header) */}
      <h1 className="sr-only">{pageHeading}</h1>
      {/* Category Icons Navigation is hidden for now, alongside VISIBLE_CATEGORIES
          above — with only Accessories showing, a selector rail with one tab
          just looked broken. Restore both together when more categories are live. */}

      {/* All Products Grid */}
      <section ref={productsRef} className="py-5 sm:py-8 md:py-20 px-3 sm:px-4 lg:px-6 bg-white">
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
            </Reveal>

            <div className="flex gap-2 w-full sm:w-auto">
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-28 sm:w-32 shrink-0 px-2.5 py-2 md:px-3 md:py-2.5 rounded-full border border-heritage-beige bg-white text-[11px] md:text-sm text-heritage-charcoal focus:outline-none focus:border-heritage-bronze transition-colors appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394826e%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_8px_center] bg-no-repeat pr-7"
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
                  className="w-full px-4 py-2 md:px-4 md:py-2.5 rounded-full border border-heritage-beige bg-white text-[11px] md:text-sm text-heritage-charcoal placeholder-heritage-bronze/40 focus:outline-none focus:border-heritage-bronze transition-colors"
                />
              </div>
            </div>
          </div>

          {isLoading && products.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col animate-pulse"
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
                    {sorted.map((product) => (
                      <Tilt key={product.id} className="h-full">
                        <ArchiveProductCard product={product} />
                      </Tilt>
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
                      className="px-4 py-2.5 rounded-full border border-heritage-charcoal/20 text-heritage-charcoal text-xs uppercase tracking-[0.15em] font-medium hover:bg-heritage-charcoal hover:text-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
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
                          className={`w-10 h-10 rounded-full text-xs font-medium transition-all duration-300 ${
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
                          className="w-10 h-10 rounded-full text-xs font-medium border border-heritage-charcoal/20 text-heritage-charcoal/70 hover:bg-heritage-cream transition-all duration-300"
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages || isLoading}
                      className="px-4 py-2.5 rounded-full border border-heritage-charcoal/20 text-heritage-charcoal text-xs uppercase tracking-[0.15em] font-medium hover:bg-heritage-charcoal hover:text-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 md:py-24 rounded-2xl bg-heritage-cream border border-heritage-beige">
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

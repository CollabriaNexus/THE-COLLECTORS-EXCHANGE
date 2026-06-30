# The Collectors Exchange — Design System

**Style:** Liquid Glass + Luxury Minimalist  
**Product:** E-commerce Luxury Marketplace (Collectibles & Antiques)  
**Version:** 1.0.0

---

## 1. Design Principles

| Principle | Meaning |
|-----------|---------|
| **Authoritative & Verified** | Every element communicates trust, curation, and authenticity |
| **Luxury Minimalist** | Fewer elements, higher quality. Sharp borders, generous whitespace, deliberate typography |
| **Liquid Glass** | Translucency, smooth transitions, depth through blur and light. Premium, airy, modern |
| **Hierarchy Through Contrast** | Gold accents guide attention. Dark/large headers establish authority |
| **Content First** | Products are the hero. UI recedes to let collectibles speak |

---

## 2. Visual Identity

### 2.1 Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `bg-primary` | `#FFFFFF` | Card & section backgrounds |
| `bg-secondary` | `#F9F9F9` | Layout/section backgrounds |
| `text-main` | `#000000` | Primary text, headings |
| `text-inverse` | `#FFFFFF` | Text on dark backgrounds |
| `text-muted` | `#6B7280` | Secondary text, metadata |

#### Brand Accents

| Token | Hex | Usage |
|-------|-----|-------|
| `luxury-gold` | `#D4AF37` | **Primary accent** — price tags, hover states, branding, CTAs |
| `gold-muted` | `#C9A962` | Subtle gold — borders, dividers, secondary accents |
| `luxury-charcoal` | `#1C1C1C` | Dark backgrounds, footer, hover overlays |
| `luxury-bronze` | `#8B7355` | Secondary accent — metadata, tertiary elements |
| `luxury-cream` | `#FAF8F5` | Sophisticated light background — gallery, featured sections |

#### Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `success` | `#059669` | Verified, delivered, approved |
| `warning` | `#D97706` | Pending, in review, processing |
| `error` | `#DC2626` | Rejected, failed, error states |
| `info` | `#2563EB` | Information, links |

#### Color Application Rules

- **CTAs**: Black background (`bg-luxury-charcoal`), white text. Hover → `bg-luxury-gold` with `text-black`
- **Price tags**: `text-luxury-gold` always. Never use green for prices
- **Badges**: High-contrast — Black/White or Gold/White. `tracking-widest` uppercase
- **Links**: Black text with gold underline on hover
- **Borders**: `1px solid #F3F4F6` (gray-100) for cards. `1px solid #E5E7EB` for dividers

### 2.2 Typography

| Role | Font | Weight | Size Scale |
|------|------|--------|------------|
| **H1** | Playfair Display | 700 (Bold) | `text-4xl` → `text-6xl` |
| **H2** | Playfair Display | 600 (Semi-bold) | `text-3xl` → `text-5xl` |
| **H3** | Playfair Display | 600 (Semi-bold) | `text-2xl` → `text-3xl` |
| **H4-H6** | Playfair Display | 400 (Regular) | `text-xl` → `text-2xl` |
| **Body** | Inter | 400 (Regular) | `text-base` |
| **Small/Label** | Inter | 500 (Medium) | `text-sm`, `tracking-widest` |
| **Button** | Inter | 600 (Semi-bold) | `text-sm`, `tracking-widest` |

```css
/* Google Fonts Import */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap');

/* Tailwind Config */
fontFamily: {
  serif: ['Playfair Display', 'serif'],
  sans: ['Inter', 'sans-serif'],
}
```

#### Typography Rules

- **Headings only** use Playfair Display. Everything else is Inter
- **Uppercase labels**: Always `tracking-widest` (0.1em). Never use uppercase for body text
- **Line height**: Headings `leading-tight` (1.25), Body `leading-relaxed` (1.625)
- **Never underline** text unless it's a link

### 2.3 Spacing

| Token | Value | Usage |
|-------|-------|-------|
| Section padding | `py-20` (80px) | Standard sections |
| Hero padding | `py-24` to `py-40` | Hero/featured sections |
| Container | `mx-auto px-6` | Standard page wrapper |
| Card padding | `p-6` | Internal card spacing |
| Grid gap | `gap-6` to `gap-8` | Between cards |
| Stack spacing | `space-y-4` | Content within cards |

### 2.4 Effects & Borders

| Token | Value | Usage |
|-------|-------|-------|
| Border radius | `rounded-none` or `rounded-sm` | Cards, sections — sharp, precision feel |
| Border radius (icons) | `rounded-full` | Action icons (wishlist, cart) |
| Shadow (default) | `0 4px 20px rgba(0,0,0,0.08)` | Cards, dropdowns |
| Shadow (hover) | `0 8px 30px rgba(0,0,0,0.12)` | Interactive states |
| Transition | `transition-all duration-300` | All interactive elements |
| Image blend | `mix-blend-multiply` | Product shots on light backgrounds |
| Glass effect | `backdrop-blur-sm bg-white/80` | Navbars, overlays |

#### Liquid Glass Effects

Use sparingly for premium moments — hero overlays, featured sections, modals:

```css
/* Glass card */
bg-white/80 backdrop-blur-md border border-white/20

/* Glass navigation */
bg-white/70 backdrop-blur-lg border-b border-gray-100
```

---

## 3. Component Library

### 3.1 Buttons

| Type | Style | States |
|------|-------|--------|
| **Primary** | `bg-black text-white uppercase tracking-widest text-sm px-8 py-3` | Hover: `bg-luxury-gold text-black` |
| **Secondary** | `bg-transparent border border-black text-black uppercase tracking-widest text-sm px-8 py-3` | Hover: `bg-black text-white` |
| **Gold** | `bg-luxury-gold text-black uppercase tracking-widest text-sm px-8 py-3` | Hover: `brightness-90` |
| **Ghost** | `bg-transparent text-black` | Hover: `bg-gray-100` |
| **Icon** | `p-2 rounded-full` | Hover: `bg-gray-100` |

Button rules:
- Always `cursor-pointer`
- Always `transition-all duration-300`
- Never use scale transforms on hover (causes layout shift)
- Disabled state: `opacity-50 cursor-not-allowed`

### 3.2 Cards

| Type | Layout | Style |
|------|--------|-------|
| **ProductCard** | Image top + content bottom | `rounded-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-heritage-hover` |
| **AuctionCard** | Same as Product + timer | Add `border-l-4 border-luxury-gold` for live auctions |
| **GalleryCard** | Museum-style, full-bleed image | `aspect-[4/3] overflow-hidden` with overlay text |
| **FeatureCard** | Icon + title + description | `p-6 border border-gray-100 rounded-sm` |

ProductCard specific:
- Image: `aspect-square` or `aspect-[4/3]`, `object-cover`
- Title: Playfair Display, `text-lg font-semibold`
- Price: Inter, `text-luxury-gold font-semibold`
- Badge: Inter, `text-[10px] tracking-[0.2em] uppercase`
- "Acquire Now" button: Bottom-aligned, full-width on mobile

### 3.3 Navigation

| Element | Style |
|---------|-------|
| **Header** | Sticky top, `bg-white/70 backdrop-blur-lg border-b border-gray-100` |
| **Logo** | Playfair Display, gold accent |
| **Nav links** | Inter, `text-sm tracking-widest uppercase`, `hover:text-luxury-gold` |
| **Footer** | `bg-luxury-charcoal text-white`, multi-column layout |
| **Breadcrumb** | Inter `text-xs tracking-widest uppercase`, separator: `/` |

### 3.4 Form Elements

| Element | Style |
|---------|-------|
| **Text input** | `border border-gray-300 rounded-sm px-4 py-2.5 focus:ring-1 focus:ring-black focus:border-black` |
| **Select** | Same as input, with custom chevron |
| **Checkbox/Radio** | Custom styled, `accent-black` |
| **Label** | Inter `text-sm font-medium` |
| **Error** | `text-error text-sm` below input |
| **Search** | Large input with icon, `border-b-2 border-black` for hero search |

---

## 4. Page Templates

### 4.1 Home Page
```
Hero (full-bleed video/image + overlay heading + search)
Category Grid (5 categories: Timepieces, Collectibles, Antiques, Jewelry, Toys)
Featured / "Most Rare" Section (top 3 products, museum-style cards)
Trust/Verification Section (KYC badge, authentication process)
Seller Policy / CTA
Footer
```

### 4.2 Product Listing ("The Exchange")
```
Header + Filter Bar (category pills, sort, search)
Product Grid (responsive: 2 cols mobile → 4 cols desktop)
Pagination (numbered, prev/next)
```

### 4.3 Product Detail
```
Image Gallery (main image + thumbnails, lightbox)
Product Info (title, price, condition, description, seller)
Action Panel (Add to Cart, Wishlist, Buy Now)
Suggested Products (category-based, horizontal scroll)
```

### 4.4 Checkout
```
Shipping Form (address, city, state, PIN, phone)
Order Summary (items, subtotal, 5% platform fee, total)
Payment (Razorpay integration)
Confirmation (order ID, tracking placeholder)
```

### 4.5 Admin Dashboard
```
Stats Cards (total users, pending KYC, products, orders)
Revenue Chart (line, 30 days)
User Growth (bar, daily)
Orders by Status (pie)
Products by Category (horizontal bar)
```

---

## 5. Design Patterns

### 5.1 Product Imagery
- **Aspect ratio**: Square (1:1) for consistency
- **Background**: Remove or neutralize. Use `mix-blend-multiply` for transparent products
- **Hover**: `scale-105` with `duration-500` — smooth zoom, no layout shift
- **Gallery**: Thumbnail strip + main image. Click opens lightbox

### 5.2 Loading & Empty States
- **Loading**: Skeleton screens (`animate-pulse bg-gray-200`) matching card layout
- **Empty**: Illustration + message + CTA (e.g., "Your wishlist is empty — start exploring")
- **Error**: Inline error message with retry button, never a blank page

### 5.3 Notifications
- **Position**: Top-right toast, `z-50`
- **Animation**: Slide in from right, `duration-300`
- **Auto-dismiss**: 5 seconds for success, persistent for errors
- **Types**: Success (green left border), Error (red), Info (blue), Warning (amber)

### 5.4 Animations
- **Transitions**: `transition-all duration-300` — standard
- **Image zoom**: `duration-500` — product cards on hover
- **Page load**: Avoid animate-in. Content should appear immediately
- **Infinite animations**: Only for loading spinners. Never for decorative elements
- **Motion**: Respect `prefers-reduced-motion` — disable all animations

---

## 6. Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| **Mobile** | < 640px | 1 column grid, hamburger nav, full-width buttons |
| **Tablet** | 640px – 1023px | 2 column grid, collapsed sidebar |
| **Desktop** | 1024px – 1279px | 3-4 column grid, full nav |
| **Wide** | ≥ 1280px | Max container, 4 column grid |

---

## 7. Iconography

- **Library**: `lucide-react` only. Never use emoji as UI icons
- **Size**: `w-5 h-5` (standard), `w-6 h-6` (nav), `w-4 h-4` (inline)
- **Stroke**: `strokeWidth={1.5}` default, `strokeWidth={2}` for small icons
- **Color**: Inherited from text color, unless semantic (gold for cart, red for delete)

---

## 8. Accessibility

- **Color contrast**: All text meets WCAG AA (4.5:1 minimum)
- **Focus states**: Visible `ring-2 ring-black ring-offset-2` on all interactive elements
- **Keyboard navigation**: All functionality available via keyboard
- **ARIA labels**: Icons use `aria-hidden="true"`, interactive icons use `aria-label`
- **Reduced motion**: `@media (prefers-reduced-motion: no-preference)` for animations
- **Form labels**: Every input has a visible `<label>`
- **Images**: All `<img>` tags have descriptive `alt` text

---

## 9. Anti-Patterns (Do NOT)

| Anti-pattern | Instead |
|-------------|---------|
| Emoji icons (🚀, 🎨, ⭐) | Use lucide-react SVG icons |
| Rounded corners on cards/buttons | Sharp corners (`rounded-none` or `rounded-sm`) |
| Scale transforms on hover for nav items | Color/opacity transitions only |
| Green or blue prices | Gold only (`luxury-gold/#D4AF37`) |
| Mixed icon sizes | Consistent `w-5 h-5` |
| Infinite decorative animations | Motion only for loading states |
| Custom CSS classes | Tailwind utilities only |
| z-index: 9999 without stacking context | Understand and manage stacking contexts |
| Text color below #475569 (slate-600) for body | `text-main` (#000000) or `text-muted` (#6B7280) |

---

## 10. File Organization

```
tailwind.config.js          — Custom colors (luxury-gold, heritage), fonts, shadows
src/
├── components/
│   ├── ui/                 — Reusable: Button, Card, Badge, Toast, Modal
│   ├── layout/             — Header, Footer, Layout, Sidebar
│   └── product/            — ProductCard, ProductGrid, ProductDetail
src/
├── hooks/api/              — TanStack Query hooks
├── pages/                  — Route-level page components
├── utils/storage.js        — Cart, wishlist persistence
└── styles/                 — Global CSS, Tailwind layers
```

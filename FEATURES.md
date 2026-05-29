# The Collectors Exchange — Feature Documentation

## Overview

A curated marketplace for verified pre-owned collectibles, antiques, and limited pieces. Built with React (Vite) frontend, Fastify backend, PostgreSQL (Supabase), Razorpay payments, and Cloudflare Pages deployment.

---

## User Features

### 1. Authentication & Account

| Feature | Status | Details |
|---------|--------|---------|
| Email OTP Login | ✅ | Supabase magic link via email OTP |
| Google OAuth | ✅ | Sign in with Google |
| Registration | ✅ | Name, email, phone, password, account type (Individual/Company) |
| Profile Viewing | ✅ | Name, email, phone, membership type |
| Profile Editing | ✅ | Edit name and phone |
| Phone Verification | ✅ | Send/verify OTP via simulated SMS |
| KYC/Verification Upload | ✅ | Aadhaar, PAN, GST, company docs with file upload + digital signature |
| Seller Agreement Acceptance | ✅ | Digital signature during KYC flow |
| Notifications | ✅ | Bell icon, notification panel, mark read/all read, polls every 30s |
| Sign Out | ✅ | Clears local session |

### 2. Product Browsing & Discovery

| Feature | Status | Details |
|---------|--------|---------|
| Category Grid | ✅ | "The Exchange" page with category cards |
| Categories | ✅ | Timepieces, Collectibles, Antiques, Jewelry, Toys & Pop Culture |
| Search Products | ✅ | Text search across titles |
| Category Filtering | ✅ | Filter products by category |
| Pagination | ✅ | Prev/Next with page numbers |
| "Most Rare" Featured Section | ✅ | Top 3 highest-priced products with museum-style cards |
| Product Detail Page | ✅ | Image gallery, markdown description, condition, price, seller info, keywords |
| Suggested Products | ✅ | Category-based recommendations on product detail |
| Auction House | ✅ | Live/Upcoming/Past auction tabs with bid UI |

### 3. Shopping & Transactions

| Feature | Status | Details |
|---------|--------|---------|
| Add to Cart | ✅ | From product cards and detail page |
| Cart View | ✅ | Item list, quantities, remove items |
| Order Summary | ✅ | Subtotal, 5% platform fee, total |
| Wishlist | ✅ | Heart icon toggle, wishlist page with add-to-cart |
| Checkout | ✅ | Shipping form (address, city, state, PIN, phone) |
| Payment Integration | ✅ | Razorpay (mock/live mode) |
| Order Confirmation | ✅ | Post-payment success screen |
| My Orders (User) | ✅ | Order list with status, items, tracking ID, totals |

### 4. Vendor Dashboard

| Feature | Status | Details |
|---------|--------|---------|
| Stats Cards | ✅ | Order count, items sold, revenue, pending payout |
| Sales Graph | ✅ | Line chart (Recharts) with daily revenue |
| Customer Interest Funnel | ✅ | Views → cart adds → checkout starts, conversion rates |
| Top Products | ✅ | Best sellers in period |
| Payouts Dashboard | ✅ | History with filters, request payout |
| Listings Overview | ✅ | Total listings, active, orders, revenue |
| Period Selector | ✅ | 7d, 10d, 15d, 30d, quarterly, 6m, 1y, all time |

### 5. Content & Information Pages

| Page | Route | Status |
|------|-------|--------|
| Home | `/` | ✅ Hero video, featured products, verification section, seller policy |
| About | `/about` | ✅ Brand story, mission, vision |
| About Us (modular) | `/about-us` | ✅ HeroManifesto, MissionValues, Genesis, OdysseyTimeline |
| Vision | `/vision` | ✅ Brand philosophy |
| Founder's Note | `/founders-note` | ✅ Founder story |
| The Gallery | `/gallery` | ✅ Museum-style archive by themes |
| Gallery Detail | `/gallery/:id` | ✅ Archival view with provenance, metadata |
| Gallery Articles | `/gallery/article/:slug` | ✅ Educational articles (7 articles) |
| Privacy Policy | `/privacy` | ✅ Comprehensive policy |
| Terms & Conditions | `/terms` | ✅ Custodianship Agreement |
| Seller Agreement | `/seller-agreement` | ✅ Full seller legal agreement |
| Contact Us | `/contact` | ✅ Contact form + support email + partnerships email |
| FAQ | `/faq` | ✅ Searchable FAQ (Buying, Selling, Account, Shipping) |

### 6. Navigation & Layout

| Feature | Details |
|---------|---------|
| Header | ✅ About, The Exchange, The Gallery, Auction, Vision, Wishlist, Cart, Account |
| Footer | ✅ Brand left, Company/Support/Legal links right, social icons |

---

## Admin Features

### 1. Dashboard

| Feature | Status | Details |
|---------|--------|---------|
| Stats Overview | ✅ | Total Users, Pending KYC, Total Products, Orders |
| Revenue Chart | ✅ | Line chart — last 30 days |
| User Growth Chart | ✅ | Bar chart — new users per day |
| Orders by Status | ✅ | Pie chart |
| Products by Category | ✅ | Horizontal bar chart |

### 2. KYC Management

| Feature | Status | Details |
|---------|--------|---------|
| List Requests | ✅ | Status filter, search, all KYC data |
| View Request Detail | ✅ | Full KYC submission display |
| Approve KYC | ✅ | With optional notes, auto-creates vendor profile |
| Reject KYC | ✅ | With required reason |
| Notifications | ✅ | Auto-sent on approve/reject |

### 3. User Management

| Feature | Status | Details |
|---------|--------|---------|
| List Users | ✅ | Role filter, search |
| View User Detail | ✅ | Products, cart, wishlist, vendor/subscription info |
| Change Role | ✅ | user/admin/curator |
| Ban / Unban User | ✅ | With notification |
| Whitelist Vendor | ✅ | With plan selection (CUSTOM_APPROVED, BULK_YEARLY, BULK_MONTHLY) |

### 4. Product Management

| Feature | Status | Details |
|---------|--------|---------|
| List Products | ✅ | Category/status filter, search |
| View Product Detail | ✅ | Image, price, category, brand, status, seller info |
| Start Review | ✅ | Pending → In Review |
| Approve & Publish | ✅ | Sets Verified, publishes, notifies seller |
| Reject | ✅ | With reason, notifies seller |
| Delete Product | ✅ | With confirmation modal |
| Edit Brand & Listing Category | ✅ | normal/featured/most_rare |
| Update Authenticity Status | ✅ | Pending/Verified/Rejected/Under Review |

### 5. Order Management

| Feature | Status | Details |
|---------|--------|---------|
| List Orders | ✅ | Status filter, search |
| View Order Detail | ✅ | Items, shipping address, customer, totals |
| Order Fulfillment Workflow | ✅ | Timeline: Processing → Shipped → Delivered |
| Tracking ID Entry | ✅ | Delhivery AWB support |
| Status Notifications | ✅ | Auto-sent to buyer |
| Print Packing Slip | ✅ | Placeholder |

### 6. Vendor Management

| Feature | Status | Details |
|---------|--------|---------|
| List Verified Sellers | ✅ | KYC-verified users |
| Stats | ✅ | Total sellers, KYC verified, pending review |
| Whitelist as Bulk Vendor | ✅ | Plan selection |
| Search | ✅ | By name or email |

### 7. Payout Management

| Feature | Status | Details |
|---------|--------|---------|
| List Payouts | ✅ | Status filter, pagination |
| Create Payout | ✅ | Vendor, amount, period, note |
| Update Status | ✅ | Process, Mark Paid, Fail |
| Audit Logging | ✅ | All payout actions logged |
| Notifications | ✅ | Auto-sent to vendor |

### 8. Gallery Management

| Feature | Status | Details |
|---------|--------|---------|
| List Items | ✅ | Grid view |
| Create Item | ✅ | Title, teaser, description, images, origin, time period, institution, significance, theme |
| Edit Item | ✅ | Update all fields |
| Delete Item | ✅ | |

---

## Technical Architecture

### Frontend (User)
- React 19 + Vite
- Tailwind CSS v4
- React Router v7
- TanStack React Query
- Recharts (vendor dashboard)
- Lucide React (icons)
- Supabase JS (auth)
- Razorpay (payments)

### Frontend (Admin)
- React 18 + Vite
- Tailwind CSS v3
- React Router v7
- TanStack React Query
- Recharts (dashboard charts)
- Lucide React (icons)

### Backend
- Fastify (Node.js)
- PostgreSQL via Prisma ORM
- Supabase Auth (JWT verification)
- Zod (validation)
- Razorpay (payment verification)
- Delhivery (shipping)

### Database Models (Prisma)
User, Product, CartItem, WishlistItem, Order, OrderItem, Vendor, VendorSubscription, Notification, AuditLog, Auction, AuctionBid, GalleryItem, ProductView, CartEvent, CheckoutEvent, Payout, PhoneVerification

### Deployment
- **User Frontend**: Cloudflare Pages (`tce-user.pages.dev`)
- **Admin Frontend**: Cloudflare Pages (`tce-admin.pages.dev`)
- **Backend**: Render (`the-collectors-exchange.onrender.com`)
- **Database**: Supabase PostgreSQL

---

## API Endpoints

### Public
- `GET /api/products` — List published products
- `GET /api/products/:id` — Product detail
- `GET /api/gallery` — List gallery items
- `GET /api/gallery/:id` — Gallery detail
- `GET /api/auctions` — List auctions
- `GET /api/auctions/:id` — Auction detail with bids
- `POST /api/analytics/view` — Log product view
- `GET /health` — Health check

### Authenticated
- `POST /api/users/register` — Register/sync user
- `GET /api/users/me` — Current user profile
- `PATCH /api/users/me` — Update profile
- `GET /api/users/:id` — User by ID
- `GET /api/users/orders` — User orders
- `GET /api/users/notifications` — User notifications
- `PATCH /api/users/notifications/read-all` — Mark all read
- `PATCH /api/users/notifications/:id/read` — Mark single read
- `POST /api/users/kyc` — Submit KYC
- `POST /api/users/seller-agreement/accept` — Accept agreement
- `POST /api/users/otp/send` — Send OTP
- `POST /api/users/otp/verify` — Verify OTP
- `POST /api/products` — Create product
- `PUT /api/products/:id` — Update product
- `DELETE /api/products/:id` — Delete product
- `GET /api/cart/:userId` — Get cart
- `POST /api/cart` — Add to cart
- `DELETE /api/cart` — Remove from cart
- `GET /api/wishlist/:userId` — Get wishlist
- `POST /api/wishlist` — Add to wishlist
- `DELETE /api/wishlist` — Remove from wishlist
- `POST /api/checkout/create-order` — Create payment order
- `POST /api/checkout/verify-payment` — Verify payment
- `POST /api/auctions/:id/bid` — Place bid
- `POST /api/analytics/cart` — Log cart event
- `POST /api/analytics/checkout` — Log checkout event
- `POST /api/contact` — Contact form submission
- `GET /api/vendor/profile` — Vendor profile
- `GET /api/vendor/stats` — Vendor stats
- `GET /api/vendor/analytics/*` — Vendor analytics
- `GET /api/vendor/payouts` — Vendor payouts
- `POST /api/vendor/payouts/request` — Request payout
- `POST /api/vendor/subscribe` — Subscribe to plan

### Admin Only
- `GET /api/admin/stats/overview` — Dashboard stats
- `GET /api/admin/stats/analytics` — Chart data
- `GET/PATCH /api/admin/kyc/requests/*` — KYC management
- `GET /api/admin/users` — List users
- `GET /api/admin/users/:id` — User detail
- `PATCH /api/admin/users/:id/role` — Change role
- `PATCH /api/admin/users/:id/ban` — Ban user
- `PATCH /api/admin/users/:id/unban` — Unban user
- `POST /api/admin/vendor/:userId/whitelist` — Whitelist vendor
- `GET /api/admin/products` — List products
- `GET /api/admin/products/:id` — Product detail
- `PATCH /api/admin/products/:id/review` — Start review
- `PATCH /api/admin/products/:id/approve` — Approve product
- `PATCH /api/admin/products/:id/reject` — Reject product
- `PATCH /api/admin/products/:id/authenticity` — Update authenticity
- `DELETE /api/admin/products/:id` — Delete product
- `PATCH /api/admin/products/:id` — Edit brand/listingCategory
- `GET /api/admin/orders` — List orders
- `GET /api/admin/orders/:id` — Order detail
- `PATCH /api/admin/orders/:id/status` — Update status
- `PATCH /api/admin/orders/:id/ship` — Ship with tracking
- `GET/POST /api/admin/payouts` — List/create payouts
- `PATCH /api/admin/payouts/:id/status` — Update payout status
- `GET/POST/PUT/DELETE /api/admin/gallery/*` — Gallery CRUD

---

## Missing Planned Features

- Product reviews & ratings
- Seller-to-buyer messaging
- Coupon/discount codes
- Newsletter signup
- Dark mode toggle
- Multi-language support

# Security & Code Audit — Progress Tracker

**Total: 61 issues** — ✅ Fixed: 58  |  🟣 Deferred: 3 (#18 enums migration, #35 Account.jsx refactor, #39 enum case consistency)

## E2E Testing Setup (added 2026-06-23)

- Installed `@playwright/test` + Chromium browser
- Created `tests/` directory with 38 tests across 5 flows:
  - **Guest browsing** (10 tests): Home, category, product detail, auction, gallery, about, FAQ, contact, 404, navigation
  - **Auth → Cart → Checkout** (5 tests): Account form, wishlist, cart display, checkout redirect, cart total calc
  - **Seller lifecycle** (6 tests): Vendor dashboard, seller agreement, products, KYC, payouts, API check
  - **Admin management** (11 tests): Login, dashboard, KYC, users, orders, products, vendors, payouts, gallery, API checks
  - **Vendor operations** (6 tests): Metrics, analytics, orders, product listing, API checks
- Added 9 backend API bugs to GitHub project board (4 P0, 2 P1, 3 P2)
- Test runner: `npm test` | `npm run test:headed` | `npm run test:ui` | `npm run test:debug`
- ⚠️ Prerequisites: Set `TEST_EMAIL`/`TEST_PASSWORD` (and optionally `TEST_ADMIN_EMAIL`/`TEST_ADMIN_PASSWORD`) in environment or `tests/.env.test`

---

## 🔴 CRITICAL — 2 remaining

| # | Issue | Fixed? | Notes |
|---|-------|--------|-------|
| 1 | GET /:id no ownership check | ✅ | Fixed in users.js:77 |
| 2 | KYC forgery (userId from body) | ✅ | Fixed in users.js:193 |
| 3 | Seller agreement forgery | ✅ | Fixed in users.js:208 |
| 4 | **Order hijack via verify-payment** | ✅ | Already had check in current code (checkout.js:187) |
| 5 | Double-purchase race | ✅ | Fixed in checkout.js:58 |
| 6 | Duplicate payment processing | ✅ | Fixed in checkout.js:188 |
| 7 | Unpublished products accessible | ✅ | Fixed in products.js:77 |
| 8 | Vendor rating without purchase | ✅ | Verified — purchase check exists (vendor.js:332-357) |
| 9 | Rating race condition | ✅ | Fixed in vendor.js:484 |
| 10 | **Vendor ships entire multi-vendor order** | ✅ | Verified — per-item shipping, order status updates only when all shipped (vendor.js:405-438) |
| 11 | XCircle not imported | ✅ | Fixed in Account.jsx |
| 12 | Password login missing | ✅ | Fixed in Account.jsx |
| 13 | No Sold Out state | ✅ | Fixed in ProductDetail.jsx |
| 14 | Razorpay error handling | ✅ | Fixed in Checkout.jsx |
| 15 | Shipping missing recipient name | ✅ | Fixed in Checkout.jsx |
| 16 | PhoneVerification callback never fires | ✅ | Fixed in Account.jsx |

## 🟠 HIGH — 16 remaining (or verify already fixed)

| # | Issue | Fixed? | Notes |
|---|-------|--------|-------|
| 17 | Testimonial userId has no @relation | ✅ | Already had @relation in schema (user User? @relation) |
| 18 | String fields should be enums | 🟣 | Comment added — deferred for data migration (schema.prisma:118) |
| 19 | Missing @unique on Order.paymentId | ✅ | Already had @unique in schema (paymentId String? @unique) |
| 20 | No cascade deletes | ✅ | Added Restrict on Order.user, Cascade on AuctionBid/Rating.user, SetNull on AuditLog.admin |
| 21 | FK without @relation (CartEvent, etc.) | ✅ | All FKs already had @relation in schema |
| 22 | Vendor.type no default, required | ✅ | Already had @default(SINGLE) in schema |
| 23 | PhoneVerification model is dead | ✅ | Model already removed from schema |
| 24 | USD label but INR used | ✅ | Fixed in Account.jsx |
| 25 | $ instead of ₹ in order history | ✅ | Fixed in Account.jsx |
| 26 | toFixed(2) vs toLocaleString() | ✅ | Fixed in Checkout.jsx |
| 27 | Vendor self-approval | ✅ | Fixed in products.js:115 |
| 28 | Mock mode bypass | ✅ | Fixed in checkout.js |
| 29 | Product view tracking undercounts | ✅ | Fixed in ProductDetail.jsx |
| 30 | Cart clears ALL items not just paid | ✅ | Fixed in checkout.js |
| 31 | No country field in shipping | ✅ | Fixed in Checkout.jsx |
| 32 | Edit product has no image fields | ✅ | Fixed in Account.jsx |
| 33 | Seller email exposed | ✅ | Fixed in products.js:64 |
| 34 | Buyer PII exposed to vendors | ✅ | Fixed in vendor.js:507 |

## 🟡 MEDIUM — 13 remaining

| # | Issue | Fixed? | Notes |
|---|-------|--------|-------|
| 35 | Account.jsx 1860-line monolith | 🟣 | Deferred — needs dedicated refactor session |
| 36 | alert() instead of toast | ✅ | All 12 replaced in Account.jsx |
| 37 | Inconsistent error format | ✅ | Fixed — standardized to `{ error: string }` across all backend routes |
| 38 | No DB indexes | ✅ | Added indexes on User(kycStatus,role), Order(paymentStatus,createdAt), OrderItem(productId), CheckoutEvent(productId), ContactMessage(read,createdAt), GalleryItem(theme,createdAt), Rating(userId), Vendor(status,type) |
| 39 | Case-inconsistent enums | 🟣 | Comment added — deferred for data migration (schema.prisma:119) |
| 40 | Company radio hardcoded checked=false | ✅ | Fixed in Account.jsx |
| 41 | Dead hooks (vendorPayoutsData, etc.) | ✅ | Removed in Account.jsx |
| 42 | handleVendorSubscribe dead code | ✅ | Removed in Account.jsx |
| 43 | No loading states on buttons | ✅ | Fixed in Account.jsx |
| 44 | setTimeout not cleaned up | ✅ | Fixed in ProductDetail.jsx |
| 45 | loginSuccess prop dead | ✅ | Already cleaned up — not found in source |
| 46 | No Zod on create-order body | ✅ | Fixed in schemas/checkout.js |
| 47 | No Zod on profile update | ✅ | Fixed in users.js:132 |
| 48 | No Zod on admin product update | ✅ | Fixed in admin.js:648 |
| 49 | Duplicate payout request guard | ✅ | Fixed in vendor.js |
| 50 | Permissive CORS | ✅ | Fixed in server.js |
| 51 | No rate limit on auth | ✅ | Added per-route rate limit (max 5/min) on /register and /phone/submit in users.js |
| 52 | Admin can self-demote | ✅ | Fixed in admin.js |
| 53 | Missing radix in parseInt | ✅ | Fixed across admin.js & vendor.js |
| 54 | Missing reply.sent check after manual authenticate | ✅ | Fixed in auth.js & products.js |

## 🟢 LOW — 7 remaining

| # | Issue | Fixed? | Notes |
|---|-------|--------|-------|
| 55 | Unused icon imports | ✅ | Removed Crown, Check, CreditCard from Account.jsx imports |
| 56 | payouts null dead branch | ✅ | Already cleaned up — not found in source |
| 57 | No password strength | ✅ | Added (min 8 chars, uppercase, lowercase, number) in Account.jsx and user schema |
| 58 | Emoji icons no aria-label | ✅ | Added aria-labels/aria-hidden to emoji icons across all pages |
| 59 | Hardcoded delhivery.com | ✅ | Replaced with TRACKING_URL env var in backend + VITE_TRACKING_URL in admin frontend |
| 60 | GalleryItem no createdBy | ✅ | Added createdById (String?) + createdBy relation to schema |
| 61 | ProductView missing @relation | ✅ | Already had both @relation declarations in schema |

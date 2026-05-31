# Security & Code Audit — Progress Tracker

**Total: 61 issues** — ✅ Fixed: 39  |  🔴 Remaining: 0  |  🟠 Remaining: 8  |  🟡 Remaining: 7  |  🟢 Remaining: 7

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
| 8 | Vendor rating without purchase | ⚠️ | Code already has purchase check — verify |
| 9 | Rating race condition | ✅ | Fixed in vendor.js:484 |
| 10 | **Vendor ships entire multi-vendor order** | ⚠️ | Need to verify current logic |
| 11 | XCircle not imported | ✅ | Fixed in Account.jsx |
| 12 | Password login missing | ✅ | Fixed in Account.jsx |
| 13 | No Sold Out state | ✅ | Fixed in ProductDetail.jsx |
| 14 | Razorpay error handling | ✅ | Fixed in Checkout.jsx |
| 15 | Shipping missing recipient name | ✅ | Fixed in Checkout.jsx |
| 16 | PhoneVerification callback never fires | ✅ | Fixed in Account.jsx |

## 🟠 HIGH — 16 remaining (or verify already fixed)

| # | Issue | Fixed? | Notes |
|---|-------|--------|-------|
| 17 | Testimonial userId has no @relation | ❌ | Schema change |
| 18 | String fields should be enums | ❌ | Schema-wide, 24 fields |
| 19 | Missing @unique on Order.paymentId | ❌ | Schema change |
| 20 | No cascade deletes | ❌ | Schema-wide |
| 21 | FK without @relation (CartEvent, etc.) | ❌ | Schema change |
| 22 | Vendor.type no default, required | ❌ | Schema change |
| 23 | PhoneVerification model is dead | ❌ | Schema cleanup |
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
| 35 | Account.jsx 1860-line monolith | ❌ | Refactor |
| 36 | alert() instead of toast | ✅ | All 12 replaced in Account.jsx |
| 37 | Inconsistent error format | ❌ | Backend-wide |
| 38 | No DB indexes | ❌ | Schema change |
| 39 | Case-inconsistent enums | ❌ | Schema-wide |
| 40 | Company radio hardcoded checked=false | ✅ | Fixed in Account.jsx |
| 41 | Dead hooks (vendorPayoutsData, etc.) | ✅ | Removed in Account.jsx |
| 42 | handleVendorSubscribe dead code | ✅ | Removed in Account.jsx |
| 43 | No loading states on buttons | ✅ | Fixed in Account.jsx |
| 44 | setTimeout not cleaned up | ✅ | Fixed in ProductDetail.jsx |
| 45 | loginSuccess prop dead | ❌ | Cleanup |
| 46 | No Zod on create-order body | ✅ | Fixed in schemas/checkout.js |
| 47 | No Zod on profile update | ✅ | Fixed in users.js:132 |
| 48 | No Zod on admin product update | ✅ | Fixed in admin.js:648 |
| 49 | Duplicate payout request guard | ✅ | Fixed in vendor.js |
| 50 | Permissive CORS | ✅ | Fixed in server.js |
| 51 | No rate limit on auth | ❌ | Backend fix |
| 52 | Admin can self-demote | ✅ | Fixed in admin.js |
| 53 | Missing radix in parseInt | ✅ | Fixed across admin.js & vendor.js |
| 54 | Missing reply.sent check after manual authenticate | ✅ | Fixed in auth.js & products.js |

## 🟢 LOW — 7 remaining

| # | Issue | Fixed? | Notes |
|---|-------|--------|-------|
| 55 | Unused icon imports | ❌ | Bundle size |
| 56 | payouts null dead branch | ❌ | Cleanup |
| 57 | No password strength | ❌ | UX |
| 58 | Emoji icons no aria-label | ❌ | a11y |
| 59 | Hardcoded delhivery.com | ❌ | Config |
| 60 | GalleryItem no createdBy | ❌ | Schema |
| 61 | ProductView missing @relation | ❌ | Schema |

# Vendor Flow — The Collectors Exchange

## Overview

Two vendor types: **Individual** (SINGLE) and **Company/Bulk** (BULK).  
Both follow the same lifecycle from registration to payout, with key differences in listing limits and upload method.

---

## 1. Account Registration

| Step | Detail |
|------|--------|
| Sign Up | Via Google OAuth or Email+Password through Supabase Auth |
| Account Type | User selects **Individual** or **Company** during registration |
| Auto-Sync | On first login, backend creates a `User` record via `POST /users/register` (supabaseId, email, name, phone, type) |
| Data Collected | `email`, `name`, `phone`, `type` (individual/company), `supabaseId` |

---

## 2. Seller Registration (KYC + Agreement)

Accessible via Account → **Seller Registration** tab (renamed to **Seller Profile** after verification).

### Identity Documents

| Field | Individual | Company |
|-------|-----------|---------|
| Aadhaar Number | ✅ Required | ✅ Required (of director) |
| PAN Number | ✅ Required | ✅ Required (company/director) |
| Company Name | — | ✅ Required |
| GST Number | — | ✅ Required + Certificate upload |
| Founder/Director Name | — | ✅ Required |
| Incorporation Certificate | — | ✅ Required |
| Document Uploads | Aadhaar doc, PAN doc | Aadhaar doc, PAN doc, GST doc, Incorporation doc |

### Seller Agreement

- User downloads PDF agreement
- Prints, signs, scans, and re-uploads the signed PDF
- Also provides a **digital signature** (types full legal name)
- Accepts Terms & Conditions checkbox

### Pickup Address (NEW)

Collected during/after Seller Registration:

| Field | Required |
|-------|----------|
| Street Address | ✅ |
| City | ✅ |
| State | ✅ |
| ZIP Code | ✅ |
| Contact Person Name | Optional |
| Contact Phone | Optional |

- Later, vendors can add multiple pickup addresses
- Address is **verified by delivery partner** (`pickupVerified: boolean`)

### All Data Stored On

`Vendor` model — linked 1:1 to `User` via `userId`.

---

## 3. KYC Review (Admin)

1. Admin reviews submitted documents in the admin panel
2. **Approve**: Auto-creates or updates `Vendor` record with:
   - `type`: `SINGLE` (individual) or `BULK` (company)
   - `maxListings`: `5` (SINGLE) or `999999` (BULK)
   - `status`: `APPROVED`
3. **Reject**: Vendor can resubmit
4. On approval, vendor gets access to listing features

---

## 4. Vendor Type & Listing Limits

| Aspect | Individual (SINGLE) | Company (BULK) |
|--------|---------------------|----------------|
| Max Listings | 5 | Unlimited (999999) |
| Upload Method | Manual form (1-by-1) | Manual + Bulk CSV upload |
| CSV Upload | Not available | Available |
| Type Change | Admin can toggle via `PATCH /admin/vendor/:userId/type` | Same |
| Previous Subscription System | Removed — admin toggle only | Removed — admin toggle only |

**Bulk Upload** (BULK only):
- Download CSV template → Fill rows → Upload via "Bulk Upload" button
- Backend processes via `POST /products/bulk`

---

## 5. Listing Items

1. Vendor fills listing form in Account → **Portfolio** tab:
   - Title, Category, Description (Markdown), Condition, Price, Keywords, Images (min 4)
2. Product is created with `status: Pending`
3. Vendor can see all products in "My Collection" with status badges:
   - Pending → In_Review → Approved / Rejected
4. **Limit enforcement**: Individual vendors blocked at 5 listings (UI shows usage bar)
5. Vendor can edit, mark-as-sold, or delete their listings
6. Editing a listing resets it to Pending (re-review)

---

## 6. Product Review (Admin)

1. Admin sees all products in admin panel with filters
2. Reviews product details, images, description
3. **Approve** → `status: Approved`, product becomes visible in The Exchange
4. **Reject** → `status: Rejected` with reason, vendor sees reason in portfolio
5. Super Admin can also verify authenticity (`authenticityStatus: Verified`)

---

## 7. Order & Delivery Flow

```
Buyer purchases → Payment (Razorpay) → Admin reviews order → Admin ships → Delivered
```

1. **Order created** with `status: Pending`, `paymentStatus: Paid`
2. Admin reviews order, can process/cancel
3. **Admin ships**: Updates order status → `Shipped`, adds tracking ID
4. Vendor marks items as shipped via vendor dashboard (`PATCH /vendor/orders/:orderItemId/ship`)
5. **Delivered**: Admin marks as `Delivered` → `updatedAt` is recorded

---

## 8. Payout (Auto-Create, Admin Release)

### Flow

```
Item Delivered → Wait 7 days → Auto-create PENDING payout → Admin marks PAID
```

### How It Works

| Step | Detail |
|------|--------|
| Trigger | Admin clicks **"Auto-Create"** in Admin → Payouts page, or the system is triggered manually |
| Logic | Finds all orders with `status: Delivered` AND `updatedAt >= 7 days ago` AND `paymentStatus: Paid` |
| Grouping | Order items are grouped by vendor (via `product.sellerId`) |
| Deduplication | Checks that no PENDING/PROCESSING/PAID payout exists for that vendor in the last 30 days |
| Creation | Creates a `Payout` record with `status: PENDING` and a note "Auto-created from delivered items (7+ days post-delivery)" |
| Notification | Vendor receives notification: "A payout has been created for your delivered items and is pending admin release" |
| Admin Release | Admin manually marks payout as PROCESSING → PAID (or FAILED if issue) |
| Payment | Admin processes the actual bank transfer offline, then marks as PAID |

### Payout Statuses

| Status | Meaning |
|--------|---------|
| PENDING | Auto-created, awaiting admin attention |
| PROCESSING | Admin is reviewing/preparing transfer |
| PAID | Payment sent (records `paidAt` timestamp) |
| FAILED | Payment failed or rejected |

### Removed

- ❌ `POST /vendor/payouts/request` — Vendors can no longer manually request payouts
- ❌ "Request a Payout" UI in vendor dashboard
- ❌ `POST /vendor/subscribe` — Subscription/plan system removed

---

## 9. Vendor Dashboard

Available after KYC approval (link in Account sidebar).

### Sections

| Section | Content |
|---------|---------|
| Stat Cards | Order Count, Items Sold, Total Revenue, Pending Payout |
| Sales Trend | Line chart (daily revenue over selected period) |
| Customer Interest | Funnel: Views → Cart Adds → Checkouts → Conversion Rate |
| Top Products | Best-selling products ranked by revenue |
| Payouts | Read-only history with status filter (All, PENDING, PAID, FAILED) + pagination |

---

## 10. Pickup Address Verification

1. Vendor enters pickup address in Seller Profile
2. **Delivery partner verifies** the address physically
3. Admin/delivery partner marks `pickupVerified: true` + sets `pickupVerifiedAt` + `pickupVerifiedBy`
4. Only verified addresses are used for item collection

---

## Data Model Summary

### Vendor Model Fields

```
id               String (PK)
userId           String (FK→User, unique)
type             SINGLE | BULK
status           PENDING | APPROVED | REJECTED | SUSPENDED
maxListings      Int (5 or 999999)
companyName      String?
gst              String?
founderName      String?
aadhaar          String?
pan              String?
aadhaarDoc       String?
panDoc           String?
gstDoc           String?
incorporationDoc String?
agreementAccepted     Boolean
agreementSignedAt     DateTime?
agreementSignedByName String?
signedAgreementDoc    String?
pickupAddress    String?          ← NEW
pickupCity       String?          ← NEW
pickupState      String?          ← NEW
pickupZip        String?          ← NEW
pickupContactName String?         ← NEW
pickupPhone      String?          ← NEW
pickupVerified   Boolean (false)  ← NEW
pickupVerifiedAt DateTime?        ← NEW
pickupVerifiedBy String?          ← NEW
rating           Float
ratingCount      Int
createdAt        DateTime
updatedAt        DateTime
```

### Payout Model Fields

```
id               String (PK)
vendorId         String (FK→Vendor)
amount           Float
status           PENDING | PROCESSING | PAID | FAILED
periodStart      DateTime
periodEnd        DateTime
paidAt           DateTime?
note             String?
createdAt        DateTime
updatedAt        DateTime
```

# The Collectors Exchange — Ubiquitous Language

The shared vocabulary for this project.

## Actors

- **User** — Anyone with an account on the platform. Can browse, purchase, and manage a profile.
- **Vendor** — A User who has completed KYC and been approved to list Products. Can be type SINGLE (max 5 listings) or COMPANY (unlimited).
- **Admin** — A User with elevated privileges who manages the platform.
- **Curator** — A User who manages Gallery content.

## Core Domain

- **Product** — An item listed for sale by a Vendor. Flows through statuses: DRAFT -> PENDING -> IN_REVIEW -> VERIFIED -> REJECTED -> SOLD.
- **Order** — A purchase transaction containing one or more OrderItems. Statuses: PROCESSING -> SHIPPED -> DELIVERED.
- **Auction** — Time-limited bidding event for a Product. Statuses: UPCOMING / LIVE / PAST.
- **Gallery** — Curated collection of archival items with provenance metadata. Museum-style presentation.
- **Payout** — Platform-to-Vendor fund transfer. Tracks approval, processing, and payment.

## Verification

- **KYC** — Know-Your-Customer process. Users submit Aadhaar, PAN, and optionally GST/comany docs. Admin approves or rejects. Approval creates a Vendor profile.
- **Seller Agreement** — Legal agreement Vendors must digitally sign before listing.
- **Authenticity** — Verification status of a Product, managed by Admin. Values: Pending / Verified / Rejected / Under Review.

## Cart & Checkout

- **Cart** — Temporary, user-local collection of Products ready for purchase. Persisted in localStorage via `utils/storage.js`.
- **Wishlist** — User-local saved Products. Persisted in localStorage.
- **Checkout** — The purchase flow: shipping form -> Razorpay payment -> order creation.

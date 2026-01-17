# Admin Dashboard: Control & Fulfillment Hub

The Admin Dashboard serves as the central nervous system for "The Collectors' Exchange," ensuring authenticity, trust, and seamless logistics across the platform.

## Purpose & Vision
This dashboard is built to bridge the gap between digital listings and physical authenticity. It provides admins with the tools to:
1.  **Vette Listings**: Every product is reviewed to maintain a premium, archival-quality catalog.
2.  **Verify Identities**: KYC (Know Your Customer) workflows ensure only legitimate sellers participate.
3.  **Manage Fulfillment**: A manual bridge for logistics (Delhivery integration) to ensure customers receive tracked and verified items.

---

## Features Built

### 1. Product Verification Pipeline
- **Gatekeeping**: New products are `Pending` and hidden by default (`isPublished: false`).
- **In-Review State**: Admins can acknowledge a listing as "Under Review."
- **Approval Logic**: Marking a product as `Approved` automatically flips `isPublished` to true and `isVerified` to true.
- **Rejection with Reason**: Admins can save a `rejectionReason`. This data is stored in the database for seller notification.

### 2. Manual Order Management
- **Workflow**: `Pending` → `Processing` → `Shipped` → `Delivered`.
- **Logistics Integration**: A field for **Tracking ID (AWB Number)** allows admins to input courier details (e.g., Delhivery) which are then saved to the order.
- **Order Details**: Full customer information, shipping addresses, and price breakdowns.
- **Placeholder Actions**: Infrastructure for future Invoice/Packing Slip PDF generation.

### 3. User & KYC Management
- **KYC Verification**: Dedicated panel to approve/reject seller identities.
- **Account Controls**: View user history and manage roles.

---

## Webapp (Customer App) Sync Requirements

To complete the ecosystem, the following syncs and guardrails are required in the main web application:

### 1. Catalog Filtering (Crucial)
- **Status Filter**: All product queries (Search, Category lists, Home page) MUST include a filter for `isPublished: true` and `status: 'Approved'`.
- **Guardrail**: Prevent users from accessing direct URLs of unapproved products.

### 2. Seller Dashboard Updates
- **Feedback Loop**: Sellers should see their product status (e.g., "Rejected - Low Quality Photo") in their dashboard.
- **KYC Block**: Prevent users from creating listings if their `kycStatus` is not `verified`.

### 3. Customer Order Tracking
- **Order Status**: Customers should see the real-time status (Processing, Shipped, etc.).
- **Tracking Links**: If an order is `Shipped`, display the `trackingID` with a link to the courier's website (e.g., `https://www.delhivery.com/track/package/${trackingID}`).

### 4. API Integrity
- **Permissions**: Ensure that only `role: 'admin'` users can access `/admin/*` routes.
- **Data Privacy**: Customer contact details should only be visible to admins for fulfillment purposes.

---

## Technical Audit Trail
- **Schema**: Updated `prisma/schema.prisma` with `Order`, `OrderItem`, and extended `Product` models.
- **State Management**: Uses TanStack Query for real-time invalidation (no stale data during status flips).
- **Styling**: Premium "Museum Heritage" theme (Charcoal, Gold, Parchment) for a luxury feel.

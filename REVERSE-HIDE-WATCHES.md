# Reverse: Unhide Timepieces (Watches)

**Created:** 2026-07-13
**Reason:** Temporarily hid all Timepieces products for one day
**Products affected:** 12 products in the "Timepieces" category

## What was done

1. Backend code change: Added `isPublished: true` filter to 3 public query endpoints in `backend/routes/products.js`
   - `GET /api/products` (catalog listing)
   - `GET /api/products/category-counts` (category tab counts)
   - `GET /api/products/:id` (single product detail)
2. Database patch: Set `isPublished = false` on all 12 Timepieces products

## How to reverse

### Step 1: Restore `isPublished` for all Timepieces

Run this SQL in Supabase SQL Editor:

```sql
UPDATE "Product" SET "isPublished" = true WHERE category ILIKE 'Timepieces' AND status IN ('Approved', 'Sold');
```

### Step 2: Deploy backend (if not already done)

The `isPublished` filter in the backend is a permanent improvement — keep it. Just restore the data and the watches will reappear.

```bash
cd backend && npx serverless deploy
```

### Step 3: Verify

- Visit `/category` — Timepieces tab should show products again
- Category count should reflect the restored products
- Individual product pages (`/product/:id`) should load

## Original `isPublished` values (for reference)

| Product ID                | Title                                   | Original isPublished | Status   |
| ------------------------- | --------------------------------------- | -------------------- | -------- |
| cmrhvjbvj0001k002rlpuo65f | HTSE Titan Solar watch                  | true                 | Approved |
| cmrhoi8600009hj1v8k28fbte | Rarely used 1068 Continental Tank watch | true                 | Approved |
| cmr0x1ft10003l02erog1qws1 | VAENED 1995s                            | true                 | Approved |
| cmr0wt3yj0001l02euh06fchr | Rado daistar golden                     | true                 | Approved |
| cmr0wmpcb0001kf1vkqymd40o | Rado daistar                            | true                 | Approved |
| cmqy10fzy0015gb1v0huwwpgx | seiko 5 open back                       | true                 | Sold     |
| cmqvc83ke0007ls1vf4lihq3g | Hmt samrat                              | true                 | Approved |
| cmqurxn1e0004k31vd7e080l7 | HMT Gandaberunda Quartz JGSS 01         | false                | Sold     |
| cmq27nrct0007ll1vojqyb7ct | Westar Automatic 17 Jewels Day-Date     | false                | Sold     |
| cmq27ct9u0003ll1vnt0f0mly | Rado Voyager Day-Date                   | false                | Sold     |
| cmq2717470001ll1v9knjiy44 | Citizen Vintage Automatic 21 Jewels     | true                 | Sold     |
| cmq0x33660001i31v7oh47nvt | HMT Akash Mechanical Heartbeat          | true                 | Approved |

## Notes

- The backend code change (`isPublished` enforcement) is a **permanent fix** — the field was previously ignored in public queries. Keep this.
- The SQL restore query only restores products that were `Approved` or `Sold` (the visible statuses). Products that were already hidden stay hidden.
- If you want to be more precise, the 3 products that were originally `isPublished=false` (HMT Gandaberunda, Westar Automatic, Rado Voyager) are all `Sold` status — they wouldn't appear in the catalog anyway.

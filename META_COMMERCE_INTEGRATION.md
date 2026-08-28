# Meta Business Suite Integration

Status snapshot of the Meta (Facebook/Instagram) Commerce integration — catalog sync, Conversions API, and the Google Merchant automation that was extended alongside it. Deployed to production 2026-08-29.

## Overview

Products now sync automatically to both Meta's Commerce Catalog and Google Merchant Center on every relevant lifecycle event — listed, sold, edited, delisted, restocked — replacing the old manual "sync to Google" admin button, which had no Meta equivalent at all. A server-side Conversions API (CAPI) call also fires on every completed purchase.

## What's built

| Piece                             | Status | Details                                                                                                                                                                                                            |
| --------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Meta Catalog sync                 | ✅     | `backend/lib/metaCatalog.js`, `backend/routes/metaCatalog.js` — upserts by `retailer_id = product.id`, so repeat calls update in place rather than duplicating                                                     |
| Automatic lifecycle triggers      | ✅     | Wired into `admin.js`, `products.js`, `checkout.js`: approval, sold (checkout/admin/vendor), price/title/image edits, delisting, deletion, order-cancel restock, manual offline orders, authenticity verify/reject |
| Google Merchant automation        | ✅     | Same trigger points now also call `syncProductToGoogleAsync` in `backend/lib/googleMerchant.js` — previously manual-button-only                                                                                    |
| Meta Conversions API              | ✅     | `backend/lib/metaConversions.js` — server-side `Purchase` event on checkout, SHA-256 hashed PII per Meta's requirement                                                                                             |
| Manual bulk/single sync endpoints | ✅     | `POST /api/products/sync-to-meta` and `/api/products/:id/sync-to-meta`, superadmin-gated                                                                                                                           |
| Real-inventory sync               | ✅     | 26 live products pushed to the Meta catalog                                                                                                                                                                        |
| Fire-and-forget error handling    | ✅     | Every sync call is non-blocking — a Meta/Google API failure is logged, never breaks a checkout or admin action                                                                                                     |

## Not built / deliberately deferred

| Piece                                           | Status | Notes                                                                                                                                                                                                                                                                                                                                 |
| ----------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Instagram Shopping connection                   | ❌     | Confirmed not connected via Graph API check; deferred by business decision                                                                                                                                                                                                                                                            |
| Ad campaigns (Advantage+ catalog ads)           | ❌     | Needs budget/targeting/objective decisions; not something to automate without those                                                                                                                                                                                                                                                   |
| Client-side Pixel events beyond `PageView`      | ❌     | No `ViewContent`/`AddToCart`/client-side `Purchase` exist in the frontend — limits retargeting audience quality even with server-side Purchase tracking in place                                                                                                                                                                      |
| `AddToCart`/`InitiateCheckout` server-side CAPI | ❌     | `Purchase` was the priority; these weren't built                                                                                                                                                                                                                                                                                      |
| Event deduplication (`event_id` matching)       | ❌     | Moot until a matching client-side event exists to dedupe against                                                                                                                                                                                                                                                                      |
| Category compliance gate (coins/currency)       | ⚠️     | Meta prohibits real money/coins even as graded collectibles, regardless of category — not reliably catchable by category or keyword filtering (a coin can sit under "Collectibles" as easily as a dedicated category), so this is documented in `metaCatalog.js` as an admin-approval-time judgment call rather than enforced in code |

## Architecture notes

- **Meta credential**: one System User token (`META_CATALOG_ACCESS_TOKEN`) covers both the Catalog API and Conversions API — no separate credential per feature.
- **Credential chain**: env var (local dev) → AWS SSM Parameter Store at `/thecollectorsexchange/META_CATALOG_ACCESS_TOKEN` (Lambda), mirroring the existing `GOOGLE_MERCHANT_KEY` pattern.
- **Meta availability model**: unlike Google (which fully deletes a delisted product), Meta upserts with an availability value — `in stock`, `mark_as_sold`, or `discontinued` — since Meta has a dedicated `mark_as_sold` state built for one-of-a-kind resale items.
- **Graph API version**: pinned to `v26.0` as a constant in `metaCatalog.js`/`metaConversions.js` — Meta sunsets API versions roughly every two years, bump this when it approaches expiry.
- **Meta assets**: Catalog `TCE Products` (`1730162018100619`), Pixel `Pilot Data` (`1814649636560455`, reused rather than recreated to preserve its existing event history), ad account `act_1037409502570893`.

## Verification performed

- Meta Catalog: created, updated in place, and deleted a real throwaway product against the live API before wiring any automatic triggers.
- Google Merchant: same throwaway-product round trip against the live Merchant Center.
- Conversions API: confirmed with a real live call (`events_received: 1`) — **not** routed through Meta's Test Events tool, since a `test_event_code` requires the Events Manager UI and there's no API to obtain one. Low-impact, but one real probe event landed in production ad-account signal data as a result.
- Full backend test suite: 518 passing, 0 failing, after both the Meta and Google Merchant work landed together.
- Production smoke test: confirmed the deployed Lambda serves real product data post-deploy.

## Related env vars

See `backend/.env.example`:

```
META_CATALOG_ACCESS_TOKEN=your-meta-system-user-access-token
```

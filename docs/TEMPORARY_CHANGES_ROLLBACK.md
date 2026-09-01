# Temporary changes — rollback guide

Everything on this page was done at the site owner's request to temporarily
take the storefront near-empty (no products, no blog, no About/Archive
pages, no brand names in visible copy) while the catalog is being rebuilt.
**None of it is meant to be permanent.** This doc is the single place that
lists what changed and exactly how to put it back.

The one exception: the footer "Call & WhatsApp" line (`+91 97407 99109`,
commit `87ff63b`) is a permanent addition, not part of this rollback set.

## 1. All products unpublished (2026-08-30)

- **What:** `isPublished` set to `false` on every product that was
  published (28 at the time).
- **Backup:** `backend/scripts/unpublished-product-ids-1788070971984.json`
  (list of `{id, title}` for every product that was live).
- **Script used:** `backend/scripts/unpublish-all-products.mjs` (talks to
  the production Supabase REST API — the direct Postgres ports weren't
  reachable from the environment that ran it).
- **To undo:** for each id in the backup file, `PATCH` the `Product` row
  back to `isPublished: true` (via the admin dashboard, or a small script
  using the same REST pattern as the unpublish script). If more products
  were added/published since, decide case by case whether they should stay
  published.

## 2. Category page forced to "Accessories" only (2026-08-30)

- **What:** the category rail/default category, which was already hard-coded
  to show only one category (previously `Timepieces`), was switched to
  `Accessories`.
- **Where:** `src/pages/Category.jsx`
  - `VISIBLE_CATEGORIES` — filter predicate `category.id === 'accessories'`
  - default `selectedCategory` state — `'Accessories'`
  - the `selectedCategory !== 'Accessories'` check in the URL-sync effect
- **Commit:** `896152d`
- **To undo:** change `'accessories'` back to the full `CATEGORIES` list (or
  whichever categories should be visible), and update the two `'Accessories'`
  string comparisons to match. Also revert the "Heritage Accessories" ticker
  word in `src/pages/Home.jsx` (see below) if it should go back to whatever
  the featured category is at that point.

## 3. Home page "Heritage Accessories" ticker word (2026-08-30)

- **What:** the trust-ticker item "Heritage Timepieces" → "Heritage
  Accessories" to match #2.
- **Where:** `src/pages/Home.jsx`, the `Marquee items={[...]}` array.
- **Commit:** `87ff63b`
- **To undo:** change the wording back, or to whatever the current featured
  category should read.

## 4. Home page "Featured Products" and "Rarest Finds" hidden (2026-08-31)

- **What:** both sections commented out — they kept rendering their heading
  shells even with zero published products.
- **Where:** `src/pages/Home.jsx`, look for
  `{/* <FeaturedProductsCarousel /> */}` and `{/* <RarestFinds /> */}`.
- **Commit:** `def6c62`
- **To undo:** uncomment both lines. Makes sense to do this at the same time
  as re-publishing products (#1), since both sections render `null` with
  zero published products anyway.

## 5. All blog posts unpublished (2026-09-01)

- **What:** `status` set from `PUBLISHED` to `DRAFT` on every blog post that
  was published (11 at the time).
- **Backup:** `backend/scripts/unpublished-blog-ids-1788264677033.json`
  (list of `{id, title, slug}`).
- **Script used:** `backend/scripts/unpublish-all-blogs.mjs` (same REST
  pattern as the products script).
- **To undo:** for each id in the backup file, `PATCH` the `Blog` row's
  `status` back to `PUBLISHED` (this alone won't bring the Archive pages
  back — see #6, the routes/nav also need restoring).

## 6. Archive (blog) pages hidden (2026-09-01)

The Archive was hidden at every layer that could otherwise resurface it:

- **Route redirect:** `src/App.jsx` — `/archive` and `/archive/:slug` now
  render `<Navigate to="/" replace />` instead of `<BlogPage />` /
  `<BlogPost />`. The original routes are left commented directly above the
  replacement for an easy revert.
- **CDN-level redirect:** `public/_redirects` — `/archive`, `/archive/`,
  and `/archive/*` all hard-301 to `/`. This is what actually stops a
  direct URL hit or a search-engine crawl, since Cloudflare Pages evaluates
  `_redirects` before serving any static/prerendered file. The old
  `/archive/*  /index.html  200` SPA-fallback rule was removed — restore it
  alongside undoing the redirect.
- **Nav:** `/archive` link removed from `PRIMARY_NAV` in
  `src/config/seo-pages.js` (drives the header nav and the
  `SiteNavigationSchema` JSON-LD), from `src/components/Footer.jsx`
  (Company column), and from `src/pages/Links.jsx`.
- **Build-time prerender:** `scripts/prerender-blogs.mjs` — `/archive` and
  `/about` links removed from `DEFAULT_NAV` and from the two hardcoded
  footer link blocks (`buildCorePageHtml`'s inline footer and
  `SHELL_FOOTER`). The archive-index/post generation logic itself was left
  alone — it's already data-driven off `status === 'PUBLISHED'`, so #5
  naturally makes it generate an empty archive and zero post pages.
- **Sitemap:** `public/sitemap.xml` — the `/archive/` `<url>` entry removed.
- **To undo:** revert all of the above (the commented-out original routes
  in `App.jsx` make the route part mechanical), re-add the nav entries, put
  the `/archive/*` SPA-fallback rule back in `_redirects` in place of the
  301, add the sitemap entry back, and re-publish posts per #5.

## 7. About page hidden (2026-09-01)

Same treatment as the Archive:

- **Route redirect:** `src/App.jsx` — `/about` (and `/about-us`) now
  `<Navigate to="/" replace />`. Original route commented above it.
- **CDN-level redirect:** `public/_redirects` — `/about`, `/about/`, and
  `/about-us` all hard-301 to `/`.
- **Nav:** removed from `PRIMARY_NAV` (`src/config/seo-pages.js`),
  `src/components/Footer.jsx`, `src/pages/Links.jsx`, and the "Learn More
  About Us" card grid on `src/pages/Home.jsx` (grid dropped from 3 columns
  to 2 — the Contact/FAQ cards stayed).
- **Build-time prerender:** `scripts/prerender-blogs.mjs` — the `/about`
  entry removed from the script's own (duplicated) `CORE_PAGES` object, plus
  the same `DEFAULT_NAV`/footer cleanup noted in #6.
- **Sitemap:** `public/sitemap.xml` — the `/about/` `<url>` entry removed.
- **To undo:** revert all of the above — the commented-out original route
  and the removed `CORE_PAGES['/about']` entry (restorable from git history
  on this file) are the two pieces most likely to be forgotten.

## 8. Brand names scrubbed from visible/SEO copy (2026-09-01)

Removed mentions of specific brands (Rolex, Omega, HMT, Seiko, Casio,
Westar) from copy that's actually shown to visitors or fed to search
engines. Left alone: `src/config/watchBrands.js` and
`src/components/BrandCombobox.jsx` — that's the seller listing form's
brand-suggestion list, not a display surface, and removing it would break
sellers' ability to enter a brand when listing a product.

- `src/config/seo-pages.js` — `/category` page's `keywords` string (dropped
  "casio", "rolex", "omega" terms).
- `src/pages/Category.jsx` — the Timepieces category's `metaDescription`
  and `metaKeywords` (dropped "Rolex, Omega, HMT, Seiko").
- `src/pages/Home.jsx` — hero video `aria-label` changed from "Westar
  automatic watch..." to "Vintage automatic watch...".
- **To undo:** these are plain string edits — check git history on each
  file for the previous wording if the exact original copy is wanted back,
  or just write new copy.

## Quick reference — backup files

| What                   | Backup file                                                  |
| ---------------------- | ------------------------------------------------------------ |
| Unpublished products   | `backend/scripts/unpublished-product-ids-1788070971984.json` |
| Unpublished blog posts | `backend/scripts/unpublished-blog-ids-1788264677033.json`    |

# Project Memory

This file is a persistent session log for AI coding assistants. It records configurations,
decisions, and context established across sessions. **Read this first when starting a new session.**

---

## How To Use This File

- **Start of session**: Read this file to pick up context from prior work
- **End of session**: Append new decisions and state changes to the Session Log
- **Config changes**: Update the relevant section if packages, rules, or architecture changes

---

## Active Sessions & Rules

### AI Rules Loaded

All files in `.agent/rules/` are loaded on every session:

| File                    | Purpose                                                                     |
| ----------------------- | --------------------------------------------------------------------------- |
| `frontend-guide.md`     | Frontend design tokens, Antigravity AI persona, luxury minimalist aesthetic |
| `backend-guide.md`      | Fastify + Prisma backend standards, integration workflow                    |
| `skills-engineering.md` | Matt Pocock skills: grill-me, tdd, diagnose, improve-architecture           |

### Engineering Skills Available

| Command                          | When to Use                                                       |
| -------------------------------- | ----------------------------------------------------------------- |
| `/grill-me`                      | Before any implementation — interview user until design is locked |
| `/grill-with-docs`               | Same as above, but also builds/sharpens CONTEXT.md glossary       |
| `/tdd`                           | Test-driven development (red-green-refactor, vertical slices)     |
| `/diagnosing-bugs`               | Hard bugs and performance regressions                             |
| `/improve-codebase-architecture` | Periodically scan for deepening opportunities                     |

### Pre-Code Checklist

Before writing any code:

- [ ] Design concept is locked with the user
- [ ] Ubiquitous language is documented in CONTEXT.md
- [ ] A failing test exists for the new behavior
- [ ] The change fits into a deep module with a simple interface
- [ ] Fast feedback loop (test/type/lint) is active

---

## Project Configuration Summary

### Files Created / Rewritten

| File                                 | What It Is                                                                              | Created    |
| ------------------------------------ | --------------------------------------------------------------------------------------- | ---------- |
| `AGENTS.md`                          | AI entry point — project overview, domain language, architecture rules, quick reference | 2026-06-30 |
| `CONTEXT.md`                         | Ubiquitous language glossary (actors, core domain, verification, cart/checkout)         | 2026-06-30 |
| `CONTRIBUTING.md`                    | Dev setup, code standards, testing policy, PR process                                   | 2026-06-30 |
| `DESIGN.md`                          | Full design system — Liquid Glass + Luxury Minimalist, 10 sections                      | 2026-06-30 |
| `MEMORY.md`                          | This file — persistent session memory for AI                                            | 2026-06-30 |
| `.editorconfig`                      | Cross-editor formatting (spaces, 2-indent, LF endings)                                  | 2026-06-30 |
| `.prettierrc`                        | Prettier config (single quotes, trailing commas, 100 width)                             | 2026-06-30 |
| `.agent/rules/skills-engineering.md` | Matt Pocock engineering skills checklist                                                | 2026-06-30 |
| `opencode.json`                      | Updated with agent config + skill references                                            | 2026-06-30 |
| `functions/api/blog/sitemap.xml.js`  | Cloudflare Pages Function — dynamic XML sitemap for blog posts                          | 2026-07-21 |
| `scripts/prerender-blogs.mjs`        | Build-time prerender script — generates static HTML for each blog post                  | 2026-07-21 |

### Files Modified

| File                        | Change                                                                                | Date       |
| --------------------------- | ------------------------------------------------------------------------------------- | ---------- |
| `.gitignore`                | Changed `.agent/*` → `.agent/*.local` and `.agent/cache/` so rules ship with repo     | 2026-06-30 |
| `README.md`                 | Rewritten from default Vite template to actual project description                    | 2026-06-30 |
| `package.json`              | Added `format`, `format:check`, `test:unit`, `test:e2e` scripts                       | 2026-06-30 |
| `backend/package.json`      | Added `test`, `test:coverage` scripts                                                 | 2026-06-30 |
| `admin/package.json`        | Added `test`, `test:coverage` scripts                                                 | 2026-06-30 |
| `package.json`              | Build script now includes prerender: `vite build && node scripts/prerender-blogs.mjs` | 2026-07-21 |
| `public/robots.txt`         | Added dynamic blog sitemap URL                                                        | 2026-07-21 |
| `src/components/Footer.jsx` | Removed phone number, simplified address to area/city/state/zip                       | 2026-07-21 |

### ADRs Created

| ADR                                              | Title                            | Date       |
| ------------------------------------------------ | -------------------------------- | ---------- |
| `docs/adr/0001-record-architecture-decisions.md` | Recording architecture decisions | 2026-06-30 |
| `docs/adr/0002-frontend-stack.md`                | Frontend stack decisions         | 2026-06-30 |
| `docs/adr/0003-backend-stack.md`                 | Backend stack decisions          | 2026-06-30 |

---

## Design Decisions

### UI Framework

- **No shadcn/ui** — evaluated, rejected. All 26 UI components are hand-rolled with raw Tailwind
- **No third-party UI library** — not Material UI, Ant Design, Chakra, Headless UI
- **Icons**: `lucide-react` only, consistent across both frontends
- **Pattern**: `createContext` for shared state (Toast, ConfirmDialog), raw className strings for styling

### Testing Standards

- **Backend**: Every route MUST have a test file using Fastify `app.inject()` — real handlers, real validation, mocked Prisma only
- **Frontend**: Hooks/API must be integration-tested. Stateful components via `@testing-library/react`. Static pages get smoke tests only
- **Coverage**: 80% lines/functions, 70% branches — enforced in vitest config
- **E2E**: Real user flows, not page-load smokes

### Agent Rules Shipping

- `.agent/rules/` is now tracked by git (removed from `.gitignore`)
- `.agents/` (Supabase skills) remains gitignored — too large, external source

---

## Pre-commit Hooks

Husky runs `npx lint-staged` on every commit — auto-formats and lints staged files only.

### CI Pipeline

`.github/workflows/ci.yml` runs on push/PR to main:

1. `npm ci` for root + backend + admin
2. `prisma generate`
3. `npm run lint`
4. `npm run test:unit`
5. `npm run build`

---

## Session Log

### Session 1 — 2026-06-30

**Objective:** Make the repo AI-friendly

**What was done:**

- Explored project structure — no `/docs/` folder, scattered docs, weak CONTRIBUTING.md
- Created `AGENTS.md`, `CONTEXT.md`, `CONTRIBUTING.md`, `DESIGN.md`, `MEMORY.md`
- Created `.editorconfig`, `.prettierrc`
- Created `.agent/rules/skills-engineering.md` (full Matt Pocock skills)
- Created `docs/adr/` with 3 ADRs
- Un-gitignored `.agent/rules/` so they ship with repo
- Rewrote `README.md` from default Vite template to actual project description
- Added proper test scripts to all 3 `package.json` files
- Evaluated shadcn/ui — **decision: keep hand-rolled components**

**Testing policy established:**

- Every backend route MUST have tests (integration style, Fastify `app.inject()`)
- Frontend: non-trivial code requires tests (hooks, stateful components, utils)
- Static pages get smoke tests only
- Coverage thresholds: 80/80/70/80

### Session 2 — 2026-06-30

**Objective:** Close remaining gaps in AI-friendliness

**What was done:**

- Created `DESIGN.md` — full design system (Liquid Glass + Luxury Minimalist, 10 sections)
- Updated `CONTRIBUTING.md` testing section — explicit backend/frontend/E2E requirements
- Added test scripts (`test`, `test:coverage`) to all 3 `package.json` files
- Rewired `npm run test:unit` via `scripts/test-unit.mjs` (cross-platform, runs all 3 areas)
- Created `.husky/pre-commit` — runs `npx lint-staged` on commit
- Added `lint-staged` config to root `package.json`
- Created `.github/workflows/ci.yml` — lint + test:unit + build on push/PR
- Fixed `opencode.json` — removed invalid `agent` and `skills.enabled` fields
- Updated skill descriptions with trigger conditions for model auto-invocation
- Created `MEMORY.md` session log, tracked config summary and decisions

**Infrastructure established:**

- Pre-commit hooks now enforce linting + formatting on staged files
- CI runs lint + unit tests + build on every push/PR to main
- Test runner works cross-platform (Node.js script, not shell chaining)

### Session 3 — 2026-07-12

**Objective:** Migrate backend from Render to AWS Lambda + deploy frontends to Cloudflare Pages

**What was done:**

- Removed auction page, replaced 404 with redirect, ErrorBoundary auto-reload — committed `a49fa9e`
- Created `feat/lambda-migration` branch with all Lambda changes
- Created `backend/handler.js` — Lambda entry using `@fastify/aws-lambda`, fixed decorator ordering (`awsLambdaFastify(app)` before `app.ready()`)
- Modified `backend/server.js` — exports fastify, conditional `listen()`
- Modified `backend/plugins/prisma.js` — `globalThis.__prisma` reuse for Lambda warm starts
- Updated `backend/lib/googleMerchant.js` — async `loadCredentials()` with SSM fallback, `__dirname` workaround for CJS bundle
- Created `backend/serverless.yml` — esbuild CJS, SSM env vars, IAM, `.prisma` + `@prisma/client` external, Windows DLL excluded from package
- Fixed `import.meta.url` crash in CJS bundle (`googleMerchant.js`) using `baseDir` variable
- Fixed Prisma `binaryTargets` — added `linux-arm64-openssl-3.0.x`, regenerated client
- Fixed `.prisma/client` not included in Lambda package — added `.prisma` to esbuild externals
- Fixed Prisma `ENOTFOUND tenant/user` error — Supabase pooler is `ap-southeast-1` not `ap-south-1`
- Fixed Fastify `FST_ERR_DEC_AFTER_START` — moved `awsLambdaFastify(app)` registration before `app.ready()`
- Updated `backend/.env` to use pooler URL for local dev (direct URL is IPv6-only)
- Set Cloudflare Pages env vars via Wrangler (`VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- Deployed both frontends to Cloudflare Pages production (`--branch=main`)
- Merged `feat/lambda-migration` into `main` (commit `b1e5487`), pushed both branches

**Critical gotchas discovered:**

- Supabase direct DB URL is IPv6-only (`db.rvamybeqoyznlgzglqqx.supabase.co`) — Lambda and local Windows cannot reach it
- **Always use pooler URL**: `postgresql://postgres.rvamybeqoyznlgzglqqx:LnhCxyKQWqvFN4j9@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1`
- Supabase region is `ap-southeast-1` (Singapore), NOT `ap-south-1` (Mumbai) — this caused the DNS resolution failure
- `serverless deploy --force` recreates the API Gateway with a new URL — never use `--force` unless you want to update frontend env vars
- Lambda CJS bundle cannot use `import.meta.url` — use `baseDir` pattern instead
- Prisma `@prisma/client` must be added to esbuild externals or `.prisma/client` won't be bundled

### Session 4 — 2026-07-12

**Objective:** Add structured product specifications feature

**What was done:**

- Added `specs Json @default("[]")` field to Prisma Product model (`backend/prisma/schema.prisma:188`)
- Created `SpecItemSchema` Zod validator (`backend/schemas/product.js:5-8`) — `{key: string, value: string}`
- Added `specs` field to `ProductSchema` and `AdminProductUpdateSchema`
- Updated vendor form (`src/pages/Account.jsx:1733-1802`) — dynamic key-value input rows with Add/Remove buttons
- Updated product detail page (`src/pages/ProductDetail.jsx:527-564`) — renders specs as alternating-row table between Provenance and Trust Indicators
- Updated admin review panel (`admin/src/pages/ProductDetail.jsx:362-393`) — same specs table in admin product detail
- Applied Supabase migration: `ALTER TABLE "Product" ADD COLUMN "specs" jsonb NOT NULL DEFAULT '[]'::jsonb`
- Redeployed Lambda (endpoint: `https://07u78lzel7.execute-api.ap-south-1.amazonaws.com`)
- Updated Cloudflare Pages secrets for both projects with new API URL
- Deployed both frontends to Cloudflare Pages

**Backend routes needed no changes** — the `...productData` spread in create/update/bulk already passes `specs` through since Zod handles validation and defaults.

### Session 5 — 2026-07-21

**Objective:** Fix blog SEO — blogs weren't ranking on Google because the site is a pure SPA (client-side rendered)

**Root cause:** Crawlers received an empty `<div id="root"></div>`. All SEO meta tags (title, description, OG, JSON-LD) were injected by `react-helmet-async` only after JS loaded. Social media scrapers (WhatsApp, Twitter, Facebook) don't execute JS — they saw the generic home page meta tags. Additionally, `public/sitemap.xml` had zero blog post URLs.

**What was done:**

- Created `functions/api/blog/sitemap.xml.js` — Cloudflare Pages Function that generates dynamic XML sitemap from all published blog posts (always fresh, no rebuild needed)
- Created `scripts/prerender-blogs.mjs` — build-time script that fetches all published blog posts from the Lambda API and generates static HTML files at `dist/archive/{slug}/index.html` with full SEO meta tags, OG tags, Twitter cards, JSON-LD Article + Breadcrumb schemas, and readable content
- Updated `package.json` build script to `vite build && node scripts/prerender-blogs.mjs`
- Updated `public/robots.txt` to reference the dynamic blog sitemap
- Removed phone number and simplified address in `src/components/Footer.jsx`
- Deployed to Cloudflare Pages — verified dynamic sitemap returns all 11 blog posts, prerendered pages serve correct meta tags

**How prerendering works:**

- Static files in `dist/archive/{slug}/index.html` take priority over the `_redirects` catch-all
- Crawlers get prerendered HTML with all SEO tags — no JS execution needed
- Users see the prerendered shell briefly, then React hydrates and takes over
- New blog posts require a rebuild + deploy to appear as prerendered pages

**Deploy command after publishing new posts:**

```
npm run build && npx wrangler pages deploy dist --project-name=tce-user --branch=main
```

---

## Open Items / Pending Decisions

- [ ] E2E tests need real user flows instead of page-load smokes (see CONTRIBUTING.md)
- [ ] Coverage thresholds defined in vitest.config.js but not active in CI
- [ ] Consider `serverless-domain-manager` for fixed custom domain (e.g., `api.thecollectorsexchange.com`) — not urgent if `--force` is never used
- [ ] Blog prerender requires rebuild + deploy for new posts — consider Cloudflare Pages deploy hook triggered by backend webhook on publish

### Session 6 — 2026-07-24

**Objective:** Fix Order Records & Dashboard Data Integrity (platform fees, manual order backfill, vendor stats unification, order status update).

**What was done:**

- **platformFee Bug Fix**: Verified platformFee calculation in `backend/routes/checkout.js` and `backend/routes/admin.js`. Backfilled correct `platformFee` for existing orders HOR00006 (₹199.90) and HOR00008 (₹700.00).
- **Stuck Order Update**: Updated order HOR00006 status from `Processing` to `Delivered`.
- **Manual Order Backfill**: Backfilled 3 manual orders (HOR00010, HOR00011, HOR00012) for vendor Deewan Husain's sold products without order records (HMT Gandaberunda, Rado Voyager Day-Date, Westar Automatic 17 Jewels) assigned to The Collectors Exchange account (TCE Branch) as requested by user, leaving old payouts unaffected.
- **Vendor Stats Unification**: Refactored `/vendor/stats` in `backend/routes/vendor.js` to query offline-sold products alongside online order items so `/vendor/stats` and `/vendor/analytics/overview` report consistent sales and item numbers.
- **Revenue Chart Double-Counting Check**: Confirmed admin analytics endpoint (`/admin/stats/analytics` in `backend/routes/admin.js`) filters offline products with `orderItems: { none: {} }`, ensuring newly backfilled orders are correctly excluded from offline merge and counted under regular paid orders without double-counting.
- **Supabase MCP Configuration**: Confirmed `.env` and Supabase credentials align with current workspace environment settings.

### Session 7 — 2026-08-23

**Objective:** QR scan tracking infrastructure (poster campaigns) + Meta Pixel + Facebook domain verification

**QR Scan Tracking (full stack):**

- Added `QrCode` (slug, title, targetUrl, active) and `QrScan` (visitorId, deviceHash, ipHash, geo, deviceType/os/browser) models — migration `create_qr_codes_and_scans` applied via Supabase MCP
- Created `backend/lib/userAgent.js` (regex UA parser: deviceType/os/browser), `backend/lib/geo.js` (ip-api.com lookup, 900ms timeout cap, 12h in-memory cache, private-IP skip, IP normalization)
- Created `backend/routes/qr.js` — public `GET /api/qr/:slug`: records scan then 302-redirects to configurable `targetUrl` (never 301 — retargeting must take effect instantly). Sets 1-year `tce_qid` cookie for unique-user counting. Redirects even if DB insert fails. Route-level rate limit 300/min
- Created `backend/routes/qrAdmin.js` mounted at `/api/admin/qr`: codes CRUD + `/stats` (totals/timeline/hourly/locations/devices/OS/browsers via `$queryRaw`, day+hour buckets in Asia/Kolkata TZ) + `/filters` (distinct filter values). Zod schemas in `backend/schemas/qr.js`
- Admin dashboard: new "QR Scans" page (`admin/src/pages/QrScans.jsx`) at `/qr-scans` — stat cards with previous-period comparison, ComposedChart scans-over-time, hourly distribution (IST), devices pie, OS/browser bars, locations table with share bars, country/city/device/OS filters, code manager modal (create/edit/copy endpoint URL/activate/delete). Hooks in `admin/src/hooks/api/useQr.js`
- Tests: 30 new backend tests (routes/lib), admin page smoke tests. All green; pre-existing failures in Dashboard/Login/etc confirmed unrelated (fail without my changes)
- Deployed Lambda (URL unchanged: `07u78lzel7...amazonaws.com`) and tce-admin to Cloudflare Pages
- **Live smoke verified**: scan → 302 → correct geo captured (Coimbatore, IN, lat/long) + parsed Android/Chrome mobile UA

**Gotchas discovered:**

- The homepage served at `/` is NOT Vite's index.html — `scripts/prerender-blogs.mjs` overwrites `dist/index.html` with its own template. Head tags must be added to BOTH source `index.html` AND the prerender script (its `loadViteTemplate()` strips ALL `<meta>` from Vite's head via regex, but passes scripts through so they flow via `VITE_HEAD_EXTRA`)
- `reply.redirect(url, 302)` — Fastify v5 signature is (url, code); use 302 not 301 so configurable targets apply instantly

**Facebook/Meta integrations (user frontend only):**

- Domain verification meta-tag added (`facebook-domain-verification`) — commit `43af5a3`, deployed, verified live
- Meta Pixel base code added (ID `1814649636560455`, script + noscript in head) — commit `1f0bf6f`, deployed, verified live on production; propagates to all prerendered pages automatically
- Both changes committed separately; user's blog/video WIP left untouched in working tree

**Pending:**

- User creates real QR codes via Admin → QR Scans → Manage Codes (paste endpoint URL into any external QR generator; redirect target editable anytime)
- GitHub remote moved: update with `git remote set-url origin https://github.com/thebigmind-productions/THE-COLLECTORS-EXCHANGE.git`

### Session 8 " 2026-08-23 (later)

**Objective:** UI polish batch on user frontend (all deployed to tce-user, main branch, uncommitted)

**QR poster asset:** Generated `src/assets/qr-codes/products-page-qr.png` (2048px) + `.svg` via `npx --yes qrcode`, encoding `/api/qr/products` (DB record `qr_products_page` " Products Page, target `https://thecollectorsexchange.in/category`). Live-verified 302; test scans cleaned up. Endpoint ~0.9s round-trip.

**Category page (`src/pages/Category.jsx`):**

- Removed long description paragraph under category heading ("Your phone tells the time..."); kept tagline + stock count
- Mobile top/bottom padding `py-8` " `py-5`; desktop untouched
- **CRITICAL GOTCHA**: the prerender script has its OWN copy of the description in `scripts/prerender-blogs.mjs` (CATEGORY_LANDING data + template line ~1044 renders tagline+intro). Removing it only from React still shows it in static HTML/SEO shell " must edit BOTH files
- Authenticity note replaced with icon-only ShieldCheck (title tooltip + sr-only text)

**Sign-in empty states:**

- New reusable `src/components/SignInPrompt.jsx`: inline SVG vault-door keyhole illustration (dashed gold ring, antique key, bronze sparkles), "MEMBERS ONLY" eyebrow, serif title, black CTA w/ gold hover, ShieldCheck microcopy
- Wired into Wishlist.jsx + Checkout.jsx replacing plain text versions

**Snappier product grids:** removed scroll-reveal stagger (`Reveal delay=i*120`) from Category grid, ProductDetail related items, Wishlist grid (kept hover Tilt). Wishlist now imports only `{ Tilt }`

**Rarest Finds section (`src/pages/Home.jsx`):**

- Featured carousel now fetches ONLY `featured` (was merging most_rare)
- New `RarestFinds` component below carousel: dark charcoal bg + gold dot pattern, "FROM THE VAULT" eyebrow, crown "Most Rare" badge cards, up to 8 items, sold sorted last, "Explore The Vault" CTA "/category", **auto-hides when zero most_rare products exist**
- Populate via Admin " Products " Listing Category = Most Rare

**Equal card sizing fix:** FeaturedProductCard had hardcoded widths (`w-[240px] sm:w-[280px] md:w-[320px]`) + no h-full + unclamped titles " unequal boxes in grid. Card is now width-agnostic (`w-full h-full`) + `line-clamp-2` title; carousel wraps cards in fixed-width divs (marquee geometry unchanged); RarestFinds Stagger uses `childClassName="h-full"`

**Navbar FAQ removal:** FAQ removed from `PRIMARY_NAV` (`src/config/seo-pages.js`) AND `DEFAULT_NAV` (`scripts/prerender-blogs.mjs` keeps its own copy of nav for static shells). Footer link kept (Footer.jsx hardcoded). SEO.jsx sitelinks schema follows PRIMARY_NAV automatically

**Test baselines (all pre-existing, verified via stash A/B):** Checkout/Wishlist/Home/ProductDetail tests fail identically before+after (stale useCheckout mock missing useValidateCoupon; jsdom lacks IntersectionObserver). Category tests pass 9/9

**Pending:** user to verify domain in Facebook Business Manager; QR assets not yet committed

### Session 9 — 2026-09-04

**Objective:** Post-audit remediation — security, test/CI health, consent, performance. Site owner handled DB password rotation + `kyc-documents` bucket lockdown separately.

**Standing directive from this session:** the storefront's current stripped-down state (see `docs/TEMPORARY_CHANGES_ROLLBACK.md`) is temporary. Write code for the PERMANENT marketplace state; do not build around, extend, or undo the temporary changes.

**Security:**

- `uploadKycDocument()` (`src/utils/storage.js`) no longer falls back to the **public** `product-images` bucket on error — that branch published Aadhaar/PAN scans at permanent public URLs. Verified the leak never fired: enumerated `product-images` (436 objects), zero matching the fallback's `kyc-<ts>-<rand>` naming.
- KYC now stores a private path `kyc/<supabase uid>/<crypto.randomUUID()>.<ext>`, not a public URL. Admin previews go through a new service-role signing endpoint `GET /api/admin/kyc/:userId/signed-url` (120s TTL), gated by `authenticateAdmin`.
- Authorisation there is an **allowlist of the paths that user's own `kycData` actually references** (`collectKycDocumentPaths`), plus a folder-ownership check — not path-prefix matching. This is what lets legacy non-user-scoped objects still resolve.
- All three shapes (legacy public URL, `/render/image/` URL, bare path) normalise via `kycStoragePathFromReference`, mirrored in `backend/lib/`, `src/utils/`, `admin/src/utils/` — **keep the three in sync.**
- `backend/plugins/auth.js`: `jwtVerify` now checks `issuer` (confirmed against the project's OIDC discovery doc) and `audience`. **`aud: 'authenticated'` was never confirmed against a real token** — overridable via `SUPABASE_JWT_AUDIENCE`, and `ERR_JWT_CLAIM_VALIDATION_FAILED` is logged distinctly so a misconfig reads as config error, not a mystery 401 storm.
- `requireDbUser` added to 19 routes that dereferenced a legitimately-null `request.dbUser`.
- Pino `redact` config added to `backend/server.js`.
- **Un-applied:** `docs/kyc-documents-storage-rls.sql` — owner runs it.

**CI green for the first time since 2026-08-11.** Was 52 failing / 21 files + 6 lint errors. Now `npm run test:unit` exits 0: root 411, backend 559, admin 329; lint 0 errors.

- Root causes were mostly misdiagnosed at audit time: the "IntersectionObserver" failures were actually `react-helmet-async` with no `HelmetProvider`; the `apiClient` "cannot find module" was a CJS `require()` inside an ESM test, **not** a resolution bug.
- New shared helpers: `src/test/utils.jsx` (`renderWithProviders`), IO/RO/scrollTo stubs in `src/test/setup.js`.
- `.wrangler/` added to `.gitignore` + `eslint.config.js` (it was the source of all 6 lint errors).

**Config de-duplication.** `scripts/prerender-blogs.mjs` now imports `SITE_URL`/`PRIMARY_NAV`/`CORE_PAGES` from `src/config/seo-pages.js` and category data from the new `src/config/categories.js`, instead of forking them. **The old comment claiming the build script "can't import the React-side config" was false — that file has zero imports and Node reads it fine.** Refactor proved safe by md5-matching all 20 generated HTML files before/after.

**Consent gate (DPDP/GDPR).** Meta Pixel + GA4 previously fired unconditionally on every page. Now nothing loads until `localStorage['tce_consent_v1'] === 'granted'`; the `<noscript>` `facebook.com/tr` pixel is deleted. `src/utils/consent.js` + `src/components/ConsentBanner.jsx`; withdrawal via Footer (desktop) and Privacy page (mobile — the footer is inside `hidden lg:block`). Verified in `dist/`: gate precedes every tracker reference on all 20 pages.

**Performance.** `src/utils/image.js` wraps Supabase image transforms (which ARE enabled on this project). Real numbers on a live object: 760,558 B original → 40,904 B at `width=400` with WebP negotiation (18.6×), 19,212 B at 200 (39.6×). Wired into 15 React call sites plus the 4 prerender `<img>` sites. og:image/twitter:image and JSON-LD `image` deliberately keep the full-resolution original.

**Bugs found and fixed along the way:**

- `ErrorBoundary` was an **infinite reload loop**: `componentDidCatch` called `window.location.reload()` unconditionally and rendered `null`, so any deterministic error looped forever on a blank page. Now reloads once per 10s window, then shows a real fallback. Instance `handled` guard because `componentDidCatch` can fire more than once per failure.
- `src/pages/Privacy.jsx` claimed _"We do not use invasive 'pixel' tracking"_ while shipping the Meta Pixel. Rewritten.
- Cart remove button was an icon-only button with no accessible name.
- `useMediaQuery` dereferenced `window` unguarded in its effect.

**Open / for the owner:**

- [ ] Confirm `aud === 'authenticated'` on a real session token before deploying the backend.
- [ ] Apply `docs/kyc-documents-storage-rls.sql`, then lock the bucket (safe now — legacy URLs resolve via signing).
- [ ] Brand scrub is incomplete: prerendered `/category/timepieces/` still ships "Rolex, Omega, HMT, Seiko" in meta + JSON-LD. One `prerenderMetaDescription` line in `src/config/categories.js`.
- [ ] Commit `33350ca` (titled as an API-URL fix) silently deleted the category tagline/intro from `buildCategoryHtml` and dropped `/faq` from the nav — category landings are now thin content. Needs new copy; `intro` no longer exists on the entries.
- [ ] `src/components/ProductCard.jsx` is dead code — only its own test imports it; the live card is `ArchiveProductCard` in `Category.jsx`.
- [ ] Returning consenting visitors lose their initial GA4 pageview (idle-deferred load races `GATracker` mount in `App.jsx`).
- [ ] Still deferred: real SSR/`hydrateRoot` (prerender builds HTML from string templates, not React SSR); real E2E flows (`tests/flows/` is empty).

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

# AGENTS.md — AI Coding Assistant Context

This file gives AI coding assistants the essential project context. Read this first before making any changes.

> **Start of every session**: Read `AGENTS.md` (this file) then `MEMORY.md` for the persistent session log and decision history.

## Project Overview

**The Collectors Exchange** is a full-stack marketplace for verified pre-owned collectibles and antiques. It has three deployable units:

1. **User Frontend** (`src/`) — React 18 + Vite 7 + Tailwind v4
2. **Backend** (`backend/`) — Fastify 5 + Prisma 6 + Supabase PostgreSQL
3. **Admin Dashboard** (`admin/`) — React 19 + Vite 7 + Tailwind v3

All use JavaScript (JSX), not TypeScript.

## Key Domain Language

| Term        | Meaning                                                                                                            |
| ----------- | ------------------------------------------------------------------------------------------------------------------ |
| **Product** | A listed item for sale; has status (DRAFT, PENDING, IN_REVIEW, VERIFIED, REJECTED, SOLD)                           |
| **Vendor**  | A user with KYC approval who can list products; has type (SINGLE/COMPANY) with different listing limits            |
| **KYC**     | Know-Your-Customer verification; required before becoming a vendor; involves Aadhaar, PAN, GST docs                |
| **Order**   | A purchase; goes through PROCESSING -> SHIPPED -> DELIVERED; uses Razorpay for payments and Delhivery for shipping |
| **Auction** | Time-limited bidding on an item; has status (UPCOMING/LIVE/PAST)                                                   |
| **Gallery** | Museum-style curated collection of archival items with provenance metadata                                         |
| **Payout**  | Funds transfer from platform to vendor; tracks status and audit trail                                              |

## Architecture Rules

### Frontend

- **Styling**: Tailwind CSS only. Use custom colors (`luxury-gold`, `heritage` palette) and fonts (`Playfair Display` for headings, `Inter` for body).
- **Icons**: `lucide-react` only.
- **Routing**: React Router v7 with `BrowserRouter`.
- **Data**: TanStack React Query for server state, `utils/storage.js` for local persistence (cart, wishlist).
- **Design**: "Luxury Minimalist" — sharp borders, `tracking-widest` on uppercase labels, `transition-all duration-300`, primary buttons are black with gold hover.

### Backend

- **Language**: JavaScript ESM (`import/export`).
- **Framework**: Fastify 5 with Zod for request validation.
- **Database**: Prisma ORM — schema-first approach. Always run `npx prisma generate` after schema changes.
- **Auth**: Supabase JWT verification. Routes verify via `request.user` set by auth decorator.
- **Payments**: Razorpay — payment verification in `backend/routes/checkout.js`.
- **Structure**: Routes in `backend/routes/`, schemas in `backend/schemas/`, services in `backend/services/`.

### Deployment

| Service             | Platform                 | URL                                                       | Deploy Command                                                                                   |
| ------------------- | ------------------------ | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| **Backend**         | AWS Lambda (API Gateway) | `https://uinie5uugg.execute-api.ap-south-1.amazonaws.com` | `cd backend && npx serverless deploy`                                                            |
| **User Frontend**   | Cloudflare Pages         | `https://tce-user.pages.dev`                              | `npm run build && wrangler pages deploy dist --project-name tce-user --branch=main`              |
| **Admin Dashboard** | Cloudflare Pages         | `https://tce-admin.pages.dev`                             | `cd admin && npm run build && wrangler pages deploy dist --project-name tce-admin --branch=main` |

**IMPORTANT**: Never use `npx serverless deploy --force` — it recreates the API Gateway and changes the URL. Always use `npx serverless deploy` (updates existing stack, keeps URL stable).

### AWS Configuration

- **Account**: `thecollectorsexchange` (ID: `903783977495`, Region: `ap-south-1`)
- **CLI Profile**: `thecollectorsexchange`
- **SSM Parameters**: `/thecollectorsexchange/*` prefix (JWT_SECRET, SUPABASE_URL, SUPABASE_ANON_KEY, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, etc.)
- **Lambda**: `serverless-esbuild` for bundling, `serverless-prune-plugin`, CJS format, architecture `arm64`, Node.js 20.x
- **Binary targets**: Prisma must include `linux-arm64-openssl-3.0.x` for Lambda ARM64

### Database (Supabase)

- **Project ref**: `rvamybeqoyznlgzglqqx`
- **Region**: `ap-southeast-1` (Singapore) — NOT `ap-south-1`
- **Direct URL** (IPv6-only, DO NOT USE from Lambda or local Windows):
  `postgresql://postgres.rvamybeqoyznlgzglqqx:LnhCxyKQWqvFN4j9@db.rvamybeqoyznlgzglqqx.supabase.co:5432/postgres`
- **Pooler URL** (USE THIS for everything):
  `postgresql://postgres.rvamybeqoyznlgzglqqx:LnhCxyKQWqvFN4j9@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1`
- **Cloudflare Pages env vars** (set via Wrangler): `VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

### Integration Workflow

1. Update `schema.prisma` -> `npx prisma generate`
2. Create Fastify route in `backend/routes/`
3. Create TanStack Query hook in `src/hooks/api/`
4. Wire into UI component
5. Apply Supabase migration: `supabase_apply_migration` tool
6. Deploy Lambda: `cd backend && npx serverless deploy`
7. Deploy frontends: `npm run build && wrangler pages deploy dist --project-name tce-user --branch=main` (same for admin)

## Coding Standards

- **ESLint**: Flat config v9 with `eslint.config.js`. Run `npm run lint` before committing.
- **Testing**: Vitest for unit tests, Playwright for E2E (`npm test`). Write tests before implementation (TDD).
- **Commits**: Keep focused. No secrets in commits.
- **Formatting**: Prettier is installed; use consistent formatting.

## Agent Rules & Skills

- `.agent/rules/frontend-guide.md` — Frontend specification (design tokens, components, Antigravity AI persona)
- `.agent/rules/backend-guide.md` — Backend & integration workflow
- `.agent/rules/skills-engineering.md` — Matt Pocock engineering skills (grill-me, tdd, improve-architecture)
- `DESIGN.md` — Full design system (colors, typography, components, patterns, accessibility)

## Key Files

- `CONTEXT.md` — Project domain glossary (ubiquitous language)
- `CONTRIBUTING.md` — Development setup, coding standards, PR process
- `MEMORY.md` — Persistent session memory for AI (decisions, config history, session log)
- `DESIGN.md` — Full design system (colors, typography, components, patterns, accessibility)
- `.editorconfig` — Cross-editor formatting settings
- `.prettierrc` — Prettier formatting configuration
- `docs/adr/` — Architecture Decision Records
- `backend/handler.js` — Lambda entry point (Fastify adapter)
- `backend/serverless.yml` — Lambda deploy config (esbuild, SSM, IAM)
- `backend/prisma/schema.prisma` — Prisma schema (includes `specs` JSON field on Product)
- `functions/api/blog/sitemap.xml.js` — Cloudflare Pages Function for dynamic blog sitemap
- `scripts/prerender-blogs.mjs` — Build-time prerender script for blog posts

## Quick Reference

```
npm run dev          — Start user frontend (port 5173)
npm run build        — Build + prerender blog posts (vite build && prerender-blogs.mjs)
npm run lint         — ESLint check
npm run format       — Prettier auto-format
npm test             — All tests (unit + E2E)
npm run test:unit    — Vitest unit/integration tests (all 3 areas via scripts/test-unit.mjs)
npm run test:e2e     — Playwright E2E tests
cd backend && npm run dev   — Backend API (port 3000)
cd admin && npm run dev     — Admin dashboard (port 5174)
cd backend && npx serverless deploy   — Deploy Lambda (NEVER use --force)
```

### Deploy (Cloudflare Pages)

```
npm run build && npx wrangler pages deploy dist --project-name=tce-user --branch=main
```

Build runs Vite + prerender script (generates static HTML for each blog post). Deploy uploads `dist/` to Cloudflare Pages. Cloudflare Pages Functions (`functions/`) are bundled automatically.

**Blog SEO**: Each `/archive/{slug}` URL is served as prerendered HTML with correct `<title>`, `<meta description>`, OG tags, Twitter cards, and JSON-LD structured data. Dynamic sitemap at `/api/blog/sitemap.xml` is always fresh (Cloudflare Pages Function).

## Pre-commit Hooks

Husky runs `npx lint-staged` on every commit — auto-formats and lints staged files only.

## Security Notes

- NEVER commit `.env` files or secrets
- `opencode.json` contains Supabase MCP tokens — keep out of commits
- All KYC documents flow through backend; admin approval creates vendor profiles
- Audit logging exists for all payout actions and admin operations

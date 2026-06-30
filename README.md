# The Collectors Exchange

A curated marketplace for verified pre-owned collectibles, antiques, and limited pieces.

**Live:**
- User Frontend: [tce-user.pages.dev](https://tce-user.pages.dev)
- Admin Dashboard: [tce-admin.pages.dev](https://tce-admin.pages.dev)
- Backend API: [the-collectors-exchange.onrender.com](https://the-collectors-exchange.onrender.com)

## Architecture

```
THE-COLLECTORS-EXCHANGE/
├── src/              — User-facing React app (Vite + Tailwind v4)
├── backend/          — API server (Fastify + Prisma + Supabase)
├── admin/            — Admin dashboard (React + Vite + Tailwind v3)
├── tests/            — Playwright E2E tests (38 tests, 5 flows)
└── docs/             — Architecture decisions & documentation
```

### Tech Stack

| Layer | Tech |
|-------|------|
| **Frontend (User)** | React 18, Vite 7, Tailwind CSS v4, React Router 7, TanStack Query 5, Axios, lucide-react |
| **Frontend (Admin)** | React 19, Vite 7, Tailwind CSS v3, Recharts, TanStack Query |
| **Backend** | Fastify 5, Prisma 6, Zod, Supabase Auth (JWT), Razorpay, Delhivery |
| **Database** | PostgreSQL (Supabase) |
| **Auth** | Supabase Auth (Email OTP + Google OAuth) |
| **Testing** | Vitest (unit), Playwright (E2E) |
| **Deployment** | Cloudflare Pages (frontends), Render (backend) |

## Quick Start

```bash
# User frontend
npm install
npm run dev          # http://localhost:5173

# Backend
cd backend
npm install
npx prisma generate
npm run dev          # http://localhost:3000

# Admin dashboard
cd admin
npm install
npm run dev          # http://localhost:5174

# E2E tests (from root)
npm test
```

## Documentation

- [Design System](DESIGN.md) — Colors, typography, components, patterns, accessibility
- [AI Agent Context](AGENTS.md) — Context for AI coding assistants
- [Session Memory](MEMORY.md) — Persistent decision log for AI sessions
- [Project Specification](PROJECT_SPECIFICATION.md) — Visual identity, design tokens, component architecture
- [Features](FEATURES.md) — Full feature inventory with API endpoints
- [Vendor Flow](vendor-flow.md) — Vendor lifecycle, KYC, payouts
- [Audit Progress](audit-progress.md) — Security audit: 61 issues, 58 fixed
- [Admin Docs](admin/ADMIN_DOCUMENTATION.md) — Admin architecture & workflows


## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint check |
| `npm test` | Run Playwright E2E tests |
| `npm run test:headed` | E2E tests with browser visible |
| `npm run test:ui` | Playwright UI mode |

## Environment

Copy `.env.example` to `.env` and configure:

- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — Supabase project credentials
- `VITE_RAZORPAY_KEY_ID` — Razorpay payment gateway key
- `VITE_BACKEND_URL` — Backend API URL (default: `http://localhost:3000`)

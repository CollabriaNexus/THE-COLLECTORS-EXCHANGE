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

| File | Purpose |
|------|---------|
| `frontend-guide.md` | Frontend design tokens, Antigravity AI persona, luxury minimalist aesthetic |
| `backend-guide.md` | Fastify + Prisma backend standards, integration workflow |
| `skills-engineering.md` | Matt Pocock skills: grill-me, tdd, diagnose, improve-architecture |

### Engineering Skills Available

| Command | When to Use |
|---------|-------------|
| `/grill-me` | Before any implementation — interview user until design is locked |
| `/grill-with-docs` | Same as above, but also builds/sharpens CONTEXT.md glossary |
| `/tdd` | Test-driven development (red-green-refactor, vertical slices) |
| `/diagnosing-bugs` | Hard bugs and performance regressions |
| `/improve-codebase-architecture` | Periodically scan for deepening opportunities |

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

| File | What It Is | Created |
|------|-----------|---------|
| `AGENTS.md` | AI entry point — project overview, domain language, architecture rules, quick reference | 2026-06-30 |
| `CONTEXT.md` | Ubiquitous language glossary (actors, core domain, verification, cart/checkout) | 2026-06-30 |
| `CONTRIBUTING.md` | Dev setup, code standards, testing policy, PR process | 2026-06-30 |
| `DESIGN.md` | Full design system — Liquid Glass + Luxury Minimalist, 10 sections | 2026-06-30 |
| `MEMORY.md` | This file — persistent session memory for AI | 2026-06-30 |
| `.editorconfig` | Cross-editor formatting (spaces, 2-indent, LF endings) | 2026-06-30 |
| `.prettierrc` | Prettier config (single quotes, trailing commas, 100 width) | 2026-06-30 |
| `.agent/rules/skills-engineering.md` | Matt Pocock engineering skills checklist | 2026-06-30 |
| `opencode.json` | Updated with agent config + skill references | 2026-06-30 |

### Files Modified

| File | Change | Date |
|------|--------|------|
| `.gitignore` | Changed `.agent/*` → `.agent/*.local` and `.agent/cache/` so rules ship with repo | 2026-06-30 |
| `README.md` | Rewritten from default Vite template to actual project description | 2026-06-30 |
| `package.json` | Added `format`, `format:check`, `test:unit`, `test:e2e` scripts | 2026-06-30 |
| `backend/package.json` | Added `test`, `test:coverage` scripts | 2026-06-30 |
| `admin/package.json` | Added `test`, `test:coverage` scripts | 2026-06-30 |

### ADRs Created

| ADR | Title | Date |
|-----|-------|------|
| `docs/adr/0001-record-architecture-decisions.md` | Recording architecture decisions | 2026-06-30 |
| `docs/adr/0002-frontend-stack.md` | Frontend stack decisions | 2026-06-30 |
| `docs/adr/0003-backend-stack.md` | Backend stack decisions | 2026-06-30 |

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

---

## Open Items / Pending Decisions

- [ ] E2E tests need real user flows instead of page-load smokes (see CONTRIBUTING.md)
- [ ] Coverage thresholds defined in vitest.config.js but not active in CI

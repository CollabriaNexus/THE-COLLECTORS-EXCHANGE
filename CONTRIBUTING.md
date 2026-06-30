# Contributing

## Development Setup

```bash
# Install dependencies
npm install
cd backend && npm install
cd admin && npm install

# Set up environment
cp .env.example .env    # Configure Supabase + Razorpay keys

# Start dev servers
npm run dev              # User frontend (port 5173)
cd backend && npm run dev  # Backend API (port 3000)
cd admin && npm run dev    # Admin dashboard (port 5174)
```

## Code Standards

### General
- **Language**: JavaScript (ESM). Use `import/export`.
- **Formatting**: Run `npm run lint` before committing. Prettier conventions apply.
- **Validation**: Use Zod for all request validation on the backend.
- **Documentation**: Use JSDoc for every function to define parameters and returns (backend).

### Frontend
- **Styling**: Tailwind CSS only. Never write custom CSS classes.
- **Icons**: `lucide-react` only. Never use emoji or Unicode icons.
- **Design**: Follow the "Luxury Minimalist" aesthetic — sharp borders, `tracking-widest` on uppercase labels, `transition-all duration-300`.
- **Colors**: Use the custom palette (`luxury-gold`, `heritage-charcoal`, etc.) not raw color values.
- **Components**: One component per file. Keep components focused and shallow.

### Backend
- **Schema-first**: Always update `schema.prisma` before writing routes.
- **Validation**: Every route must validate its inputs with a Zod schema.
- **Error format**: All errors respond with `{ error: string }`.
- **Auth**: Protected routes verify JWT via the auth decorator.

### Testing

Every new or modified code path MUST have corresponding tests. No test = blocked PR.

#### Backend — Integration Tests (Required for Every Route)

Every route file in `backend/routes/` must have a corresponding test file in `backend/test/routes/`. Tests use **Fastify's `app.inject()`** — real route handlers, real Zod validation, real auth decorators, real error handling. Only Prisma (database) and external services (Razorpay, Supabase) are mocked.

**Gold standard pattern** (see `backend/test/routes/products.test.js`):
- Build a Fastify instance with `buildApp(mockPrisma)`
- Register the actual route module
- Use `app.inject()` to simulate HTTP requests
- Test success paths, auth failures, validation errors, DB errors, edge cases

**Test coverage must cover:**
- 200/201 success paths
- 400 validation errors (bad input)
- 401 unauthenticated access
- 403 forbidden access (wrong role, banned, not owner)
- 404 not found
- 409/422 business rule violations (duplicate, limit reached)
- 500 database errors

**Required for every:** new route, route modification, schema change, new validation rule.

#### Frontend — Tests for Non-Trivial Code

**Must test (unit + integration):**
- **Hooks/API** (`src/hooks/api/`, `admin/src/hooks/api/`) — Every hook that fetches or mutates data. Test success data shape, loading state (isPending), error handling. Mock at the HTTP/Axios level, not the hook level.
- **Stateful components** — Components with internal state, user interactions, conditional rendering, or error states (e.g., ProductCard, LoginForm, NotificationsPanel). Prefer `@testing-library/react` and test behavior via screen queries, not implementation via state checks.
- **Utility functions** (`src/utils/`) — Pure functions with edge cases.
- **Route guards / App routing** — Auth-protected routes, redirects, 404s.

**Smoke tests only (render + heading check):**
- Static / informational pages (About, Privacy, Terms, FAQ, Contact)
- These just verify the page doesn't crash on mount

**Do NOT test:**
- Implementation details (internal state, private methods, class names unless functional)
- Third-party library internals
- Tautological assertions (testing that `a + b` equals the code's own `a + b`)

#### E2E Tests (Playwright)

Located in `tests/flows/`. Must test **real user flows** end-to-end:
- Guest browsing flow (already done)
- Auth → cart → checkout flow (needs expansion)
- Seller lifecycle (product creation, KYC submission)
- Admin management (KYC approval, order processing)

E2E tests should run against a real dev server and a test database, not be skipped due to missing env vars.

#### Running Tests

```bash
# All unit/integration tests (runs all three areas)
npm run test:unit

# Backend only
cd backend && npx vitest run

# User frontend only
npx vitest run

# Admin frontend only
cd admin && npx vitest run

# With coverage
cd backend && npx vitest run --coverage
npx vitest run --coverage

# E2E tests
npm run test:e2e            # headless
npm run test:e2e:headed     # visible browser
```

#### Coverage Thresholds (Enforced)

| Metric | Threshold |
|--------|-----------|
| Lines | 80% |
| Functions | 80% |
| Branches | 70% |
| Statements | 80% |

Coverage is enforced via `vitest.config.js` in each area. PRs that drop below these thresholds will fail.

## Pull Request Process

1. Create a feature branch from `main`.
2. Make your changes following the code standards above.
3. Run lint: `npm run lint`.
4. **Run all tests:** `npm run test:unit` (unit/integration) + `npm run test:e2e` (E2E).
5. **Check coverage is not degraded:** `npx vitest run --coverage` in affected area.
6. Submit a PR with a clear description of what, why, and what was tested.

## Architecture Decisions

Significant decisions are recorded as ADRs in `docs/adr/`. If you make a hard-to-reverse decision, add an ADR.

## AI Agent Usage

This repo includes AI agent instructions in `.agent/rules/`. When using AI coding tools:

1. Start by reading `AGENTS.md` for project context.
2. Run `/grill-me` or `/grill-with-docs` to align on the design before coding.
3. Use `/tdd` for test-driven development.
4. Run `/improve-codebase-architecture` periodically to prevent architectural drift.

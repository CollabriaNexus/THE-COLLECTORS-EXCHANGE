# ADR 2: Frontend Stack

**Date:** 2026-06-30  
**Status:** Accepted  

## Context

The project has two frontend applications (user-facing and admin) that need to share a consistent design language while being independently deployable.

## Decision

- **User Frontend**: React 18 + Vite 7 + Tailwind CSS v4 + React Router v7 + TanStack Query v5
- **Admin Dashboard**: React 19 + Vite 7 + Tailwind CSS v3 + Recharts + TanStack Query
- Both use `lucide-react` for icons and Axios for HTTP requests
- JavaScript (JSX), not TypeScript

The admin uses Tailwind v3 while the user frontend uses v4 due to the upgrade timing.

## Consequences

- Different Tailwind versions mean some utilities differ between apps
- No TypeScript means less compile-time safety but faster iteration
- Shared icon library keeps visual consistency

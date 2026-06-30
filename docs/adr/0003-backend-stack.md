# ADR 3: Backend Stack

**Date:** 2026-06-30  
**Status:** Accepted  

## Context

The backend powers both frontend applications and integrates with payment and shipping providers.

## Decision

- **Framework**: Fastify 5 for high performance and native schema validation
- **Validation**: Zod for all request/response schemas
- **ORM**: Prisma 6 with PostgreSQL (Supabase)
- **Auth**: Supabase Auth with JWT verification via auth decorator
- **Payments**: Razorpay for payment processing and verification
- **Shipping**: Delhivery integration for order fulfillment

## Consequences

- Fastify's plugin system keeps routes modular and testable
- Prisma provides type-safe database access without TypeScript
- Supabase handles auth infrastructure reducing maintenance burden
- Razorpay + Delhivery are India-focused; international expansion would require additional providers

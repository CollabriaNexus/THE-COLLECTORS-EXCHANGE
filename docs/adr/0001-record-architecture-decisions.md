# ADR 1: Record Architecture Decisions

**Date:** 2026-06-30  
**Status:** Accepted  

## Context

The project needs a consistent way to document architectural decisions so that AI agents and human developers can understand why things are done a certain way.

## Decision

We will use Architecture Decision Records (ADRs) in `docs/adr/`. Each ADR is a short markdown file describing a significant decision, its context, alternatives considered, and the chosen approach.

## Consequences

- Decisions are durable and discoverable
- AI agents can respect past decisions without re-litigating them
- New team members can quickly understand architectural rationale

---
description: Read this BEFORE implementing or modifying any route handlers (API routes) to ensure compliance with project standards.
---

# Route Handler Standards

This document defines the standards for implementing **route handlers** (`route.ts`) in this Next.js application.

## Core Principles

1. **All data mutations MUST use route handlers** — never mutate data directly in components or server actions. fileciteturn1file0L11-L14
2. **Route handlers are called from Client Components only** — mark calling components with `"use client"`. fileciteturn1file0L11-L14
3. **Colocation is required** — route handler files MUST be named `route.ts` and placed in the same directory as the component that calls them. fileciteturn1file0L11-L14
4. **NEVER throw errors** — always return `{ success, data? }` or `{ success, error }`. fileciteturn1file0L11-L14

## Data Fetching & DB Access Rules

- **Never write raw DB queries inside components.** Always use helper functions in the `/data` directory for data fetching and DB access. fileciteturn1file11L13-L17
- Helper functions in `/data` should use **Drizzle ORM**. fileciteturn1file11L15-L17

> Note: Route handlers may call `/data/*` helpers directly. Components should not.

## Authentication & Authorization (Clerk)

- **Clerk is the only auth provider** for this app. fileciteturn1file5L7-L17
- For any protected mutation, **verify auth server-side** in the route handler using `auth()` and return an Unauthorized response if needed. fileciteturn1file7L61-L78
- **Validate ownership**: if the mutation modifies a user-owned resource, ensure the authenticated `userId` owns that resource before mutating. fileciteturn1file9L1-L4

## File Naming & Structure

Route handlers MUST be colocated and named exactly `route.ts`:

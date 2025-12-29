# Agent Instructions

This file provides guidance for AI coding assistants working on the **gh-copilot-linkshortener** project.

## Overview

This is a Next.js link shortener application with the following stack:

- **Framework**: Next.js 16 (App Router) with React 19
- **Language**: TypeScript 5 (strict mode)
- **Database**: PostgreSQL via Neon (serverless)
- **ORM**: Drizzle ORM
- **Authentication**: Clerk
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui exclusively (no custom components)

## Quick Reference

### Tech Stack Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run db:generate  # Generate database migrations
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio
```

### Important Paths

- **App Router**: `/app`
- **Components**: `/components/ui` (base) and `/components/features` (feature-specific)
- **Database**: `/db/schema.ts` (schema), `/db/index.ts` (client)
- **Utilities**: `/lib/utils.ts`
- **Documentation**: `/docs/*.md`

## ⚠️ CRITICAL: Read Documentation BEFORE Coding

**MANDATORY REQUIREMENT**: All coding standards, patterns, and best practices are documented in separate files in the `/docs` directory.

**YOU MUST ALWAYS READ THE RELEVANT DOCUMENTATION FILE(S) BEFORE GENERATING ANY CODE.**

Do not skip this step. Do not assume you know the patterns. The documentation contains critical project-specific requirements that must be followed:

### 📋 [Coding Standards](docs/coding-standards.md)

General TypeScript, React, and Next.js coding standards including:

- TypeScript best practices and type safety
- Naming conventions
- Component structure patterns
- Server vs Client Components
- Import organization
- Error handling
- Code quality guidelines

### 🗄️ [Database Standards](docs/database-standards.md)

Drizzle ORM and database patterns including:

- Schema design and naming conventions
- Table definitions and column types
- Query patterns and type safety
- Migration workflow
- Transaction handling
- Performance best practices
- Data validation

### 🔐 [Authentication Standards](docs/authentication-standards.md)

Clerk authentication implementation including:

- Setup and configuration
- Server-side and client-side auth
- Protected routes and middleware
- Server Actions with auth
- API route protection
- User ID storage in database
- Security best practices

### 🎨 [UI Component Standards](docs/ui-components.md)

shadcn/ui component usage (REQUIRED - use shadcn/ui exclusively):

- Using shadcn/ui components only (no custom components)
- Adding components via shadcn CLI
- Component composition patterns
- Form components with react-hook-form
- Lucide icons
- Dark mode support
- Accessibility standards
- Loading and error states

### 🏗️ [Project Architecture](docs/project-architecture.md)

Overall project structure and patterns including:

- Technology stack overview
- Project folder structure
- Architectural patterns
- Data flow patterns
- Feature development workflow
- Environment management
- Performance optimization
- Error handling
- Deployment guidelines

## Key Principles

When working on this project, always:

1. **Read Documentation First**: ALWAYS read relevant `/docs` files BEFORE generating any code
2. **Type Safety First**: Use TypeScript strictly, no `any` types
3. **Server-First**: Prefer Server Components, use Client Components only when needed
4. **shadcn/ui Only**: Use shadcn/ui components exclusively, never create custom UI components
5. **Authentication**: Always verify auth server-side for protected operations
6. **Database**: Use Drizzle ORM type-safe queries, never raw SQL
7. **Styling**: Use Tailwind CSS with dark mode support
8. **Accessibility**: Ensure proper ARIA labels and keyboard navigation
9. **Performance**: Optimize for serverless environment, minimize client bundle

## Adding New Features

**IMPORTANT**: Before writing any code, you MUST read the relevant documentation files in the `/docs` directory.

When implementing new features:

1. **READ the relevant documentation in `/docs` folder FIRST** (this is mandatory)
2. Follow the established patterns in existing code
3. Use Server Components by default
4. Protect routes with Clerk authentication
5. Define database schema with Drizzle
6. Create type-safe query functions
7. Build accessible UI components
8. Test both light and dark modes

## Before Committing

- [ ] Code follows TypeScript strict mode (no `any`, proper types)
- [ ] Server/Client components used appropriately
- [ ] Authentication checks in place for protected operations
- [ ] Database queries use Drizzle ORM type-safe patterns
- [ ] UI components include dark mode styles
- [ ] No environment secrets in code
- [ ] ESLint passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)

## Getting Help

- For coding patterns: See relevant doc in `/docs`
- For dependencies: Check [package.json](package.json)
- For configuration: See config files (`next.config.ts`, `tsconfig.json`, etc.)
- For database schema: See [db/schema.ts](db/schema.ts)

## Important Notes

- This project uses **Next.js App Router**, not Pages Router
- **Server Components** are the default - add `"use client"` only when necessary
- All database operations must go through **Drizzle ORM**
- Authentication is handled by **Clerk** - use their hooks and utilities
- Use the `cn()` utility from `/lib/utils.ts` for conditional Tailwind classes
- Always support **dark mode** with `dark:` variants

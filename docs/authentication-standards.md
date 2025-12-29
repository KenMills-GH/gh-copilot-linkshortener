# Authentication Standards

## Overview

**ALL authentication in this application is handled exclusively by Clerk.** No other authentication methods, libraries, or custom auth solutions should be used.

## Core Principles

- **Clerk Only**: Use Clerk for all authentication and user management
- **Server-Side Verification**: Always verify authentication server-side for protected operations
- **Modal Authentication**: Sign in and sign up must launch as modals (not full-page redirects)
- **Protected Routes**: Dashboard and other protected pages require authentication
- **Smart Redirects**: Logged-in users accessing the homepage should be redirected to /dashboard

## Environment Setup

### Required Environment Variables

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

## Route Protection

### Protected Routes

The following routes require authentication:

- `/dashboard` - Main dashboard (primary protected route)
- Any other routes that require user-specific data

### Middleware Configuration

Create `middleware.ts` in the root directory:

```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
```

### Homepage Redirect for Authenticated Users

In your homepage Server Component (`app/page.tsx`):

```typescript
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  // Render public homepage for unauthenticated users
  return <main>{/* Homepage content */}</main>;
}
```

## Modal Authentication

### ClerkProvider Configuration

Configure Clerk in your root layout to use modal authentication:

```typescript
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#000000",
        },
      }}
    >
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

### Sign In/Sign Up Buttons

Use Clerk's built-in components for modal authentication:

```typescript
"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function AuthButtons() {
  return (
    <div className="flex gap-4">
      <SignInButton mode="modal">
        <Button variant="outline">Sign In</Button>
      </SignInButton>
      <SignUpButton mode="modal">
        <Button>Sign Up</Button>
      </SignUpButton>
    </div>
  );
}
```

**Important**: Always use `mode="modal"` to ensure authentication opens in a modal, not a full-page redirect.

## Server-Side Authentication

### Server Components

Use Clerk's `auth()` helper to check authentication in Server Components:

```typescript
import { auth } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    // Middleware should handle this, but good practice to check
    redirect("/");
  }

  // Fetch user-specific data using userId
  const userLinks = await db.query.links.findMany({
    where: eq(links.userId, userId),
  });

  return <div>{/* Dashboard content */}</div>;
}
```

### Server Actions

Always verify authentication in Server Actions:

```typescript
"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { links } from "@/db/schema";

export async function createLink(url: string, slug: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const newLink = await db
    .insert(links)
    .values({
      userId,
      originalUrl: url,
      slug,
      createdAt: new Date(),
    })
    .returning();

  return newLink[0];
}
```

### API Routes

Protect API routes with authentication checks:

```typescript
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Handle authenticated request
  return NextResponse.json({ data: "..." });
}
```

## Client-Side Authentication

### Using User Data in Client Components

Use Clerk's hooks to access user data:

```typescript
"use client";

import { useUser } from "@clerk/nextjs";

export function UserProfile() {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return null;
  }

  return (
    <div>
      <p>Welcome, {user.firstName}!</p>
      <p>{user.emailAddresses[0].emailAddress}</p>
    </div>
  );
}
```

### User Button Component

Display user account management:

```typescript
"use client";

import { UserButton } from "@clerk/nextjs";

export function Header() {
  return (
    <header>
      <UserButton
        afterSignOutUrl="/"
        appearance={{
          elements: {
            avatarBox: "h-10 w-10",
          },
        }}
      />
    </header>
  );
}
```

## Database Integration

### Storing User IDs

Always store Clerk's `userId` in your database for relational data:

```typescript
// db/schema.ts
import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const links = pgTable("links", {
  id: text("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(), // Clerk user ID
  originalUrl: text("original_url").notNull(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

### Querying User-Specific Data

Always filter by `userId` for user-specific operations:

```typescript
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { links } from "@/db/schema";

export async function getUserLinks() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  return await db.query.links.findMany({
    where: eq(links.userId, userId),
    orderBy: (links, { desc }) => [desc(links.createdAt)],
  });
}
```

## Common Patterns

### Conditional Rendering Based on Auth

```typescript
"use client";

import { useAuth } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function ConditionalContent() {
  const { isSignedIn } = useAuth();

  return (
    <div>
      {isSignedIn ? (
        <Button>Create Link</Button>
      ) : (
        <SignInButton mode="modal">
          <Button>Sign In to Create Links</Button>
        </SignInButton>
      )}
    </div>
  );
}
```

### Loading States

Always handle loading states when checking auth:

```typescript
"use client";

import { useAuth } from "@clerk/nextjs";

export function ProtectedContent() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <div>Please sign in to continue</div>;
  }

  return <div>Protected content</div>;
}
```

## Security Best Practices

1. **Never Trust Client-Side Auth**: Always verify authentication server-side for sensitive operations
2. **Use Server Actions**: Prefer Server Actions over API routes for mutations
3. **Validate User Ownership**: Always check that the authenticated user owns the resource they're accessing
4. **No Sensitive Data on Client**: Never expose sensitive user data to client components unnecessarily
5. **Environment Variables**: Keep Clerk secret key server-side only (no `NEXT_PUBLIC_` prefix)

## DO NOT

- ❌ Implement custom authentication (JWT, sessions, cookies, etc.)
- ❌ Use any auth library other than Clerk
- ❌ Allow access to `/dashboard` without authentication
- ❌ Use full-page redirects for sign in/sign up (always use modals)
- ❌ Skip authentication checks in Server Actions or API routes
- ❌ Store passwords or auth credentials in the database
- ❌ Allow logged-in users to access the homepage (redirect to `/dashboard`)

## DO

- ✅ Use Clerk's built-in components (`SignInButton`, `SignUpButton`, `UserButton`)
- ✅ Always use `mode="modal"` for authentication buttons
- ✅ Verify auth server-side in Server Components, Server Actions, and API routes
- ✅ Store only Clerk's `userId` in your database
- ✅ Protect routes using Clerk middleware
- ✅ Redirect authenticated users from homepage to dashboard
- ✅ Handle loading states when checking authentication
- ✅ Use TypeScript types from `@clerk/nextjs`

## Checklist for Auth Implementation

- [ ] Clerk environment variables configured
- [ ] Middleware created with protected routes
- [ ] Homepage redirects logged-in users to `/dashboard`
- [ ] Sign in/sign up use modal mode
- [ ] Server Actions verify authentication
- [ ] Database schema includes `userId` field
- [ ] UserButton component in header
- [ ] Loading states handled in client components
- [ ] No custom auth code anywhere in the project

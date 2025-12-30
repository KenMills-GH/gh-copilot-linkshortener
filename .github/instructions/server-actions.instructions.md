---
description: Read this BEFORE implementing or modifying any server actions or data mutations to ensure compliance with project standards.
---

# Server Actions Standards

This document defines the standards for implementing server actions in this Next.js application.

## Core Principles

1. **All data mutations MUST use server actions** - Never mutate data directly in components or API routes
2. **Server actions are called from Client Components only** - Mark components with `"use client"`
3. **Colocation is required** - Server action files MUST be named `actions.ts` and placed in the same directory as the component that calls them
4. **NEVER throw errors** - Always return an object with `success` and either `data` or `error` properties

## File Structure

```
app/
  dashboard/
    page.tsx           # Client Component calling the action
    actions.ts         # Server actions for this route
data/
  links.ts            # Database helper functions (Drizzle queries)
```

## Server Action Requirements

### 1. File Naming and Location

```typescript
// ✅ CORRECT: app/dashboard/actions.ts
"use server";

export async function createLink(data: CreateLinkInput) {
  // ...
}
```

```typescript
// ❌ WRONG: app/dashboard/link-actions.ts
// ❌ WRONG: app/actions/dashboard.ts
```

### 2. Type Safety (NO FormData)

```typescript
// ✅ CORRECT: Use proper TypeScript types
import { z } from "zod";

const createLinkSchema = z.object({
  url: z.string().url(),
  slug: z.string().min(3),
});

type CreateLinkInput = z.infer<typeof createLinkSchema>;

export async function createLink(data: CreateLinkInput) {
  // ...
}
```

```typescript
// ❌ WRONG: Using FormData type
export async function createLink(formData: FormData) {
  // ...
}
```

### 3. Validation with Zod

All data MUST be validated using Zod before processing. Use `safeParse` and return error object:

```typescript
"use server";

import { z } from "zod";

const createLinkSchema = z.object({
  url: z.string().url(),
  slug: z.string().min(3).max(50),
});

type CreateLinkInput = z.infer<typeof createLinkSchema>;

export async function createLink(data: CreateLinkInput) {
  // Validate input
  const validation = createLinkSchema.safeParse(data);

  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message };
  }

  // Continue with action...
}
```

### 4. Authentication Check

ALWAYS check for authenticated user BEFORE database operations. Return error object if not authenticated:

```typescript
"use server";

import { auth } from "@clerk/nextjs/server";

export async function createLink(data: CreateLinkInput) {
  // 1. Check authentication FIRST
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "You must be logged in to create links" };
  }

  // 2. Validate data
  const validation = createLinkSchema.safeParse(data);

  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message };
  }

  // 3. Perform database operations
  // ...
}
```

### 5. Database Operations via Helper Functions

Server actions MUST NOT use Drizzle queries directly. Use helper functions from `/data` directory:

```typescript
// ✅ CORRECT: app/dashboard/actions.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { createLinkInDb, getLinkBySlug } from "@/data/links";

const createLinkSchema = z.object({
  url: z.string().url(),
  slug: z.string().min(3),
});

type CreateLinkInput = z.infer<typeof createLinkSchema>;

export async function createLink(data: CreateLinkInput) {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "You must be logged in to create links" };
  }

  const validation = createLinkSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message };
  }

  // Use helper function from /data directory
  const link = await createLinkInDb({
    url: validation.data.url,
    slug: validation.data.slug,
    userId,
  });

  return { success: true, data: link };
}
```

```typescript
// ❌ WRONG: Direct Drizzle queries in server action
"use server";

import { db } from "@/db";
import { links } from "@/db/schema";

export async function createLink(data: CreateLinkInput) {
  // ❌ WRONG: Do NOT use Drizzle directly here
  const link = await db.insert(links).values(data).returning();
  return link;
}
```

## Complete Example

### Client Component

```typescript
// app/dashboard/page.tsx
"use client";

import { useState } from "react";
import { createLink } from "./actions";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const result = await createLink({
      url: formData.get("url") as string,
      slug: formData.get("slug") as string,
    });

    if (!result.success) {
      setError(result.error);
    }

    setIsLoading(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="text-red-500">{error}</p>}
      <input name="url" type="url" required />
      <input name="slug" type="text" required />
      <Button type="submit" disabled={isLoading}>
        Create Link
      </Button>
    </form>
  );
}
```

### Server Action

```typescript
// app/dashboard/actions.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { createLinkInDb } from "@/data/links";
import { revalidatePath } from "next/cache";

const createLinkSchema = z.object({
  url: z.string().url("Invalid URL"),
  slug: z.string().min(3, "Slug must be at least 3 characters").max(50),
});

type CreateLinkInput = z.infer<typeof createLinkSchema>;

export async function createLink(data: CreateLinkInput) {
  // 1. Authentication check
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "You must be logged in to create links" };
  }

  // 2. Validate input
  const validation = createLinkSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message };
  }

  // 3. Database operation via helper
  const link = await createLinkInDb({
    url: validation.data.url,
    slug: validation.data.slug,
    userId,
  });

  // 4. Revalidate cache
  revalidatePath("/dashboard");

  return { success: true, data: link };
}
```

### Database Helper

```typescript
// data/links.ts
import { db } from "@/db";
import { links } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function createLinkInDb(data: {
  url: string;
  slug: string;
  userId: string;
}) {
  const [link] = await db
    .insert(links)
    .values({
      url: data.url,
      slug: data.slug,
      userId: data.userId,
      createdAt: new Date(),
    })
    .returning();

  return link;
}

export async function getLinkBySlug(slug: string) {
  const [link] = await db.select().from(links).where(eq(links.slug, slug));

  return link;
}
```

## Checklist

Before committing server actions:

- [ ] File is named `actions.ts` and colocated with component
- [ ] `"use server"` directive at top of file
- [ ] Uses proper TypeScript types (NOT FormData)
- [ ] All inputs validated with Zod
- [ ] Authentication check before database operations
- [ ] Database operations use helper functions from `/data`
- [ ] No direct Drizzle queries in server action
- [ ] Error handling implemented
- [ ] Cache revalidation if needed (`revalidatePath`, `revalidateTag`)

## Common Patterns

### Error Handling

Always return an object with `success` property. NEVER throw errors:

```typescript
export async function createLink(data: CreateLinkInput) {
  // 1. Authentication
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "You must be logged in" };
  }

  // 2. Validation
  const validation = createLinkSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message };
  }

  // 3. Database operation (wrap in try-catch for unexpected errors)
  try {
    const link = await createLinkInDb({ ...validation.data, userId });
    revalidatePath("/dashboard");
    return { success: true, data: link };
  } catch (error) {
    console.error("Database error:", error);
    return { success: false, error: "Failed to create link" };
  }
}
```

### Optimistic Updates

```typescript
// Client component
import { useOptimistic } from "react";

const [optimisticLinks, addOptimisticLink] = useOptimistic(
  links,
  (state, newLink) => [...state, newLink]
);
```

## Anti-Patterns

❌ **NEVER do these:**

1. Throwing errors - always return `{ success: false, error: "message" }`
2. Direct Drizzle queries in server actions
3. Using FormData as TypeScript type
4. Skipping authentication checks
5. Skipping validation
6. Naming files anything other than `actions.ts`
7. Placing actions in centralized directories
8. Calling server actions from Server Components
9. Using `.parse()` instead of `.safeParse()` for Zod validation

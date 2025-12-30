---
description: Read this BEFORE implementing or modifying any UI components to ensure compliance with project standards.
---

# UI Component Standards

## Overview

This project uses **shadcn/ui** exclusively for all UI components. Do not create custom components from scratch - always use shadcn/ui components.

## Configuration

- **Style**: New York variant
- **Icon Library**: Lucide React
- **Base Color**: Neutral
- **CSS Variables**: Enabled
- **RSC**: Enabled (React Server Components)

## Core Principles

1. **Always Use shadcn/ui**: Never create custom UI components - use shadcn/ui components
2. **Component Installation**: Add components via the shadcn CLI when needed
3. **Composition Over Creation**: Compose existing shadcn components to build features
4. **Dark Mode**: All components support dark mode out of the box
5. **Accessibility**: Components include proper ARIA attributes and keyboard navigation

## Adding Components

To add a new shadcn/ui component:

```bash
npx shadcn@latest add [component-name]
```

Common components:

- `button` - Buttons in various styles
- `input` - Form inputs
- `card` - Card containers
- `dialog` - Modal dialogs
- `form` - Form components with react-hook-form integration
- `table` - Data tables
- `badge` - Status badges
- `dropdown-menu` - Dropdown menus
- `toast` - Toast notifications
- `skeleton` - Loading skeletons

## Component Usage Patterns

### Importing Components

```typescript
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
```

### Using Components

```tsx
// Button variants
<Button variant="default">Click me</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost">Menu</Button>

// Cards
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

### Styling with Tailwind

Use the `cn()` utility from `@/lib/utils` for conditional classes:

```tsx
import { cn } from "@/lib/utils";

<Button className={cn("w-full", isActive && "bg-primary")}>Submit</Button>;
```

## Component Composition

Build features by composing shadcn components:

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LinkForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Short Link</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input placeholder="Enter URL..." />
        <Button className="w-full">Shorten</Button>
      </CardContent>
    </Card>
  );
}
```

## Forms

Use shadcn's form components with react-hook-form:

```bash
npx shadcn@latest add form
```

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const schema = z.object({
  url: z.string().url(),
});

export function MyForm() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

## Icons

Use Lucide React icons (installed with shadcn/ui):

```tsx
import { Link, Copy, Trash2, ExternalLink } from "lucide-react";

<Button>
  <Link className="mr-2 h-4 w-4" />
  Create Link
</Button>;
```

## Dark Mode

All shadcn components automatically support dark mode through CSS variables. Use `dark:` Tailwind variants for custom styling:

```tsx
<div className="bg-white dark:bg-slate-950">
  <Card className="border-gray-200 dark:border-gray-800">Content</Card>
</div>
```

## Common Patterns

### Loading States

```tsx
import { Skeleton } from "@/components/ui/skeleton";

<Skeleton className="h-12 w-full" />;
```

### Error States

```tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Something went wrong</AlertDescription>
</Alert>;
```

### Toast Notifications

```tsx
import { useToast } from "@/hooks/use-toast";

const { toast } = useToast();

toast({
  title: "Success",
  description: "Link created successfully",
});
```

## Component Organization

```
/components
  /ui              # shadcn/ui components (auto-generated)
    button.tsx
    card.tsx
    input.tsx
    ...
  /features        # Feature-specific compositions of ui components
    link-form.tsx
    link-list.tsx
    ...
```

## Rules

1. ❌ **DO NOT** create custom button, input, card, or other basic UI components
2. ✅ **DO** use shadcn/ui components from `/components/ui`
3. ✅ **DO** compose shadcn components to build features in `/components/features`
4. ✅ **DO** add new shadcn components when needed via CLI
5. ✅ **DO** use the `cn()` utility for conditional styling
6. ✅ **DO** support dark mode in all custom compositions
7. ✅ **DO** maintain accessibility standards from shadcn components

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Component List](https://ui.shadcn.com/docs/components)
- [Lucide Icons](https://lucide.dev)

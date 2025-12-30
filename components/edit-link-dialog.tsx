"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, Loader2 } from "lucide-react";
import { updateLink } from "@/app/dashboard/actions";

const updateLinkSchema = z.object({
  id: z.number(),
  url: z.string().url("Please enter a valid URL"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(50, "Slug must be less than 50 characters")
    .regex(
      /^[a-zA-Z0-9-_]+$/,
      "Slug can only contain letters, numbers, hyphens, and underscores"
    ),
});

type UpdateLinkFormValues = z.infer<typeof updateLinkSchema>;

interface EditLinkDialogProps {
  link: {
    id: number;
    slug: string;
    originalUrl: string;
  };
}

export function EditLinkDialog({ link }: EditLinkDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<UpdateLinkFormValues>({
    resolver: zodResolver(updateLinkSchema),
    defaultValues: {
      id: link.id,
      url: link.originalUrl,
      slug: link.slug,
    },
  });

  async function onSubmit(values: UpdateLinkFormValues) {
    setError(null);

    const result = await updateLink(values);

    if (!result.success) {
      setError(result.error ?? "An error occurred");
      return;
    }

    // Success - close dialog and reset form
    setOpen(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Link</DialogTitle>
          <DialogDescription>
            Update the URL or slug for your shortened link.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Original URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/very-long-url"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The full URL you want to shorten
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="my-link" {...field} />
                  </FormControl>
                  <FormDescription>
                    The short identifier for your link (letters, numbers,
                    hyphens, and underscores only)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  form.reset();
                  setError(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Update Link
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

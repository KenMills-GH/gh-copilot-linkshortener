"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import {
  createLinkInDb,
  getLinkBySlug,
  updateLinkInDb,
  deleteLinkInDb,
  getLinkById,
} from "@/data/links";
import { revalidatePath } from "next/cache";
import { checkRateLimit } from "@/lib/rate-limit";

const createLinkSchema = z.object({
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

type CreateLinkInput = z.infer<typeof createLinkSchema>;
type UpdateLinkInput = z.infer<typeof updateLinkSchema>;

export async function createLink(data: CreateLinkInput) {
  // 1. Check authentication FIRST
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "You must be logged in to create links" };
  }

  // 1b. Rate limiting - 10 links per minute per user
  const rateLimitAllowed = checkRateLimit(`create-link:${userId}`, {
    max: 10,
    windowMs: 60000,
  });

  if (!rateLimitAllowed) {
    return {
      success: false,
      error: "Too many requests. Please wait a moment and try again.",
    };
  }

  // 2. Validate data
  const validation = createLinkSchema.safeParse(data);

  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  // 2b. Validate URL protocol to prevent malicious URLs
  try {
    const url = new URL(validation.data.url);
    if (!["http:", "https:"].includes(url.protocol)) {
      return {
        success: false,
        error: "Only HTTP and HTTPS URLs are allowed",
      };
    }
  } catch (urlError) {
    return {
      success: false,
      error: "Invalid URL format",
    };
  }

  // 3. Check if slug already exists
  const existingLink = await getLinkBySlug(validation.data.slug);

  if (existingLink) {
    return { success: false, error: "This slug is already taken" };
  }

  // 4. Create link in database
  try {
    const link = await createLinkInDb({
      originalUrl: validation.data.url,
      slug: validation.data.slug,
      userId,
    });

    // 5. Revalidate dashboard page to show new link
    revalidatePath("/dashboard");

    return { success: true, data: link };
  } catch (error) {
    console.error("Error creating link:", error);
    return {
      success: false,
      error: "Failed to create link. Please try again.",
    };
  }
}

export async function updateLink(data: UpdateLinkInput) {
  // 1. Check authentication FIRST
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "You must be logged in to update links" };
  }

  // 1b. Rate limiting - 20 updates per minute per user
  const rateLimitAllowed = checkRateLimit(`update-link:${userId}`, {
    max: 20,
    windowMs: 60000,
  });

  if (!rateLimitAllowed) {
    return {
      success: false,
      error: "Too many requests. Please wait a moment and try again.",
    };
  }

  // 2. Validate data
  const validation = updateLinkSchema.safeParse(data);

  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  // 2b. Validate URL protocol to prevent malicious URLs
  try {
    const url = new URL(validation.data.url);
    if (!["http:", "https:"].includes(url.protocol)) {
      return {
        success: false,
        error: "Only HTTP and HTTPS URLs are allowed",
      };
    }
  } catch (urlError) {
    return {
      success: false,
      error: "Invalid URL format",
    };
  }

  // 3. Verify link ownership
  const existingLink = await getLinkById(validation.data.id);

  if (!existingLink) {
    return { success: false, error: "Link not found" };
  }

  if (existingLink.userId !== userId) {
    return {
      success: false,
      error: "You don't have permission to update this link",
    };
  }

  // 4. Check if new slug is already taken (by a different link)
  if (existingLink.slug !== validation.data.slug) {
    const slugTaken = await getLinkBySlug(validation.data.slug);
    if (slugTaken && slugTaken.id !== validation.data.id) {
      return { success: false, error: "This slug is already taken" };
    }
  }

  // 5. Update link in database
  try {
    const link = await updateLinkInDb(validation.data.id, {
      originalUrl: validation.data.url,
      slug: validation.data.slug,
    });

    // 6. Revalidate dashboard page to show updated link
    revalidatePath("/dashboard");

    return { success: true, data: link };
  } catch (error) {
    console.error("Error updating link:", error);
    return {
      success: false,
      error: "Failed to update link. Please try again.",
    };
  }
}

export async function deleteLink(linkId: number) {
  // 1. Check authentication FIRST
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "You must be logged in to delete links" };
  }

  // 1b. Rate limiting - 20 deletes per minute per user
  const rateLimitAllowed = checkRateLimit(`delete-link:${userId}`, {
    max: 20,
    windowMs: 60000,
  });

  if (!rateLimitAllowed) {
    return {
      success: false,
      error: "Too many requests. Please wait a moment and try again.",
    };
  }

  // 2. Verify link ownership
  const existingLink = await getLinkById(linkId);

  if (!existingLink) {
    return { success: false, error: "Link not found" };
  }

  if (existingLink.userId !== userId) {
    return {
      success: false,
      error: "You don't have permission to delete this link",
    };
  }

  // 3. Delete link from database
  try {
    await deleteLinkInDb(linkId);

    // 4. Revalidate dashboard page to remove deleted link
    revalidatePath("/dashboard");

    return { success: true, data: null };
  } catch (error) {
    console.error("Error deleting link:", error);
    return {
      success: false,
      error: "Failed to delete link. Please try again.",
    };
  }
}

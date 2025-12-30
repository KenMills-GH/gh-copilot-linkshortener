import { db } from "@/db";
import { links } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

/**
 * Get all links for a specific user
 * Ordered by creation date (newest first)
 */
export async function getUserLinks(userId: string) {
  return db
    .select()
    .from(links)
    .where(eq(links.userId, userId))
    .orderBy(desc(links.createdAt));
}

/**
 * Get a link by its slug
 */
export async function getLinkBySlug(slug: string) {
  const result = await db
    .select()
    .from(links)
    .where(eq(links.slug, slug))
    .limit(1);

  return result[0] ?? null;
}

/**
 * Create a new link in the database
 */
export async function createLinkInDb(data: {
  userId: string;
  slug: string;
  originalUrl: string;
}) {
  const result = await db
    .insert(links)
    .values({
      userId: data.userId,
      slug: data.slug,
      originalUrl: data.originalUrl,
    })
    .returning();

  return result[0];
}

/**
 * Update an existing link in the database
 */
export async function updateLinkInDb(
  linkId: number,
  data: {
    slug: string;
    originalUrl: string;
  }
) {
  const result = await db
    .update(links)
    .set({
      slug: data.slug,
      originalUrl: data.originalUrl,
      updatedAt: new Date(),
    })
    .where(eq(links.id, linkId))
    .returning();

  return result[0];
}

/**
 * Delete a link from the database
 */
export async function deleteLinkInDb(linkId: number) {
  const result = await db.delete(links).where(eq(links.id, linkId)).returning();

  return result[0];
}

/**
 * Get a link by its ID (for ownership verification)
 */
export async function getLinkById(linkId: number) {
  const result = await db
    .select()
    .from(links)
    .where(eq(links.id, linkId))
    .limit(1);

  return result[0] ?? null;
}

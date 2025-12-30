import { drizzle } from "drizzle-orm/neon-http";
import { eq, desc } from "drizzle-orm";
import { links } from "./schema";

const db = drizzle(process.env.DATABASE_URL!);

export { db };

// Type-safe query helpers for links table

/**
 * Create a new shortened link
 */
export async function createLink(data: {
  userId: string;
  slug: string;
  originalUrl: string;
}) {
  const [link] = await db.insert(links).values(data).returning();
  return link;
}

/**
 * Get a link by its slug (short code)
 */
export async function getLinkBySlug(slug: string) {
  const [link] = await db.select().from(links).where(eq(links.slug, slug));
  return link;
}

/**
 * Get all links for a specific user
 */
export async function getUserLinks(userId: string) {
  return db
    .select()
    .from(links)
    .where(eq(links.userId, userId))
    .orderBy(desc(links.createdAt));
}

/**
 * Update a link's URL (manually updates updatedAt)
 */
export async function updateLink(
  id: string,
  userId: string,
  data: { originalUrl: string }
) {
  const [link] = await db
    .update(links)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(links.id, id))
    .returning();
  return link;
}

/**
 * Delete a link (permanent deletion)
 */
export async function deleteLink(id: string, userId: string) {
  await db.delete(links).where(eq(links.id, id));
}

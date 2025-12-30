import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";

const connection = neon(process.env.DATABASE_URL!);
const db = drizzle(connection);

async function updateUserIds() {
  const correctUserId = "user_37XNulO5aedDmNg04TfWi82DSis";

  // First, check what's in the database
  console.log("Checking current database contents...");
  const allLinks = await db.execute(
    sql`SELECT id, user_id, slug, original_url FROM links`
  );

  console.log("Current links in database:", allLinks.rows);
  console.log("Total links found:", allLinks.rowCount);

  if (allLinks.rowCount === 0) {
    console.log("No links found in database!");
    return;
  }

  console.log("\nUpdating all links to use Clerk user ID:", correctUserId);

  const result = await db.execute(
    sql`UPDATE links SET user_id = ${correctUserId}`
  );

  console.log("Update complete!", result);
  console.log("Rows updated:", result.rowCount);

  // Verify the update
  const updatedLinks = await db.execute(
    sql`SELECT id, user_id, slug FROM links LIMIT 5`
  );

  console.log("\nSample of updated links:", updatedLinks.rows);
}

updateUserIds().catch(console.error);

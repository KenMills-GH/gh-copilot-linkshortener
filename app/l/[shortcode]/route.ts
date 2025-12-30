import { NextRequest, NextResponse } from "next/server";
import { getLinkBySlug } from "@/data/links";

/**
 * GET /l/[shortcode]
 * Redirects to the original URL associated with the shortcode
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortcode: string }> }
) {
  try {
    const { shortcode } = await params;

    // Look up the link by shortcode
    const link = await getLinkBySlug(shortcode);

    // If link not found, return 404
    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    // Validate URL before redirect to prevent open redirect attacks
    try {
      const url = new URL(link.originalUrl);

      // Only allow http and https protocols
      if (!["http:", "https:"].includes(url.protocol)) {
        console.error(`Invalid protocol detected: ${url.protocol}`);
        return NextResponse.json(
          { error: "Invalid URL protocol" },
          { status: 400 }
        );
      }
    } catch (urlError) {
      console.error("Invalid URL format:", link.originalUrl);
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Redirect to the original URL with a 307 (Temporary Redirect)
    return NextResponse.redirect(link.originalUrl, 307);
  } catch (error) {
    console.error("Error in redirect handler:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

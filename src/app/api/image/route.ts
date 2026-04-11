import { NextRequest } from "next/server";

// Image proxy — fetches from Wikimedia server-side to avoid browser rate limits.
// Server-side fetches use Next.js cache so repeated requests don't hit Wikimedia again.
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url || (!url.includes("wikimedia.org") && !url.includes("wikipedia.org"))) {
    return new Response(null, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "TourismGalleryApp/1.0 (educational project)" },
      redirect: "follow",
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      return new Response(null, { status: 404 });
    }

    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "image/jpeg";

    return new Response(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400, immutable",
      },
    });
  } catch {
    return new Response(null, { status: 502 });
  }
}

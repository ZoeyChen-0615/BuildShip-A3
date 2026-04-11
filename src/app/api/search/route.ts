import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const term = searchParams.get("term") || "restaurants";
  const location = searchParams.get("location") || "New York";

  const apiKey = process.env.YELP_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Yelp API key not configured" }, { status: 500 });
  }

  const params = new URLSearchParams({
    term,
    location,
    limit: "20",
    sort_by: "best_match",
  });

  const res = await fetch(
    `https://api.yelp.com/v3/businesses/search?${params}`,
    {
      headers: { Authorization: `Bearer ${apiKey}` },
      next: { revalidate: 300 }, // cache for 5 minutes
    }
  );

  if (!res.ok) {
    const error = await res.text();
    return Response.json(
      { error: "Failed to fetch from Yelp API", details: error },
      { status: res.status }
    );
  }

  const data = await res.json();
  return Response.json(data);
}

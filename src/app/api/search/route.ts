import { NextRequest } from "next/server";

const API_KEY = process.env.OPENTRIPMAP_API_KEY;
const BASE = "https://api.opentripmap.com/0.1/en/places";

interface GeoResult {
  lat: number;
  lon: number;
  name: string;
  country: string;
}

interface PlaceFeature {
  properties: {
    xid: string;
    name: string;
    rate: number;
    kinds: string;
  };
}

interface PlaceDetail {
  xid: string;
  name: string;
  kinds: string;
  rate: string;
  address?: { city?: string; state?: string; country?: string };
  preview?: { source: string; height: number; width: number };
  image?: string;
  wikipedia?: string;
  otm?: string;
  wikipedia_extracts?: { text: string };
}

// Use Special:FilePath which doesn't get rate-limited like thumbnail URLs
function getImageUrl(detail: PlaceDetail): string {
  if (detail.image) {
    const match = detail.image.match(/File:(.+)$/);
    if (match) {
      const filename = decodeURIComponent(match[1]);
      return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=400`;
    }
  }
  return detail.preview?.source || "";
}

// Fetch details in small batches with delay to avoid rate limits
async function fetchDetailsBatched(xids: string[]): Promise<(PlaceDetail | null)[]> {
  const results: (PlaceDetail | null)[] = [];
  const batchSize = 4;

  for (let i = 0; i < xids.length; i += batchSize) {
    const batch = xids.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (xid): Promise<PlaceDetail | null> => {
        try {
          const res = await fetch(`${BASE}/xid/${xid}?apikey=${API_KEY}`);
          if (!res.ok) return null;
          return res.json();
        } catch {
          return null;
        }
      })
    );
    results.push(...batchResults);
    // Small delay between batches
    if (i + batchSize < xids.length) {
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  return results;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const city = searchParams.get("city") || "Paris";
  const category = searchParams.get("category") || "";

  if (!API_KEY) {
    return Response.json({ error: "OpenTripMap API key not configured" }, { status: 500 });
  }

  // Step 1: Geocode the city
  const geoRes = await fetch(
    `${BASE}/geoname?name=${encodeURIComponent(city)}&apikey=${API_KEY}`
  );

  if (!geoRes.ok) {
    return Response.json({ error: "City not found" }, { status: 404 });
  }

  const geo: GeoResult = await geoRes.json();
  if (!geo.lat || !geo.lon) {
    return Response.json({ error: "City not found" }, { status: 404 });
  }

  // Step 2: Fetch places within 10km radius, rated 2+ (notable places)
  const kinds = category || "interesting_places,amusements,cultural,sport,foods,shops,tourist_facilities";

  const placesRes = await fetch(
    `${BASE}/radius?radius=10000&lon=${geo.lon}&lat=${geo.lat}&kinds=${kinds}&rate=2&limit=20&apikey=${API_KEY}`,
    { next: { revalidate: 3600 } }
  );

  if (!placesRes.ok) {
    return Response.json({ error: "Failed to fetch places" }, { status: 500 });
  }

  const placesData = await placesRes.json();
  const features: PlaceFeature[] = placesData.features || [];

  // Filter out unnamed places and sort by rate
  const named = features
    .filter((f) => f.properties.name)
    .sort((a, b) => b.properties.rate - a.properties.rate)
    .slice(0, 12);

  // Step 3: Fetch details in batches
  const xids = named.map((f) => f.properties.xid);
  const details = await fetchDetailsBatched(xids);

  const places = details
    .filter((d): d is PlaceDetail => d !== null && !!d.name)
    .map((d) => ({
      id: d.xid,
      name: d.name,
      image_url: getImageUrl(d),
      kinds: d.kinds
        ?.split(",")
        .slice(0, 3)
        .map((k) => k.replace(/_/g, " "))
        .join(", ") || "",
      rate: d.rate || "",
      address: d.address
        ? [d.address.city, d.address.state, d.address.country].filter(Boolean).join(", ")
        : "",
      description: d.wikipedia_extracts?.text?.slice(0, 200) || "",
      wikipedia: d.wikipedia || "",
      url: d.otm || "",
    }));

  return Response.json({
    city: geo.name,
    country: geo.country,
    places,
  });
}

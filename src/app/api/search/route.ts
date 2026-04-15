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

function getWikipediaApiUrl(wikipediaUrl: string): string | null {
  try {
    const url = new URL(wikipediaUrl);
    const titlePrefix = "/wiki/";

    if (!url.pathname.startsWith(titlePrefix)) return null;

    const title = decodeURIComponent(url.pathname.slice(titlePrefix.length));
    if (!title) return null;

    const params = new URLSearchParams({
      action: "query",
      prop: "pageimages",
      piprop: "thumbnail",
      pithumbsize: "400",
      titles: title,
      format: "json",
    });

    return `${url.origin}/w/api.php?${params.toString()}`;
  } catch {
    return null;
  }
}

function getWikipediaSummaryUrl(wikipediaUrl: string): string | null {
  try {
    const url = new URL(wikipediaUrl);
    const titlePrefix = "/wiki/";

    if (!url.pathname.startsWith(titlePrefix)) return null;

    const title = decodeURIComponent(url.pathname.slice(titlePrefix.length));
    if (!title) return null;

    return `${url.origin}/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  } catch {
    return null;
  }
}

async function getWikipediaThumbnail(wikipediaUrl?: string): Promise<string> {
  if (!wikipediaUrl) return "";

  const apiUrl = getWikipediaApiUrl(wikipediaUrl);
  const summaryUrl = getWikipediaSummaryUrl(wikipediaUrl);

  try {
    if (apiUrl) {
      const res = await fetch(apiUrl, { next: { revalidate: 86400 } });
      if (res.ok) {
        const data = await res.json();
        const pages = data?.query?.pages;
        const firstPage = pages
          ? (Object.values(pages)[0] as { thumbnail?: { source?: string } } | undefined)
          : undefined;
        const thumbnail = firstPage?.thumbnail?.source || "";
        if (thumbnail) return thumbnail;
      }
    }

    if (summaryUrl) {
      const res = await fetch(summaryUrl, { next: { revalidate: 86400 } });
      if (!res.ok) return "";

      const data = await res.json();
      return data?.thumbnail?.source || "";
    }

    return "";
  } catch {
    return "";
  }
}

// Use Special:FilePath which doesn't get rate-limited like thumbnail URLs
async function getImageUrl(detail: PlaceDetail): Promise<string> {
  if (detail.image) {
    const match = detail.image.match(/File:(.+)$/);
    if (match) {
      const filename = decodeURIComponent(match[1]);
      return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=400`;
    }
  }

  if (detail.preview?.source) {
    return detail.preview.source;
  }

  return getWikipediaThumbnail(detail.wikipedia);
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
    `${BASE}/radius?radius=10000&lon=${geo.lon}&lat=${geo.lat}&kinds=${kinds}&rate=2&limit=30&apikey=${API_KEY}`,
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
    .slice(0, 24);

  // Step 3: Fetch details in batches
  const xids = named.map((f) => f.properties.xid);
  const details = await fetchDetailsBatched(xids);

  const rankedPlaces = await Promise.all(
    details
    .filter((d): d is PlaceDetail => d !== null && !!d.name)
    .map(async (d) => ({
      id: d.xid,
      name: d.name,
      image_url: await getImageUrl(d),
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
    }))
  );

  const withImages = rankedPlaces.filter((place) => !!place.image_url);
  const withoutImages = rankedPlaces.filter((place) => !place.image_url);
  const places = [...withImages, ...withoutImages].slice(0, 12);

  return Response.json({
    city: geo.name,
    country: geo.country,
    places,
  });
}

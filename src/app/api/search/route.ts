import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("query") || "";
  const region = searchParams.get("region") || "";

  let url: string;

  if (query) {
    // Search by country name
    url = `https://restcountries.com/v3.1/name/${encodeURIComponent(query)}?fields=cca3,name,flags,capital,region,subregion,population,languages,currencies,area,maps`;
  } else if (region) {
    // Browse by region
    url = `https://restcountries.com/v3.1/region/${encodeURIComponent(region)}?fields=cca3,name,flags,capital,region,subregion,population,languages,currencies,area,maps`;
  } else {
    // Default: return all countries
    url = `https://restcountries.com/v3.1/all?fields=cca3,name,flags,capital,region,subregion,population,languages,currencies,area,maps`;
  }

  const res = await fetch(url, { next: { revalidate: 3600 } });

  if (!res.ok) {
    if (res.status === 404) {
      return Response.json({ countries: [] });
    }
    return Response.json(
      { error: "Failed to fetch countries" },
      { status: res.status }
    );
  }

  const data = await res.json();

  const countries = (Array.isArray(data) ? data : []).map(
    (c: Record<string, unknown>) => {
      const name = c.name as { common: string; official: string };
      const flags = c.flags as { png: string; svg: string; alt?: string };
      const capital = c.capital as string[] | undefined;
      const languages = c.languages as Record<string, string> | undefined;
      const currencies = c.currencies as Record<string, { name: string; symbol: string }> | undefined;
      const maps = c.maps as { googleMaps: string } | undefined;

      return {
        id: c.cca3,
        name: name.common,
        official_name: name.official,
        flag_url: flags.svg,
        flag_alt: flags.alt || `Flag of ${name.common}`,
        capital: capital?.[0] || "N/A",
        region: c.region,
        subregion: c.subregion || "",
        population: c.population,
        area: c.area,
        languages: languages ? Object.values(languages).join(", ") : "",
        currencies: currencies
          ? Object.values(currencies).map((cur) => `${cur.name} (${cur.symbol})`).join(", ")
          : "",
        map_url: maps?.googleMaps || "",
      };
    }
  );

  // Sort by name
  countries.sort((a: { name: string }, b: { name: string }) =>
    a.name.localeCompare(b.name)
  );

  return Response.json({ countries });
}

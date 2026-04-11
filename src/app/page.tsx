"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { SearchBar } from "@/components/SearchBar";
import { CountryCard, Country } from "@/components/BusinessCard";

export default function Home() {
  const { isSignedIn } = useAuth();
  const [countries, setCountries] = useState<Country[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const loadSavedIds = useCallback(async () => {
    if (!isSignedIn) return;
    const res = await fetch("/api/favorites");
    if (res.ok) {
      const data = await res.json();
      setSavedIds(new Set(data.map((f: { place_id: string }) => f.place_id)));
    }
  }, [isSignedIn]);

  useEffect(() => {
    loadSavedIds();
  }, [loadSavedIds]);

  async function handleSearch(query: string) {
    setIsLoading(true);
    setError("");
    setSearched(true);

    const params = new URLSearchParams();
    if (query) params.set("query", query);

    const res = await fetch(`/api/search?${params}`);
    if (!res.ok) {
      setError("Failed to search. Please try again.");
      setIsLoading(false);
      return;
    }

    const data = await res.json();
    setCountries(data.countries || []);
    setIsLoading(false);
  }

  async function handleRegion(region: string) {
    setIsLoading(true);
    setError("");
    setSearched(true);

    const params = new URLSearchParams();
    if (region) params.set("region", region);

    const res = await fetch(`/api/search?${params}`);
    if (!res.ok) {
      setError("Failed to load countries. Please try again.");
      setIsLoading(false);
      return;
    }

    const data = await res.json();
    setCountries(data.countries || []);
    setIsLoading(false);
  }

  async function handleSave(country: Country) {
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        place_id: country.id,
        name: country.name,
        image_url: country.flag_url,
        rating: 0,
        review_count: 0,
        location: `${country.capital}, ${country.region}`,
        categories: country.subregion || country.region,
        price: formatPopulation(country.population),
        url: country.map_url,
      }),
    });

    if (res.ok) {
      setSavedIds((prev) => new Set(prev).add(country.id));
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
          Explore the World
        </h1>
        <p className="mt-3 text-lg text-stone-500">
          Discover countries around the globe. Build your travel bucket list.
        </p>
      </div>

      <div className="mx-auto mb-10 max-w-3xl">
        <SearchBar onSearch={handleSearch} onRegion={handleRegion} isLoading={isLoading} />
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-center text-sm text-red-600">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
        </div>
      ) : countries.length > 0 ? (
        <>
          <p className="mb-4 text-sm text-stone-500">
            {countries.length} {countries.length === 1 ? "country" : "countries"} found
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {countries.map((country) => (
              <CountryCard
                key={country.id}
                country={country}
                savedIds={savedIds}
                onSave={handleSave}
              />
            ))}
          </div>
        </>
      ) : searched ? (
        <p className="py-20 text-center text-stone-400">
          No countries found. Try a different search.
        </p>
      ) : (
        <div className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <svg className="h-8 w-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A8.966 8.966 0 013 12c0-1.777.515-3.433 1.404-4.832" />
            </svg>
          </div>
          <p className="text-stone-500">
            Search for a country or browse by region to get started
          </p>
        </div>
      )}
    </div>
  );
}

function formatPopulation(pop: number): string {
  if (pop >= 1_000_000_000) return `${(pop / 1_000_000_000).toFixed(1)}B`;
  if (pop >= 1_000_000) return `${(pop / 1_000_000).toFixed(1)}M`;
  if (pop >= 1_000) return `${(pop / 1_000).toFixed(1)}K`;
  return pop.toString();
}

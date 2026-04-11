"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { SearchBar } from "@/components/SearchBar";
import { BusinessCard } from "@/components/BusinessCard";

interface Business {
  id: string;
  name: string;
  image_url: string;
  rating: number;
  review_count: number;
  location: { display_address: string[] };
  categories: { title: string }[];
  price?: string;
  url: string;
}

export default function Home() {
  const { isSignedIn } = useUser();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  // Load saved IDs so we can show which ones are already saved
  const loadSavedIds = useCallback(async () => {
    if (!isSignedIn) return;
    const res = await fetch("/api/favorites");
    if (res.ok) {
      const data = await res.json();
      setSavedIds(new Set(data.map((f: { yelp_id: string }) => f.yelp_id)));
    }
  }, [isSignedIn]);

  useEffect(() => {
    loadSavedIds();
  }, [loadSavedIds]);

  async function handleSearch(term: string, location: string) {
    setIsLoading(true);
    setError("");
    setSearched(true);

    const params = new URLSearchParams();
    if (term) params.set("term", term);
    if (location) params.set("location", location);

    const res = await fetch(`/api/search?${params}`);
    if (!res.ok) {
      setError("Failed to search. Please try again.");
      setIsLoading(false);
      return;
    }

    const data = await res.json();
    setBusinesses(data.businesses || []);
    setIsLoading(false);
  }

  async function handleSave(business: Business) {
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        yelp_id: business.id,
        name: business.name,
        image_url: business.image_url,
        rating: business.rating,
        review_count: business.review_count,
        location: business.location.display_address.join(", "),
        categories: business.categories.map((c) => c.title).join(", "),
        price: business.price || "",
        url: business.url,
      }),
    });

    if (res.ok) {
      setSavedIds((prev) => new Set(prev).add(business.id));
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Hero Section */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
          Discover Amazing Places
        </h1>
        <p className="mt-3 text-lg text-stone-500">
          Search restaurants, hotels, attractions and more. Save your favorites.
        </p>
      </div>

      {/* Search */}
      <div className="mx-auto mb-10 max-w-3xl">
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-center text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
        </div>
      ) : businesses.length > 0 ? (
        <>
          <p className="mb-4 text-sm text-stone-500">
            {businesses.length} results found
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {businesses.map((business) => (
              <BusinessCard
                key={business.id}
                business={business}
                savedIds={savedIds}
                onSave={handleSave}
              />
            ))}
          </div>
        </>
      ) : searched ? (
        <p className="py-20 text-center text-stone-400">
          No results found. Try a different search.
        </p>
      ) : (
        <div className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <svg className="h-8 w-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <p className="text-stone-500">
            Search for a city or type of place to get started
          </p>
        </div>
      )}
    </div>
  );
}

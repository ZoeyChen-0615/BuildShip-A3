"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { SearchBar } from "@/components/SearchBar";
import { PlaceCard, Place } from "@/components/BusinessCard";

export default function Home() {
  const { isSignedIn } = useAuth();
  const [places, setPlaces] = useState<Place[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [cityInfo, setCityInfo] = useState("");

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

  async function handleSearch(city: string, category: string) {
    setIsLoading(true);
    setError("");
    setSearched(true);

    const params = new URLSearchParams({ city });
    if (category) params.set("category", category);

    const res = await fetch(`/api/search?${params}`);
    if (!res.ok) {
      setError("City not found. Please try another city name.");
      setIsLoading(false);
      return;
    }

    const data = await res.json();
    setPlaces(data.places || []);
    setCityInfo(`${data.city}, ${data.country}`);
    setIsLoading(false);
  }

  async function handleSave(place: Place) {
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        place_id: place.id,
        name: place.name,
        image_url: place.image_url,
        location: place.address,
        categories: place.kinds,
        url: place.wikipedia || place.url,
      }),
    });

    if (res.ok) {
      setSavedIds((prev) => new Set(prev).add(place.id));
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
          Tourism Gallery
        </h1>
        <p className="mt-3 text-lg text-stone-500">
          Search any city to discover famous landmarks, restaurants, and attractions.
        </p>
      </div>

      <div className="mx-auto mb-10 max-w-3xl">
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-center text-sm text-red-600">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
          <p className="mt-3 text-sm text-stone-400">Finding places...</p>
        </div>
      ) : places.length > 0 ? (
        <>
          <p className="mb-4 text-sm text-stone-500">
            {places.length} places found in <span className="font-medium text-stone-700">{cityInfo}</span>
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {places.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                savedIds={savedIds}
                onSave={handleSave}
              />
            ))}
          </div>
        </>
      ) : searched ? (
        <p className="py-20 text-center text-stone-400">
          No places found. Try a different city or category.
        </p>
      ) : (
        <div className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <svg className="h-8 w-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          </div>
          <p className="text-stone-500">
            Enter a city name to discover its best spots
          </p>
        </div>
      )}
    </div>
  );
}

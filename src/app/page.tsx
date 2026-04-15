"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { SearchBar } from "@/components/SearchBar";
import { PlaceCard, Place } from "@/components/BusinessCard";
import { PlaceImage } from "@/components/PlaceImage";

interface CommunityFavorite {
  id: string;
  place_id: string;
  name: string;
  image_url: string;
  location: string;
  categories: string;
  url: string;
}

export default function Home() {
  const { isSignedIn } = useAuth();
  const [places, setPlaces] = useState<Place[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [cityInfo, setCityInfo] = useState("");
  const [communityFavorites, setCommunityFavorites] = useState<CommunityFavorite[]>([]);
  const [loadingCommunity, setLoadingCommunity] = useState(true);

  // Load community favorites on mount
  useEffect(() => {
    async function loadCommunity() {
      try {
        const res = await fetch("/api/favorites?mode=community");
        if (res.ok) {
          const data = await res.json();
          setCommunityFavorites(data);
        }
      } catch {
        // silently fail
      }
      setLoadingCommunity(false);
    }
    loadCommunity();
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!isSignedIn) {
      setTimeout(() => {
        if (!cancelled) {
          setSavedIds(new Set());
        }
      }, 0);

      return () => {
        cancelled = true;
      };
    }

    fetch("/api/favorites")
      .then(async (res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!cancelled) {
          setSavedIds(new Set(data.map((f: { place_id: string }) => f.place_id)));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSavedIds(new Set());
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isSignedIn]);

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
    <>
      <div className="relative -mt-16 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80"
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />
        </div>

        <div className="relative px-6 pb-14 pt-28 text-center sm:pb-20 sm:pt-36">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A8.966 8.966 0 0 1 3 12c0-1.777.514-3.433 1.401-4.832" />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-lg sm:text-5xl">
            Tourism Gallery
          </h1>
          <p className="mx-auto mt-3 max-w-md text-lg text-white/80">
            Search any city to discover famous landmarks, restaurants, and attractions.
          </p>

          <div className="mx-auto mt-8 max-w-2xl">
            <SearchBar onSearch={handleSearch} isLoading={isLoading} />
          </div>
        </div>
      </div>

    <div className="mx-auto max-w-6xl px-4 py-8">

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
        /* Default view: show community favorites */
        <div>
          {loadingCommunity ? (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
            </div>
          ) : communityFavorites.length > 0 ? (
            <>
              <div className="mb-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-stone-200" />
                <h2 className="text-lg font-semibold text-stone-700">
                  Saved by the Community
                </h2>
                <div className="h-px flex-1 bg-stone-200" />
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {communityFavorites.map((fav) => (
                  <div
                    key={fav.id}
                    className="animate-fade-in-up group overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                      <PlaceImage src={fav.image_url} alt={fav.name} />
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />
                      {fav.categories && (
                        <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-stone-700 shadow-sm backdrop-blur-sm">
                          {fav.categories.split(",")[0].trim()}
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-stone-900 line-clamp-1">{fav.name}</h3>
                      {fav.location && (
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-stone-400 line-clamp-1">
                          <svg className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                          </svg>
                          {fav.location}
                        </p>
                      )}
                      {fav.url && (
                        <a
                          href={fav.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 block rounded-lg border border-stone-200 px-3 py-1.5 text-center text-xs font-medium text-stone-600 transition hover:border-stone-300 hover:bg-stone-50"
                        >
                          Learn More
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
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
      )}
    </div>
    </>
  );
}

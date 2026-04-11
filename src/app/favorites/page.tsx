"use client";

import { useState, useEffect } from "react";

interface Favorite {
  id: string;
  place_id: string;
  name: string;
  image_url: string;
  location: string;
  categories: string;
  price: string;
  url: string;
  created_at: string;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadFavorites() {
      const res = await fetch("/api/favorites");
      if (res.ok) {
        const data = await res.json();
        setFavorites(data);
      }
      setIsLoading(false);
    }
    loadFavorites();
  }, []);

  async function handleRemove(id: string) {
    const res = await fetch(`/api/favorites/${id}`, { method: "DELETE" });
    if (res.ok) {
      setFavorites((prev) => prev.filter((f) => f.id !== id));
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-stone-900">
        My Travel Bucket List
      </h1>
      <p className="mb-8 text-stone-500">
        {favorites.length} saved {favorites.length === 1 ? "country" : "countries"}
      </p>

      {favorites.length === 0 ? (
        <div className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <svg className="h-8 w-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </div>
          <p className="text-stone-500">No countries saved yet. Explore and build your bucket list!</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {favorites.map((fav) => (
            <div
              key={fav.id}
              className="group overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="relative aspect-[3/2] overflow-hidden bg-stone-100">
                {fav.image_url ? (
                  <img
                    src={fav.image_url}
                    alt={`Flag of ${fav.name}`}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-stone-300">
                    <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
                    </svg>
                  </div>
                )}
                <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-stone-700 backdrop-blur-sm">
                  {fav.categories}
                </span>
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold text-stone-900">{fav.name}</h3>
                <p className="mt-1 text-sm text-stone-500">{fav.location}</p>
                <p className="mt-0.5 text-xs text-stone-400">Pop. {fav.price}</p>

                <div className="mt-3 flex items-center gap-2">
                  {fav.url && (
                    <a
                      href={fav.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 rounded-lg border border-stone-200 px-3 py-1.5 text-center text-xs font-medium text-stone-600 transition hover:bg-stone-50"
                    >
                      View on Map
                    </a>
                  )}
                  <button
                    onClick={() => handleRemove(fav.id)}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

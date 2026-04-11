"use client";

import { useState, useEffect } from "react";

interface Favorite {
  id: string;
  yelp_id: string;
  name: string;
  image_url: string;
  rating: number;
  review_count: number;
  location: string;
  categories: string;
  price: string;
  url: string;
  created_at: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`h-4 w-4 ${star <= rating ? "text-amber-400" : "text-stone-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-1 text-xs text-stone-500">({rating})</span>
    </div>
  );
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
        My Favorites
      </h1>
      <p className="mb-8 text-stone-500">
        {favorites.length} saved {favorites.length === 1 ? "place" : "places"}
      </p>

      {favorites.length === 0 ? (
        <div className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <svg className="h-8 w-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </div>
          <p className="text-stone-500">No favorites yet. Search and save places you love!</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {favorites.map((fav) => (
            <div
              key={fav.id}
              className="group overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                {fav.image_url ? (
                  <img
                    src={fav.image_url}
                    alt={fav.name}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-stone-300">
                    <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                    </svg>
                  </div>
                )}
                {fav.price && (
                  <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-stone-700 backdrop-blur-sm">
                    {fav.price}
                  </span>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-stone-900 line-clamp-1">{fav.name}</h3>
                <StarRating rating={fav.rating} />
                <p className="mt-1 text-xs text-stone-500">{fav.review_count} reviews</p>
                <p className="mt-1 text-xs text-stone-500 line-clamp-1">{fav.categories}</p>
                <p className="mt-1 text-xs text-stone-400 line-clamp-1">{fav.location}</p>

                <div className="mt-3 flex items-center gap-2">
                  <a
                    href={fav.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 rounded-lg border border-stone-200 px-3 py-1.5 text-center text-xs font-medium text-stone-600 transition hover:bg-stone-50"
                  >
                    View on Yelp
                  </a>
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

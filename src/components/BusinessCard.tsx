"use client";

import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { PlaceImage } from "@/components/PlaceImage";

export interface Place {
  id: string;
  name: string;
  image_url: string;
  kinds: string;
  rate: string;
  address: string;
  description: string;
  wikipedia: string;
  url: string;
}

interface PlaceCardProps {
  place: Place;
  savedIds: Set<string>;
  onSave: (place: Place) => void;
}

export function PlaceCard({ place, savedIds, onSave }: PlaceCardProps) {
  const { isSignedIn } = useAuth();
  const [saving, setSaving] = useState(false);
  const isSaved = savedIds.has(place.id);

  async function handleSave() {
    if (!isSignedIn || isSaved) return;
    setSaving(true);
    onSave(place);
    setSaving(false);
  }

  return (
    <div className="animate-fade-in-up group overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
        <PlaceImage src={place.image_url} alt={place.name} />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />
        {place.kinds && (
          <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-stone-700 shadow-sm backdrop-blur-sm line-clamp-1">
            {place.kinds.split(",")[0].trim()}
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-stone-900 line-clamp-1">{place.name}</h3>
        {place.address && (
          <p className="mt-0.5 flex items-center gap-1 text-xs text-stone-400 line-clamp-1">
            <svg className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            {place.address}
          </p>
        )}
        {place.description && (
          <p className="mt-2 text-xs leading-relaxed text-stone-500 line-clamp-3">
            {place.description}
          </p>
        )}

        <div className="mt-3 flex items-center gap-2">
          {(place.wikipedia || place.url) && (
            <a
              href={place.wikipedia || place.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-lg border border-stone-200 px-3 py-1.5 text-center text-xs font-medium text-stone-600 transition hover:border-stone-300 hover:bg-stone-50"
            >
              Learn More
            </a>
          )}
          {isSignedIn && (
            <button
              onClick={handleSave}
              disabled={isSaved || saving}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                isSaved
                  ? "bg-amber-100 text-amber-700"
                  : "bg-amber-600 text-white hover:bg-amber-700"
              } disabled:opacity-60`}
            >
              <svg className="h-3.5 w-3.5" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
              {isSaved ? "Saved" : saving ? "..." : "Save"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

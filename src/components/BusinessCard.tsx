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
    <div className="group overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
        <PlaceImage src={place.image_url} alt={place.name} />
        {place.kinds && (
          <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-stone-600 backdrop-blur-sm line-clamp-1">
            {place.kinds.split(",")[0].trim()}
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-stone-900 line-clamp-1">{place.name}</h3>
        {place.address && (
          <p className="mt-0.5 text-xs text-stone-400 line-clamp-1">{place.address}</p>
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
              className="flex-1 rounded-lg border border-stone-200 px-3 py-1.5 text-center text-xs font-medium text-stone-600 transition hover:bg-stone-50"
            >
              Learn More
            </a>
          )}
          {isSignedIn && (
            <button
              onClick={handleSave}
              disabled={isSaved || saving}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                isSaved
                  ? "bg-amber-100 text-amber-700"
                  : "bg-amber-600 text-white hover:bg-amber-700"
              } disabled:opacity-60`}
            >
              {isSaved ? "Saved" : saving ? "..." : "Save"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

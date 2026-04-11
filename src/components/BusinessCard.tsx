"use client";

import { useAuth } from "@clerk/nextjs";
import { useState } from "react";

export interface Country {
  id: string;
  name: string;
  official_name: string;
  flag_url: string;
  flag_alt: string;
  capital: string;
  region: string;
  subregion: string;
  population: number;
  area: number;
  languages: string;
  currencies: string;
  map_url: string;
}

interface CountryCardProps {
  country: Country;
  savedIds: Set<string>;
  onSave: (country: Country) => void;
}

function formatPopulation(pop: number): string {
  if (pop >= 1_000_000_000) return `${(pop / 1_000_000_000).toFixed(1)}B`;
  if (pop >= 1_000_000) return `${(pop / 1_000_000).toFixed(1)}M`;
  if (pop >= 1_000) return `${(pop / 1_000).toFixed(1)}K`;
  return pop.toString();
}

export function CountryCard({ country, savedIds, onSave }: CountryCardProps) {
  const { isSignedIn } = useAuth();
  const [saving, setSaving] = useState(false);
  const isSaved = savedIds.has(country.id);

  async function handleSave() {
    if (!isSignedIn || isSaved) return;
    setSaving(true);
    onSave(country);
    setSaving(false);
  }

  return (
    <div className="group overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative aspect-[3/2] overflow-hidden bg-stone-100">
        <img
          src={country.flag_url}
          alt={country.flag_alt}
          className="h-full w-full object-cover transition group-hover:scale-105"
        />
        <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-stone-700 backdrop-blur-sm">
          {country.region}
        </span>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-stone-900">{country.name}</h3>
        <p className="text-xs text-stone-400">{country.official_name}</p>

        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <span className="font-medium">Capital:</span>
            <span>{country.capital}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <span className="font-medium">Population:</span>
            <span>{formatPopulation(country.population)}</span>
          </div>
          {country.languages && (
            <p className="text-xs text-stone-500 line-clamp-1">
              <span className="font-medium">Languages:</span> {country.languages}
            </p>
          )}
          {country.currencies && (
            <p className="text-xs text-stone-500 line-clamp-1">
              <span className="font-medium">Currency:</span> {country.currencies}
            </p>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2">
          {country.map_url && (
            <a
              href={country.map_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-lg border border-stone-200 px-3 py-1.5 text-center text-xs font-medium text-stone-600 transition hover:bg-stone-50"
            >
              View on Map
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

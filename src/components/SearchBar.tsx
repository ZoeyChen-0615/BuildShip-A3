"use client";

import { useState } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onRegion: (region: string) => void;
  isLoading: boolean;
}

const REGIONS = ["Africa", "Americas", "Asia", "Europe", "Oceania"];

export function SearchBar({ onSearch, onRegion, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch(query);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          placeholder="Search countries (e.g. Japan, Brazil, France)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-lg bg-amber-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-50"
        >
          {isLoading ? "Searching..." : "Search"}
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-stone-500">Browse by region:</span>
        {REGIONS.map((region) => (
          <button
            key={region}
            onClick={() => onRegion(region)}
            disabled={isLoading}
            className="rounded-full border border-stone-200 bg-white px-3 py-1 text-sm text-stone-600 transition hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700 disabled:opacity-50"
          >
            {region}
          </button>
        ))}
        <button
          onClick={() => onRegion("")}
          disabled={isLoading}
          className="rounded-full border border-stone-200 bg-white px-3 py-1 text-sm text-stone-600 transition hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700 disabled:opacity-50"
        >
          All
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

interface SearchBarProps {
  onSearch: (city: string, category: string) => void;
  isLoading: boolean;
}

const CATEGORIES = [
  { label: "All", value: "" },
  { label: "Landmarks", value: "interesting_places,historic" },
  { label: "Museums", value: "cultural,museums" },
  { label: "Entertainment", value: "amusements,sport" },
  { label: "Food & Dining", value: "foods,restaurants" },
  { label: "Shopping", value: "shops" },
];

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [city, setCity] = useState("");
  const [activeCategory, setActiveCategory] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (city.trim()) onSearch(city, activeCategory);
  }

  function handleCategory(value: string) {
    setActiveCategory(value);
    if (city.trim()) onSearch(city, value);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-3 rounded-xl bg-white p-2 shadow-lg shadow-stone-200/60 ring-1 ring-stone-200">
        <div className="relative flex-1">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            placeholder="Enter a city (e.g. Paris, Tokyo, New York)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full rounded-lg border-0 bg-transparent py-3 pl-10 pr-4 text-sm placeholder:text-stone-400 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !city.trim()}
          className="rounded-lg bg-amber-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700 hover:shadow-md disabled:opacity-50"
        >
          {isLoading ? "Searching..." : "Explore"}
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-stone-500">Filter:</span>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => handleCategory(cat.value)}
            disabled={isLoading}
            className={`rounded-full border px-3 py-1 text-sm transition disabled:opacity-50 ${
              activeCategory === cat.value
                ? "border-amber-500 bg-amber-50 font-medium text-amber-700"
                : "border-stone-200 bg-white text-stone-600 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}

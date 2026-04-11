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
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          placeholder="Enter a city (e.g. Paris, Tokyo, New York)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="flex-1 rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
        />
        <button
          type="submit"
          disabled={isLoading || !city.trim()}
          className="rounded-lg bg-amber-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-50"
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

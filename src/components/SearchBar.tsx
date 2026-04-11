"use client";

import { useState } from "react";

interface SearchBarProps {
  onSearch: (term: string, location: string) => void;
  isLoading: boolean;
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [term, setTerm] = useState("");
  const [location, setLocation] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch(term, location);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <input
        type="text"
        placeholder="What are you looking for? (e.g. restaurants, hotels)"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        className="flex-1 rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
      />
      <input
        type="text"
        placeholder="City or location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 sm:w-56"
      />
      <button
        type="submit"
        disabled={isLoading}
        className="rounded-lg bg-amber-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-50"
      >
        {isLoading ? "Searching..." : "Search"}
      </button>
    </form>
  );
}

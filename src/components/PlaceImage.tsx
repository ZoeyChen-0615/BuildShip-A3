"use client";

import { useState } from "react";

export function PlaceImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (!src || failed) {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-br from-amber-50 to-stone-100 text-stone-300">
        <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
      </div>
    );
  }

  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-50 to-stone-100">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={`h-full w-full object-cover transition group-hover:scale-105 ${loaded ? "" : "opacity-0"}`}
        onLoad={(e) => {
          const img = e.currentTarget;
          if (img.naturalWidth < 50 || img.naturalHeight < 50) {
            setFailed(true);
          } else {
            setLoaded(true);
          }
        }}
        onError={() => setFailed(true)}
      />
    </>
  );
}

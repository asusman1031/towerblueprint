"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type GalleryItem = {
  slug: string;
  number: number;
  name: string;
  designer: string;
  blocks: number;
  unit: string;
  tall: string;
  thumb: string; // cached still drawing
  anim: string; // cached animated drawing
  ms: number; // about how long the build animation runs
};

// A big stage that plays any tower building itself, with a wall of every build underneath.
// Tap a tile to watch it. "Play them all" cycles through the whole wall.
export default function BuildGallery({ items }: { items: GalleryItem[] }) {
  const [index, setIndex] = useState(0);
  const [run, setRun] = useState(0); // a new run remounts the <img>, which replays the animation
  const [auto, setAuto] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const item = items[index];

  const go = (i: number) => {
    setIndex((i + items.length) % items.length);
    setRun((r) => r + 1);
  };

  // "Play them all": move on a moment after each tower finishes building.
  useEffect(() => {
    if (!auto) return;
    const t = setTimeout(() => go(index + 1), item.ms + 2500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, index, run]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLElement && ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) return;
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, items.length]);

  if (!item) return null;

  return (
    <div>
      <div ref={stage} className="card scroll-mt-24 p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="rounded-full border-2 border-navy bg-sun px-3 py-0.5 font-display text-sm">
            Blueprint No. {String(item.number).padStart(3, "0")}
          </span>
          <span className="text-sm font-extrabold text-ink">
            {index + 1} of {items.length}
          </span>
        </div>
        <div className="bg-grid-light relative mt-3 flex h-[22rem] items-center justify-center rounded-2xl border-2 border-navy/20 p-3 sm:h-[30rem]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={`${item.slug}-${run}`}
            src={item.anim}
            alt={`${item.name} building itself`}
            decoding="async"
            className="h-full w-full object-contain"
          />
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous tower"
            className="btn btn-white absolute left-2 top-1/2 -translate-y-1/2 !px-3 text-xl"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next tower"
            className="btn btn-white absolute right-2 top-1/2 -translate-y-1/2 !px-3 text-xl"
          >
            →
          </button>
        </div>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl text-navy sm:text-4xl">{item.name}</h2>
            <p className="font-semibold text-ink">
              {item.blocks} {item.unit} · {item.tall}
              {item.designer ? ` · Guest architect: ${item.designer}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setRun((r) => r + 1)} className="btn btn-white btn-sm">
              ↻ Build it again
            </button>
            <button
              type="button"
              onClick={() => setAuto((a) => !a)}
              aria-pressed={auto}
              className={`btn btn-sm ${auto ? "btn-sun" : "btn-white"}`}
            >
              {auto ? "⏸ Stop" : "▶ Play them all"}
            </button>
            <Link href={`/blueprints/${item.slug}`} className="btn btn-sun btn-sm">
              See blueprint →
            </Link>
          </div>
        </div>
      </div>

      <h2 className="mt-12 font-display text-3xl text-navy sm:text-4xl">Every build on one wall</h2>
      <p className="mt-1 text-ink">Tap any tower to watch it build.</p>
      <ul className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {items.map((it, i) => (
          <li key={it.slug}>
            <button
              type="button"
              onClick={() => {
                go(i);
                stage.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              aria-label={`Watch ${it.name} build`}
              aria-current={i === index ? "true" : undefined}
              className={`bg-grid-light group relative flex aspect-[4/5] w-full items-center justify-center rounded-2xl border-[3px] p-2 transition hover:-translate-y-1 ${
                i === index ? "border-brand shadow-[0_4px_0_#1e63e9]" : "border-navy"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.thumb} alt="" loading="lazy" decoding="async" className="h-full w-full object-contain" />
              <span className="absolute top-1.5 left-1.5 rounded-full border-2 border-navy bg-white px-1.5 text-[0.65rem] font-extrabold">
                {String(it.number).padStart(3, "0")}
              </span>
              <span className="absolute inset-x-1.5 bottom-1.5 truncate rounded-lg bg-white/90 px-1.5 py-0.5 text-center text-[0.7rem] font-extrabold text-navy">
                {it.name}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

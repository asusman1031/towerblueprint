"use client";

import { Children, useCallback, useEffect, useRef, useState } from "react";

// A row of cards that slides sideways: 3 at a time on wide screens, 2 on tablets,
// 1 on phones. The arrows go a whole row at a time and wrap around at the ends,
// the dots jump to a row, and phones can swipe.
export default function BlueprintCarousel({ children, label }: { children: React.ReactNode; label: string }) {
  const track = useRef<HTMLDivElement>(null);
  const slides = Children.toArray(children);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(Math.ceil(slides.length / 3));

  // One "page" is one screenful of cards; the last one may be a partial row.
  const metrics = useCallback(() => {
    const el = track.current;
    if (!el) return null;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    const width = el.clientWidth + gap;
    const max = el.scrollWidth - el.clientWidth;
    return { width, max, count: max > 2 ? Math.ceil(max / width - 0.02) + 1 : 1 };
  }, []);

  const sync = useCallback(() => {
    const m = metrics();
    if (!m) return;
    const left = track.current!.scrollLeft;
    setPages(m.count);
    setPage(left >= m.max - 2 ? m.count - 1 : Math.round(left / m.width));
  }, [metrics]);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    el.addEventListener("scroll", sync, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", sync);
    };
  }, [sync]);

  function goTo(p: number) {
    const m = metrics();
    if (!m) return;
    const next = (p + m.count) % m.count; // wrap around like a turnstile
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.current!.scrollTo({ left: Math.min(next * m.width, m.max), behavior: smooth ? "smooth" : "auto" });
  }

  return (
    <div role="region" aria-roledescription="carousel" aria-label={label}>
      <div
        ref={track}
        tabIndex={0}
        className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-6 overflow-x-auto px-1 pt-2 pb-4 focus-visible:outline-2 focus-visible:outline-brand"
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${slides.length}`}
            className="flex shrink-0 basis-full snap-start sm:basis-[calc((100%_-_1.5rem)/2)] lg:basis-[calc((100%_-_3rem)/3)] [&>*]:w-full"
          >
            {slide}
          </div>
        ))}
      </div>
      {pages > 1 ? (
        <div className="mt-4 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => goTo(page - 1)}
            className="btn btn-white !px-4 text-xl"
            aria-label="Previous blueprints"
          >
            ←
          </button>
          <div className="flex flex-wrap justify-center gap-2">
            {Array.from({ length: pages }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Show row ${i + 1} of ${pages}`}
                aria-current={i === page ? "true" : undefined}
                className={`size-3.5 rounded-full border-2 border-navy transition ${i === page ? "bg-sun" : "bg-white hover:bg-ice"}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => goTo(page + 1)}
            className="btn btn-white !px-4 text-xl"
            aria-label="Next blueprints"
          >
            →
          </button>
        </div>
      ) : null}
    </div>
  );
}

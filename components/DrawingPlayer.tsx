"use client";

import { useState } from "react";

// The tower builds itself layer by layer. The animation lives inside a cached SVG
// file (see app/api/drawing), so the page stays light. A fresh <img> replays it.
export default function DrawingPlayer({
  src,
  alt,
  className,
  wide = false,
}: {
  src: string;
  alt: string;
  className?: string;
  wide?: boolean; // stretch to the container's width (for sideways builds)
}) {
  const [run, setRun] = useState(0);
  return (
    <div className={`flex flex-col items-center ${wide ? "w-full" : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img key={run} src={src} alt={alt} decoding="async" className={className} />
      <button type="button" onClick={() => setRun((r) => r + 1)} className="btn btn-white btn-sm mt-4">
        ↻ Build it again
      </button>
    </div>
  );
}

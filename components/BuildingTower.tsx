"use client";

import { useState } from "react";
import IsoTower from "@/components/IsoTower";
import type { Section } from "@/lib/tower";

// The tower builds itself layer by layer. Tap the button to watch it again.
export default function BuildingTower({
  sections,
  className,
  title,
  stepMs = 65,
}: {
  sections: Section[];
  className?: string;
  title?: string;
  stepMs?: number;
}) {
  const [run, setRun] = useState(0);
  return (
    <div className="flex flex-col items-center">
      <IsoTower key={run} sections={sections} animate stepMs={stepMs} className={className} title={title} />
      <button type="button" onClick={() => setRun((r) => r + 1)} className="btn btn-white btn-sm mt-4">
        ↻ Build it again
      </button>
    </div>
  );
}

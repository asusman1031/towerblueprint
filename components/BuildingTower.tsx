"use client";

import { useState } from "react";
import IsoTower from "@/components/IsoTower";
import type { BrickDesign } from "@/lib/bricks";
import type { Structure } from "@/lib/structure";
import type { TileDesign } from "@/lib/tiles";
import type { Section } from "@/lib/tower";

// The tower builds itself layer by layer. Tap the button to watch it again.
export default function BuildingTower({
  sections,
  structure,
  tiles,
  bricks,
  className,
  title,
  stepMs = 65,
  wide = false,
}: {
  sections: Section[];
  structure?: Structure | null;
  tiles?: TileDesign | null;
  bricks?: BrickDesign | null;
  className?: string;
  title?: string;
  stepMs?: number;
  wide?: boolean; // stretch to the container's width (for sideways builds)
}) {
  const [run, setRun] = useState(0);
  return (
    <div className={`flex flex-col items-center ${wide ? "w-full" : ""}`}>
      <IsoTower
        key={run}
        sections={sections}
        structure={structure}
        tiles={tiles}
        bricks={bricks}
        animate
        stepMs={stepMs}
        className={className}
        title={title}
      />
      <button type="button" onClick={() => setRun((r) => r + 1)} className="btn btn-white btn-sm mt-4">
        ↻ Build it again
      </button>
    </div>
  );
}

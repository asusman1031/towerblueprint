import type { Metadata } from "next";
import BuildGallery, { type GalleryItem } from "@/components/BuildGallery";
import Track from "@/components/Track";
import { getBlueprints } from "@/lib/data";
import { drawingUrl } from "@/lib/drawing";
import { designTotals, unitLabel } from "@/lib/structure";

// Always read live data, so new blueprints show up right away.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Watch the towers build",
  description: "Watch every Tower Blueprints for Kids tower build itself, layer by layer.",
};

export default async function WatchPage() {
  const blueprints = await getBlueprints();
  const items: GalleryItem[] = [...blueprints]
    .sort((a, b) => b.number - a.number)
    .map((bp) => {
      const t = designTotals(bp);
      return {
        slug: bp.slug,
        number: bp.number,
        name: bp.name,
        designer: bp.designer,
        blocks: t.blocks,
        unit: unitLabel(t.unit).toLowerCase(),
        tall: `${t.tall.value} ${t.tall.label.toLowerCase()}`,
        thumb: drawingUrl(bp),
        anim: drawingUrl(bp, { animate: true }),
        ms: Math.min(9000, 800 + t.height * 65),
      };
    });
  return (
    <div className="bg-grid-light min-h-[60vh]">
      <Track />
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h1 className="font-display text-5xl text-navy sm:text-6xl">Watch them build</h1>
        <p className="mt-3 max-w-2xl text-lg text-ink">
          Every tower goes up one layer at a time, just like the real thing. Flip through them, or press play and
          watch the whole wall build itself.
        </p>
        <div className="mt-8">
          <BuildGallery items={items} />
        </div>
      </div>
    </div>
  );
}

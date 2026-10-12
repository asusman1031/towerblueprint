import type { Metadata } from "next";
import BlueprintCard from "@/components/BlueprintCard";
import Track from "@/components/Track";
import { getBlueprints } from "@/lib/data";

// Always read live data, so changes from HQ or the database show up right away.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "All blueprints",
  description: "Every official Tower Blueprints for Kids magnetic block tower, tested and published by Sawyer.",
};

export default async function BlueprintsPage() {
  const blueprints = await getBlueprints();
  return (
    <div className="bg-grid-light min-h-[60vh]">
      <Track />
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h1 className="font-display text-5xl text-navy sm:text-6xl">The blueprints</h1>
        <p className="mt-3 max-w-2xl text-lg text-ink">
          Sawyer builds and tests every tower before it becomes an official blueprint. Most are his own designs, and
          some come from guest architects. Pick one, count your blocks, tiles or bricks, and start building.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {blueprints.map((bp) => (
            <BlueprintCard key={bp.id} bp={bp} />
          ))}
          <div className="flex min-h-72 flex-col items-center justify-center rounded-[1.5rem] border-[3px] border-dashed border-navy/40 bg-white/60 p-8 text-center">
            <span className="font-display text-6xl text-navy/30">?</span>
            <p className="mt-2 font-display text-2xl text-navy">Blueprint No. {String(blueprints.length + 1).padStart(3, "0")}</p>
            <p className="mt-1 text-ink">Top secret. Sawyer is building it now.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

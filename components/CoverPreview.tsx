import IsoTower from "@/components/IsoTower";
import type { Structure } from "@/lib/structure";
import type { Section } from "@/lib/tower";

// A mini cover page of the official blueprint. Shows only the drawing, never
// the layer math, so it is safe to show before someone buys.
export default function CoverPreview({
  sections,
  structure,
  name,
  number,
  size = "lg",
}: {
  sections: Section[];
  structure?: Structure | null;
  name: string;
  number: number;
  size?: "sm" | "lg";
}) {
  const no = `No. ${String(number).padStart(3, "0")}`;

  if (size === "sm") {
    return (
      <div className="relative w-24 shrink-0" aria-hidden>
        <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 rotate-3 rounded-lg border-2 border-navy bg-ice" />
        <div className="relative -rotate-2 rounded-lg border-2 border-navy bg-white p-1.5">
          <div className="flex justify-between border-b border-blueprint pb-0.5 text-[0.4rem] font-extrabold tracking-wider text-blueprint uppercase">
            <span>Official</span>
            <span>{no}</span>
          </div>
          <div className="flex h-24 items-end justify-center pt-1">
            <IsoTower
              sections={sections}
              structure={structure}
              variant="ink"
              className="h-full w-auto max-w-full"
              title={`${name} cover`}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-xs">
      <div className="absolute inset-0 translate-x-4 translate-y-3 rotate-6 rounded-2xl border-[3px] border-navy bg-white p-4">
        <p className="text-right font-display text-sm text-blueprint/60">🏆 Certificate</p>
      </div>
      <div className="absolute inset-0 translate-x-2 translate-y-1.5 rotate-3 rounded-2xl border-[3px] border-navy bg-ice p-4">
        <p className="text-right font-display text-sm text-blueprint/60">Step-by-step maps</p>
      </div>
      <div className="relative -rotate-2 rounded-2xl border-[3px] border-navy bg-white p-5 shadow-[0_8px_0_#0b1f4d]">
        <div className="flex items-center justify-between border-b-2 border-blueprint pb-2 text-blueprint">
          <span className="text-[0.65rem] font-extrabold tracking-[0.2em] uppercase">Official Blueprint</span>
          <span className="font-display text-sm">{no}</span>
        </div>
        <p className="mt-3 text-center font-display text-3xl text-blueprint">{name}</p>
        <div className="mt-3 flex h-72 items-end justify-center">
          <IsoTower
            sections={sections}
            structure={structure}
            variant="ink"
            className="h-full w-auto max-w-full"
            title={`${name} blueprint cover`}
          />
        </div>
        <div className="mt-3 grid grid-cols-2 border-2 border-blueprint text-[0.65rem] font-bold text-navy">
          <span className="border-r-2 border-blueprint bg-ice px-2 py-1 tracking-wider text-blueprint uppercase">
            Architect
          </span>
          <span className="px-2 py-1 font-display text-sm">Sawyer (age 7)</span>
        </div>
      </div>
    </div>
  );
}

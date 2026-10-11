import IsoTower from "@/components/IsoTower";
import GridDiagram from "@/components/GridDiagram";
import { towerTotals, type Section } from "@/lib/tower";

// A tilted mini "page" from the official blueprint, for marketing sections.
export default function BlueprintPeek({ sections, name, number }: { sections: Section[]; name: string; number: number }) {
  const t = towerTotals(sections);
  const first = sections[0];
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="absolute inset-0 translate-x-3 translate-y-3 rotate-3 rounded-2xl border-[3px] border-navy bg-ice" />
      <div className="relative -rotate-2 rounded-2xl border-[3px] border-navy bg-white p-5 shadow-[0_8px_0_#0b1f4d]">
        <div className="flex items-center justify-between border-b-2 border-blueprint pb-2 text-blueprint">
          <span className="text-[0.65rem] font-extrabold tracking-[0.2em] uppercase">Official Blueprint</span>
          <span className="font-display text-sm">No. {String(number).padStart(3, "0")}</span>
        </div>
        <p className="mt-3 font-display text-2xl text-blueprint">{name}</p>
        <div className="mt-3 grid grid-cols-[1fr_auto] items-end gap-4">
          <div className="space-y-3">
            <div className="rounded-lg border-2 border-dashed border-blueprint/40 p-2">
              <p className="text-[0.65rem] font-extrabold tracking-widest text-blueprint uppercase">Step 1</p>
              <div className="mt-1 flex items-center gap-2">
                <GridDiagram w={first.w} d={first.d} className="h-12 w-12" />
                <p className="text-xs leading-tight font-bold text-ink">
                  {first.w} × {first.d} = {first.w * first.d} blocks
                  <br />
                  Stack {first.count} layers
                </p>
              </div>
            </div>
            <div className="rounded-lg bg-ice p-2 text-xs font-bold text-ink">
              Parts list: <span className="font-display text-base text-blueprint">{t.blocks}</span> blocks
            </div>
            <div className="rounded-lg border-2 border-blueprint/30 p-2 text-[0.7rem] font-bold text-ink">
              ✓ &ldquo;I built it!&rdquo; certificate
            </div>
          </div>
          <IsoTower sections={sections} variant="ink" className="h-44 w-auto" title={`${name} drawing`} />
        </div>
      </div>
    </div>
  );
}

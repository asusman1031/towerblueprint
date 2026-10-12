import Image from "next/image";
import IsoTower from "@/components/IsoTower";
import { PathMap, PillarMap } from "@/components/StructureDiagrams";
import type { Blueprint } from "@/lib/data";
import {
  headingBefore,
  runWords,
  type BuiltStructure,
  type PartStats,
  type PathStats,
  type PillarStats,
  type Structure,
} from "@/lib/structure";
import { difficultyLabel } from "@/lib/tower";
import { CountingTrick, TickBoxes, TitleBar } from "./sheets";

// The official blueprint pages for a structure (cover, parts list, steps).
// The certificate and bonus pages come from the main print page.

// Long paths get a page to themselves; everything else goes two to a page.
function isBig(p: PartStats) {
  return p.kind === "path" && p.blocks > 20;
}

export function structureStepPages(built: BuiltStructure): PartStats[][] {
  const pages: PartStats[][] = [];
  let open: PartStats[] = [];
  for (const p of built.parts) {
    if (isBig(p)) {
      if (open.length) pages.push(open);
      pages.push([p]);
      open = [];
    } else {
      open.push(p);
      if (open.length === 2) {
        pages.push(open);
        open = [];
      }
    }
  }
  if (open.length) pages.push(open);
  return pages;
}

function partMath(p: PartStats) {
  if (p.kind === "pillar") {
    return `${p.base.w} × ${p.base.d} × ${p.base.layers}${p.column ? ` + ${p.column}` : ""}`;
  }
  const runs = p.runs.map((r) => r.n);
  const terms = p.hasStart ? [1, ...runs] : runs;
  return terms.length > 1 ? terms.join(" + ") : "";
}

function partKind(p: PartStats) {
  if (p.kind === "pillar") return "Base + column";
  return p.runs.some((r) => r.dir === "U" || r.dir === "D") ? "Hanging blocks" : "Beam";
}

function StepHeader({ p, step }: { p: PartStats; step: number }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="rounded-lg bg-blueprint px-2.5 py-1 font-display text-lg text-white">Step {step}</span>
      <span className="font-display text-2xl text-blueprint">{p.label}</span>
      <span className="ml-auto font-display text-xl text-blueprint">{p.blocks} blocks</span>
    </div>
  );
}

function Note({ text }: { text: string }) {
  if (!text) return null;
  return <p className="mt-2 rounded-lg bg-ice px-3 py-1.5 text-sm font-bold text-navy">{text}</p>;
}

function PillarStep({ p, step, structure, soFar }: { p: PillarStats; step: number; structure: Structure; soFar: number }) {
  return (
    <div className="step-card rounded-2xl border-[2.5px] border-blueprint p-4">
      <StepHeader p={p} step={step} />
      <Note text={p.note} />
      <div className="mt-3 flex items-start gap-4">
        <PillarMap part={p} className="h-24 w-auto max-w-[1.6in] shrink-0" />
        <div className="space-y-1.5 text-[0.95rem] text-navy">
          <p>
            <strong>Base:</strong> {p.base.w} × {p.base.d} = <strong>{p.perLayer}</strong> blocks a layer. Stack{" "}
            {p.base.layers}: {p.perLayer} × {p.base.layers} = <strong>{p.baseBlocks}</strong>
          </p>
          {p.column ? (
            <p>
              <strong>Column:</strong> stand <strong>{p.column}</strong> blocks straight up on the yellow square.
            </p>
          ) : null}
          {p.holds ? (
            <p className="text-sm text-ink">
              The top of the column holds up block {p.holds.block} of {p.holds.part}.
            </p>
          ) : null}
          {p.gap ? (
            <p className="text-sm font-bold text-ink">
              Leave a gap of {p.gap.blocks} block{p.gap.blocks === 1 ? "" : "s"} between this base and {p.gap.from}
              &apos;s base.
            </p>
          ) : null}
        </div>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-4">
        <div>
          <p className="text-[0.7rem] font-extrabold tracking-widest text-blueprint uppercase">Base layers</p>
          <TickBoxes count={p.base.layers} />
        </div>
        {p.column ? (
          <div>
            <p className="text-[0.7rem] font-extrabold tracking-widest text-blueprint uppercase">Column blocks</p>
            <TickBoxes count={p.column} size="sm" />
          </div>
        ) : null}
      </div>
      <StepFooter structure={structure} index={p.index} soFar={soFar} />
    </div>
  );
}

function PathStep({
  p,
  step,
  structure,
  built,
  soFar,
  big,
}: {
  p: PathStats;
  step: number;
  structure: Structure;
  built: BuiltStructure;
  soFar: number;
  big: boolean;
}) {
  const words = runWords(p.runs, headingBefore(structure, p.index));
  const onPillar = built.parts.find(
    (q) => q.kind === "pillar" && q.holds && q.holds.part === p.label && q.holds.block === 1,
  );
  const prev = [...built.parts].reverse().find((q) => q.kind === "path" && q.index < p.index);
  const side = p.runs.some((r) => r.dir === "U" || r.dir === "D");
  return (
    <div className="step-card rounded-2xl border-[2.5px] border-blueprint p-4">
      <StepHeader p={p} step={step} />
      <Note text={p.note} />
      <div className={`mt-3 grid gap-4 ${big ? "grid-cols-[4.1in_1fr]" : "grid-cols-[auto_1fr]"}`}>
        <div className="flex flex-col items-center">
          <PathMap
            part={p}
            className={big ? "h-auto max-h-[4.1in] w-full" : side ? "h-28 w-auto" : "h-auto w-[3.1in] max-h-28"}
          />
          <span className="mt-1 text-[0.6rem] font-extrabold tracking-widest text-blueprint uppercase">
            {side ? "Side view" : "Top view"}
            {p.heldBy.length ? " · yellow = on a pillar" : ""}
          </span>
        </div>
        <ol className="space-y-1.5 text-[0.95rem] text-navy">
          <li>
            {p.hasStart ? (
              <>
                <strong>Start block:</strong>{" "}
                {onPillar ? `put it on top of ${onPillar.label}.` : `put it ${structure.startLayer} blocks up.`}
              </>
            ) : (
              <>
                <strong>Start</strong> from the last block of {prev?.label ?? "the step before"}
                {p.attach ? <span className="text-ink"> (the dashed square)</span> : null}.
              </>
            )}
          </li>
          {words.map((w, i) => (
            <li key={i} className="flex items-baseline gap-2">
              <span className="font-display text-lg text-blueprint">{w.arrow}</span>
              <span>
                <strong>{w.words}:</strong> {p.runs[i].n} block{p.runs[i].n === 1 ? "" : "s"}
              </span>
            </li>
          ))}
          {p.heldBy.map((h) => (
            <li key={h.pillar} className="text-sm text-ink">
              Block {h.block} sits on {h.pillar}.
            </li>
          ))}
        </ol>
      </div>
      <div className="mt-2">
        <p className="text-[0.7rem] font-extrabold tracking-widest text-blueprint uppercase">
          Tick a box for every block
        </p>
        <TickBoxes count={p.blocks} size="sm" />
      </div>
      <StepFooter structure={structure} index={p.index} soFar={soFar} big={big} />
    </div>
  );
}

function StepFooter({
  structure,
  index,
  soFar,
  big = false,
}: {
  structure: Structure;
  index: number;
  soFar: number;
  big?: boolean;
}) {
  return (
    <div className="mt-2 flex items-end gap-4">
      <p className="flex-1 rounded-lg bg-ice px-3 py-1.5 text-sm font-bold text-navy">
        Structure so far: {soFar} blocks used
      </p>
      <div className="flex flex-col items-center">
        <IsoTower
          structure={structure}
          variant="ink"
          highlight={index}
          className={`${big ? "h-[1.9in]" : "h-[1.15in]"} w-auto max-w-[4.6in]`}
          title={`Where step ${index + 1} goes`}
        />
        <span className="text-[0.6rem] font-extrabold tracking-widest text-blueprint uppercase">This step</span>
      </div>
    </div>
  );
}

export default function StructureSheets({
  bp,
  structure,
  built,
  pages,
}: {
  bp: Blueprint;
  structure: Structure;
  built: BuiltStructure;
  pages: number;
}) {
  const stepPages = structureStepPages(built);
  const furniture = [...new Set(built.parts.map((p) => p.on).filter(Boolean))];
  const photos = [bp.photo_url, ...(structure.photos ?? [])].filter((x): x is string => !!x && !x.startsWith("/api/"));
  const soFar = new Map<number, number>();
  built.parts.reduce((n, p) => {
    soFar.set(p.index, n + p.blocks);
    return n + p.blocks;
  }, 0);
  const pillars = built.parts.filter((p) => p.kind === "pillar").length;

  return (
    <>
      {/* Cover */}
      <section className="sheet">
        <TitleBar bp={bp} page={1} pages={pages} />
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="text-sm font-extrabold tracking-[0.3em] text-blueprint/70 uppercase">Official Blueprint</p>
          <h1 className="font-display text-6xl leading-none text-blueprint">{bp.name}</h1>
          <p className="mt-2 text-lg font-semibold text-ink">{bp.tagline}</p>
          <IsoTower structure={structure} variant="ink" className="mt-6 h-auto max-h-[3.6in] w-full" title={`${bp.name} drawing`} />
          {photos.length ? (
            <div className="mt-5 flex justify-center gap-4">
              {photos.slice(0, 2).map((src) => (
                <Image
                  key={src}
                  src={src}
                  alt={`Sawyer's real ${bp.name}`}
                  width={1200}
                  height={1400}
                  loading="eager"
                  className="h-[2.3in] w-auto rounded-xl border-[2.5px] border-blueprint"
                />
              ))}
            </div>
          ) : null}
          {photos.length ? (
            <p className="mt-1 text-[0.65rem] font-extrabold tracking-widest text-blueprint/70 uppercase">
              Sawyer&apos;s real build
            </p>
          ) : null}
        </div>
        <table className="title-block mt-4 w-full text-left text-sm">
          <tbody>
            <tr>
              <th>{bp.designer ? "Designer" : "Architect"}</th>
              <td className="font-display text-lg">{bp.designer || "Sawyer (age 7)"}</td>
              <th>Blocks</th>
              <td className="font-display text-lg">{built.blocks}</td>
              <th>Long</th>
              <td className="font-display text-lg">{built.length}</td>
            </tr>
            <tr>
              <th>Tallest</th>
              <td>{built.height} blocks</td>
              <th>Steps</th>
              <td>{built.parts.length}</td>
              <th>Level</th>
              <td>{difficultyLabel(bp.difficulty)}</td>
            </tr>
            <tr>
              <th>Builds on</th>
              <td colSpan={3}>{furniture.length ? furniture.join(", ") : "the floor"}</td>
              <th>Scale</th>
              <td>1 block = 1 block</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Parts list */}
      <section className="sheet">
        <TitleBar bp={bp} page={2} pages={pages} />
        <h2 className="mt-5 font-display text-4xl text-blueprint">Parts list &amp; block math</h2>
        <p className="mt-1 text-ink">Before you build, make sure you have enough blocks. Here is the math!</p>
        <table className="parts mt-5 w-full text-left">
          <thead>
            <tr>
              <th>Step</th>
              <th>Part</th>
              <th>What it is</th>
              <th>Math</th>
              <th className="text-right">Blocks</th>
            </tr>
          </thead>
          <tbody>
            {built.parts.map((p, i) => (
              <tr key={p.index}>
                <td className="font-display text-lg">{i + 1}</td>
                <td className="font-bold">{p.label}</td>
                <td>{partKind(p)}</td>
                <td>{partMath(p)}</td>
                <td className="text-right font-display text-xl">{p.blocks}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4} className="font-bold">
                Total: {built.parts.map((p) => p.blocks).join(" + ")} =
              </td>
              <td className="text-right font-display text-3xl">{built.blocks}</td>
            </tr>
          </tfoot>
        </table>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-2xl border-[2.5px] border-blueprint p-4">
            <p className="font-display text-xl text-blueprint">How big will it be?</p>
            <p className="mt-2 text-navy">
              <strong className="font-display text-2xl">{built.length}</strong> blocks long and{" "}
              <strong className="font-display text-2xl">{built.height}</strong> blocks tall at the top beam, with{" "}
              {pillars} pillar{pillars === 1 ? "" : "s"} holding it up.
            </p>
          </div>
          <CountingTrick blocks={built.blocks} />
        </div>

        <div className="mt-6 rounded-2xl bg-ice p-4">
          <p className="font-display text-xl text-blueprint">Builder tips from Sawyer</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-navy">
            {furniture.length ? <li>Line up the {furniture.join(", ")} first, just like the photo on the cover.</li> : null}
            <li>Build the pillars before the beams. Beams need something to sit on!</li>
            <li>Ask a grown-up to hold long beams while the magnets click together.</li>
            <li>Your chairs might be a little different. Add or take away a block or two so it fits.</li>
            <li>Any colors work. Mix them up and make it yours!</li>
          </ul>
        </div>
      </section>

      {/* Steps */}
      {stepPages.map((group, gi) => (
        <section key={gi} className="sheet">
          <TitleBar bp={bp} page={3 + gi} pages={pages} />
          <div className="mt-5 flex flex-1 flex-col gap-5">
            {group.map((p) => {
              const step = built.parts.indexOf(p) + 1;
              return p.kind === "pillar" ? (
                <PillarStep key={p.index} p={p} step={step} structure={structure} soFar={soFar.get(p.index) ?? 0} />
              ) : (
                <PathStep
                  key={p.index}
                  p={p}
                  step={step}
                  structure={structure}
                  built={built}
                  soFar={soFar.get(p.index) ?? 0}
                  big={isBig(p)}
                />
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}

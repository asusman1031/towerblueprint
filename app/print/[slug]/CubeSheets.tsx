import Image from "next/image";
import IsoTower from "@/components/IsoTower";
import type { BuiltCubes, CubeDesign, CubeStepStats, LayerRun } from "@/lib/cubes";
import type { Blueprint } from "@/lib/data";
import { difficultyLabel } from "@/lib/tower";
import { CountingTrick, TickBoxes, TitleBar } from "./sheets";

// The official blueprint pages for a free-form magnetic block build (cover,
// block count and layer math, then each step as top-view layer maps). Layers
// that look the same are shown once, with how many times to build them. The
// certificate and bonus pages come from the main print page.

const PAGE_ROOM = 4; // about how many layer maps fit on a page, with their step headers

export function cubeStepPages(built: BuiltCubes): CubeStepStats[][] {
  const pages: CubeStepStats[][] = [];
  for (const s of built.steps) {
    const last = pages[pages.length - 1];
    if (last && last.length < 2 && last.reduce((n, x) => n + x.runs.length, 0) + s.runs.length <= PAGE_ROOM) last.push(s);
    else pages.push([s]);
  }
  return pages;
}

const CELL = 10;
const key = (x: number, y: number) => `${x}:${y}`;
const layers = (r: LayerRun) => r.z1 - r.z0 + 1;
const layerName = (r: LayerRun) => (r.z0 === r.z1 ? `Layer ${r.z0 + 1}` : `Layers ${r.z0 + 1}–${r.z1 + 1}`);

// Squares that already have a block on the layer under z.
function under(built: BuiltCubes, z: number) {
  return new Set(built.cubes.filter((c) => c.z === z - 1).map((c) => key(c.x, c.y)));
}

// A layer is a rectangle when its squares fill their bounding box: then it's w × d.
function rectangle(cells: [number, number][]) {
  const xs = cells.map(([x]) => x);
  const ys = cells.map(([, y]) => y);
  const w = Math.max(...xs) - Math.min(...xs) + 1;
  const d = Math.max(...ys) - Math.min(...ys) + 1;
  return w * d === cells.length ? { w, d } : null;
}

// Top view of a run of layers: dashed squares are the layer underneath, blue
// squares are this layer, and orange ones hang out past the layer underneath.
function LayerMap({ run, built, box, className }: { run: LayerRun; built: BuiltCubes; box: Box; className?: string }) {
  const below = under(built, run.z0);
  const cx = (x: number) => (x - box.x0) * CELL;
  const cy = (y: number) => (y - box.y0) * CELL;
  const mine = new Set(run.cells.map(([x, y]) => key(x, y)));
  return (
    <svg
      viewBox={`-2 -2 ${(box.x1 - box.x0) * CELL + 4} ${(box.y1 - box.y0) * CELL + 4}`}
      className={className}
      role="img"
      aria-label={`Top view of ${layerName(run).toLowerCase()}: ${run.cells.length} blocks`}
    >
      {[...below]
        .filter((k) => !mine.has(k))
        .map((k) => {
          const [x, y] = k.split(":").map(Number);
          return (
            <rect
              key={`u-${k}`}
              x={cx(x) + 0.6}
              y={cy(y) + 0.6}
              width={CELL - 1.2}
              height={CELL - 1.2}
              rx={1.2}
              fill="#F4F8FF"
              stroke="#8DB3EE"
              strokeWidth={0.6}
              strokeDasharray="1.6 1.2"
            />
          );
        })}
      {run.cells.map(([x, y]) => {
        const hangs = run.z0 > 0 && !below.has(key(x, y));
        return (
          <rect
            key={key(x, y)}
            x={cx(x) + 0.5}
            y={cy(y) + 0.5}
            width={CELL - 1}
            height={CELL - 1}
            rx={1.2}
            fill={hangs ? "#FFB15C" : "#5E97F2"}
            stroke="#0B1F4D"
            strokeWidth={0.8}
          />
        );
      })}
    </svg>
  );
}

type Box = { x0: number; y0: number; x1: number; y1: number };

// One frame for all the maps of a step, so they line up with each other.
function stepBox(step: CubeStepStats, built: BuiltCubes): Box {
  const xs: number[] = [];
  const ys: number[] = [];
  for (const r of step.runs) {
    for (const [x, y] of r.cells) {
      xs.push(x, x + 1);
      ys.push(y, y + 1);
    }
    for (const k of under(built, r.z0)) {
      const [x, y] = k.split(":").map(Number);
      xs.push(x, x + 1);
      ys.push(y, y + 1);
    }
  }
  return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
}

function CubeStep({ step, built, cubes }: { step: CubeStepStats; built: BuiltCubes; cubes: CubeDesign }) {
  const box = stepBox(step, built);
  const layerCount = step.runs.reduce((n, r) => n + layers(r), 0);
  return (
    <div className="step-card rounded-2xl border-[2.5px] border-blueprint p-4">
      <div className="flex items-baseline gap-3">
        <span className="rounded-lg bg-blueprint px-2.5 py-1 font-display text-lg text-white">Step {step.index + 1}</span>
        <span className="font-display text-2xl text-blueprint">{step.label}</span>
        <span className="ml-auto font-display text-xl text-blueprint">{step.count} blocks</span>
      </div>
      {step.note ? <p className="mt-2 rounded-lg bg-ice px-3 py-1.5 text-sm font-bold text-navy">{step.note}</p> : null}
      <div className="mt-3 grid grid-cols-[1fr_auto] gap-4">
        <div>
          <ol className="space-y-2">
            {step.runs.map((r) => {
              const below = under(built, r.z0);
              const hanging = r.z0 > 0 ? r.cells.filter(([x, y]) => !below.has(key(x, y))).length : 0;
              const rect = rectangle(r.cells);
              return (
                <li key={r.z0} className="flex items-center gap-3">
                  <div className="flex w-[1.9in] shrink-0 flex-col items-center">
                    <LayerMap run={r} built={built} box={box} className="h-auto max-h-[1.1in] w-full" />
                  </div>
                  <div className="text-[0.9rem] leading-snug text-navy">
                    <span className="font-display text-blueprint">{layerName(r)}:</span>{" "}
                    {rect && r.cells.length > 1 ? `${rect.w} × ${rect.d} = ` : ""}
                    <strong>{r.cells.length}</strong> {r.cells.length === 1 ? "block" : "blocks"}
                    {layers(r) > 1 ? (
                      <>
                        {" "}
                        in each layer. <strong>Build it {layers(r)} times</strong> ({layers(r)} × {r.cells.length} ={" "}
                        {layers(r) * r.cells.length}).
                      </>
                    ) : (
                      "."
                    )}
                    {hanging ? (
                      <strong className="block text-[#c2410c]">
                        {hanging} {hanging === 1 ? "block hangs" : "blocks hang"} out (orange). Hold them while the magnets
                        click!
                      </strong>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
          <div className="mt-2">
            <p className="text-[0.7rem] font-extrabold tracking-widest text-blueprint uppercase">
              Tick a box for every layer
            </p>
            <TickBoxes count={layerCount} size="sm" />
          </div>
          <p className="mt-2 rounded-lg bg-ice px-3 py-1.5 text-sm font-bold text-navy">
            Build so far: {step.countAfter} blocks
          </p>
        </div>
        <div className="flex flex-col items-center">
          <IsoTower
            cubes={cubes}
            highlight={step.index}
            className="h-[2.6in] w-auto max-w-[2.3in]"
            title={`Where step ${step.index + 1} goes`}
          />
          <span className="mt-1 text-[0.6rem] font-extrabold tracking-widest text-blueprint uppercase">This step</span>
        </div>
      </div>
    </div>
  );
}

export default function CubeSheets({
  bp,
  cubes,
  built,
  pages,
}: {
  bp: Blueprint;
  cubes: CubeDesign;
  built: BuiltCubes;
  pages: number;
}) {
  const photos = [bp.photo_url, ...(cubes.photos ?? [])].filter((x): x is string => !!x && !x.startsWith("/api/"));
  // The biggest run of same layers makes the best multiplication example.
  const big = built.steps.flatMap((s) => s.runs).sort((a, b) => layers(b) * b.cells.length - layers(a) * a.cells.length)[0];
  const bigRect = big ? rectangle(big.cells) : null;
  const filled = new Set(built.cubes.map((c) => `${c.x},${c.y},${c.z}`));
  const hangs = built.cubes.some((c) => c.z > 0 && !filled.has(`${c.x},${c.y},${c.z - 1}`));
  return (
    <>
      {/* Cover */}
      <section className="sheet">
        <TitleBar bp={bp} page={1} pages={pages} />
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="text-sm font-extrabold tracking-[0.3em] text-blueprint/70 uppercase">Official Blueprint</p>
          <h1 className="font-display text-6xl leading-none text-blueprint">{bp.name}</h1>
          <p className="mt-2 text-lg font-semibold text-ink">{bp.tagline}</p>
          {bp.award ? <p className="mt-2 font-display text-2xl text-blueprint">🏆 {bp.award}</p> : null}
          <IsoTower cubes={cubes} className="mt-5 h-[3.6in] w-auto max-w-full" title={`${bp.name} drawing`} />
          {photos.length ? (
            <div className="mt-5 flex justify-center gap-4">
              {photos.slice(0, 2).map((src) => (
                <Image
                  key={src}
                  src={src}
                  alt={`${bp.name}, the real build`}
                  width={1200}
                  height={1400}
                  loading="eager"
                  className="h-[2.1in] w-auto rounded-xl border-[2.5px] border-blueprint"
                />
              ))}
            </div>
          ) : null}
        </div>
        <table className="title-block mt-4 w-full text-left text-sm">
          <tbody>
            <tr>
              <th>{bp.designer ? "Designer" : "Architect"}</th>
              <td className="font-display text-lg">{bp.designer || "Sawyer (age 7)"}</td>
              <th>Blocks</th>
              <td className="font-display text-lg">{built.count}</td>
              <th>Tall</th>
              <td className="font-display text-lg">{built.tall} blocks</td>
            </tr>
            <tr>
              <th>Base</th>
              <td>
                {built.base.w} × {built.base.d} blocks
              </td>
              <th>Steps</th>
              <td>{built.steps.length}</td>
              <th>Level</th>
              <td>{difficultyLabel(bp.difficulty)}</td>
            </tr>
            <tr>
              <th>{bp.designer ? "Blueprint by" : "Inspired by"}</th>
              <td colSpan={3}>
                {bp.designer ? "Sawyer (age 7), Tower Blueprints for Kids" : bp.inspired_by || "Sawyer's imagination"}
              </td>
              <th>Pieces</th>
              <td>Magnetic blocks</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Block count */}
      <section className="sheet">
        <TitleBar bp={bp} page={2} pages={pages} />
        <h2 className="mt-5 font-display text-4xl text-blueprint">Block count &amp; layer math</h2>
        <p className="mt-1 text-ink">
          {cubes.need ? <strong>{cubes.need}. </strong> : null}
          Count out your blocks before you start, so you don&apos;t run out halfway.
        </p>
        <table className="parts compact mt-4 w-full text-left">
          <thead>
            <tr>
              <th>Step</th>
              <th>Layers</th>
              <th className="text-right">Blocks</th>
            </tr>
          </thead>
          <tbody>
            {built.steps.map((s) => (
              <tr key={s.index}>
                <td>
                  <span className="font-display">{s.index + 1}.</span> <span className="font-bold">{s.label}</span>
                </td>
                <td className="text-sm">
                  {s.runs
                    .map((r) => (layers(r) > 1 ? `${layers(r)} × ${r.cells.length}` : `${r.cells.length}`))
                    .join(" + ")}
                </td>
                <td className="text-right font-display">{s.count}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2} className="font-bold">
                Total: {built.steps.map((s) => s.count).join(" + ")} =
              </td>
              <td className="text-right font-display text-3xl">{built.count}</td>
            </tr>
          </tfoot>
        </table>

        <div className="mt-3 grid grid-cols-2 gap-4">
          {big && bigRect ? (
            <div className="rounded-2xl border-[2.5px] border-blueprint p-4">
              <p className="font-display text-xl text-blueprint">Layer math</p>
              <p className="mt-2 text-navy">
                A layer {bigRect.w} blocks wide and {bigRect.d} deep has {bigRect.w} × {bigRect.d} ={" "}
                <strong>{big.cells.length}</strong> blocks.
                {layers(big) > 1 ? (
                  <>
                    {" "}
                    Build it {layers(big)} times: {layers(big)} × {big.cells.length} ={" "}
                    <strong>{layers(big) * big.cells.length}</strong>!
                  </>
                ) : null}
              </p>
            </div>
          ) : null}
          <CountingTrick blocks={built.count} />
        </div>

        <div className="mt-3 rounded-2xl bg-ice px-4 py-3">
          <p className="font-display text-xl text-blueprint">Builder tips</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-navy">
            <li>Build on a hard, flat floor. Finish each layer before you start the next one.</li>
            <li>Maps show each layer from the top, front at the bottom. Dashed squares are the layer underneath.</li>
            {hangs ? (
              <li>Orange squares hang out past the layer underneath: hold them until the magnets click.</li>
            ) : null}
            {bp.difficulty >= 4 ? (
              <li>Ultra Expert build! Take breaks between steps, and ask a grown-up to help count.</li>
            ) : null}
            <li>Any block pictures work. Mix them up, like Sawyer did!</li>
          </ul>
        </div>
      </section>

      {/* Steps */}
      {cubeStepPages(built).map((group, gi) => (
        <section key={gi} className="sheet">
          <TitleBar bp={bp} page={3 + gi} pages={pages} />
          <div className="mt-5 flex flex-1 flex-col gap-5">
            {group.map((step) => (
              <CubeStep key={step.index} step={step} built={built} cubes={cubes} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

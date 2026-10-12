import Image from "next/image";
import BrickDrawing from "@/components/BrickDrawing";
import {
  BRICK_COLORS,
  brickName,
  rampWord,
  type BrickDesign,
  type BuiltBricks,
  type PlacedBrick,
  type StepStats,
} from "@/lib/bricks";
import type { Blueprint } from "@/lib/data";
import { difficultyLabel } from "@/lib/tower";
import { CountingTrick, TickBoxes, TitleBar } from "./sheets";

// The official blueprint pages for a LEGO-style brick build (cover, parts list, steps).
// The certificate and bonus pages come from the main print page.

const PAGE_ROOM = 7; // about how many one-row layers fit on a page, with their step headers

// A layer split into a back row and a front row takes more room.
const stepSize = (s: StepStats) =>
  s.layers.reduce((n, z) => n + (rowsOf(s.bricks.filter((b) => b.z === z)).length > 1 ? 1.4 : 1), 0);

// One or two steps per page, as long as their layer maps fit.
export function brickStepPages(built: BuiltBricks): StepStats[][] {
  const pages: StepStats[][] = [];
  for (const s of built.steps) {
    const last = pages[pages.length - 1];
    if (last && last.length < 2 && last.reduce((n, x) => n + stepSize(x), 0) + stepSize(s) <= PAGE_ROOM) last.push(s);
    else pages.push([s]);
  }
  return pages;
}

const CELL = 10;
const cellKey = (x: number, y: number) => `${x}:${y}`;

function cellsAt(bricks: PlacedBrick[], z: number) {
  const out = new Set<string>();
  for (const b of bricks)
    if (b.z <= z && z < b.z + b.h)
      for (let x = b.x; x < b.x + b.w; x++) for (let y = b.y; y < b.y + b.d; y++) out.add(cellKey(x, y));
  return out;
}

// Which new bricks hang past what's under them.
function sticksOut(b: PlacedBrick, below: Set<string>) {
  if (b.z === 0) return false;
  for (let x = b.x; x < b.x + b.w; x++) for (let y = b.y; y < b.y + b.d; y++) if (!below.has(cellKey(x, y))) return true;
  return false;
}

type Box = { x0: number; y0: number; x1: number; y1: number };

// What's already there when a layer goes on: the layer underneath, plus any
// tall brick from an earlier layer that pokes up through this one.
function underCells(built: BuiltBricks, z: number) {
  const before = built.bricks.filter((b) => b.z < z);
  return new Set([...cellsAt(before, z - 1), ...cellsAt(before, z)]);
}

// One frame for all the maps of a step, so they line up with each other.
function stepBox(step: StepStats, built: BuiltBricks): Box {
  const xs: number[] = [];
  const ys: number[] = [];
  for (const z of step.layers)
    for (const k of underCells(built, z)) {
      const [x, y] = k.split(":").map(Number);
      xs.push(x, x + 1);
      ys.push(y, y + 1);
    }
  for (const b of step.bricks) {
    xs.push(b.x, b.x + b.w);
    ys.push(b.y, b.y + b.d);
  }
  return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
}

// Top view of one layer. Dashed squares are what's already there (including
// bricks an earlier step put on this same layer); this step's bricks are in color.
function LayerMap({
  z,
  step,
  built,
  box,
  className,
}: {
  z: number;
  step: StepStats;
  built: BuiltBricks;
  box: Box;
  className?: string;
}) {
  const fresh = step.bricks.filter((b) => b.z === z);
  const under = new Set([
    ...underCells(built, z),
    ...cellsAt(
      built.bricks.filter((b) => b.z === z && b.step < step.index),
      z,
    ),
  ]);
  const cx = (x: number) => (x - box.x0) * CELL;
  const cy = (y: number) => (y - box.y0) * CELL;

  return (
    <svg
      viewBox={`-2 -2 ${(box.x1 - box.x0) * CELL + 4} ${(box.y1 - box.y0) * CELL + 4}`}
      className={className}
      role="img"
      aria-label={`Top view: ${fresh.map((b) => `${b.color} ${brickName(b)}`).join(", ")}`}
    >
      {[...under].map((k) => {
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
      {fresh.map((b) => {
        const studs = Array.from({ length: b.w * b.d }, (_, i) => [b.x + (i % b.w), b.y + Math.floor(i / b.w)]).filter(
          ([x, y]) => !b.ramp || rampTop(b, x, y),
        );
        return (
          <g key={b.id}>
            <rect
              x={cx(b.x) + 0.5}
              y={cy(b.y) + 0.5}
              width={b.w * CELL - 1}
              height={b.d * CELL - 1}
              rx={1.2}
              fill={BRICK_COLORS[b.color]}
              fillOpacity={b.ramp ? 0.55 : 1}
              stroke="#0B1F4D"
              strokeWidth={0.9}
            />
            {b.ramp ? <RampArrow b={b} cx={cx} cy={cy} /> : null}
            {studs.map(([x, y]) => (
              <circle
                key={`${x}-${y}`}
                cx={cx(x) + CELL / 2}
                cy={cy(y) + CELL / 2}
                r={2.6}
                fill={b.ramp ? BRICK_COLORS[b.color] : "none"}
                stroke="rgba(11,31,77,0.45)"
                strokeWidth={0.7}
              />
            ))}
          </g>
        );
      })}
    </svg>
  );
}

// The tall end of a ramp, where its studs are: the row of squares farthest from the tip.
function rampTop(b: PlacedBrick, x: number, y: number) {
  if (b.ramp === "left") return x === b.x + b.w - 1;
  if (b.ramp === "right") return x === b.x;
  if (b.ramp === "back") return y === b.y + b.d - 1;
  return y === b.y;
}

// On a map, an arrow from a ramp's tall end toward its tip.
function RampArrow({ b, cx, cy }: { b: PlacedBrick; cx: (x: number) => number; cy: (y: number) => number }) {
  const midX = cx(b.x) + (b.w * CELL) / 2;
  const midY = cy(b.y) + (b.d * CELL) / 2;
  const [dx, dy] = { left: [-1, 0], right: [1, 0], front: [0, 1], back: [0, -1] }[b.ramp!];
  const len = ((dx ? b.w : b.d) - 1) * CELL * 0.42;
  const off = (dx ? b.w : b.d) * CELL * 0.18; // start a little toward the tall end
  const x0 = midX - dx * off;
  const y0 = midY - dy * off;
  const x1 = x0 + dx * len * 2;
  const y1 = y0 + dy * len * 2;
  return (
    <g stroke="#0B1F4D" strokeWidth={0.9} strokeLinecap="round" fill="none">
      <line x1={x0} y1={y0} x2={x1} y2={y1} />
      <path d={`M${x1 - dx * 2.6 - dy * 2.2},${y1 - dy * 2.6 - dx * 2.2}L${x1},${y1}L${x1 - dx * 2.6 + dy * 2.2},${y1 - dy * 2.6 + dx * 2.2}`} />
    </g>
  );
}

// A layer that is exactly a back row and a front row reads easier split in two.
function rowsOf(bricks: PlacedBrick[]) {
  const ys = [...new Set(bricks.map((b) => b.y))].sort((a, b) => a - b);
  if (ys.length !== 2 || bricks.some((b) => b.y === ys[0] && b.y + b.d > ys[1])) return [bricks];
  return ys.map((y) => bricks.filter((b) => b.y === y).sort((a, b) => a.x - b.x));
}

function Swatch({ color }: { color: PlacedBrick["color"] }) {
  return (
    <span
      className="inline-block size-3.5 shrink-0 rounded-sm border-2 border-navy align-[-2px]"
      style={{ background: BRICK_COLORS[color] }}
    />
  );
}

function BrickStep({
  step,
  built,
  bricks,
  layerNo,
}: {
  step: StepStats;
  built: BuiltBricks;
  bricks: BrickDesign;
  layerNo: Map<number, number>;
}) {
  const box = stepBox(step, built);
  return (
    <div className="step-card rounded-2xl border-[2.5px] border-blueprint p-4">
      <div className="flex items-baseline gap-3">
        <span className="rounded-lg bg-blueprint px-2.5 py-1 font-display text-lg text-white">
          Step {step.index + 1}
        </span>
        <span className="font-display text-2xl text-blueprint">{step.label}</span>
        <span className="ml-auto font-display text-xl text-blueprint">
          {step.count} brick{step.count === 1 ? "" : "s"}
        </span>
      </div>
      {step.note ? <p className="mt-2 rounded-lg bg-ice px-3 py-1.5 text-sm font-bold text-navy">{step.note}</p> : null}
      <div className="mt-3 grid grid-cols-[1fr_auto] gap-4">
        <div>
          <ol className="space-y-1.5">
            {step.layers.map((z) => {
              const fresh = step.bricks.filter((b) => b.z === z);
              const below = cellsAt(
                built.bricks.filter((b) => b.z < z),
                z - 1,
              );
              return (
                <li key={z} className="flex items-center gap-3">
                  <div className="flex w-[1.75in] shrink-0 flex-col items-center">
                    <LayerMap z={z} step={step} built={built} box={box} className="h-auto max-h-[0.5in] w-full" />
                  </div>
                  <div className="text-[0.9rem] leading-snug text-navy">
                    <span className="font-display text-blueprint">Layer {layerNo.get(z)}:</span>{" "}
                    {rowsOf(fresh).map((row, r, all) => (
                      <span key={r} className={all.length > 1 ? "block" : undefined}>
                        {all.length > 1 ? <strong>{r === 0 ? "Back row: " : "Front row: "}</strong> : null}
                        {row.map((b, i) => (
                          <span key={b.id}>
                            {i ? " + " : ""}
                            <Swatch color={b.color} /> {b.color} {brickName(b)}
                            {b.ramp ? ` (${rampWord(b.ramp)})` : null}
                            {sticksOut(b, below) ? <strong className="text-[#c2410c]"> (sticks out!)</strong> : null}
                          </span>
                        ))}
                      </span>
                    ))}
                  </div>
                </li>
              );
            })}
          </ol>
          <div className="mt-2">
            <p className="text-[0.7rem] font-extrabold tracking-widest text-blueprint uppercase">
              Tick a box for every brick
            </p>
            <TickBoxes count={step.count} size="sm" />
          </div>
          <p className="mt-2 rounded-lg bg-ice px-3 py-1.5 text-sm font-bold text-navy">
            Build so far: {step.countAfter} bricks
          </p>
        </div>
        <div className="flex flex-col items-center">
          <BrickDrawing
            bricks={bricks}
            highlight={step.index}
            className="h-[2.6in] w-auto max-w-[2.2in]"
            title={`Where step ${step.index + 1} goes`}
          />
          <span className="mt-1 text-[0.6rem] font-extrabold tracking-widest text-blueprint uppercase">This step</span>
        </div>
      </div>
    </div>
  );
}

export default function BrickSheets({
  bp,
  bricks,
  built,
  pages,
}: {
  bp: Blueprint;
  bricks: BrickDesign;
  built: BuiltBricks;
  pages: number;
}) {
  const photos = [bp.photo_url, ...(bricks.photos ?? [])].filter((x): x is string => !!x && !x.startsWith("/api/"));
  const layers = [...new Set(built.bricks.map((b) => b.z))].sort((a, b) => a - b);
  // One row per brick size, with how many of each color.
  const sizes = new Map<string, { label: string; count: number; colors: typeof built.kinds }>();
  for (const k of built.kinds) {
    const row = sizes.get(k.label) ?? { label: k.label, count: 0, colors: [] };
    row.count += k.count;
    row.colors.push(k);
    sizes.set(k.label, row);
  }
  const rows = [...sizes.values()].sort((a, b) => b.count - a.count);
  const layerNo = new Map(layers.map((z, i) => [z, i + 1]));
  const hasPlate = built.bricks.some((b) => b.h === 1);
  const basePlate = built.bricks.some((b) => b.h === 1 && b.z === 0);
  const hasTall = built.bricks.some((b) => b.h === 6 && !b.ramp);
  const hasRamp = built.bricks.some((b) => b.ramp);
  const overhang = built.bricks.some((b) =>
    sticksOut(
      b,
      cellsAt(
        built.bricks.filter((x) => x.z < b.z),
        b.z - 1,
      ),
    ),
  );

  return (
    <>
      {/* Cover */}
      <section className="sheet">
        <TitleBar bp={bp} page={1} pages={pages} />
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="text-sm font-extrabold tracking-[0.3em] text-blueprint/70 uppercase">Official Blueprint</p>
          <h1 className="font-display text-6xl leading-none text-blueprint">{bp.name}</h1>
          <p className="mt-2 text-lg font-semibold text-ink">{bp.tagline}</p>
          <BrickDrawing bricks={bricks} className="mt-6 h-[3.8in] w-auto max-w-full" title={`${bp.name} drawing`} />
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
              <th>Bricks</th>
              <td className="font-display text-lg">{built.count}</td>
              <th>Tall</th>
              <td className="font-display text-lg">{built.tall} bricks</td>
            </tr>
            <tr>
              <th>Base</th>
              <td>
                {built.base.w} × {built.base.d} studs
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
              <td>LEGO DUPLO bricks</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Parts list */}
      <section className="sheet">
        <TitleBar bp={bp} page={2} pages={pages} />
        <h2 className="mt-5 font-display text-4xl text-blueprint">Parts list &amp; brick math</h2>
        <p className="mt-1 text-ink">
          {bricks.need ? <strong>{bricks.need}. </strong> : null}
          Find these bricks before you build and put them in a pile.
        </p>
        <table className="parts mt-5 w-full text-left">
          <thead>
            <tr>
              <th>Brick</th>
              <th>Colors (tick each one when you have them)</th>
              <th className="text-right">How many</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label}>
                <td className="font-bold whitespace-nowrap">{r.label}</td>
                <td>
                  <span className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
                    {r.colors.map((k) => (
                      <span key={k.key} className="flex items-center gap-1 whitespace-nowrap">
                        <span className="size-4 shrink-0 rounded border-2 border-blueprint" />
                        <Swatch color={k.color} /> {k.count} {k.color}
                      </span>
                    ))}
                  </span>
                </td>
                <td className="text-right font-display text-xl">{r.count}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2} className="font-bold">
                Total, step by step: {built.steps.map((s) => s.count).join(" + ")} =
              </td>
              <td className="text-right font-display text-3xl">{built.count}</td>
            </tr>
          </tfoot>
        </table>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-2xl border-[2.5px] border-blueprint p-4">
            <p className="font-display text-xl text-blueprint">How tall is a brick?</p>
            <p className="mt-2 text-navy">
              {hasPlate ? (
                <>
                  A <strong>plate</strong> is a thin, flat brick.{" "}
                </>
              ) : null}
              {hasTall ? (
                <>
                  A <strong>tall brick</strong> is as tall as <strong>2</strong> bricks.{" "}
                </>
              ) : null}
              The whole tower is about <strong>{built.tall}</strong> bricks tall!
            </p>
          </div>
          <CountingTrick blocks={built.count} />
        </div>

        <div className="mt-6 rounded-2xl bg-ice p-4">
          <p className="font-display text-xl text-blueprint">Builder tips</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-navy">
            <li>Press each brick down until it clicks, so the tower stays strong.</li>
            <li>
              The maps show each layer from the top, with the front at the bottom. Dashed squares are the bricks already
              there.
            </li>
            {hasTall ? <li>No tall brick? Stack two regular bricks of the same size instead.</li> : null}
            {basePlate ? <li>No thin plate? Leave it out and start the next layer right on the floor.</li> : null}
            {hasPlate && !basePlate ? <li>No thin plates? Long bricks of the same size work too.</li> : null}
            {overhang ? <li>Bricks that stick out need a steady hand. Hold the tower while you press them on.</li> : null}
            {hasRamp ? (
              <li>
                A curved ramp has studs only on its tall end. On the maps, the arrow points the way the curve swoops.
              </li>
            ) : null}
            <li>Any colors work. Swap in the colors you have and make it yours!</li>
          </ul>
        </div>
      </section>

      {/* Steps */}
      {brickStepPages(built).map((group, gi) => (
        <section key={gi} className="sheet">
          <TitleBar bp={bp} page={3 + gi} pages={pages} />
          <div className="mt-5 flex flex-1 flex-col gap-5">
            {group.map((step) => (
              <BrickStep key={step.index} step={step} built={built} bricks={bricks} layerNo={layerNo} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

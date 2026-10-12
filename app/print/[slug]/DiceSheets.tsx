import Image from "next/image";
import DiceDrawing from "@/components/DiceDrawing";
import type { Blueprint } from "@/lib/data";
import { DICE_COLORS, PIPS, type BuiltDice, type DiceDesign, type DiceStepStats, type PlacedDie } from "@/lib/dice";
import { difficultyLabel } from "@/lib/tower";
import { TickBoxes, TitleBar } from "./sheets";

// The official blueprint pages for a dice build (cover, dice list with dot math, steps).
// The certificate and bonus pages come from the main print page.

export function diceStepPages(built: BuiltDice): DiceStepStats[][] {
  const pages: DiceStepStats[][] = [];
  for (let i = 0; i < built.steps.length; i += 2) pages.push(built.steps.slice(i, i + 2));
  return pages;
}

const CELL = 20;

// The wall from the front. Dice from earlier steps are dashed; this step's dice show their color and dots.
function FrontMap({ built, step, className }: { built: BuiltDice; step: DiceStepStats; className?: string }) {
  const minX = Math.min(...built.dice.map((d) => d.x));
  const maxZ = Math.max(...built.dice.map((d) => d.z));
  const front = new Map<string, PlacedDie>();
  for (const d of built.dice) {
    const k = `${d.x},${d.z}`;
    const was = front.get(k);
    if (!was || d.y > was.y) front.set(k, d);
  }
  const shown = [...front.values()].filter((d) => d.step <= step.index);
  return (
    <svg
      viewBox={`-2 -2 ${built.wide * CELL + 4} ${built.tall * CELL + 4}`}
      className={className}
      role="img"
      aria-label={`Front view of ${step.label}`}
    >
      {shown.map((d) => {
        const x = (d.x - minX) * CELL;
        const y = (maxZ - d.z) * CELL;
        const now = d.step === step.index;
        return (
          <g key={d.id}>
            <rect
              x={x + 1}
              y={y + 1}
              width={CELL - 2}
              height={CELL - 2}
              rx={3.5}
              fill={now ? DICE_COLORS[d.color] : "#F4F8FF"}
              stroke={now ? "#0B1F4D" : "#8DB3EE"}
              strokeWidth={now ? 1 : 0.7}
              strokeDasharray={now ? undefined : "2 1.5"}
            />
            {now
              ? PIPS[d.front].map(([px, py], i) => (
                  <circle
                    key={i}
                    cx={x + 1 + px * (CELL - 2)}
                    cy={y + 1 + py * (CELL - 2)}
                    r={1.7}
                    fill={d.color === "white" ? "#2B2B2B" : "#FFFFFF"}
                  />
                ))
              : null}
          </g>
        );
      })}
    </svg>
  );
}

function Swatch({ color }: { color: PlacedDie["color"] }) {
  return (
    <span
      className="inline-block size-3.5 shrink-0 rounded-sm border-2 border-navy align-[-2px]"
      style={{ background: DICE_COLORS[color] }}
    />
  );
}

function DiceStep({ step, built, dice }: { step: DiceStepStats; built: BuiltDice; dice: DiceDesign }) {
  const taken = new Set(built.dice.map((d) => `${d.x},${d.y},${d.z}`));
  const row = [...step.dice].sort((a, b) => a.z - b.z || a.x - b.x);
  const sum = row.reduce((n, d) => n + d.front, 0);
  return (
    <div className="step-card rounded-2xl border-[2.5px] border-blueprint p-4">
      <div className="flex items-baseline gap-3">
        <span className="rounded-lg bg-blueprint px-2.5 py-1 font-display text-lg text-white">Step {step.index + 1}</span>
        <span className="font-display text-2xl text-blueprint">{step.label}</span>
        <span className="ml-auto font-display text-xl text-blueprint">
          {step.dice.length} {step.dice.length === 1 ? "die" : "dice"}
        </span>
      </div>
      {step.note ? <p className="mt-2 rounded-lg bg-ice px-3 py-1.5 text-sm font-bold text-navy">{step.note}</p> : null}
      <div className="mt-3 grid grid-cols-[1fr_auto] gap-4">
        <div>
          <div className="flex items-start gap-4">
            <div className="flex shrink-0 flex-col items-center">
              <FrontMap built={built} step={step} className="h-auto w-[1.6in]" />
              <span className="mt-1 text-[0.6rem] font-extrabold tracking-widest text-blueprint uppercase">
                Front view
              </span>
            </div>
            <ol className="space-y-1 text-[0.9rem] text-navy">
              {row.map((d) => (
                <li key={d.id}>
                  <Swatch color={d.color} /> {d.color} die: <strong>{d.front}</strong> facing you
                  {taken.has(`${d.x},${d.y},${d.z + 1}`) ? null : (
                    <>
                      , <strong>{d.top}</strong> on top
                    </>
                  )}
                </li>
              ))}
            </ol>
          </div>
          <div className="mt-2">
            <p className="text-[0.7rem] font-extrabold tracking-widest text-blueprint uppercase">Tick a box for every die</p>
            <TickBoxes count={step.dice.length} size="sm" />
          </div>
          <p className="mt-2 rounded-lg bg-ice px-3 py-1.5 text-sm font-bold text-navy">
            Dots facing you: {row.map((d) => d.front).join(" + ")} = {sum}
          </p>
        </div>
        <div className="flex flex-col items-center">
          <DiceDrawing
            dice={dice}
            highlight={step.index}
            className="h-auto max-h-[2in] w-[2.4in]"
            title={`Where step ${step.index + 1} goes`}
          />
          <span className="mt-1 text-[0.6rem] font-extrabold tracking-widest text-blueprint uppercase">This step</span>
        </div>
      </div>
    </div>
  );
}

export default function DiceSheets({
  bp,
  dice,
  built,
  pages,
}: {
  bp: Blueprint;
  dice: DiceDesign;
  built: BuiltDice;
  pages: number;
}) {
  const photos = [bp.photo_url, ...(dice.photos ?? [])].filter((x): x is string => !!x && !x.startsWith("/api/"));
  const rowName = (i: number, n: number) => (n === 1 ? "The wall" : i === 0 ? "Bottom row" : i === n - 1 ? "Top row" : `Row ${i + 1}`);
  return (
    <>
      {/* Cover */}
      <section className="sheet">
        <TitleBar bp={bp} page={1} pages={pages} />
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="text-sm font-extrabold tracking-[0.3em] text-blueprint/70 uppercase">Official Blueprint</p>
          <h1 className="font-display text-6xl leading-none text-blueprint">{bp.name}</h1>
          <p className="mt-2 text-lg font-semibold text-ink">{bp.tagline}</p>
          <DiceDrawing dice={dice} className="mt-6 h-auto max-h-[3.2in] w-[5in] max-w-full" title={`${bp.name} drawing`} />
          {photos.length ? (
            <div className="mt-5 flex justify-center gap-4">
              {photos.slice(0, 2).map((src) => (
                <Image
                  key={src}
                  src={src}
                  alt={`${bp.name}, the real build`}
                  width={1400}
                  height={1000}
                  loading="eager"
                  className="h-[2.2in] w-auto rounded-xl border-[2.5px] border-blueprint"
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
              <th>Dice</th>
              <td className="font-display text-lg">{built.count}</td>
              <th>Tall</th>
              <td className="font-display text-lg">{built.tall} dice</td>
            </tr>
            <tr>
              <th>Wall</th>
              <td>
                {built.wide} wide × {built.tall} tall
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
              <td>Dice</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Dice list & dot math */}
      <section className="sheet">
        <TitleBar bp={bp} page={2} pages={pages} />
        <h2 className="mt-5 font-display text-4xl text-blueprint">Dice list &amp; dot math</h2>
        <p className="mt-1 text-ink">
          {dice.need ? <strong>{dice.need}. </strong> : null}
          Find your dice and tick them off.
        </p>
        <table className="parts mt-5 w-full text-left">
          <thead>
            <tr>
              <th>Color</th>
              <th>Got them?</th>
              <th className="text-right">How many</th>
            </tr>
          </thead>
          <tbody>
            {built.colors.map((c) => (
              <tr key={c.color}>
                <td className="font-bold">
                  <Swatch color={c.color} /> {c.color}
                </td>
                <td>
                  <span className="flex gap-1">
                    {Array.from({ length: c.count }, (_, i) => (
                      <span key={i} className="size-4 rounded border-2 border-blueprint" />
                    ))}
                  </span>
                </td>
                <td className="text-right font-display text-xl">{c.count}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2} className="font-bold">
                Total dice:
              </td>
              <td className="text-right font-display text-3xl">{built.count}</td>
            </tr>
          </tfoot>
        </table>

        <div className="mt-6 rounded-2xl border-[2.5px] border-blueprint p-4">
          <p className="font-display text-xl text-blueprint">Dot math: the secret number</p>
          <p className="mt-1 text-navy">Add up the dots facing you, one row at a time.</p>
          <ul className="mt-2 space-y-1 text-lg text-navy">
            {[...built.rows].reverse().map((r) => {
              const i = built.rows.indexOf(r);
              return (
                <li key={r.z}>
                  <strong>{rowName(i, built.rows.length)}:</strong> {r.dots.join(" + ")} = <strong>{r.sum}</strong>
                </li>
              );
            })}
            {built.rows.length > 1 ? (
              <li>
                <strong>Whole wall:</strong> {built.rows.map((r) => r.sum).join(" + ")} ={" "}
                <strong className="font-display text-2xl">{built.dots}</strong>
              </li>
            ) : null}
          </ul>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="rounded-2xl border-[2.5px] border-blueprint p-4">
            <p className="font-display text-xl text-blueprint">Dice secret</p>
            <p className="mt-2 text-navy">
              Opposite sides of a die add up to <strong>7</strong>. So the dots on the back of the wall add up to{" "}
              {built.count} × 7 − {built.dots} = <strong>{built.count * 7 - built.dots}</strong>. Peek and check!
            </p>
          </div>
          <div className="rounded-2xl border-[2.5px] border-blueprint p-4">
            <p className="font-display text-xl text-blueprint">Challenge</p>
            <p className="mt-2 text-navy">
              Turn the dice so the front adds up to a new secret number. Can you make it <strong>{built.count * 3}</strong>?
              How about <strong>{built.count * 6}</strong>?
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-ice p-4">
          <p className="font-display text-xl text-blueprint">Builder tips</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-navy">
            <li>Build on a hard, flat floor or table. Dice are smooth, so set each one down gently.</li>
            <li>Turn each die so the right number faces you before you stack the next one.</li>
            <li>Any colors work. The numbers are what make the math come out right!</li>
          </ul>
        </div>
      </section>

      {/* Steps */}
      {diceStepPages(built).map((group, gi) => (
        <section key={gi} className="sheet">
          <TitleBar bp={bp} page={3 + gi} pages={pages} />
          <div className="mt-5 flex flex-1 flex-col gap-5">
            {group.map((step) => (
              <DiceStep key={step.index} step={step} built={built} dice={dice} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

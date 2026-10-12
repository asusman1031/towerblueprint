import type { PathStats, PillarStats } from "@/lib/structure";

// Blueprint maps for structure steps, drawn in the same style as GridDiagram.

const CELL = 10;
const INK = "#1146B8";
const SUN = "#FFC21A";

function Square({
  x,
  y,
  fill = "#CFE2FF",
  dashed = false,
  label,
  small = false,
}: {
  x: number;
  y: number;
  fill?: string;
  dashed?: boolean;
  label?: string;
  small?: boolean;
}) {
  return (
    <g>
      <rect
        x={x * CELL + 0.6}
        y={y * CELL + 0.6}
        width={CELL - 1.2}
        height={CELL - 1.2}
        rx={1.2}
        fill={dashed ? "#F4F8FF" : fill}
        stroke={dashed ? "#8DB3EE" : INK}
        strokeWidth={dashed ? 0.6 : 0.9}
        strokeDasharray={dashed ? "1.6 1.2" : undefined}
      />
      {label ? (
        <text
          x={x * CELL + CELL / 2}
          y={y * CELL + CELL / 2 + (small ? 1.3 : 1.7)}
          textAnchor="middle"
          fontSize={small ? 3.6 : 4.6}
          fontWeight={800}
          fill={INK}
          fontFamily="Nunito, sans-serif"
        >
          {label}
        </text>
      ) : null}
    </g>
  );
}

// A path part seen from above (sideways runs) or from the side (runs that go up or down).
// The dashed square is the block it grows from; yellow squares sit on a pillar.
export function PathMap({ part, className }: { part: PathStats; className?: string }) {
  const side = part.runs.some((r) => r.dir === "U" || r.dir === "D");
  const across = part.runs.some((r) => r.dir === "N" || r.dir === "S") && !part.runs.some((r) => r.dir === "E" || r.dir === "W");
  // Top view: east is right, north is up. Side view: up is up.
  const at = ([x, y, z]: [number, number, number]) =>
    side ? { c: across ? -y : x, r: -z } : { c: x, r: y };
  const pts = part.cubes.map(at);
  const attach = part.attach ? at(part.attach) : null;
  const all = attach ? [...pts, attach] : pts;
  const minC = Math.min(...all.map((p) => p.c));
  const minR = Math.min(...all.map((p) => p.r));
  const w = Math.max(...all.map((p) => p.c)) - minC + 1;
  const h = Math.max(...all.map((p) => p.r)) - minR + 1;
  const held = new Map(part.heldBy.map((p) => [p.block, p.pillar.split(" ").pop() ?? "P"]));
  const numbered = part.cubes.length <= 20;

  // Badge with the run length, halfway along each run.
  const badges: { c: number; r: number; n: number }[] = [];
  let i = part.hasStart ? 1 : 0;
  for (const run of part.runs) {
    const mid = pts[i + Math.floor((run.n - 1) / 2)];
    if (mid && !numbered) badges.push({ c: mid.c, r: mid.r, n: run.n });
    i += run.n;
  }

  return (
    <svg
      viewBox={`-1 -1 ${w * CELL + 2} ${h * CELL + 2}`}
      className={className}
      role="img"
      aria-label={`${side ? "Side" : "Top"} view of ${part.label}: ${part.blocks} blocks`}
    >
      {attach ? <Square x={attach.c - minC} y={attach.r - minR} dashed /> : null}
      {pts.map((p, k) => {
        const pillar = held.get(k + 1);
        return (
          <Square
            key={k}
            x={p.c - minC}
            y={p.r - minR}
            fill={pillar ? SUN : "#CFE2FF"}
            label={pillar ?? (numbered ? String(k + 1) : k === 0 && part.hasStart ? "S" : undefined)}
            small={!numbered}
          />
        );
      })}
      {badges.map((b, k) => (
        <g key={`badge-${k}`}>
          <circle cx={(b.c - minC) * CELL + CELL / 2} cy={(b.r - minR) * CELL + CELL / 2} r={4.6} fill={INK} />
          <text
            x={(b.c - minC) * CELL + CELL / 2}
            y={(b.r - minR) * CELL + CELL / 2 + 1.8}
            textAnchor="middle"
            fontSize={5}
            fontWeight={800}
            fill="#fff"
            fontFamily="Nunito, sans-serif"
          >
            {b.n}
          </text>
        </g>
      ))}
    </svg>
  );
}

// A pillar's base from above. The yellow square is where the column stands.
export function PillarMap({ part, className }: { part: PillarStats; className?: string }) {
  const cells = [];
  let n = 0;
  for (let y = 0; y < part.base.d; y++)
    for (let x = 0; x < part.base.w; x++) {
      n++;
      const column = part.column > 0 && x === part.columnAt.x && y === part.columnAt.y;
      cells.push(<Square key={`${x}-${y}`} x={x} y={y} fill={column ? SUN : "#CFE2FF"} label={String(n)} />);
    }
  return (
    <svg
      viewBox={`-1 -1 ${part.base.w * CELL + 2} ${part.base.d * CELL + 2}`}
      className={className}
      role="img"
      aria-label={`Top view of ${part.label}'s base: ${part.base.w} by ${part.base.d}, the column stands on the yellow square`}
    >
      {cells}
    </svg>
  );
}

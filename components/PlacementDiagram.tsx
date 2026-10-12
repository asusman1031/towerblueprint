import type { Section } from "@/lib/tower";

// Top-down map for one step: the layer below (dashed) and where this layer's
// blocks go (numbered), both centered the same way the tower is built.
export default function PlacementDiagram({
  current,
  below,
  footprint,
  className,
}: {
  current: Section;
  below?: Section;
  footprint: { w: number; d: number };
  className?: string;
}) {
  const cell = 10;
  const off = (s: Section) => ({
    x: Math.floor((footprint.w - s.w) / 2),
    y: Math.floor((footprint.d - s.d) / 2),
  });
  // The map covers both layers, so a layer that sticks out past the one below still fits.
  const c = off(current);
  const b = below ? off(below) : c;
  const a = { x: Math.min(b.x, c.x), y: Math.min(b.y, c.y) };
  const area = {
    w: Math.max(b.x + (below?.w ?? 0), c.x + current.w) - a.x,
    d: Math.max(b.y + (below?.d ?? 0), c.y + current.d) - a.y,
  };
  const cells: React.ReactElement[] = [];

  // A wider layer hides the one below, so that one is drawn as a dashed outline on top instead.
  const overhang = !!below && (current.w > below.w || current.d > below.d);
  if (below && !overhang) {
    for (let y = 0; y < below.d; y++)
      for (let x = 0; x < below.w; x++)
        cells.push(
          <rect
            key={`b-${x}-${y}`}
            x={(x + b.x - a.x) * cell + 0.6}
            y={(y + b.y - a.y) * cell + 0.6}
            width={cell - 1.2}
            height={cell - 1.2}
            rx={1.2}
            fill="#F4F8FF"
            stroke="#8DB3EE"
            strokeWidth={0.6}
            strokeDasharray="1.6 1.2"
          />,
        );
  }
  let n = 0;
  for (let y = 0; y < current.d; y++)
    for (let x = 0; x < current.w; x++) {
      n++;
      const px = (x + c.x - a.x) * cell;
      const py = (y + c.y - a.y) * cell;
      cells.push(
        <g key={`c-${x}-${y}`}>
          <rect
            x={px + 0.6}
            y={py + 0.6}
            width={cell - 1.2}
            height={cell - 1.2}
            rx={1.2}
            fill="#CFE2FF"
            stroke="#1146B8"
            strokeWidth={0.9}
          />
          <text
            x={px + cell / 2}
            y={py + cell / 2 + 1.7}
            textAnchor="middle"
            fontSize={current.w * current.d > 30 ? 3.6 : 4.4}
            fontWeight={800}
            fill="#1146B8"
            fontFamily="Nunito, sans-serif"
          >
            {n}
          </text>
        </g>,
      );
    }

  if (below && overhang) {
    cells.push(
      <rect
        key="below-outline"
        x={(b.x - a.x) * cell + 0.3}
        y={(b.y - a.y) * cell + 0.3}
        width={below.w * cell - 0.6}
        height={below.d * cell - 0.6}
        rx={1.6}
        fill="none"
        stroke="#0B1F4D"
        strokeWidth={0.9}
        strokeDasharray="2 1.4"
      />,
    );
  }

  return (
    <svg
      viewBox={`-1 -1 ${area.w * cell + 2} ${area.d * cell + 2}`}
      className={className}
      role="img"
      aria-label={`Top view: a ${current.w} by ${current.d} layer${below ? ` on top of the ${below.w} by ${below.d} layer` : ""}`}
    >
      {cells}
    </svg>
  );
}

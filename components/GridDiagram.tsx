// Top-down view of one layer: a w x d grid of blocks, drawn like a blueprint.
export default function GridDiagram({
  w,
  d,
  className,
  fill = "#DCEBFF",
  stroke = "#1146B8",
  numbered = false,
}: {
  w: number;
  d: number;
  className?: string;
  fill?: string;
  stroke?: string;
  numbered?: boolean;
}) {
  const cell = 10;
  const cells = [];
  let n = 0;
  for (let y = 0; y < d; y++) {
    for (let x = 0; x < w; x++) {
      n++;
      cells.push(
        <g key={`${x}-${y}`}>
          <rect
            x={x * cell + 0.6}
            y={y * cell + 0.6}
            width={cell - 1.2}
            height={cell - 1.2}
            rx={1.2}
            fill={fill}
            stroke={stroke}
            strokeWidth={0.8}
          />
          {numbered ? (
            <text
              x={x * cell + cell / 2}
              y={y * cell + cell / 2 + 1.6}
              textAnchor="middle"
              fontSize={4.4}
              fontWeight={800}
              fill={stroke}
              fontFamily="Nunito, sans-serif"
            >
              {n}
            </text>
          ) : null}
        </g>,
      );
    }
  }
  return (
    <svg
      viewBox={`-1 -1 ${w * cell + 2} ${d * cell + 2}`}
      className={className}
      role="img"
      aria-label={`${w} by ${d} layer, ${w * d} blocks`}
    >
      {cells}
    </svg>
  );
}

import Image from "next/image";
import TileDrawing from "@/components/TileDrawing";
import type { Blueprint } from "@/lib/data";
import type { BuiltTiles, RoomStats, TileDesign } from "@/lib/tiles";
import { difficultyLabel } from "@/lib/tower";
import { CountingTrick, TickBoxes, TitleBar } from "./sheets";

// The official blueprint pages for a magnetic tile build (cover, parts list, steps).
// The certificate and bonus pages come from the main print page.

export function tileStepPages(built: BuiltTiles): RoomStats[][] {
  const pages: RoomStats[][] = [];
  for (let i = 0; i < built.rooms.length; i += 2) pages.push(built.rooms.slice(i, i + 2));
  return pages;
}

const CELL = 10;

// Top view of the whole build. Earlier rooms are dashed, this room is solid.
// Yellow edges are walls an earlier room already built, so they are skipped.
function RoomMap({ room, built, className }: { room: RoomStats; built: BuiltTiles; className?: string }) {
  const rooms = built.rooms;
  const minX = Math.min(...rooms.map((r) => r.x));
  const minY = Math.min(...rooms.map((r) => r.y));
  const earlier = new Set(built.panels.filter((p) => p.room < room.index).map((p) => `${p.axis}:${p.x}:${p.y}:${p.z}`));
  const shared = (axis: "x" | "y", x: number, y: number) => {
    for (let z = room.z; z < room.z + room.h; z++) if (earlier.has(`${axis}:${x}:${y}:${z}`)) return true;
    return false;
  };
  const cx = (x: number) => (x - minX) * CELL;
  const cy = (y: number) => (y - minY) * CELL;

  const dashed: React.ReactElement[] = [];
  const seen = new Set<string>();
  for (const r of rooms.slice(0, room.index))
    for (let x = r.x; x < r.x + r.w; x++)
      for (let y = r.y; y < r.y + r.d; y++) {
        const k = `${x}:${y}`;
        if (seen.has(k)) continue;
        seen.add(k);
        dashed.push(
          <rect
            key={`e-${k}`}
            x={cx(x) + 0.6}
            y={cy(y) + 0.6}
            width={CELL - 1.2}
            height={CELL - 1.2}
            rx={1.2}
            fill="#F4F8FF"
            stroke="#8DB3EE"
            strokeWidth={0.6}
            strokeDasharray="1.6 1.2"
          />,
        );
      }

  const cells: React.ReactElement[] = [];
  for (let x = room.x; x < room.x + room.w; x++)
    for (let y = room.y; y < room.y + room.d; y++)
      cells.push(
        <rect
          key={`c-${x}-${y}`}
          x={cx(x) + 1.2}
          y={cy(y) + 1.2}
          width={CELL - 2.4}
          height={CELL - 2.4}
          rx={1}
          fill="#CFE2FF"
          stroke="none"
        />,
      );

  const edges: React.ReactElement[] = [];
  const edge = (key: string, x1: number, y1: number, x2: number, y2: number, isShared: boolean) =>
    edges.push(
      <line
        key={key}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={isShared ? "#FFC21A" : "#1146B8"}
        strokeWidth={isShared ? 2.2 : 1.6}
        strokeLinecap="round"
      />,
    );
  for (let x = room.x; x < room.x + room.w; x++) {
    edge(`t${x}`, cx(x) + 0.8, cy(room.y), cx(x + 1) - 0.8, cy(room.y), shared("y", x, room.y));
    edge(
      `b${x}`,
      cx(x) + 0.8,
      cy(room.y + room.d),
      cx(x + 1) - 0.8,
      cy(room.y + room.d),
      shared("y", x, room.y + room.d),
    );
  }
  for (let y = room.y; y < room.y + room.d; y++) {
    edge(`l${y}`, cx(room.x), cy(y) + 0.8, cx(room.x), cy(y + 1) - 0.8, shared("x", room.x, y));
    edge(
      `r${y}`,
      cx(room.x + room.w),
      cy(y) + 0.8,
      cx(room.x + room.w),
      cy(y + 1) - 0.8,
      shared("x", room.x + room.w, y),
    );
  }

  return (
    <svg
      viewBox={`-2 -2 ${built.width * CELL + 4} ${built.depth * CELL + 4}`}
      className={className}
      role="img"
      aria-label={`Top view: ${room.label} is ${room.w} by ${room.d}`}
    >
      {dashed}
      {cells}
      {edges}
    </svg>
  );
}

function where(room: RoomStats) {
  if (room.sitsOn) return `On top of ${room.sitsOn}`;
  if (room.skippedFrom.length) return `Right next to ${room.skippedFrom.join(" and ")}`;
  return "Right on the floor";
}

function RoomStep({ room, built, tiles }: { room: RoomStats; built: BuiltTiles; tiles: TileDesign }) {
  const newWalls = room.walls - room.skipped;
  const terms = [newWalls, room.floorTiles, room.roofTiles].filter((n) => n > 0);
  return (
    <div className="step-card rounded-2xl border-[2.5px] border-blueprint p-4">
      <div className="flex items-baseline gap-3">
        <span className="rounded-lg bg-blueprint px-2.5 py-1 font-display text-lg text-white">
          Step {room.index + 1}
        </span>
        <span className="font-display text-2xl text-blueprint">{room.label}</span>
        <span className="ml-auto font-display text-xl text-blueprint">{room.tiles} tiles</span>
      </div>
      {room.note ? <p className="mt-2 rounded-lg bg-ice px-3 py-1.5 text-sm font-bold text-navy">{room.note}</p> : null}
      <div className="mt-3 grid grid-cols-[1fr_auto] gap-4">
        <div>
          <div className="flex items-start gap-4">
            <div className="flex shrink-0 flex-col items-center">
              <RoomMap room={room} built={built} className="h-20 w-auto max-w-[1.6in]" />
              <span className="mt-1 text-[0.6rem] font-extrabold tracking-widest text-blueprint uppercase">
                Top view
              </span>
            </div>
            <ul className="space-y-1 text-[0.95rem] text-navy">
              <li className="text-sm font-bold text-ink">
                📍 {where(room)}
                {room.z > 0 ? `, ${room.z} squares up` : ""}
              </li>
              <li>
                <strong>Walls all the way around:</strong> {room.w} + {room.d} + {room.w} + {room.d} ={" "}
                <strong>{room.around}</strong> squares
              </li>
              {room.h > 1 ? (
                <li>
                  <strong>Make it {room.h} squares tall:</strong> {room.around} × {room.h} ={" "}
                  <strong>{room.walls}</strong>
                </li>
              ) : null}
              {room.skipped ? (
                <li>
                  <strong>Skip the yellow walls</strong> ({room.skippedFrom.join(" and ")} already built them):{" "}
                  {room.walls} − {room.skipped} = <strong>{newWalls}</strong>
                </li>
              ) : null}
              {room.floorTiles ? (
                <li>
                  <strong>Floor:</strong> {room.w} × {room.d} = <strong>{room.floorTiles}</strong>. Lay it down first!
                </li>
              ) : null}
              {room.roofTiles ? (
                <li>
                  <strong>Roof:</strong> {room.w} × {room.d} = <strong>{room.roofTiles}</strong>
                </li>
              ) : null}
              {terms.length > 1 ? (
                <li>
                  <strong>This room:</strong> {terms.join(" + ")} = <strong>{room.tiles}</strong> tiles
                </li>
              ) : null}
            </ul>
          </div>
          <div className="mt-2">
            <p className="text-[0.7rem] font-extrabold tracking-widest text-blueprint uppercase">
              Tick a box for every tile
            </p>
            <TickBoxes count={room.tiles} size="sm" />
          </div>
          <p className="mt-2 rounded-lg bg-ice px-3 py-1.5 text-sm font-bold text-navy">
            Build so far: {room.tilesAfter} tiles
          </p>
        </div>
        <div className="flex flex-col items-center">
          <TileDrawing
            tiles={tiles}
            variant="ink"
            highlight={room.index}
            className="h-[2.2in] w-auto max-w-[2.4in]"
            title={`Where step ${room.index + 1} goes`}
          />
          <span className="mt-1 text-[0.6rem] font-extrabold tracking-widest text-blueprint uppercase">This step</span>
        </div>
      </div>
    </div>
  );
}

export default function TileSheets({
  bp,
  tiles,
  built,
  pages,
}: {
  bp: Blueprint;
  tiles: TileDesign;
  built: BuiltTiles;
  pages: number;
}) {
  const photos = [bp.photo_url, ...(tiles.photos ?? [])].filter((x): x is string => !!x && !x.startsWith("/api/"));
  return (
    <>
      {/* Cover */}
      <section className="sheet">
        <TitleBar bp={bp} page={1} pages={pages} />
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="text-sm font-extrabold tracking-[0.3em] text-blueprint/70 uppercase">Official Blueprint</p>
          <h1 className="font-display text-6xl leading-none text-blueprint">{bp.name}</h1>
          <p className="mt-2 text-lg font-semibold text-ink">{bp.tagline}</p>
          <TileDrawing
            tiles={tiles}
            variant="ink"
            className="mt-6 h-[3.8in] w-auto max-w-full"
            title={`${bp.name} drawing`}
          />
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
              <th>Tiles</th>
              <td className="font-display text-lg">{built.tiles}</td>
              <th>Tall</th>
              <td className="font-display text-lg">{built.height}</td>
            </tr>
            <tr>
              <th>Base</th>
              <td>
                {built.width} × {built.depth}
              </td>
              <th>Rooms</th>
              <td>{built.rooms.length}</td>
              <th>Level</th>
              <td>{difficultyLabel(bp.difficulty)}</td>
            </tr>
            <tr>
              <th>{bp.designer ? "Blueprint by" : "Inspired by"}</th>
              <td colSpan={3}>
                {bp.designer ? "Sawyer (age 7), Tower Blueprints for Kids" : bp.inspired_by || "Sawyer's imagination"}
              </td>
              <th>Pieces</th>
              <td>Magnetic tiles</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Parts list */}
      <section className="sheet">
        <TitleBar bp={bp} page={2} pages={pages} />
        <h2 className="mt-5 font-display text-4xl text-blueprint">Parts list &amp; tile math</h2>
        <p className="mt-1 text-ink">Before you build, make sure you have enough tiles. Here is the math!</p>
        <table className="parts mt-5 w-full text-left">
          <thead>
            <tr>
              <th>Step</th>
              <th>Room</th>
              <th>Size</th>
              <th>Math</th>
              <th className="text-right">Tiles</th>
            </tr>
          </thead>
          <tbody>
            {built.rooms.map((r) => {
              const parts = [
                `${r.walls - r.skipped} walls`,
                r.floorTiles ? `${r.floorTiles} floor` : "",
                r.roofTiles ? `${r.roofTiles} roof` : "",
              ].filter(Boolean);
              return (
                <tr key={r.index}>
                  <td className="font-display text-lg">{r.index + 1}</td>
                  <td className="font-bold">{r.label}</td>
                  <td>
                    {r.w} × {r.d}, {r.h} tall
                  </td>
                  <td>{parts.join(" + ")}</td>
                  <td className="text-right font-display text-xl">{r.tiles}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4} className="font-bold">
                Total: {built.rooms.map((r) => r.tiles).join(" + ")} =
              </td>
              <td className="text-right font-display text-3xl">{built.tiles}</td>
            </tr>
          </tfoot>
        </table>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-2xl border-[2.5px] border-blueprint p-4">
            <p className="font-display text-xl text-blueprint">Big tiles count too</p>
            <p className="mt-2 text-navy">
              Every tile here is a small square. A <strong>big square</strong> can take the place of <strong>4</strong>,
              and a <strong>long rectangle</strong> the place of <strong>2</strong>.
            </p>
          </div>
          <CountingTrick blocks={built.tiles} />
        </div>

        <div className="mt-6 rounded-2xl bg-ice p-4">
          <p className="font-display text-xl text-blueprint">Builder tips</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-navy">
            <li>Build on a hard, flat floor so the walls stand up straight.</li>
            <li>Build all the walls of a room first, then click on the roof.</li>
            <li>Rooms that touch share a wall. The yellow lines on each map show the walls you can skip.</li>
            <li>Hold the tower with one hand while the magnets click.</li>
            <li>Any colors work. Mix them up and make it yours!</li>
          </ul>
        </div>
      </section>

      {/* Steps */}
      {tileStepPages(built).map((group, gi) => (
        <section key={gi} className="sheet">
          <TitleBar bp={bp} page={3 + gi} pages={pages} />
          <div className="mt-5 flex flex-1 flex-col gap-5">
            {group.map((room) => (
              <RoomStep key={room.index} room={room} built={built} tiles={tiles} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

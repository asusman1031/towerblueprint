import Image from "next/image";
import type { Blueprint } from "@/lib/data";
import { theName } from "@/lib/tower";

// Pieces shared by every official blueprint, tower or structure.

export function pad3(n: number) {
  return String(n).padStart(3, "0");
}

export function TitleBar({ bp, page, pages }: { bp: Blueprint; page: number; pages: number }) {
  return (
    <div className="flex items-center gap-3 border-b-[3px] border-blueprint pb-3">
      <Image src="/brand/mark.png" alt="" width={400} height={270} className="h-10 w-auto" loading="eager" />
      <div className="leading-tight">
        <div className="text-[0.62rem] font-extrabold tracking-[0.25em] text-blueprint uppercase">
          Tower Blueprints for Kids · Official Blueprint
        </div>
        <div className="font-display text-xl text-blueprint">{bp.name}</div>
      </div>
      <div className="ml-auto text-right leading-tight">
        <div className="font-display text-xl text-blueprint">No. {pad3(bp.number)}</div>
        <div className="text-[0.62rem] font-extrabold tracking-widest text-blueprint/70 uppercase">
          Page {page} of {pages}
        </div>
      </div>
    </div>
  );
}

export function CountingTrick({ blocks }: { blocks: number }) {
  const tens = Math.floor(blocks / 10);
  const extra = blocks % 10;
  return (
    <div className="rounded-2xl border-[2.5px] border-blueprint p-4">
      <p className="font-display text-xl text-blueprint">Counting trick</p>
      <p className="mt-2 text-navy">
        Make piles of 10. You need <strong>{tens}</strong> pile{tens === 1 ? "" : "s"} of 10
        {extra ? (
          <>
            {" "}
            and <strong>{extra}</strong> extra
          </>
        ) : null}
        .
      </p>
      <div className="mt-2 flex flex-wrap gap-1">
        {Array.from({ length: Math.min(tens, 60) }, (_, i) => (
          <span key={i} className="size-3.5 rounded-sm border-2 border-blueprint" />
        ))}
      </div>
    </div>
  );
}

export function TickBoxes({ count, size = "md" }: { count: number; size?: "sm" | "md" }) {
  return (
    <div className="mt-1.5 flex flex-wrap gap-1.5">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={`flex items-center justify-center rounded border-2 border-blueprint font-bold text-blueprint/50 ${
            size === "sm" ? "size-5 text-[0.5rem]" : "size-6 text-[0.6rem]"
          }`}
        >
          {i + 1}
        </span>
      ))}
    </div>
  );
}

export function Certificate({ bp, stats }: { bp: Blueprint; stats: string }) {
  return (
    <section className="sheet">
      <div className="certificate flex flex-1 flex-col items-center justify-center rounded-3xl border-[6px] border-double border-blueprint p-10 text-center">
        <Image src="/brand/logo.png" alt="Tower Blueprints for Kids" width={900} height={948} className="h-36 w-auto" loading="eager" />
        <p className="mt-6 text-sm font-extrabold tracking-[0.35em] text-blueprint/70 uppercase">Certificate of</p>
        <h2 className="font-display text-6xl text-blueprint">Awesome Building</h2>
        <p className="mt-8 text-lg text-ink">This certifies that</p>
        <div className="mt-8 w-4/5 border-b-[3px] border-blueprint" />
        <p className="mt-2 text-xs font-extrabold tracking-widest text-blueprint/60 uppercase">Builder&apos;s name</p>
        <p className="mt-8 text-lg text-ink">{theName(bp.name) === bp.name ? "built" : "built the"}</p>
        <p className="font-display text-5xl text-blueprint">{bp.name}</p>
        <p className="mt-2 font-bold text-navy">{stats}</p>
        {bp.designer ? <p className="mt-1 text-ink">Designed by {bp.designer}</p> : null}
        {bp.award ? <p className="mt-2 font-display text-2xl text-blueprint">🏆 {bp.award} winner</p> : null}
        <div className="mt-12 grid w-full grid-cols-2 gap-10">
          <div>
            <div className="h-10 border-b-[3px] border-blueprint" />
            <p className="mt-2 text-xs font-extrabold tracking-widest text-blueprint/60 uppercase">Date</p>
          </div>
          <div>
            <div className="flex h-10 items-end justify-center border-b-[3px] border-blueprint font-display text-3xl text-blueprint">
              Sawyer
            </div>
            <p className="mt-2 text-xs font-extrabold tracking-widest text-blueprint/60 uppercase">Chief Architect</p>
          </div>
        </div>
        <p className="mt-10 text-sm text-ink">Blueprint No. {pad3(bp.number)} · towerblueprintsforkids.com</p>
      </div>
    </section>
  );
}

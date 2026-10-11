"use client";

import Link from "next/link";
import { useState } from "react";
import IsoTower from "@/components/IsoTower";
import { formatPrice, towerTotals } from "@/lib/tower";
import BlueprintEditor from "./BlueprintEditor";
import CopyButton from "./CopyButton";
import type { HqBlueprint } from "./types";

const STATUS_CHIP: Record<string, string> = {
  draft: "bg-white text-ink",
  coming_soon: "bg-tangerine text-white",
  live: "bg-[#22c063] text-white",
};
const STATUS_LABEL: Record<string, string> = { draft: "Secret draft", coming_soon: "Coming soon", live: "Live" };

export default function BlueprintManager({ blueprints, origin }: { blueprints: HqBlueprint[]; origin: string }) {
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const current = editing && editing !== "new" ? blueprints.find((b) => b.id === editing) : undefined;

  return (
    <div className="space-y-5">
      {editing ? (
        <BlueprintEditor key={editing} blueprint={current} onDone={() => setEditing(null)} />
      ) : (
        <button type="button" className="btn btn-blue" onClick={() => setEditing("new")}>
          ✏️ Design a new tower
        </button>
      )}

      <ul className="grid gap-4 md:grid-cols-2">
        {blueprints.map((bp) => {
          const t = towerTotals(bp.sections);
          const printUrl = bp.print_key ? `${origin}/print/${bp.slug}?key=${bp.print_key}` : null;
          return (
            <li key={bp.id} className="card flex gap-4 p-4">
              <div className="bg-grid-light flex w-24 shrink-0 items-end justify-center rounded-xl border-2 border-navy/20 p-2">
                <IsoTower sections={bp.sections} className="h-36 w-auto max-w-full" title={bp.name} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-sm text-ink">No. {String(bp.number).padStart(3, "0")}</span>
                  <span
                    className={`rounded-full border-2 border-navy px-2 py-0.5 text-[0.7rem] font-extrabold uppercase ${STATUS_CHIP[bp.status]}`}
                  >
                    {STATUS_LABEL[bp.status]}
                  </span>
                </div>
                <h3 className="truncate font-display text-2xl text-navy">{bp.name}</h3>
                <p className="text-sm font-bold text-ink">
                  {t.blocks} blocks · {t.height} tall · {formatPrice(bp.price_cents)}
                  {bp.checkout_url ? " · checkout on" : " · no checkout link yet"}
                </p>
                <p className="mt-1 text-sm text-ink">
                  👀 {bp.views} looks · 🛒 {bp.buy_clicks} buy clicks · 📝 {bp.preorders} reserved · 💰 {bp.sales} sold
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" className="btn btn-sun btn-sm" onClick={() => setEditing(bp.id)}>
                    Edit
                  </button>
                  {bp.status !== "draft" ? (
                    <Link href={`/blueprints/${bp.slug}`} className="btn btn-white btn-sm" target="_blank">
                      View page
                    </Link>
                  ) : null}
                  {printUrl ? (
                    <>
                      <a href={printUrl} className="btn btn-white btn-sm" target="_blank" rel="noopener">
                        Open blueprint
                      </a>
                      <CopyButton text={printUrl} label="Copy blueprint link" />
                    </>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

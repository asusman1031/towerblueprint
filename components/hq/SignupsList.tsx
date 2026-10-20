"use client";

import { useState } from "react";
import type { HqSignup } from "@/components/hq/types";

export default function SignupsList({ signups }: { signups: HqSignup[] }) {
  const [copied, setCopied] = useState(false);
  const unique = [...new Set(signups.map((s) => s.email))];

  async function copyAll() {
    try {
      await navigator.clipboard.writeText(unique.join(", "));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* the list below can still be selected by hand */
    }
  }

  if (!signups.length) return <p className="text-ink">No one has signed up yet. They&apos;ll show up here!</p>;

  return (
    <div>
      <button type="button" onClick={copyAll} className="btn btn-white btn-sm">
        {copied ? "Copied!" : `Copy all ${unique.length} email${unique.length === 1 ? "" : "s"}`}
      </button>
      <ul className="mt-3 divide-y divide-navy/10 rounded-xl border-2 border-navy/10 bg-white text-sm">
        {signups.map((s, i) => (
          <li key={`${s.email}-${s.kind}-${s.blueprint_slug ?? ""}-${i}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2">
            <a href={`mailto:${s.email}`} className="font-bold text-brand underline">
              {s.email}
            </a>
            <span className="rounded-full bg-ice px-2 py-0.5 text-xs font-extrabold text-navy">
              {s.kind === "club" ? "Builders Club" : `Reserved${s.blueprint_slug ? `: ${s.blueprint_slug}` : ""}`}
            </span>
            <span className="ml-auto text-xs font-bold text-ink/70">
              {new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cookies, headers } from "next/headers";
import { deleteSale, logout } from "@/app/hq/actions";
import BlueprintManager from "@/components/hq/BlueprintManager";
import LoginForm from "@/components/hq/LoginForm";
import CustomSettingsForm from "@/components/hq/CustomSettingsForm";
import NoteForm from "@/components/hq/NoteForm";
import SaleForm from "@/components/hq/SaleForm";
import type { HqDashboard } from "@/components/hq/types";
import { DEFAULT_ARCHITECT_NOTE, DEFAULT_CUSTOM_PRICE_CENTS } from "@/lib/data";
import { cleanBoxes } from "@/lib/boxes";
import { cleanBricks } from "@/lib/bricks";
import { cleanDice } from "@/lib/dice";
import { cleanPaper } from "@/lib/paper";
import { db } from "@/lib/supabase";
import { cleanStructure } from "@/lib/structure";
import { cleanTiles } from "@/lib/tiles";
import { cleanSections, formatPrice } from "@/lib/tower";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Architect HQ",
  robots: { index: false, follow: false },
};

function Shell({ children }: { children: React.ReactNode }) {
  return <main className="bg-grid-light min-h-screen">{children}</main>;
}

function Gate({ children }: { children: React.ReactNode }) {
  return (
    <Shell>
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 py-12">
        <Image src="/brand/logo.png" alt="Tower Blueprints for Kids" width={900} height={948} className="h-40 w-auto" priority />
        <div className="card mt-6 w-full p-7">
          <h1 className="font-display text-4xl text-navy">Architect HQ</h1>
          <div className="mt-4">{children}</div>
        </div>
        <Link href="/" className="mt-6 text-sm font-extrabold text-brand hover:underline">
          ← Back to the website
        </Link>
      </div>
    </Shell>
  );
}

function pct(n: number, of: number) {
  if (!of) return "0";
  const p = (n / of) * 100;
  return p >= 10 || p === 0 ? p.toFixed(0) : p.toFixed(1);
}

export default async function HQPage() {
  const sb = db();
  if (!sb) {
    return (
      <Gate>
        <p className="text-ink">HQ turns on as soon as the database is connected. Check back soon!</p>
      </Gate>
    );
  }

  const token = (await cookies()).get("tb_hq")?.value;
  let dash: HqDashboard | null = null;
  if (token) {
    const { data, error } = await sb.rpc("hq_dashboard", { p_token: token });
    if (error) console.error("hq_dashboard", error.message);
    dash = (data as HqDashboard | null) ?? null;
  }
  if (!dash) {
    return (
      <Gate>
        <p className="mb-4 text-ink">Top secret. Architects only! 🏗️</p>
        <LoginForm />
      </Gate>
    );
  }

  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") ?? "https"}://${h.get("x-forwarded-host") ?? h.get("host")}`;
  const note = dash.settings?.architect_note?.trim() || DEFAULT_ARCHITECT_NOTE;
  const customPrice = Number(dash.settings?.custom_price_cents ?? DEFAULT_CUSTOM_PRICE_CENTS);
  const customOpen = dash.settings?.custom_open !== "false";
  const blueprints = dash.blueprints.map((b) => ({
    ...b,
    sections: cleanSections(b.sections),
    structure: cleanStructure(b.structure),
    tiles: cleanTiles(b.tiles),
    bricks: cleanBricks(b.bricks),
    boxes: cleanBoxes(b.boxes),
    dice: cleanDice(b.dice),
    paper: cleanPaper(b.paper),
  }));
  const n = (v: unknown) => Number(v ?? 0);
  const visitsTotal = n(dash.total.visit);
  const funnel = [
    { label: "Visited the website", value: visitsTotal, color: "bg-sky" },
    { label: "Looked at a blueprint", value: n(dash.total.view_blueprint), color: "bg-brand" },
    { label: "Clicked “Get the blueprint”", value: n(dash.total.click_buy), color: "bg-sun" },
    { label: "Bought one", value: n(dash.sales_count), color: "bg-[#22c063]" },
  ];
  const maxDaily = Math.max(1, ...dash.daily_visits.map((d) => n(d.visits)));

  const tiles = [
    { icon: "👀", big: n(dash.today.visit), label: "visitors today", small: `${visitsTotal} all time` },
    { icon: "🏗️", big: n(dash.total.view_blueprint), label: "blueprint looks", small: `${n(dash.today.view_blueprint)} today` },
    { icon: "📬", big: n(dash.club), label: "Builders Club members", small: "people who want new towers" },
    { icon: "📝", big: n(dash.preorders), label: "reservations", small: "waiting for their blueprint" },
    { icon: "🛎️", big: n(dash.sales_count), label: "blueprints sold", small: "ring them up below" },
    { icon: "💰", big: formatPrice(n(dash.sales_cents)), label: "money earned", small: "total sales" },
  ];

  return (
    <Shell>
      <header className="border-b-[3px] border-navy bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <Image src="/brand/mark.png" alt="" width={400} height={270} className="h-10 w-auto" />
          <div>
            <h1 className="font-display text-2xl leading-none text-navy">Architect HQ</h1>
            <p className="text-sm font-bold text-ink">Hi Sawyer! Here&apos;s how your business is doing.</p>
          </div>
          <div className="ml-auto flex gap-2">
            <Link href="/" className="btn btn-white btn-sm" target="_blank">
              View website
            </Link>
            <form action={logout}>
              <button type="submit" className="btn btn-white btn-sm">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-12 px-4 py-8 sm:px-6">
        {/* Scoreboard */}
        <section>
          <h2 className="font-display text-3xl text-navy">Scoreboard</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
            {tiles.map((t) => (
              <div key={t.label} className="card p-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl" aria-hidden>
                    {t.icon}
                  </span>
                  <span className="text-sm font-extrabold text-ink uppercase">{t.label}</span>
                </div>
                <div className="mt-1 font-display text-5xl text-navy">{t.big}</div>
                <div className="text-sm text-ink">{t.small}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Funnel + daily chart */}
        <section className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="card p-5">
            <h2 className="font-display text-2xl text-navy">From visitor to buyer</h2>
            <p className="text-sm text-ink">Every business has a funnel. Here&apos;s yours!</p>
            <ol className="mt-4 space-y-3">
              {funnel.map((f, i) => (
                <li key={f.label}>
                  <div className="flex justify-between text-sm font-extrabold text-ink">
                    <span>{f.label}</span>
                    <span>
                      {f.value}
                      {i > 0 && visitsTotal ? (
                        <span className="font-semibold text-ink/70"> · {pct(f.value, visitsTotal)} out of every 100</span>
                      ) : null}
                    </span>
                  </div>
                  <div className="mt-1 h-6 overflow-hidden rounded-lg border-2 border-navy bg-paper">
                    <div
                      className={`h-full ${f.color}`}
                      style={{ width: `${visitsTotal ? Math.max(f.value ? 3 : 0, (f.value / visitsTotal) * 100) : 0}%` }}
                    />
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="card p-5">
            <h2 className="font-display text-2xl text-navy">Visitors, last 14 days</h2>
            <div className="mt-4 flex h-40 items-end gap-1.5" role="img" aria-label="Daily visitors for the last 14 days">
              {dash.daily_visits.map((d) => (
                <div key={d.day} className="flex flex-1 flex-col items-center justify-end gap-1">
                  <span className="text-[0.65rem] font-bold text-ink">{n(d.visits) || ""}</span>
                  <div
                    className="w-full rounded-t-md border-2 border-b-0 border-navy bg-brand"
                    style={{ height: `${(n(d.visits) / maxDaily) * 100}%`, minHeight: n(d.visits) ? 6 : 2 }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-1 flex justify-between text-[0.65rem] font-bold text-ink">
              <span>2 weeks ago</span>
              <span>today</span>
            </div>
          </div>
        </section>

        {/* Blueprints */}
        <section>
          <h2 className="font-display text-3xl text-navy">My blueprints</h2>
          <p className="mb-4 text-ink">Design a tower, watch it build, and publish it when it&apos;s ready.</p>
          <BlueprintManager blueprints={blueprints} requests={dash.requests ?? []} origin={origin} />
        </section>

        {/* Cash register */}
        <section className="card p-5">
          <h2 className="font-display text-3xl text-navy">Cash register</h2>
          <p className="mb-4 text-ink">When someone pays for a blueprint, ring it up here.</p>
          <SaleForm blueprints={blueprints.map((b) => ({ id: b.id, name: b.name, price_cents: b.price_cents }))} />
          {dash.recent_sales.length ? (
            <ul className="mt-5 divide-y-2 divide-dashed divide-navy/15">
              {dash.recent_sales.map((s) => (
                <li key={s.id} className="flex items-center gap-3 py-2">
                  <span className="font-display text-xl text-[#15803d]">{formatPrice(s.amount_cents)}</span>
                  <span className="font-bold text-navy">{s.blueprint ?? "Blueprint"}</span>
                  {s.note ? <span className="text-ink">· {s.note}</span> : null}
                  <span className="ml-auto text-xs text-ink">
                    {new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/New_York" })}
                  </span>
                  <form action={deleteSale.bind(null, s.id)}>
                    <button type="submit" className="rounded-md px-2 text-ink hover:bg-ice" aria-label="Remove this sale">
                      ✕
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-ink">No sales yet. Your first one is coming!</p>
          )}
        </section>

        {/* Custom design service settings */}
        <section className="card p-5">
          <h2 className="font-display text-3xl text-navy">&ldquo;Make your design a blueprint&rdquo; settings</h2>
          <p className="mb-4 text-ink">How much do you charge to turn someone&apos;s tower into a blueprint?</p>
          <CustomSettingsForm priceCents={Number.isFinite(customPrice) ? customPrice : DEFAULT_CUSTOM_PRICE_CENTS} open={customOpen} />
        </section>

        {/* Architect note */}
        <section className="card p-5">
          <h2 className="font-display text-3xl text-navy">Meet the Architect</h2>
          <p className="mb-4 text-ink">This shows on the home page. Write it in your own words!</p>
          <NoteForm note={note} />
        </section>

        {/* Grown-up corner */}
        <section className="rounded-2xl border-2 border-dashed border-navy/30 p-5 text-sm text-ink">
          <h2 className="font-display text-xl text-navy">Grown-up corner</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <strong>Sending a blueprint:</strong> use &ldquo;Copy blueprint link&rdquo; and email it to the buyer. The
              link opens the printable blueprint.
            </li>
            <li>
              <strong>Turning on checkout:</strong> create a Stripe Payment Link for the price, set its after-payment
              redirect to the blueprint link, then paste the Payment Link into the tower&apos;s &ldquo;Checkout link&rdquo;
              field.
            </li>
            <li>
              <strong>Emails:</strong> Builders Club and reservation emails are in Supabase, table{" "}
              <code>private.signups</code>.
            </li>
            <li>
              <strong>Design requests:</strong> reply to the grown-up&apos;s email to confirm and send a payment link.
              Once paid, use &ldquo;Copy link to send&rdquo; on the request and email them their blueprint.
            </li>
          </ul>
        </section>
      </div>
    </Shell>
  );
}

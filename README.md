# Tower Blueprints for Kids

Sawyer (age 7) designs giant towers out of magnetic cube blocks. This site sells the official, printable blueprints so other kids can build them.

Live at **towerblueprintsforkids.com** (once the domain is connected).

## What's here

| Route | What it is |
| --- | --- |
| `/` | Home: animated tower, how it works, Meet the Architect, Builders Club sign-up |
| `/blueprints`, `/blueprints/[slug]` | Catalog and blueprint pages with price and order button |
| `/print/[slug]?key=…` | The product: a printable 5-page official blueprint (cover, parts-list math, layer-by-layer steps, certificate). Only opens with the blueprint's secret key. |
| `/hq` | **Architect HQ**, Sawyer's passcode-protected dashboard: scoreboard, visitor-to-buyer funnel, tower designer with live 3D preview, cash register, and his home-page note |
| `/grown-ups` | Parent info and privacy |

Every tower is just data: a list of sections, bottom first (`{ w, d, count }`). The isometric drawings, block math, step pages, and placement maps are all generated from it (`lib/tower.ts`, `components/IsoTower.tsx`).

## Stack

Next.js 16 (App Router) on Vercel, Tailwind CSS 4, Supabase Postgres.

The browser never talks to Supabase. The Next.js server uses the anon key; public tables are read-only, and everything private (emails, sales, print keys, HQ sessions) lives in a `private` schema reachable only through validated `SECURITY DEFINER` functions. See `supabase/migrations/`.

## Environment variables

Set automatically by the Vercel Supabase integration:

- `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Optional: `NEXT_PUBLIC_SITE_URL` (defaults to `https://towerblueprintsforkids.com`).

Without a database the site still runs, using the built-in Jeddah Tower and with sign-ups and HQ switched off.

## Local development

```bash
npm install
npm run dev
```

In development without a database, `/print/jeddah-tower` previews the blueprint without a key.

## HQ passcode

The passcode is stored as a bcrypt hash in `private.hq_secret` (never in git). To change it, run in the Supabase SQL editor:

```sql
update private.hq_secret
set passcode_hash = extensions.crypt('new-passcode-here', extensions.gen_salt('bf'))
where id = 1;
```

## Taking payments

1. Create a Stripe Payment Link for the blueprint's price.
2. In the Payment Link's after-payment settings, redirect to the blueprint link (HQ → "Copy blueprint link").
3. Paste the Payment Link into the tower's "Checkout link" field in HQ.

Until a checkout link is set, the order button collects a grown-up's email as a reservation (`private.signups`), so orders can be fulfilled by hand.

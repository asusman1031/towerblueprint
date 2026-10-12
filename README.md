# Tower Blueprints for Kids

Sawyer (age 7) designs giant towers out of magnetic cube blocks and writes the blueprints himself. This site sells his original blueprints so other kids can build them, and offers a custom service: **"Sawyer will make your design a blueprint too."**

Live at **towerblueprintsforkids.com** (once the domain is connected).

## What's here

| Route | What it is |
| --- | --- |
| `/` | Home: animated tower, how it works, Meet the Architect, Builders Club sign-up |
| `/blueprints`, `/blueprints/[slug]` | Catalog and blueprint pages with price, order button, and a cover preview |
| `/your-design` | Custom blueprint requests: a grown-up sends a photo and description of their kid's tower |
| `/print/[slug]?key=…` | The product, opened only with the blueprint's secret key: the official 5-page blueprint (cover drawing, parts-list math, layer-by-layer steps, certificate), printable or saved as PDF. Optional bonus files from HQ appear at the end. |
| `/hq` | **Architect HQ**, Sawyer's passcode-protected dashboard: scoreboard, visitor-to-buyer funnel, tower designer with live 3D preview, bonus-file uploads, design-request inbox, cash register, custom-blueprint price, and his home-page note |
| `/grown-ups` | Parent info and privacy |

Every tower is just data: a list of sections, bottom first (`{ w, d, count }`). The isometric drawings, block math, step pages, and placement maps are all generated from it (`lib/tower.ts`, `components/IsoTower.tsx`).

## Bonus files

Buyers always get the official blueprint generated from the tower's sections. Sawyer can optionally attach his own notes (PDF or photos) in HQ (Edit a tower, then "Upload PDF or photo"); they appear at the end of the delivery page. PDFs up to 3 MB; photos are resized in the browser. This repo is public, so these files live only in the database, never in git.

## Custom blueprints ("Sawyer will make your design a blueprint too")

1. A request arrives in HQ under Design requests (photo, description, grown-up's email).
2. Reply to the grown-up to confirm and arrange payment.
3. Click "Make the blueprint". The designer opens prefilled; enter the sections and save. It stays a secret draft, linked to the request.
4. "Copy link to send" and email it. Mark the request Sent.

## Stack

Next.js 16 (App Router) on Vercel, Tailwind CSS 4, Supabase Postgres.

The browser never talks to Supabase. The Next.js server uses the anon key; public tables are read-only, and everything private (emails, sales, print keys, HQ sessions) lives in a `private` schema reachable only through validated `SECURITY DEFINER` functions. See `supabase/migrations/`.

## Environment variables

The production Supabase project ("towerbuild") URL and anon key are built into `lib/supabase.ts`. The anon key is public by design; private data is only reachable through validated database functions. To point at a different database, set:

- `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Optional: `NEXT_PUBLIC_SITE_URL` (defaults to `https://towerblueprintsforkids.com`).

If the database can't be reached, public pages fall back to the built-in Jeddah Tower.

## Local development

```bash
npm install
npm run dev
```

Local runs use the production database unless you set the variables above.

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

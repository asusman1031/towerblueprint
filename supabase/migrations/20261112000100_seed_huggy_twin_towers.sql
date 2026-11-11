-- Blueprint No. 034: Sawyer's Huggy Twin Towers.
insert into public.blueprints (
  slug, number, name, tagline, description, inspired_by, fun_fact, sections, cubes,
  difficulty, price_cents, status, photo_url, designer, sort_order
)
values (
  'huggy-twin-towers',
  (select coalesce(max(number), 0) + 1 from public.blueprints),
  'Huggy Twin Towers',
  'Two tall twin towers holding hands across a bridge, with a little leg in the middle!',
  'Sawyer''s Huggy Twin Towers! Two tall towers stand side by side like twins, each with a skinny chimney on top. A bridge joins them near the bottom, like they are holding hands for a big hug, and a short leg in the middle holds the bridge up.',
  '',
  'Some real skyscrapers come in pairs, joined by a bridge high in the air. The Petronas Towers in Malaysia have a sky bridge between them.',
  '[{"w": 1, "d": 1, "count": 1}]'::jsonb,
  '{"need": "274 magnetic cube blocks (any pictures or colors)", "photos": ["/photos/huggy-twin-towers-side.webp"], "steps": [{"label": "The Left Tower", "note": "Build the first tower: a solid block 3 wide, 3 long and 13 tall.", "boxes": [{"x": 0, "y": 0, "z": 0, "w": 3, "d": 3, "h": 13}]}, {"label": "The Right Tower", "note": "Build its twin about 5 blocks to the right: another solid block, also 3 wide, 3 long and 13 tall. Leave a gap of 5 blocks between the two towers.", "boxes": [{"x": 8, "y": 0, "z": 0, "w": 3, "d": 3, "h": 13}]}, {"label": "The Hug", "note": "Now the towers hold hands! Lay a bridge between them, 5 blocks long, 2 deep and 2 tall, starting 3 blocks up from the floor on the front side.", "boxes": [{"x": 3, "y": 0, "z": 3, "w": 5, "d": 2, "h": 2}]}, {"label": "The Middle Leg", "note": "Under the middle of the bridge, build a short leg 2 wide, 2 deep and 3 tall, standing on the floor and holding the bridge up.", "boxes": [{"x": 4, "y": 0, "z": 0, "w": 2, "d": 2, "h": 3}]}, {"label": "The Two Chimneys", "note": "Finish by standing a skinny stem of 4 blocks in the middle of each tower''s roof.", "boxes": [{"x": 1, "y": 1, "z": 13, "w": 1, "d": 1, "h": 4}, {"x": 9, "y": 1, "z": 13, "w": 1, "d": 1, "h": 4}]}]}'::jsonb,
  3,
  500,
  'live',
  '/photos/huggy-twin-towers.webp',
  '',
  (select coalesce(max(sort_order), 0) + 1 from public.blueprints)
)
on conflict (slug) do nothing;

insert into private.blueprint_keys (blueprint_id)
select id from public.blueprints where slug = 'huggy-twin-towers'
on conflict (blueprint_id) do nothing;

notify pgrst, 'reload schema';

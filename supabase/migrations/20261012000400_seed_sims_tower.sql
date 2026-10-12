-- Blueprint No. 004: Sawyer's Sims Tower.
insert into public.blueprints (
  slug, number, name, tagline, description, inspired_by, fun_fact, sections,
  difficulty, price_cents, status, photo_url, sort_order
)
values (
  'sims-tower',
  (select coalesce(max(number), 0) + 1 from public.blueprints),
  'The Sims Tower',
  'A stepped base and a super-tall tower with a spire on top.',
  'Sawyer''s newest tower. A wide base steps in like a pyramid, then a 2×2 tower shoots straight up and ends with a 9-block spire.',
  '',
  'Lots of skyscrapers get skinnier as they go up, in steps like this one. Builders call those steps setbacks. The Empire State Building in New York has them, and they help sunlight reach the street below.',
  '[
    {"w": 7, "d": 7, "count": 1, "label": "The Base"},
    {"w": 5, "d": 5, "count": 3, "label": "The First Step"},
    {"w": 3, "d": 3, "count": 2, "label": "The Second Step"},
    {"w": 2, "d": 2, "count": 28, "label": "The Tower"},
    {"w": 1, "d": 1, "count": 9, "label": "The Spire"}
  ]'::jsonb,
  2,
  500,
  'live',
  '/photos/sims-tower.jpg',
  (select coalesce(max(sort_order), 0) + 1 from public.blueprints)
)
on conflict (slug) do nothing;

insert into private.blueprint_keys (blueprint_id)
select id from public.blueprints where slug = 'sims-tower'
on conflict (blueprint_id) do nothing;

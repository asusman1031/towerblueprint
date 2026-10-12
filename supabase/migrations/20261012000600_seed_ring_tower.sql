-- Blueprint No. 006: Sawyer's Ring Tower.
insert into public.blueprints (
  slug, number, name, tagline, description, inspired_by, fun_fact, sections,
  difficulty, price_cents, status, photo_url, sort_order
)
values (
  'ring-tower',
  (select coalesce(max(number), 0) + 1 from public.blueprints),
  'Ring Tower',
  'A tall tower wrapped in rings, with a tiny ring at the very top.',
  'Sawyer''s newest tower has rings! Three wide 5×5 rings stick out around the tower, and a little 3×3 ring sits near the top, just under the spire.',
  '',
  'Real supertall skyscrapers have extra-strong floors partway up, called belt floors. They wrap around the building like a ring and help keep it from swaying in the wind.',
  '[
    {"w": 5, "d": 5, "count": 1, "label": "The Bottom Ring"},
    {"w": 5, "d": 3, "count": 3, "label": "The Base"},
    {"w": 5, "d": 5, "count": 1, "label": "The Second Ring"},
    {"w": 5, "d": 3, "count": 4, "label": "The Lower Tower"},
    {"w": 3, "d": 3, "count": 5, "label": "The Middle"},
    {"w": 5, "d": 5, "count": 1, "label": "The Third Ring"},
    {"w": 5, "d": 3, "count": 3, "label": "The Upper Tower"},
    {"w": 3, "d": 3, "count": 4, "label": "The Top Tower"},
    {"w": 1, "d": 1, "count": 2, "label": "The Neck"},
    {"w": 3, "d": 3, "count": 1, "label": "The Top Ring"},
    {"w": 1, "d": 1, "count": 4, "label": "The Spire"}
  ]'::jsonb,
  3,
  500,
  'live',
  '/photos/sawyer-ring-tower.jpg',
  (select coalesce(max(sort_order), 0) + 1 from public.blueprints)
)
on conflict (slug) do nothing;

insert into private.blueprint_keys (blueprint_id)
select id from public.blueprints where slug = 'ring-tower'
on conflict (blueprint_id) do nothing;

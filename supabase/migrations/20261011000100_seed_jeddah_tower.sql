-- Blueprint No. 001: Sawyer's Jeddah Tower.
insert into public.blueprints (
  slug, number, name, tagline, description, inspired_by, fun_fact, sections,
  difficulty, price_cents, status, photo_url, preview_url, sort_order
)
values (
  'jeddah-tower',
  1,
  'Jeddah Tower',
  'A super-skinny supertall that goes up, up, up.',
  'Sawyer''s very first blueprint. Four sections that get skinnier as they go up, just like the real tower. It starts with a wide, strong base and ends with a spire one block wide.',
  'Jeddah Tower, Saudi Arabia',
  'The real Jeddah Tower is being built in Saudi Arabia. When it''s finished it is planned to be about 1 kilometer tall (more than 3,000 feet), which would make it the tallest building in the world, taller than the Burj Khalifa.',
  '[
    {"w": 5, "d": 5, "count": 6, "label": "The Base"},
    {"w": 3, "d": 3, "count": 12, "label": "The Lower Tower"},
    {"w": 2, "d": 2, "count": 12, "label": "The Upper Tower"},
    {"w": 1, "d": 1, "count": 21, "label": "The Spire"}
  ]'::jsonb,
  2,
  500,
  'live',
  '/photos/jeddah-tower.jpg',
  '/previews/jeddah-tower-original.jpg',
  1
)
on conflict (slug) do nothing;

insert into private.blueprint_keys (blueprint_id)
select id from public.blueprints where slug = 'jeddah-tower'
on conflict (blueprint_id) do nothing;

-- Blueprint No. 003: the Ring Tower, by guest architect Ashton (Sawyer's little brother).
insert into public.blueprints (
  slug, number, name, tagline, description, inspired_by, fun_fact, sections,
  difficulty, price_cents, status, photo_url, designer, sort_order
)
values (
  'ring-tower',
  (select coalesce(max(number), 0) + 1 from public.blueprints),
  'Ring Tower',
  'A tall tower with a big ring around its middle.',
  'Our first guest architect! Sawyer''s little brother Ashton designed this one. A big strong base, a skinny neck, a wide ring in the middle, then up, up, up to a pointy spire.',
  '',
  'Lots of tall towers have a ring partway up where people can look out. The CN Tower in Toronto has a glass floor up in its ring, 342 meters (more than 1,100 feet) above the ground, and you can stand right on it!',
  '[
    {"w": 4, "d": 4, "count": 9, "label": "The Big Base"},
    {"w": 2, "d": 2, "count": 5, "label": "The Neck"},
    {"w": 4, "d": 4, "count": 2, "label": "The Ring"},
    {"w": 2, "d": 2, "count": 7, "label": "The Tower"},
    {"w": 2, "d": 1, "count": 5, "label": "The Skinny Part"},
    {"w": 1, "d": 1, "count": 4, "label": "The Spire"}
  ]'::jsonb,
  2,
  500,
  'live',
  '/photos/ring-tower.jpg',
  'Ashton (age 5)',
  (select coalesce(max(sort_order), 0) + 1 from public.blueprints)
)
on conflict (slug) do nothing;

insert into private.blueprint_keys (blueprint_id)
select id from public.blueprints where slug = 'ring-tower'
on conflict (blueprint_id) do nothing;

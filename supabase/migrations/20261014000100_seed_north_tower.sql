-- Blueprint No. 018: Sawyer's North Tower, a very tall skinny tower of magnetic blocks.
insert into public.blueprints (
  slug, number, name, tagline, description, inspired_by, fun_fact, sections, cubes,
  difficulty, price_cents, status, photo_url, designer, sort_order
)
values (
  'north-tower',
  (select coalesce(max(number), 0) + 1 from public.blueprints),
  'The North Tower',
  'A super tall skinny tower that reaches way up high!',
  'Sawyer''s North Tower! A wide, sturdy base 20 blocks tall holds up a long skinny stem that stretches way up into the sky, with a green block on top. It''s 137 magnetic blocks tall and tricky to balance!',
  '',
  'A compass needle is a tiny magnet. It points north because the whole Earth acts like a giant magnet!',
  '[{"w": 1, "d": 1, "count": 1}]'::jsonb,
  '{"need": "137 magnetic cube blocks (any pictures or colors)", "steps": [{"label": "The Base: Bottom Half", "note": "Make a tall, skinny tower 3 blocks wide and 2 deep. Build the same layer 10 times.", "boxes": [{"x": 0, "y": 0, "z": 0, "w": 3, "d": 2, "h": 10}]}, {"label": "The Base: Top Half", "note": "Ten more layers just like the first ones. Now the base is 20 blocks tall!", "boxes": [{"x": 0, "y": 0, "z": 10, "w": 3, "d": 2, "h": 10}]}, {"label": "The Skinny Stem", "note": "One block wide and 17 blocks tall, standing on top of the base. Go slowly so it doesn''t wobble!", "boxes": [{"x": 1, "y": 0, "z": 20, "w": 1, "d": 1, "h": 17}]}]}'::jsonb,
  3,
  500,
  'live',
  '/photos/north-tower.webp',
  '',
  (select coalesce(max(sort_order), 0) + 1 from public.blueprints)
)
on conflict (slug) do nothing;

insert into private.blueprint_keys (blueprint_id)
select id from public.blueprints where slug = 'north-tower'
on conflict (blueprint_id) do nothing;

notify pgrst, 'reload schema';

-- Blueprint No. 030: Ashton's Shooting Head Tower.
insert into public.blueprints (
  slug, number, name, tagline, description, inspired_by, fun_fact, sections, cubes,
  difficulty, price_cents, status, photo_url, designer, sort_order
)
values (
  'shooting-head-tower',
  (select coalesce(max(number), 0) + 1 from public.blueprints),
  'Shooting Head Tower',
  'A chunky tower with funny faces on the front and a head on top!',
  'Ashton''s Shooting Head Tower! It starts narrow at the bottom, bulges out wide in the middle, then narrows again into a skinny stem with a dark head block on the very top. Look closely at the front: there''s a ghost face and a boy in a cap hiding in the blocks.',
  '',
  'Most skyscrapers are widest at the bottom so they stay steady. This tower bulges out in the middle instead, and the magnets inside the blocks help hold it all together!',
  '[{"w": 1, "d": 1, "count": 1}]'::jsonb,
  '{"need": "108 magnetic cube blocks (any pictures or colors)", "photos": ["/photos/shooting-head-tower-side.webp"], "steps": [{"label": "The Narrow Base", "note": "Start with a solid block of cubes that is 3 blocks wide, 3 long and 3 tall.", "boxes": [{"x": 1, "y": 0, "z": 0, "w": 3, "d": 3, "h": 3}]}, {"label": "The Wide Middle", "note": "Now build wider! Make a block that is 5 blocks wide, 3 long and 4 tall, and put it right on top of the base. It sticks out 1 block on each side.", "boxes": [{"x": 0, "y": 0, "z": 3, "w": 5, "d": 3, "h": 4}]}, {"label": "The Shoulders", "note": "Go narrow again. Build a block 3 wide, 3 long and 2 tall in the middle of the wide part.", "boxes": [{"x": 1, "y": 0, "z": 7, "w": 3, "d": 3, "h": 2}]}, {"label": "The Head Stem", "note": "Finish with a skinny stem of 3 blocks standing in the middle. Put the dark head block on the very top!", "boxes": [{"x": 2, "y": 1, "z": 9, "w": 1, "d": 1, "h": 3}]}]}'::jsonb,
  2,
  500,
  'live',
  '/photos/shooting-head-tower.webp',
  'Ashton',
  (select coalesce(max(sort_order), 0) + 1 from public.blueprints)
)
on conflict (slug) do nothing;

insert into private.blueprint_keys (blueprint_id)
select id from public.blueprints where slug = 'shooting-head-tower'
on conflict (blueprint_id) do nothing;

notify pgrst, 'reload schema';

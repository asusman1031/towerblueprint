-- Blueprint No. 015: Ashton's House of Hess, built from magnetic blocks.
insert into public.blueprints (
  slug, number, name, tagline, description, inspired_by, fun_fact, sections, cubes,
  difficulty, price_cents, status, photo_url, designer, sort_order
)
values (
  'house-of-hess',
  (select coalesce(max(number), 0) + 1 from public.blueprints),
  'The House of Hess',
  'A cozy block house with a doorway, windows, and a super tall chimney!',
  'Ashton''s house made of magnetic blocks! It has a flat floor, a front door, walls all around, a tower with windows you can see right through, and a really tall chimney that reaches up to the sky.',
  '',
  'Chimneys are built tall so smoke goes high above the roof. Some factory chimneys are taller than 300 meters!',
  '[{"w": 1, "d": 1, "count": 1}]'::jsonb,
  '{"need": "87 magnetic cube blocks (any pictures or colors)", "photos": ["/photos/house-of-hess-side.webp"], "steps": [{"label": "The Floor", "note": "Lay a flat floor of blocks, 5 long and 3 wide.", "boxes": [{"x": 0, "y": 0, "z": 0, "w": 5, "d": 3, "h": 1}]}, {"label": "The Front Wall", "note": "Two short walls with a doorway gap between them, 2 layers tall. Then a block across the top of the doorway.", "boxes": [{"x": 0, "y": 0, "z": 1, "w": 2, "d": 1, "h": 2}, {"x": 3, "y": 0, "z": 1, "w": 2, "d": 1, "h": 2}, {"x": 0, "y": 0, "z": 3, "w": 5, "d": 1, "h": 1}]}, {"label": "The Back and Side Walls", "note": "Build the back wall 5 long and 3 tall, then one block in each end to close the room.", "boxes": [{"x": 0, "y": 2, "z": 1, "w": 5, "d": 1, "h": 3}, {"x": 0, "y": 1, "z": 1, "w": 1, "d": 1, "h": 3}, {"x": 4, "y": 1, "z": 1, "w": 1, "d": 1, "h": 3}]}, {"label": "The Tower Base", "note": "Build a tower on the roof, 2 wide and 3 deep, 2 layers tall.", "boxes": [{"x": 2, "y": 0, "z": 4, "w": 2, "d": 3, "h": 2}]}, {"label": "The Windows", "note": "Leave a hole in the middle so you can see right through. Build a wall at the front and a wall at the back, 2 layers tall.", "boxes": [{"x": 2, "y": 0, "z": 6, "w": 2, "d": 1, "h": 2}, {"x": 2, "y": 2, "z": 6, "w": 2, "d": 1, "h": 2}]}, {"label": "The Tower Top", "note": "Fill the middle back in, with 2 more layers.", "boxes": [{"x": 2, "y": 0, "z": 8, "w": 2, "d": 3, "h": 2}]}, {"label": "The Tall Chimney", "note": "One block wide and 6 blocks tall, right in the middle. Build it slowly and don''t let it wobble!", "boxes": [{"x": 2, "y": 1, "z": 10, "w": 1, "d": 1, "h": 6}]}]}'::jsonb,
  3,
  500,
  'live',
  '/photos/house-of-hess.webp',
  'Ashton (age 5)',
  (select coalesce(max(sort_order), 0) + 1 from public.blueprints)
)
on conflict (slug) do nothing;

insert into private.blueprint_keys (blueprint_id)
select id from public.blueprints where slug = 'house-of-hess'
on conflict (blueprint_id) do nothing;

notify pgrst, 'reload schema';

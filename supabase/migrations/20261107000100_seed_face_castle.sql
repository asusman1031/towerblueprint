-- Blueprint No. 029: Sawyer's Face Castle.
insert into public.blueprints (
  slug, number, name, tagline, description, inspired_by, fun_fact, sections, cubes,
  difficulty, price_cents, status, photo_url, designer, sort_order
)
values (
  'face-castle',
  (select coalesce(max(number), 0) + 1 from public.blueprints),
  'The Face Castle',
  'A castle wall with a smiling face inside and four towers standing guard!',
  'Sawyer''s Face Castle! A square wall lies flat on the floor with a face inside it: two eyes and a water-block smile. A little gate in the middle of each side leads out to a tower, and each of the four towers is a different height with a skinny stem sticking up from the top. It takes lots of blocks, but the flat face is easy to build.',
  '',
  'Many real castles had a wall around the outside with tall towers, so the guards could see enemies coming from far away.',
  '[{"w": 1, "d": 1, "count": 1}]'::jsonb,
  '{"need": "474 magnetic cube blocks (any pictures or colors)", "photos": ["/photos/face-castle-top.jpg"], "steps": [{"label": "The Square Frame", "note": "Lay a square on the floor for the castle wall: 12 blocks wide and 12 blocks long, with one layer of blocks all the way around. The middle stays empty for now.", "boxes": [{"x": 0, "y": 0, "z": 0, "w": 12, "d": 1, "h": 1}, {"x": 0, "y": 11, "z": 0, "w": 12, "d": 1, "h": 1}, {"x": 0, "y": 1, "z": 0, "w": 1, "d": 10, "h": 1}, {"x": 11, "y": 1, "z": 0, "w": 1, "d": 10, "h": 1}]}, {"label": "The Two Eyes", "note": "Inside the frame, near the top, lay two flat squares side by side, each 4 blocks wide and 4 long. Sawyer used dark purple blocks for the left eye and red lava blocks for the right eye, with a lighter L-shaped pupil in the middle of each.", "boxes": [{"x": 2, "y": 2, "z": 0, "w": 4, "d": 4, "h": 1}, {"x": 6, "y": 2, "z": 0, "w": 4, "d": 4, "h": 1}]}, {"label": "The Smile", "note": "Below the eyes, lay a row of 6 water blocks. Then add 1 water block above each end of the row, so the ends curl up like a smile.", "boxes": [{"x": 3, "y": 8, "z": 0, "w": 6, "d": 1, "h": 1}, {"x": 3, "y": 7, "z": 0, "w": 1, "d": 1, "h": 1}, {"x": 8, "y": 7, "z": 0, "w": 1, "d": 1, "h": 1}]}, {"label": "The Four Bridges", "note": "From the middle of each side of the wall, lay a line of 2 blocks pointing straight out. These are the gates that lead to the four towers.", "boxes": [{"x": 5, "y": -2, "z": 0, "w": 1, "d": 2, "h": 1}, {"x": 5, "y": 12, "z": 0, "w": 1, "d": 2, "h": 1}, {"x": -2, "y": 5, "z": 0, "w": 2, "d": 1, "h": 1}, {"x": 12, "y": 5, "z": 0, "w": 2, "d": 1, "h": 1}]}, {"label": "The Short Tower", "note": "At the end of the left bridge, build a tower that is 3 blocks wide, 3 long and 8 tall. Put a skinny stem of 4 blocks on top, in the middle.", "boxes": [{"x": -5, "y": 4, "z": 0, "w": 3, "d": 3, "h": 8}, {"x": -4, "y": 5, "z": 8, "w": 1, "d": 1, "h": 4}]}, {"label": "The Front Tower", "note": "At the end of the bottom bridge, build a tower 3 wide, 3 long and 9 tall. Put a skinny stem of 5 blocks on top, in the middle.", "boxes": [{"x": 4, "y": 14, "z": 0, "w": 3, "d": 3, "h": 9}, {"x": 5, "y": 15, "z": 9, "w": 1, "d": 1, "h": 5}]}, {"label": "The Tall Tower", "note": "At the end of the top bridge, build a tower 3 wide, 3 long and 11 tall. Put a skinny stem of 6 blocks on top, in the middle.", "boxes": [{"x": 4, "y": -5, "z": 0, "w": 3, "d": 3, "h": 11}, {"x": 5, "y": -4, "z": 11, "w": 1, "d": 1, "h": 6}]}, {"label": "The Tallest Tower", "note": "At the end of the right bridge, build the biggest tower: 3 wide, 3 long and 12 tall. Put a skinny stem of 7 blocks on top, in the middle.", "boxes": [{"x": 14, "y": 4, "z": 0, "w": 3, "d": 3, "h": 12}, {"x": 15, "y": 5, "z": 12, "w": 1, "d": 1, "h": 7}]}]}'::jsonb,
  4,
  500,
  'live',
  '/photos/face-castle.jpg',
  '',
  (select coalesce(max(sort_order), 0) + 1 from public.blueprints)
)
on conflict (slug) do nothing;

insert into private.blueprint_keys (blueprint_id)
select id from public.blueprints where slug = 'face-castle'
on conflict (blueprint_id) do nothing;

notify pgrst, 'reload schema';

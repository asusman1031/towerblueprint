-- Blueprint No. 022: Sawyer's Stop Sign Tower, a flat STOP sign with a tower for the O.
insert into public.blueprints (
  slug, number, name, tagline, description, inspired_by, fun_fact, sections, cubes,
  difficulty, price_cents, status, photo_url, designer, sort_order
)
values (
  'stop-sign-tower',
  (select coalesce(max(number), 0) + 1 from public.blueprints),
  'Stop Sign Tower',
  'A STOP sign made of blocks, with a tall tower where the O goes!',
  'Sawyer''s Stop Sign Tower! It''s a big flat frame lying on the floor with the letters S, T and P built inside, and a tall tower standing right where the O should be. The tower has a skinny stem sticking way up, so it''s like a stop sign that''s also a skyscraper.',
  '',
  'The first stop signs, in the 1920s, were yellow with black letters. Red stop signs didn''t start until the 1950s!',
  '[{"w": 1, "d": 1, "count": 1}]'::jsonb,
  '{"need": "260 magnetic cube blocks (any pictures or colors)", "photos": ["/photos/stop-sign-tower-side.webp"], "steps": [{"label": "The Frame", "note": "Lay the sign flat on the floor. Make a long rectangle, one block thick: 25 blocks along the front and back, and 8 blocks on each end.", "boxes": [{"x": 0, "y": 0, "z": 0, "w": 25, "d": 1, "h": 1}, {"x": 0, "y": 7, "z": 0, "w": 25, "d": 1, "h": 1}, {"x": 0, "y": 1, "z": 0, "w": 1, "d": 6, "h": 1}, {"x": 24, "y": 1, "z": 0, "w": 1, "d": 6, "h": 1}]}, {"label": "The Letter S", "note": "Inside the frame, 2 blocks in from the left, build a big S that''s 3 blocks wide and 5 blocks tall. It goes: top row of 3, one block down on the left, a middle row of 3, one block down on the right, and a bottom row of 3.", "boxes": [{"x": 2, "y": 5, "z": 0, "w": 3, "d": 1, "h": 1}, {"x": 2, "y": 4, "z": 0, "w": 1, "d": 1, "h": 1}, {"x": 2, "y": 3, "z": 0, "w": 3, "d": 1, "h": 1}, {"x": 4, "y": 2, "z": 0, "w": 1, "d": 1, "h": 1}, {"x": 2, "y": 1, "z": 0, "w": 3, "d": 1, "h": 1}]}, {"label": "The Letter T", "note": "Leave a gap, then build a T. The top bar is 5 blocks wide, and the stem goes down 4 blocks from the middle.", "boxes": [{"x": 6, "y": 5, "z": 0, "w": 5, "d": 1, "h": 1}, {"x": 8, "y": 1, "z": 0, "w": 1, "d": 4, "h": 1}]}, {"label": "The Letter P", "note": "Leave a bigger gap for the tower. Then build a P on the right: a tall line of 5 blocks, a top bar, one block on the right, and a middle bar to make the loop.", "boxes": [{"x": 18, "y": 1, "z": 0, "w": 1, "d": 5, "h": 1}, {"x": 19, "y": 5, "z": 0, "w": 2, "d": 1, "h": 1}, {"x": 20, "y": 4, "z": 0, "w": 1, "d": 1, "h": 1}, {"x": 19, "y": 3, "z": 0, "w": 2, "d": 1, "h": 1}]}, {"label": "The Tower Where the O Goes", "note": "In the gap between the T and the P, build a big tower. It''s 5 blocks wide and 4 blocks deep, and 8 layers tall. This is the ''O'' in STOP.", "boxes": [{"x": 12, "y": 1, "z": 0, "w": 5, "d": 4, "h": 8}]}, {"label": "The Skinny Stem", "note": "Stand a stem of 8 blocks, one on top of another, right on top of the tower. It''s the tallest part, so go slowly. Now your STOP sign has a tower in the middle!", "boxes": [{"x": 14, "y": 2, "z": 8, "w": 1, "d": 1, "h": 8}]}]}'::jsonb,
  3,
  500,
  'live',
  '/photos/stop-sign-tower.webp',
  '',
  (select coalesce(max(sort_order), 0) + 1 from public.blueprints)
)
on conflict (slug) do nothing;

insert into private.blueprint_keys (blueprint_id)
select id from public.blueprints where slug = 'stop-sign-tower'
on conflict (blueprint_id) do nothing;

notify pgrst, 'reload schema';

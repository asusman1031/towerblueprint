-- Blueprint No. 33: Sawyer's Guard Tower Police Station.
insert into public.blueprints (
  slug, number, name, tagline, description, inspired_by, fun_fact, sections, cubes,
  difficulty, price_cents, status, photo_url, designer, sort_order
)
values (
  'guard-tower-police-station',
  (select coalesce(max(number), 0) + 1 from public.blueprints),
  'Guard Tower Police Station',
  'A tall guard tower and a little police station, joined by a long bridge!',
  'Sawyer''s Guard Tower Police Station! Two chunky buildings stand at the two ends of a long line of blocks. The tall one is the guard tower and the shorter one is the police station, and each one has a square head on top.',
  '',
  'Many towns keep their police station close to a tall lookout so help is never far away.',
  '[{"w": 1, "d": 1, "count": 1}]'::jsonb,
  '{"need": "186 magnetic cube blocks (any pictures or colors)", "photos": ["/photos/guard-tower-police-station-side.webp"], "steps": [{"label": "The Guard Tower", "note": "Build the big building: 4 blocks wide, 3 long and 9 tall. It''s the tall one on the left.", "boxes": [{"x": 0, "y": 0, "z": 0, "w": 4, "d": 3, "h": 9}]}, {"label": "The Guard''s Head", "note": "Stand 1 block in the middle of the roof for a neck. Then put the head on top: a block 3 wide, 2 long and 2 tall.", "boxes": [{"x": 1, "y": 1, "z": 9, "w": 1, "d": 1, "h": 1}, {"x": 0, "y": 0, "z": 10, "w": 3, "d": 2, "h": 2}]}, {"label": "The Long Bridge", "note": "From the middle of the guard tower''s right side, lay a line of 7 blocks on the floor, one block wide and one tall, pointing straight out.", "boxes": [{"x": 4, "y": 1, "z": 0, "w": 7, "d": 1, "h": 1}]}, {"label": "The Police Station", "note": "At the end of the bridge, build the smaller building: 3 blocks wide, 3 long and 5 tall.", "boxes": [{"x": 11, "y": 0, "z": 0, "w": 3, "d": 3, "h": 5}]}, {"label": "The Station''s Head", "note": "Stand 1 block in the middle of its roof for a neck. Then put the head on top: a block 3 wide, 2 long and 2 tall.", "boxes": [{"x": 12, "y": 1, "z": 5, "w": 1, "d": 1, "h": 1}, {"x": 11, "y": 0, "z": 6, "w": 3, "d": 2, "h": 2}]}]}'::jsonb,
  2,
  500,
  'live',
  '/photos/guard-tower-police-station.webp',
  '',
  (select coalesce(max(sort_order), 0) + 1 from public.blueprints)
)
on conflict (slug) do nothing;

insert into private.blueprint_keys (blueprint_id)
select id from public.blueprints where slug = 'guard-tower-police-station'
on conflict (blueprint_id) do nothing;

notify pgrst, 'reload schema';

-- Blueprint No. 32: Sawyer's Guard Tower.
insert into public.blueprints (
  slug, number, name, tagline, description, inspired_by, fun_fact, sections, cubes,
  difficulty, price_cents, status, photo_url, designer, sort_order
)
values (
  'guard-tower',
  (select coalesce(max(number), 0) + 1 from public.blueprints),
  'Guard Tower',
  'A super tall guard with arms and a head, standing at the end of a long bridge!',
  'Sawyer''s Guard Tower! A super tall, skinny tower stands guard at one end of a long line of blocks, with a flat platform at the other end. The tower has two arms sticking out near the top and a square head, just like a real guard. Two round toy eyes peek out from the front of the platform.',
  '',
  'Real guard towers are built very tall so the guard on top can see far in every direction.',
  '[{"w": 1, "d": 1, "count": 1}]'::jsonb,
  '{"need": "334 magnetic cube blocks (any pictures or colors)", "photos": ["/photos/guard-tower-side.webp"], "steps": [{"label": "The Platform", "note": "Build a flat platform 9 blocks wide, 6 deep and 3 tall. In the bottom row of the front wall, leave two gaps. Sawyer tucked two round toy eyes into them, but you can leave them empty.", "boxes": [{"x": 0, "y": 1, "z": 0, "w": 9, "d": 5, "h": 1}, {"x": 0, "y": 0, "z": 0, "w": 2, "d": 1, "h": 1}, {"x": 4, "y": 0, "z": 0, "w": 1, "d": 1, "h": 1}, {"x": 7, "y": 0, "z": 0, "w": 2, "d": 1, "h": 1}, {"x": 0, "y": 0, "z": 1, "w": 9, "d": 6, "h": 2}]}, {"label": "The Long Bridge", "note": "From the middle of the platform''s left side, lay a line of 7 blocks, one block wide and one block tall, pointing straight out.", "boxes": [{"x": -7, "y": 2, "z": 0, "w": 7, "d": 1, "h": 1}]}, {"label": "The Guard Shaft", "note": "At the end of the bridge, build a very tall tower: 3 blocks wide, 3 long and 17 tall. The bridge touches the middle of its side.", "boxes": [{"x": -10, "y": 1, "z": 0, "w": 3, "d": 3, "h": 17}]}, {"label": "The Two Arms", "note": "Near the top, stick one block out from the front of the tower on the left side and one on the right side. They are the guard''s arms, and they stick out toward the platform.", "boxes": [{"x": -7, "y": 1, "z": 14, "w": 1, "d": 1, "h": 1}, {"x": -7, "y": 3, "z": 14, "w": 1, "d": 1, "h": 1}]}, {"label": "The Neck", "note": "On top of the tower, stack 2 blocks in the middle for the neck.", "boxes": [{"x": -9, "y": 2, "z": 17, "w": 1, "d": 1, "h": 2}]}, {"label": "The Head", "note": "Finish with the head: a block of cubes 2 wide, 3 long and 2 tall, sitting on top of the neck.", "boxes": [{"x": -10, "y": 1, "z": 19, "w": 2, "d": 3, "h": 2}]}]}'::jsonb,
  3,
  500,
  'live',
  '/photos/guard-tower.webp',
  '',
  (select coalesce(max(sort_order), 0) + 1 from public.blueprints)
)
on conflict (slug) do nothing;

insert into private.blueprint_keys (blueprint_id)
select id from public.blueprints where slug = 'guard-tower'
on conflict (blueprint_id) do nothing;

notify pgrst, 'reload schema';

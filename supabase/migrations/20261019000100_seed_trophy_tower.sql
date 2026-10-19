-- Blueprint No. 020: Ashton's Trophy Tower, a flat trophy shape built from magnetic blocks.
insert into public.blueprints (
  slug, number, name, tagline, description, inspired_by, fun_fact, sections, cubes,
  difficulty, price_cents, status, photo_url, designer, sort_order
)
values (
  'trophy-tower',
  (select coalesce(max(number), 0) + 1 from public.blueprints),
  'The Trophy Tower',
  'A tall, flat trophy with two big handles, a crown, and a spire on top!',
  'Ashton''s trophy! It has a strong 3-block-wide base, a window you can see right through, two big handles on the sides, a crown bar across the top, and a tall spire in the middle. It''s a flat build, only one block thick, and the handles make it tricky to balance.',
  '',
  'Olympic gold medals aren''t made of solid gold. They''re mostly silver, with a thin layer of gold on the outside!',
  '[{"w": 1, "d": 1, "count": 1}]'::jsonb,
  '{"need": "64 magnetic cube blocks (any pictures or colors)", "steps": [{"label": "The Legs", "note": "Build a wall 3 blocks wide and 5 layers tall. This is the strong bottom of the trophy.", "boxes": [{"x": 2, "y": 0, "z": 0, "w": 3, "d": 1, "h": 5}]}, {"label": "The Window", "note": "Now build two skinny posts, one on the left and one on the right, 3 layers tall. Leave the middle empty so you can see right through!", "boxes": [{"x": 2, "y": 0, "z": 5, "w": 1, "d": 1, "h": 3}, {"x": 4, "y": 0, "z": 5, "w": 1, "d": 1, "h": 3}]}, {"label": "The First Handle Bars", "note": "Add a bar of 3 blocks sticking out to the left, and another sticking out to the right. Check that your handles are the same height!", "boxes": [{"x": 0, "y": 0, "z": 8, "w": 3, "d": 1, "h": 1}, {"x": 4, "y": 0, "z": 8, "w": 3, "d": 1, "h": 1}]}, {"label": "The Handle Posts", "note": "Four single blocks on top of the bars: one at each end and one on each of the middle posts.", "boxes": [{"x": 0, "y": 0, "z": 9, "w": 1, "d": 1, "h": 1}, {"x": 2, "y": 0, "z": 9, "w": 1, "d": 1, "h": 1}, {"x": 4, "y": 0, "z": 9, "w": 1, "d": 1, "h": 1}, {"x": 6, "y": 0, "z": 9, "w": 1, "d": 1, "h": 1}]}, {"label": "The Second Handle Bars", "note": "Two more bars of 3 blocks, left and right, just like the first ones.", "boxes": [{"x": 0, "y": 0, "z": 10, "w": 3, "d": 1, "h": 1}, {"x": 4, "y": 0, "z": 10, "w": 3, "d": 1, "h": 1}]}, {"label": "The Tall Posts", "note": "Build the four posts up 2 more layers. Then add one block in the middle, between the two inner posts, to bridge them together.", "boxes": [{"x": 0, "y": 0, "z": 11, "w": 1, "d": 1, "h": 2}, {"x": 2, "y": 0, "z": 11, "w": 1, "d": 1, "h": 2}, {"x": 4, "y": 0, "z": 11, "w": 1, "d": 1, "h": 2}, {"x": 6, "y": 0, "z": 11, "w": 1, "d": 1, "h": 2}, {"x": 3, "y": 0, "z": 12, "w": 1, "d": 1, "h": 1}]}, {"label": "The Crown Posts", "note": "Three single blocks: one on each outer post and one in the middle.", "boxes": [{"x": 0, "y": 0, "z": 13, "w": 1, "d": 1, "h": 1}, {"x": 3, "y": 0, "z": 13, "w": 1, "d": 1, "h": 1}, {"x": 6, "y": 0, "z": 13, "w": 1, "d": 1, "h": 1}]}, {"label": "The Crown Bar", "note": "A long bar of 7 blocks across the very top of the handles.", "boxes": [{"x": 0, "y": 0, "z": 14, "w": 7, "d": 1, "h": 1}]}, {"label": "The Horns and the Spire", "note": "Two short horns, 2 blocks tall, on each side. Then the tall spire in the middle: 4 blocks tall!", "boxes": [{"x": 1, "y": 0, "z": 15, "w": 1, "d": 1, "h": 2}, {"x": 5, "y": 0, "z": 15, "w": 1, "d": 1, "h": 2}, {"x": 3, "y": 0, "z": 15, "w": 1, "d": 1, "h": 4}]}]}'::jsonb,
  3,
  500,
  'live',
  '/photos/trophy-tower.webp',
  'Ashton (age 5)',
  (select coalesce(max(sort_order), 0) + 1 from public.blueprints)
)
on conflict (slug) do nothing;

insert into private.blueprint_keys (blueprint_id)
select id from public.blueprints where slug = 'trophy-tower'
on conflict (blueprint_id) do nothing;

notify pgrst, 'reload schema';

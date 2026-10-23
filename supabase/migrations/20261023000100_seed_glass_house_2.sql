-- Blueprint No. 025: Ashton's Glass House 2.
insert into public.blueprints (
  slug, number, name, tagline, description, inspired_by, fun_fact, sections, cubes,
  difficulty, price_cents, status, photo_url, designer, sort_order
)
values (
  'glass-house-2',
  (select coalesce(max(number), 0) + 1 from public.blueprints),
  'Glass House 2',
  'Two big windows, a glass roof, and a super tall stem that sticks way up!',
  'Ashton''s Glass House 2! It''s a house made of windows: two big square frames you can see right through, joined together, with a smaller window across the roof. A skinny stem stands on top and reaches way up high, with a lava block at the very top. It''s the sequel to the Glasses Tower, only taller.',
  '',
  'Glass is made from sand! When sand is heated to about 1,700 degrees Celsius, it melts, and when it cools down, it turns into clear glass.',
  '[{"w": 1, "d": 1, "count": 1}]'::jsonb,
  '{"need": "131 magnetic cube blocks (any pictures or colors)", "steps": [{"label": "The Left Window", "note": "Build a big square frame standing up: 6 blocks wide and 6 blocks tall, and 2 blocks thick. It has a hole in the middle, like a window.", "boxes": [{"x": 0, "y": 0, "z": 0, "w": 6, "d": 2, "h": 1}, {"x": 0, "y": 0, "z": 5, "w": 6, "d": 2, "h": 1}, {"x": 0, "y": 0, "z": 1, "w": 1, "d": 2, "h": 4}, {"x": 5, "y": 0, "z": 1, "w": 1, "d": 2, "h": 4}]}, {"label": "The Right Window", "note": "Build a second frame just like the first, with a 2-block gap in between. These are the two windows of the glass house.", "boxes": [{"x": 8, "y": 0, "z": 0, "w": 6, "d": 2, "h": 1}, {"x": 8, "y": 0, "z": 5, "w": 6, "d": 2, "h": 1}, {"x": 8, "y": 0, "z": 1, "w": 1, "d": 2, "h": 4}, {"x": 13, "y": 0, "z": 1, "w": 1, "d": 2, "h": 4}]}, {"label": "The Middle Bridges", "note": "Join the two windows together with two short bars in the middle, 2 blocks wide and 2 thick. One goes across the top and one goes lower down.", "boxes": [{"x": 6, "y": 0, "z": 5, "w": 2, "d": 2, "h": 1}, {"x": 6, "y": 0, "z": 3, "w": 2, "d": 2, "h": 1}]}, {"label": "The Glass Roof", "note": "On top, build a third, smaller frame that sits across the middle: 6 blocks wide, 3 blocks tall and 2 blocks thick, with a hole in the middle. This is the roof window!", "boxes": [{"x": 4, "y": 0, "z": 6, "w": 6, "d": 2, "h": 1}, {"x": 4, "y": 0, "z": 8, "w": 6, "d": 2, "h": 1}, {"x": 4, "y": 0, "z": 7, "w": 1, "d": 2, "h": 1}, {"x": 9, "y": 0, "z": 7, "w": 1, "d": 2, "h": 1}]}, {"label": "The Tall Stem", "note": "Stand a skinny stem right in the middle of the roof, 9 blocks tall and one block wide. Go slowly and hold it steady while the magnets click.", "boxes": [{"x": 7, "y": 0, "z": 9, "w": 1, "d": 1, "h": 9}]}, {"label": "The Side Blocks", "note": "Put one block sticking out to the right, about halfway up. Then, near the top, step the stem over to the left by one block.", "boxes": [{"x": 8, "y": 0, "z": 12, "w": 1, "d": 1, "h": 1}, {"x": 6, "y": 0, "z": 18, "w": 1, "d": 1, "h": 1}]}, {"label": "The Top of the Stem", "note": "Finish by building the stem 4 blocks higher, with a red lava block on the very top!", "boxes": [{"x": 6, "y": 0, "z": 19, "w": 1, "d": 1, "h": 4}]}]}'::jsonb,
  3,
  500,
  'live',
  '/photos/glass-house-2.webp',
  'Ashton (age 5)',
  (select coalesce(max(sort_order), 0) + 1 from public.blueprints)
)
on conflict (slug) do nothing;

insert into private.blueprint_keys (blueprint_id)
select id from public.blueprints where slug = 'glass-house-2'
on conflict (blueprint_id) do nothing;

notify pgrst, 'reload schema';

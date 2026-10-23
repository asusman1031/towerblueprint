-- Blueprint No. 027: Sawyer's Menorah Tower.
insert into public.blueprints (
  slug, number, name, tagline, description, inspired_by, fun_fact, sections, cubes,
  difficulty, price_cents, status, photo_url, designer, sort_order
)
values (
  'menorah-tower',
  (select coalesce(max(number), 0) + 1 from public.blueprints),
  'Menorah Tower',
  'A candle-topped tower on a staircase base, built for the festival of lights!',
  'Sawyer''s Menorah Tower! A wide, stepped base climbs up toward the back, then a thick tower rises from it and turns into a super skinny stem with little branches. At the very top, three candle holders and a flame stand high above everything, like a menorah.',
  '',
  'A menorah is a special candle holder used during Hanukkah, the Jewish festival of lights. It has nine branches: eight for the eight nights and one helper candle to light the others!',
  '[{"w": 1, "d": 1, "count": 1}]'::jsonb,
  '{"need": "204 magnetic cube blocks (any pictures or colors)", "steps": [{"label": "The Low Steps", "note": "Build the base from the front. It''s 12 blocks wide. The first two walls are 1 block tall: build one, then another right behind it.", "boxes": [{"x": 0, "y": 0, "z": 0, "w": 12, "d": 1, "h": 1}, {"x": 0, "y": 1, "z": 0, "w": 12, "d": 1, "h": 1}]}, {"label": "The Higher Steps", "note": "Behind those, build two walls that are 2 blocks tall, and then two more that are 3 blocks tall. The base goes up like a staircase toward the back!", "boxes": [{"x": 0, "y": 2, "z": 0, "w": 12, "d": 1, "h": 2}, {"x": 0, "y": 3, "z": 0, "w": 12, "d": 1, "h": 2}, {"x": 0, "y": 4, "z": 0, "w": 12, "d": 1, "h": 3}, {"x": 0, "y": 5, "z": 0, "w": 12, "d": 1, "h": 3}]}, {"label": "The Tower", "note": "In the middle of the back, build a tower 3 blocks wide, 2 blocks deep and 6 blocks tall. It sits on the base.", "boxes": [{"x": 4, "y": 4, "z": 3, "w": 3, "d": 2, "h": 6}]}, {"label": "The Tall Stem", "note": "Stand one block on another on top of the tower, right in the middle, to make a stem 11 blocks tall. Hold it steady while the magnets click!", "boxes": [{"x": 5, "y": 4, "z": 9, "w": 1, "d": 1, "h": 11}]}, {"label": "The Branches", "note": "Add 4 little branches that stick out of the stem, 2 on the left and 2 on the right. Put one pair about 5 blocks up from the tower, and the other pair 2 blocks higher.", "boxes": [{"x": 4, "y": 4, "z": 14, "w": 1, "d": 1, "h": 1}, {"x": 6, "y": 4, "z": 14, "w": 1, "d": 1, "h": 1}, {"x": 4, "y": 4, "z": 16, "w": 1, "d": 1, "h": 1}, {"x": 6, "y": 4, "z": 16, "w": 1, "d": 1, "h": 1}]}, {"label": "The Candle Holders", "note": "At the top of the stem, put one block on the left and one on the right, with a gap in the middle. Then build a row of 3 blocks on top of them, like the base of a menorah.", "boxes": [{"x": 4, "y": 4, "z": 20, "w": 1, "d": 1, "h": 1}, {"x": 6, "y": 4, "z": 20, "w": 1, "d": 1, "h": 1}, {"x": 4, "y": 4, "z": 21, "w": 3, "d": 1, "h": 1}]}, {"label": "The Flame", "note": "In the middle, stack one block on top. Then put a block on the left and a block on the right, with a hole in the middle. Finish with one block on the very top, like a flame!", "boxes": [{"x": 5, "y": 4, "z": 22, "w": 1, "d": 1, "h": 1}, {"x": 4, "y": 4, "z": 23, "w": 1, "d": 1, "h": 1}, {"x": 6, "y": 4, "z": 23, "w": 1, "d": 1, "h": 1}, {"x": 5, "y": 4, "z": 24, "w": 1, "d": 1, "h": 1}]}]}'::jsonb,
  3,
  500,
  'live',
  '/photos/menorah-tower.webp',
  '',
  (select coalesce(max(sort_order), 0) + 1 from public.blueprints)
)
on conflict (slug) do nothing;

insert into private.blueprint_keys (blueprint_id)
select id from public.blueprints where slug = 'menorah-tower'
on conflict (blueprint_id) do nothing;

notify pgrst, 'reload schema';

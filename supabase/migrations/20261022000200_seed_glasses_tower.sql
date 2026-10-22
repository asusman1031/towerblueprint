-- Blueprint No. 023: Ashton's Glasses Tower, a pair of glasses with a floating arch.
insert into public.blueprints (
  slug, number, name, tagline, description, inspired_by, fun_fact, sections, cubes,
  difficulty, price_cents, status, photo_url, designer, sort_order
)
values (
  'glasses-tower',
  (select coalesce(max(number), 0) + 1 from public.blueprints),
  'Glasses Tower',
  'A big pair of glasses with two see-through lenses and a floating arch on top!',
  'Ashton''s Glasses Tower! It''s a giant pair of glasses made from two big square lenses that you can see right through, joined in the middle by a bridge. On top there''s a floating arch with little sparks on each side, like fireworks.',
  '',
  'The first eyeglasses were made in Italy around 700 years ago. They were held up on your nose with no arms to go over your ears!',
  '[{"w": 1, "d": 1, "count": 1}]'::jsonb,
  '{"need": "56 magnetic cube blocks (any pictures or colors)", "steps": [{"label": "The Left Lens", "note": "Build a rectangle frame, one block thick, standing up. It''s 6 blocks wide and 6 blocks tall, with an empty hole in the middle. This is the left lens of the glasses!", "boxes": [{"x": 0, "y": 0, "z": 0, "w": 6, "d": 1, "h": 1}, {"x": 0, "y": 0, "z": 5, "w": 6, "d": 1, "h": 1}, {"x": 0, "y": 0, "z": 1, "w": 1, "d": 1, "h": 4}, {"x": 5, "y": 0, "z": 1, "w": 1, "d": 1, "h": 4}]}, {"label": "The Right Lens", "note": "Build a second frame just like the first, with a 2-block gap between them. This is the right lens.", "boxes": [{"x": 8, "y": 0, "z": 0, "w": 6, "d": 1, "h": 1}, {"x": 8, "y": 0, "z": 5, "w": 6, "d": 1, "h": 1}, {"x": 8, "y": 0, "z": 1, "w": 1, "d": 1, "h": 4}, {"x": 13, "y": 0, "z": 1, "w": 1, "d": 1, "h": 4}]}, {"label": "The Bridge", "note": "Connect the two lenses in the middle. Put a 2-block bar across the top, and another 2-block bar lower down, like the part of glasses that sits on your nose.", "boxes": [{"x": 6, "y": 0, "z": 5, "w": 2, "d": 1, "h": 1}, {"x": 6, "y": 0, "z": 3, "w": 2, "d": 1, "h": 1}]}, {"label": "The Two Posts", "note": "Stand a post of 3 blocks on top, on each side of the middle. Hold them while the magnets click, because they''re tall and skinny!", "boxes": [{"x": 5, "y": 0, "z": 6, "w": 1, "d": 1, "h": 3}, {"x": 9, "y": 0, "z": 6, "w": 1, "d": 1, "h": 3}]}, {"label": "The Floating Arch", "note": "Now the fun part: build an arch. Put a block up high and to the inside of each post. Then one block in the very middle, on top, to be the keystone. The arch looks like it''s floating!", "boxes": [{"x": 6, "y": 0, "z": 9, "w": 1, "d": 1, "h": 1}, {"x": 8, "y": 0, "z": 9, "w": 1, "d": 1, "h": 1}, {"x": 7, "y": 0, "z": 10, "w": 1, "d": 1, "h": 1}]}, {"label": "The Little Sparks", "note": "Finish with three blocks sticking out like little sparks: two lava blocks, one on each side, and one brown block up high on the right.", "boxes": [{"x": 4, "y": 0, "z": 9, "w": 1, "d": 1, "h": 1}, {"x": 10, "y": 0, "z": 9, "w": 1, "d": 1, "h": 1}, {"x": 10, "y": 0, "z": 10, "w": 1, "d": 1, "h": 1}]}]}'::jsonb,
  3,
  500,
  'live',
  '/photos/glasses-tower.webp',
  'Ashton (age 5)',
  (select coalesce(max(sort_order), 0) + 1 from public.blueprints)
)
on conflict (slug) do nothing;

insert into private.blueprint_keys (blueprint_id)
select id from public.blueprints where slug = 'glasses-tower'
on conflict (blueprint_id) do nothing;

notify pgrst, 'reload schema';

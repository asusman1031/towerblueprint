-- Blueprint No. 028: Ashton's Crosses Tower.
insert into public.blueprints (
  slug, number, name, tagline, description, inspired_by, fun_fact, sections, cubes,
  difficulty, price_cents, status, photo_url, designer, sort_order
)
values (
  'crosses-tower',
  (select coalesce(max(number), 0) + 1 from public.blueprints),
  'Crosses Tower',
  'A tall stem with two cross-shaped layers and a skinny tip!',
  'Ashton''s Crosses Tower! It starts with a hollow box that has a tall corner, then two skinny stems rise up from it. Near the top, blocks stick out to the sides to make two crosses, one on top of the other, and a skinny tower of five blocks finishes it off.',
  '',
  'A cross with arms that are all the same length is called a plus sign. The flag of Switzerland has one, and it''s one of the only square flags in the world!',
  '[{"w": 1, "d": 1, "count": 1}]'::jsonb,
  '{"need": "123 magnetic cube blocks (any pictures or colors)", "photos": ["/photos/crosses-tower-side.webp"], "steps": [{"label": "The Floor", "note": "Start with a solid block of cubes on the floor: 4 wide, 3 deep and 3 tall.", "boxes": [{"x": 0, "y": 0, "z": 0, "w": 4, "d": 3, "h": 3}]}, {"label": "The Hollow Walls", "note": "Build a hollow box on top, 4 layers tall. Make the front and back walls 4 blocks wide, and close each end with 1 block. The middle stays empty!", "boxes": [{"x": 0, "y": 0, "z": 3, "w": 4, "d": 1, "h": 4}, {"x": 0, "y": 2, "z": 3, "w": 4, "d": 1, "h": 4}, {"x": 0, "y": 1, "z": 3, "w": 1, "d": 1, "h": 4}, {"x": 3, "y": 1, "z": 3, "w": 1, "d": 1, "h": 4}]}, {"label": "The Roof", "note": "Cover the hollow box with a solid roof, 4 wide and 3 deep, 1 block tall.", "boxes": [{"x": 0, "y": 0, "z": 7, "w": 4, "d": 3, "h": 1}]}, {"label": "The Tall Corner", "note": "On the left half of the roof, build a block 2 wide, 3 deep and 2 tall. This is the tallest part of the base.", "boxes": [{"x": 0, "y": 0, "z": 8, "w": 2, "d": 3, "h": 2}]}, {"label": "The Two Stems", "note": "Stand two skinny stems on the tall corner, side by side, each 5 blocks tall. The one in front is the main stem. The other one stands right behind it.", "boxes": [{"x": 1, "y": 1, "z": 10, "w": 1, "d": 1, "h": 5}, {"x": 1, "y": 2, "z": 10, "w": 1, "d": 1, "h": 5}]}, {"label": "The First Cross", "note": "Put 1 block on top of the main stem, then stick one block to each side of it. That makes the first cross, like a plus sign.", "boxes": [{"x": 1, "y": 1, "z": 15, "w": 1, "d": 1, "h": 1}, {"x": 0, "y": 1, "z": 15, "w": 1, "d": 1, "h": 1}, {"x": 2, "y": 1, "z": 15, "w": 1, "d": 1, "h": 1}]}, {"label": "The Second Cross", "note": "Build a second cross right on top. Put 1 block in the middle, and stick one block to the left, right, front and back.", "boxes": [{"x": 1, "y": 1, "z": 16, "w": 1, "d": 1, "h": 1}, {"x": 0, "y": 1, "z": 16, "w": 1, "d": 1, "h": 1}, {"x": 2, "y": 1, "z": 16, "w": 1, "d": 1, "h": 1}, {"x": 1, "y": 0, "z": 16, "w": 1, "d": 1, "h": 1}, {"x": 1, "y": 2, "z": 16, "w": 1, "d": 1, "h": 1}]}, {"label": "The Crown", "note": "Finish with a skinny tower of 5 blocks standing on the middle of the second cross.", "boxes": [{"x": 1, "y": 1, "z": 17, "w": 1, "d": 1, "h": 5}]}]}'::jsonb,
  3,
  500,
  'live',
  '/photos/crosses-tower.webp',
  'Ashton',
  (select coalesce(max(sort_order), 0) + 1 from public.blueprints)
)
on conflict (slug) do nothing;

insert into private.blueprint_keys (blueprint_id)
select id from public.blueprints where slug = 'crosses-tower'
on conflict (blueprint_id) do nothing;

notify pgrst, 'reload schema';

-- Blueprint No. 021: Sawyer's Stairs Tower, a 13-step staircase of magnetic blocks.
insert into public.blueprints (
  slug, number, name, tagline, description, inspired_by, fun_fact, sections, cubes,
  difficulty, price_cents, status, photo_url, designer, sort_order
)
values (
  'stairs-tower',
  (select coalesce(max(number), 0) + 1 from public.blueprints),
  'Stairs Tower',
  'A giant staircase of magnetic blocks, 13 steps tall!',
  'Sawyer''s Stairs Tower! It''s a staircase that goes up one block at a time, from a tiny 1-block step all the way up to a 13-block-tall wall. It''s wide and sturdy, so it''s easy to build but it takes a LOT of blocks.',
  '',
  'The Great Pyramid of Giza has about 200 layers of stone blocks, stacked up like giant steps. When it was new, it was nearly 150 meters tall!',
  '[{"w": 1, "d": 1, "count": 1}]'::jsonb,
  '{"need": "273 magnetic cube blocks (any pictures or colors)", "photos": ["/photos/stairs-tower-side.webp"], "steps": [{"label": "The Low Steps", "note": "Build 4 walls side by side, each 3 blocks wide (that''s the width of the stairs). The first wall is 1 block tall, then 2, then 3, then 4 blocks tall.", "boxes": [{"x": 0, "y": 0, "z": 0, "w": 1, "d": 3, "h": 1}, {"x": 1, "y": 0, "z": 0, "w": 1, "d": 3, "h": 2}, {"x": 2, "y": 0, "z": 0, "w": 1, "d": 3, "h": 3}, {"x": 3, "y": 0, "z": 0, "w": 1, "d": 3, "h": 4}]}, {"label": "The Middle Steps", "note": "Keep going! Build 5 more walls: 5, 6, 7, 8 and 9 blocks tall. Each wall is 1 block taller than the last one.", "boxes": [{"x": 4, "y": 0, "z": 0, "w": 1, "d": 3, "h": 5}, {"x": 5, "y": 0, "z": 0, "w": 1, "d": 3, "h": 6}, {"x": 6, "y": 0, "z": 0, "w": 1, "d": 3, "h": 7}, {"x": 7, "y": 0, "z": 0, "w": 1, "d": 3, "h": 8}, {"x": 8, "y": 0, "z": 0, "w": 1, "d": 3, "h": 9}]}, {"label": "The High Steps", "note": "Finish with 4 tall walls: 10, 11, 12 and 13 blocks tall. Now you''ve built a giant staircase!", "boxes": [{"x": 9, "y": 0, "z": 0, "w": 1, "d": 3, "h": 10}, {"x": 10, "y": 0, "z": 0, "w": 1, "d": 3, "h": 11}, {"x": 11, "y": 0, "z": 0, "w": 1, "d": 3, "h": 12}, {"x": 12, "y": 0, "z": 0, "w": 1, "d": 3, "h": 13}]}]}'::jsonb,
  2,
  500,
  'live',
  '/photos/stairs-tower.webp',
  '',
  (select coalesce(max(sort_order), 0) + 1 from public.blueprints)
)
on conflict (slug) do nothing;

insert into private.blueprint_keys (blueprint_id)
select id from public.blueprints where slug = 'stairs-tower'
on conflict (blueprint_id) do nothing;

notify pgrst, 'reload schema';

-- Blueprint No. 031: Arden's Side to Side Tower.
insert into public.blueprints (
  slug, number, name, tagline, description, inspired_by, fun_fact, sections, cubes,
  difficulty, price_cents, status, photo_url, designer, sort_order
)
values (
  'side-to-side-tower',
  (select coalesce(max(number), 0) + 1 from public.blueprints),
  'Side to Side Tower',
  'A long, wide base with a super tall tower and a skinny pillar side by side!',
  'Arden''s Side to Side Tower! A long, wide base stretches out side to side, with a skinny pillar on one end and a super tall tower rising from the other side. Arden is our neighbor, and this is the very first blueprint from a guest architect outside the family!',
  '',
  'The tallest buildings in the world stand on very wide foundations that spread their weight out, just like this tower''s long, wide base.',
  '[{"w": 1, "d": 1, "count": 1}]'::jsonb,
  '{"need": "137 magnetic cube blocks (any pictures or colors)", "steps": [{"label": "The Long Base", "note": "Build a long, solid base on the floor: 5 blocks wide, 2 blocks deep and 7 tall.", "boxes": [{"x": 0, "y": 0, "z": 0, "w": 5, "d": 2, "h": 7}]}, {"label": "The Raised Side", "note": "On the right 3 columns of the base, build up 3 more blocks. The right side is now 10 blocks tall, and the left 2 columns stay lower.", "boxes": [{"x": 2, "y": 0, "z": 7, "w": 3, "d": 2, "h": 3}]}, {"label": "The Skinny Pillar", "note": "On the lowest left corner, stand a skinny pillar 5 blocks tall, 1 block wide and 1 block deep.", "boxes": [{"x": 0, "y": 0, "z": 7, "w": 1, "d": 1, "h": 5}]}, {"label": "The Tall Tower", "note": "Now the big finish! On the raised side, build a tower 2 blocks wide, 2 deep and 11 tall. It''s the tallest part by far.", "boxes": [{"x": 2, "y": 0, "z": 10, "w": 2, "d": 2, "h": 11}]}]}'::jsonb,
  2,
  500,
  'live',
  '/photos/side-to-side-tower.webp',
  'Arden',
  (select coalesce(max(sort_order), 0) + 1 from public.blueprints)
)
on conflict (slug) do nothing;

insert into private.blueprint_keys (blueprint_id)
select id from public.blueprints where slug = 'side-to-side-tower'
on conflict (blueprint_id) do nothing;

notify pgrst, 'reload schema';

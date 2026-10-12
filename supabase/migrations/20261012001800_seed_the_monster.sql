-- Blueprint No. 017: Ashton's Monster, built from magnetic blocks.
insert into public.blueprints (
  slug, number, name, tagline, description, inspired_by, fun_fact, sections, cubes,
  difficulty, price_cents, status, photo_url, designer, sort_order
)
values (
  'the-monster',
  (select coalesce(max(number), 0) + 1 from public.blueprints),
  'The Monster',
  'A big blocky monster with long arms stretched out wide!',
  'Ashton''s monster, built from 75 magnetic blocks! It has a skinny body, super long arms that reach out to each side, wide shoulders, a square head, and a green hat on top.',
  '',
  'Video game characters are often built with their arms stretched straight out, just like this monster. It''s called a T-pose, and it helps artists get ready to make them move!',
  '[{"w": 1, "d": 1, "count": 1}]'::jsonb,
  '{"need": "75 magnetic cube blocks (any pictures or colors)", "photos": ["/photos/the-monster-side.webp"], "steps": [{"label": "The Legs and Body", "note": "Build a skinny tower 2 blocks wide and 2 deep. Build the same layer 9 times.", "boxes": [{"x": 4, "y": 0, "z": 0, "w": 2, "d": 2, "h": 9}]}, {"label": "The Long Arms", "note": "One long layer. Lay 10 blocks in a row, with the body in the middle so each arm sticks out 4 blocks. Put 2 more blocks behind the body.", "boxes": [{"x": 0, "y": 0, "z": 9, "w": 10, "d": 1, "h": 1}, {"x": 4, "y": 1, "z": 9, "w": 2, "d": 1, "h": 1}]}, {"label": "The Chest", "note": "Four more layers of 2 \u00d7 2 on top of the arms.", "boxes": [{"x": 4, "y": 0, "z": 10, "w": 2, "d": 2, "h": 4}]}, {"label": "The Shoulders", "note": "A wider layer: 4 blocks in a row, so one block sticks out on each side, and 2 more blocks behind.", "boxes": [{"x": 3, "y": 0, "z": 14, "w": 4, "d": 1, "h": 1}, {"x": 4, "y": 1, "z": 14, "w": 2, "d": 1, "h": 1}]}, {"label": "The Head", "note": "Back to 2 \u00d7 2 for the monster''s big square head.", "boxes": [{"x": 4, "y": 0, "z": 15, "w": 2, "d": 2, "h": 1}]}, {"label": "The Hat", "note": "Finish with one green block on top!", "boxes": [{"x": 4, "y": 1, "z": 16, "w": 1, "d": 1, "h": 1}]}]}'::jsonb,
  2,
  500,
  'live',
  '/photos/the-monster.webp',
  'Ashton (age 5)',
  (select coalesce(max(sort_order), 0) + 1 from public.blueprints)
)
on conflict (slug) do nothing;

insert into private.blueprint_keys (blueprint_id)
select id from public.blueprints where slug = 'the-monster'
on conflict (blueprint_id) do nothing;

notify pgrst, 'reload schema';

-- Blueprint No. 019: the Steve Tower, from Minecraft, built from magnetic blocks.
insert into public.blueprints (
  slug, number, name, tagline, description, inspired_by, fun_fact, sections, cubes,
  difficulty, price_cents, status, photo_url, designer, sort_order
)
values (
  'steve-tower',
  (select coalesce(max(number), 0) + 1 from public.blueprints),
  'Steve Tower',
  'Minecraft''s Steve, made of magnetic blocks, with a face you can see!',
  'The Steve Tower, from Minecraft! A skinny body holds up a big square head made of 5 × 5 × 5 blocks. Look at the front of the head: some blocks are pushed in, so you can see Steve''s eyes and nose.',
  'Minecraft',
  'In the game Minecraft, the whole world is made of blocks, and so is Steve, the main character!',
  '[{"w": 1, "d": 1, "count": 1}]'::jsonb,
  '{"need": "248 magnetic cube blocks (any pictures or colors)", "photos": ["/photos/steve-tower-side.webp"], "steps": [{"label": "The Body", "note": "Build a tower 3 blocks wide and 3 deep. Build the same layer 14 times. This is Steve''s body!", "boxes": [{"x": 1, "y": 1, "z": 0, "w": 3, "d": 3, "h": 14}]}, {"label": "The Head: Chin and Nose", "note": "Now the big square head, 5 blocks wide and 5 deep. Start with one full 5 \u00d7 5 layer. Then another layer with a gap in the front for the nose: leave out the middle block on the front row.", "boxes": [{"x": 0, "y": 0, "z": 14, "w": 5, "d": 5, "h": 1}, {"x": 0, "y": 0, "z": 15, "w": 2, "d": 1, "h": 1}, {"x": 3, "y": 0, "z": 15, "w": 2, "d": 1, "h": 1}, {"x": 0, "y": 1, "z": 15, "w": 5, "d": 4, "h": 1}]}, {"label": "The Head: Eyes", "note": "Another 5 \u00d7 5 layer with two gaps in the front row for Steve''s eyes. Leave out the 2nd and 4th blocks on the front row.", "boxes": [{"x": 0, "y": 0, "z": 16, "w": 1, "d": 1, "h": 1}, {"x": 2, "y": 0, "z": 16, "w": 1, "d": 1, "h": 1}, {"x": 4, "y": 0, "z": 16, "w": 1, "d": 1, "h": 1}, {"x": 0, "y": 1, "z": 16, "w": 5, "d": 4, "h": 1}]}, {"label": "The Head: Hair", "note": "Finish the head with two more full 5 \u00d7 5 layers on top.", "boxes": [{"x": 0, "y": 0, "z": 17, "w": 5, "d": 5, "h": 2}]}]}'::jsonb,
  3,
  500,
  'live',
  '/photos/steve-tower.webp',
  '',
  (select coalesce(max(sort_order), 0) + 1 from public.blueprints)
)
on conflict (slug) do nothing;

insert into private.blueprint_keys (blueprint_id)
select id from public.blueprints where slug = 'steve-tower'
on conflict (blueprint_id) do nothing;

notify pgrst, 'reload schema';

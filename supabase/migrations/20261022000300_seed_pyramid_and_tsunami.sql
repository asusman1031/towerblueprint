-- Blueprint No. 024: Ashton's Pyramid and Tsunami, two Ultra Expert builds in one blueprint.
insert into public.blueprints (
  slug, number, name, tagline, description, inspired_by, fun_fact, sections, cubes,
  difficulty, price_cents, status, photo_url, designer, sort_order
)
values (
  'pyramid-and-tsunami',
  (select coalesce(max(number), 0) + 1 from public.blueprints),
  'The Pyramid and the Tsunami',
  'Two huge builds in one: a stepped pyramid with a sky-high stem, and a crashing tsunami wave!',
  'Ashton''s Pyramid and Tsunami! It''s two buildings in one blueprint. First, a big stepped pyramid with a super tall, skinny stem that reaches way up into the sky, with little arms and a crown at the top. Then, a tsunami: a thick wave with a tall tower on one end and a curl that looks like it''s about to crash. It''s an Ultra Expert build, so take your time!',
  '',
  'A tsunami can travel across the ocean as fast as a jet plane! Out at sea it''s barely noticeable, but near the shore it slows down and grows into a giant wave.',
  '[{"w": 1, "d": 1, "count": 1}]'::jsonb,
  '{"need": "351 magnetic cube blocks (any pictures or colors)", "photos": ["/photos/pyramid-and-tsunami-side.webp"], "steps": [{"label": "The Pyramid Floor", "note": "Lay a big flat floor of blocks, 8 blocks wide and 11 blocks long. This is the bottom of the pyramid.", "boxes": [{"x": 0, "y": 0, "z": 0, "w": 8, "d": 11, "h": 1}]}, {"label": "The Pyramid Steps", "note": "Now build the steps. Make a smaller floor on top: 6 wide and 9 long, leaving one block of room all the way around the edge. Then 4 wide and 7 long. Then 2 wide and 5 long. It looks like a staircase up all four sides!", "boxes": [{"x": 1, "y": 1, "z": 1, "w": 6, "d": 9, "h": 1}, {"x": 2, "y": 2, "z": 2, "w": 4, "d": 7, "h": 1}, {"x": 3, "y": 3, "z": 3, "w": 2, "d": 5, "h": 1}]}, {"label": "The Super Tall Stem", "note": "On the very top step, stand one block on another. Build it 20 blocks tall, one block wide. This is the hardest part of the whole build, so go slowly and hold it steady!", "boxes": [{"x": 3, "y": 5, "z": 4, "w": 1, "d": 1, "h": 20}]}, {"label": "The Stem''s Arms", "note": "Add two small arms that stick out of the stem, one at 8 blocks up and one at 14 blocks up. Each arm is one block on each side.", "boxes": [{"x": 2, "y": 5, "z": 12, "w": 1, "d": 1, "h": 1}, {"x": 4, "y": 5, "z": 12, "w": 1, "d": 1, "h": 1}, {"x": 2, "y": 5, "z": 18, "w": 1, "d": 1, "h": 1}, {"x": 4, "y": 5, "z": 18, "w": 1, "d": 1, "h": 1}]}, {"label": "The Crown", "note": "At the very top, build a little crown: a bar of 3 blocks, with 3 blocks standing on top.", "boxes": [{"x": 2, "y": 5, "z": 24, "w": 3, "d": 1, "h": 1}, {"x": 2, "y": 5, "z": 25, "w": 1, "d": 1, "h": 1}, {"x": 3, "y": 5, "z": 25, "w": 1, "d": 1, "h": 1}, {"x": 4, "y": 5, "z": 25, "w": 1, "d": 1, "h": 1}]}, {"label": "The Tsunami Base", "note": "Now the second building: the tsunami! Leave a gap, then build a thick wall on the floor, 8 blocks long and 3 deep, 2 layers tall.", "boxes": [{"x": 10, "y": 0, "z": 0, "w": 8, "d": 3, "h": 2}]}, {"label": "The Tsunami Wall", "note": "On top, build the wall of the wave: 8 blocks long, 2 deep, and 3 layers tall.", "boxes": [{"x": 10, "y": 0, "z": 2, "w": 8, "d": 2, "h": 3}]}, {"label": "The Wave Tower", "note": "At one end of the wave, build a tall tower: 2 blocks wide, 2 deep, and 6 layers tall.", "boxes": [{"x": 10, "y": 0, "z": 5, "w": 2, "d": 2, "h": 6}]}, {"label": "The Curl", "note": "The wave curls over! Build a curl next to the tower: 3 wide, 2 deep and 3 layers tall. Then one single block on top of the curl, like the tip of a wave.", "boxes": [{"x": 12, "y": 0, "z": 5, "w": 3, "d": 2, "h": 3}, {"x": 14, "y": 0, "z": 8, "w": 1, "d": 1, "h": 1}]}, {"label": "The Spray", "note": "Add 2 blocks sticking out in front of the wave at the bottom, like water splashing out.", "boxes": [{"x": 8, "y": 0, "z": 0, "w": 2, "d": 1, "h": 1}]}]}'::jsonb,
  4,
  500,
  'live',
  '/photos/pyramid-and-tsunami.webp',
  'Ashton (age 5)',
  (select coalesce(max(sort_order), 0) + 1 from public.blueprints)
)
on conflict (slug) do nothing;

insert into private.blueprint_keys (blueprint_id)
select id from public.blueprints where slug = 'pyramid-and-tsunami'
on conflict (blueprint_id) do nothing;

notify pgrst, 'reload schema';

-- Blueprint No. 016: the Toothbrush Tower, a toothbrush and a tube of toothpaste.
insert into public.blueprints (
  slug, number, name, tagline, description, inspired_by, fun_fact, sections, cubes,
  difficulty, price_cents, status, photo_url, designer, sort_order
)
values (
  'toothbrush-tower',
  (select coalesce(max(number), 0) + 1 from public.blueprints),
  'Toothbrush Tower',
  'A giant toothbrush and a tube of toothpaste, built out of blocks!',
  'Two buildings in one blueprint! A super tall toothbrush with a long handle, a skinny neck, and a brush head, and a short tube of toothpaste with a pink cap standing beside it. The wooden block at the end of the brush is the toothpaste that got squeezed on.',
  '',
  'Long ago, people cleaned their teeth with chewing sticks. The first toothbrush with bristles was made in China more than 500 years ago!',
  '[{"w": 1, "d": 1, "count": 1}]'::jsonb,
  '{"need": "178 magnetic cube blocks (any pictures or colors), and one wooden block", "photos": ["/photos/toothbrush-tower-side.webp"], "steps": [{"label": "The Handle: Bottom Half", "note": "Make a tall tower 3 blocks wide and 2 deep. Build the same layer 10 times. This is the handle of the toothbrush!", "boxes": [{"x": 0, "y": 0, "z": 0, "w": 3, "d": 2, "h": 10}]}, {"label": "The Handle: Top Half", "note": "Ten more layers just like the first ones. Now the handle is 20 blocks tall!", "boxes": [{"x": 0, "y": 0, "z": 10, "w": 3, "d": 2, "h": 10}]}, {"label": "The Skinny Neck", "note": "One block wide and 13 blocks tall, standing in the middle of the handle. Go slowly so it doesn''t wobble!", "boxes": [{"x": 1, "y": 0, "z": 20, "w": 1, "d": 1, "h": 13}]}, {"label": "The Brush Head", "note": "The head sticks out sideways like a toothbrush. Lay 5 blocks in a row, with the last one sitting on top of the neck. Then 3 more blocks on top of them.", "boxes": [{"x": -3, "y": 0, "z": 33, "w": 5, "d": 1, "h": 1}, {"x": -2, "y": 0, "z": 34, "w": 3, "d": 1, "h": 1}]}, {"label": "The Squeezed-on Toothpaste", "note": "Put one wooden block right on top of the neck end. That''s the toothpaste that got squeezed onto the brush!", "boxes": [{"x": 1, "y": 0, "z": 34, "w": 1, "d": 1, "h": 1}]}, {"label": "The Toothpaste Tube", "note": "A second building, standing next to the toothbrush. Make a tower 2 wide and 2 deep, 8 layers tall.", "boxes": [{"x": -5, "y": 0, "z": 0, "w": 2, "d": 2, "h": 8}]}, {"label": "The Pink Cap", "note": "Finish the tube with a flat 2 \u00d7 2 cap of pink blocks on top.", "boxes": [{"x": -5, "y": 0, "z": 8, "w": 2, "d": 2, "h": 1}]}]}'::jsonb,
  3,
  500,
  'live',
  '/photos/toothbrush-tower.webp',
  '',
  (select coalesce(max(sort_order), 0) + 1 from public.blueprints)
)
on conflict (slug) do nothing;

insert into private.blueprint_keys (blueprint_id)
select id from public.blueprints where slug = 'toothbrush-tower'
on conflict (blueprint_id) do nothing;

notify pgrst, 'reload schema';

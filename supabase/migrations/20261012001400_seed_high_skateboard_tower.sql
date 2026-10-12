-- Bricks can be curved ramps now (the `ramp` field on a brick says which way the
-- curve swoops). Nothing to change in the table: bricks stay in the jsonb column.

-- Blueprint No. 013: Ashton's High Skateboard Tower. It starts like the James
-- Tower, then keeps going with a skate deck and two curved ramps.
insert into public.blueprints (
  slug, number, name, tagline, description, inspired_by, fun_fact, sections, bricks,
  difficulty, price_cents, status, photo_url, designer, sort_order
)
values (
  'high-skateboard-tower',
  (select coalesce(max(number), 0) + 1 from public.blueprints),
  'High Skateboard Tower',
  'A super-tall tower with two skateboard ramps way up high!',
  'Ashton''s fourth blueprint, and his tallest yet! It starts just like Sawyer''s James Tower, with the rainbow trunk, the lookout eye and the propeller. Then Ashton kept going: a long green skate deck with a curved ramp on each end, and a lookout stack on top.',
  '',
  'Skateboarding was invented by surfers in California in the 1950s, who wanted to surf on the sidewalk. A curved ramp like these is called a quarter pipe, because it''s shaped like a quarter of a pipe!',
  '[{"w": 1, "d": 1, "count": 1}]'::jsonb,
  '{
    "need": "83 DUPLO-size pieces, including five thin 2×4 plates and two curved ramps",
    "photos": ["/photos/high-skateboard-tower-back.webp"],
    "steps": [
      {"label": "The Rainbow Base", "note": "Every layer has a back row and a front row. Long bricks fill a whole row. On the maps, the front row is at the bottom.", "bricks": [
        {"x": 0, "y": 0, "z": 0, "w": 2, "d": 2, "h": 3, "color": "sky"},
        {"x": 2, "y": 0, "z": 0, "w": 2, "d": 2, "h": 3, "color": "green"},
        {"x": 0, "y": 2, "z": 0, "w": 2, "d": 2, "h": 3, "color": "sky"},
        {"x": 2, "y": 2, "z": 0, "w": 2, "d": 2, "h": 3, "color": "green"},
        {"x": 0, "y": 0, "z": 3, "w": 4, "d": 2, "h": 3, "color": "lime"},
        {"x": 0, "y": 2, "z": 3, "w": 4, "d": 2, "h": 3, "color": "orange"},
        {"x": 0, "y": 0, "z": 6, "w": 4, "d": 2, "h": 3, "color": "sky"},
        {"x": 0, "y": 2, "z": 6, "w": 2, "d": 2, "h": 3, "color": "yellow"},
        {"x": 2, "y": 2, "z": 6, "w": 2, "d": 2, "h": 3, "color": "lime"},
        {"x": 0, "y": 0, "z": 9, "w": 2, "d": 2, "h": 3, "color": "orange"},
        {"x": 2, "y": 0, "z": 9, "w": 2, "d": 2, "h": 3, "color": "yellow"},
        {"x": 0, "y": 2, "z": 9, "w": 2, "d": 2, "h": 3, "color": "blue"},
        {"x": 2, "y": 2, "z": 9, "w": 2, "d": 2, "h": 3, "color": "lime"},
        {"x": 0, "y": 0, "z": 12, "w": 2, "d": 2, "h": 3, "color": "green"},
        {"x": 2, "y": 0, "z": 12, "w": 2, "d": 2, "h": 3, "color": "sky"},
        {"x": 0, "y": 2, "z": 12, "w": 2, "d": 2, "h": 3, "color": "red"},
        {"x": 2, "y": 2, "z": 12, "w": 2, "d": 2, "h": 3, "color": "orange"}
      ]},
      {"label": "The Middle", "note": "Keep stacking, back row then front row. Press each layer down hard so the tower stays straight.", "bricks": [
        {"x": 0, "y": 0, "z": 15, "w": 2, "d": 2, "h": 3, "color": "red"},
        {"x": 2, "y": 0, "z": 15, "w": 2, "d": 2, "h": 3, "color": "yellow"},
        {"x": 0, "y": 2, "z": 15, "w": 2, "d": 2, "h": 3, "color": "lime"},
        {"x": 2, "y": 2, "z": 15, "w": 2, "d": 2, "h": 3, "color": "lime"},
        {"x": 0, "y": 0, "z": 18, "w": 2, "d": 2, "h": 3, "color": "sky"},
        {"x": 2, "y": 0, "z": 18, "w": 2, "d": 2, "h": 3, "color": "blue"},
        {"x": 0, "y": 2, "z": 18, "w": 2, "d": 2, "h": 3, "color": "red"},
        {"x": 2, "y": 2, "z": 18, "w": 2, "d": 2, "h": 3, "color": "sky"},
        {"x": 0, "y": 0, "z": 21, "w": 2, "d": 2, "h": 3, "color": "orange"},
        {"x": 2, "y": 0, "z": 21, "w": 2, "d": 2, "h": 3, "color": "yellow"},
        {"x": 0, "y": 2, "z": 21, "w": 2, "d": 2, "h": 3, "color": "blue"},
        {"x": 2, "y": 2, "z": 21, "w": 2, "d": 2, "h": 3, "color": "blue"},
        {"x": 0, "y": 0, "z": 24, "w": 4, "d": 2, "h": 3, "color": "blue"},
        {"x": 0, "y": 2, "z": 24, "w": 2, "d": 2, "h": 3, "color": "sky"},
        {"x": 2, "y": 2, "z": 24, "w": 2, "d": 2, "h": 3, "color": "sky"},
        {"x": 0, "y": 0, "z": 27, "w": 2, "d": 2, "h": 3, "color": "red"},
        {"x": 2, "y": 0, "z": 27, "w": 2, "d": 2, "h": 3, "color": "lime"},
        {"x": 0, "y": 2, "z": 27, "w": 2, "d": 2, "h": 3, "color": "sky"},
        {"x": 2, "y": 2, "z": 27, "w": 2, "d": 2, "h": 3, "color": "yellow"}
      ]},
      {"label": "The Top of the Tower", "note": "Look for the green brick with an eye and turn it to look out the front! The last layer is two long bricks.", "bricks": [
        {"x": 0, "y": 0, "z": 30, "w": 2, "d": 2, "h": 3, "color": "red"},
        {"x": 2, "y": 0, "z": 30, "w": 2, "d": 2, "h": 3, "color": "sky"},
        {"x": 0, "y": 2, "z": 30, "w": 2, "d": 2, "h": 3, "color": "blue"},
        {"x": 2, "y": 2, "z": 30, "w": 2, "d": 2, "h": 3, "color": "yellow"},
        {"x": 0, "y": 0, "z": 33, "w": 2, "d": 2, "h": 3, "color": "green"},
        {"x": 2, "y": 0, "z": 33, "w": 2, "d": 2, "h": 3, "color": "orange"},
        {"x": 0, "y": 2, "z": 33, "w": 2, "d": 2, "h": 3, "color": "yellow"},
        {"x": 2, "y": 2, "z": 33, "w": 2, "d": 2, "h": 3, "color": "green"},
        {"x": 0, "y": 0, "z": 36, "w": 2, "d": 2, "h": 3, "color": "red"},
        {"x": 2, "y": 0, "z": 36, "w": 2, "d": 2, "h": 3, "color": "red"},
        {"x": 0, "y": 2, "z": 36, "w": 2, "d": 2, "h": 3, "color": "lime"},
        {"x": 2, "y": 2, "z": 36, "w": 2, "d": 2, "h": 3, "color": "orange"},
        {"x": 0, "y": 0, "z": 39, "w": 2, "d": 2, "h": 3, "color": "yellow"},
        {"x": 2, "y": 0, "z": 39, "w": 2, "d": 2, "h": 3, "color": "green"},
        {"x": 0, "y": 2, "z": 39, "w": 2, "d": 2, "h": 3, "color": "green"},
        {"x": 2, "y": 2, "z": 39, "w": 2, "d": 2, "h": 3, "color": "sky"},
        {"x": 0, "y": 0, "z": 42, "w": 4, "d": 2, "h": 3, "color": "green"},
        {"x": 0, "y": 2, "z": 42, "w": 4, "d": 2, "h": 3, "color": "blue"}
      ]},
      {"label": "The Hat", "note": "Four small bricks right on top. Then a row of three across the middle: the side bricks stick out one stud, and the green one starts the neck.", "bricks": [
        {"x": 0, "y": 2, "z": 45, "w": 2, "d": 2, "h": 3, "color": "orange"},
        {"x": 2, "y": 2, "z": 45, "w": 2, "d": 2, "h": 3, "color": "sky"},
        {"x": 0, "y": 0, "z": 45, "w": 2, "d": 2, "h": 3, "color": "sky"},
        {"x": 2, "y": 0, "z": 45, "w": 2, "d": 2, "h": 3, "color": "blue"},
        {"x": -1, "y": 1, "z": 48, "w": 2, "d": 2, "h": 3, "color": "sky"},
        {"x": 1, "y": 1, "z": 48, "w": 2, "d": 2, "h": 3, "color": "green"},
        {"x": 3, "y": 1, "z": 48, "w": 2, "d": 2, "h": 3, "color": "blue"}
      ]},
      {"label": "The Neck", "note": "Four small bricks straight up on the green one. The yellow brick has an eye, so turn it to look out the front!", "bricks": [
        {"x": 1, "y": 1, "z": 51, "w": 2, "d": 2, "h": 3, "color": "yellow"},
        {"x": 1, "y": 1, "z": 54, "w": 2, "d": 2, "h": 3, "color": "orange"},
        {"x": 1, "y": 1, "z": 57, "w": 2, "d": 2, "h": 3, "color": "blue"},
        {"x": 1, "y": 1, "z": 60, "w": 2, "d": 2, "h": 3, "color": "lime"}
      ]},
      {"label": "The Propeller", "note": "A long blue brick on the neck. Then the yellow brick in the middle, with a thin plate on each side sticking way out.", "bricks": [
        {"x": 0, "y": 1, "z": 63, "w": 4, "d": 2, "h": 3, "color": "blue"},
        {"x": -3, "y": 1, "z": 66, "w": 4, "d": 2, "h": 1, "color": "sky"},
        {"x": 1, "y": 1, "z": 66, "w": 2, "d": 2, "h": 3, "color": "yellow"},
        {"x": 3, "y": 1, "z": 66, "w": 4, "d": 2, "h": 1, "color": "orange"}
      ]},
      {"label": "Up the Middle", "note": "A green brick on the yellow one. Then an orange brick and a blue brick side by side, each sticking out one stud.", "bricks": [
        {"x": 1, "y": 1, "z": 69, "w": 2, "d": 2, "h": 3, "color": "green"},
        {"x": 0, "y": 1, "z": 72, "w": 2, "d": 2, "h": 3, "color": "orange"},
        {"x": 2, "y": 1, "z": 72, "w": 2, "d": 2, "h": 3, "color": "blue"}
      ]},
      {"label": "The Skate Deck", "note": "Two thin green plates end to end make a long deck. Put the orange brick right in the middle.", "bricks": [
        {"x": -2, "y": 1, "z": 75, "w": 4, "d": 2, "h": 1, "color": "green"},
        {"x": 2, "y": 1, "z": 75, "w": 4, "d": 2, "h": 1, "color": "green"},
        {"x": 1, "y": 1, "z": 76, "w": 2, "d": 2, "h": 3, "color": "orange"}
      ]},
      {"label": "The Skateboard Ramps", "note": "Press a curved ramp onto each end of the deck, tall side in, so the curves swoop out like skate ramps!", "bricks": [
        {"x": -4, "y": 1, "z": 76, "w": 3, "d": 2, "h": 6, "color": "blue", "ramp": "left"},
        {"x": 5, "y": 1, "z": 76, "w": 3, "d": 2, "h": 6, "color": "blue", "ramp": "right"}
      ]},
      {"label": "The Lookout Top", "note": "A thin yellow plate, then light blue and dark blue bricks straight up. Two lime bricks side by side, and a green brick on top!", "bricks": [
        {"x": 0, "y": 1, "z": 79, "w": 4, "d": 2, "h": 1, "color": "yellow"},
        {"x": 1, "y": 1, "z": 80, "w": 2, "d": 2, "h": 3, "color": "sky"},
        {"x": 1, "y": 1, "z": 83, "w": 2, "d": 2, "h": 3, "color": "blue"},
        {"x": 0, "y": 1, "z": 86, "w": 2, "d": 2, "h": 3, "color": "lime"},
        {"x": 2, "y": 1, "z": 86, "w": 2, "d": 2, "h": 3, "color": "lime"},
        {"x": 1, "y": 1, "z": 89, "w": 2, "d": 2, "h": 3, "color": "green"}
      ]}
    ]
  }'::jsonb,
  3,
  500,
  'live',
  '/photos/high-skateboard-tower.webp',
  'Ashton (age 5)',
  (select coalesce(max(sort_order), 0) + 1 from public.blueprints)
)
on conflict (slug) do nothing;

insert into private.blueprint_keys (blueprint_id)
select id from public.blueprints where slug = 'high-skateboard-tower'
on conflict (blueprint_id) do nothing;

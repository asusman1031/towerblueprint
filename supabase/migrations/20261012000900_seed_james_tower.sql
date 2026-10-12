-- Blueprint No. 009: The James Tower, Sawyer's first LEGO DUPLO build.
insert into public.blueprints (
  slug, number, name, tagline, description, inspired_by, fun_fact, sections, bricks,
  difficulty, price_cents, status, photo_url, designer, sort_order
)
values (
  'james-tower',
  (select coalesce(max(number), 0) + 1 from public.blueprints),
  'The James Tower',
  'A super-tall rainbow tower with a hat, a lookout eye, and a propeller on top.',
  'Sawyer''s first LEGO DUPLO blueprint! A rainbow tower four studs wide, a hat that sticks out on both sides, a skinny neck with an eye peeking out, and a propeller on top.',
  '',
  'The name LEGO comes from two Danish words, "leg godt", which mean "play well".',
  '[{"w": 1, "d": 1, "count": 1}]'::jsonb,
  '{
    "need": "69 DUPLO-size bricks, including two thin 2×4 plates",
    "photos": ["/photos/james-tower-back.jpg"],
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
      ]}
    ]
  }'::jsonb,
  2,
  500,
  'live',
  '/photos/james-tower.jpg',
  '',
  (select coalesce(max(sort_order), 0) + 1 from public.blueprints)
)
on conflict (slug) do nothing;

insert into private.blueprint_keys (blueprint_id)
select id from public.blueprints where slug = 'james-tower'
on conflict (blueprint_id) do nothing;

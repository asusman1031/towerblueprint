-- Blueprint No. 007: Sawyer's Tic Tac Toe Twin Towers. Two separate towers in
-- one structure: the second path part has its own start spot.
insert into public.blueprints (
  slug, number, name, tagline, description, inspired_by, fun_fact, sections, structure,
  difficulty, price_cents, status, photo_url, sort_order
)
values (
  'tic-tac-toe-twin-towers',
  (select coalesce(max(number), 0) + 1 from public.blueprints),
  'Tic Tac Toe Twin Towers',
  'Two little towers, one for X and one for O. Who wins?',
  'Sawyer built this one with tic-tac-toe pieces! Two towers stand side by side: the X Tower and the O Tower. It''s his smallest blueprint yet, perfect for little builders.',
  '',
  'Tic-tac-toe is really old: the ancient Romans played a game like it called terni lapilli. And if both players make the best move every time, nobody can win. It always ends in a tie!',
  '[{"w": 1, "d": 1, "count": 1}]'::jsonb,
  '{
    "startLayer": 1,
    "need": "8 tic-tac-toe pieces (or any 8 blocks), with an X and an O for the tops",
    "parts": [
      {"kind": "path", "label": "The X Tower", "start": {"x": 0, "y": 0, "z": 0}, "runs": [{"dir": "U", "n": 3}], "mark": "X", "note": "Stack 4 pieces. Put the X on top!"},
      {"kind": "path", "label": "The O Tower", "start": {"x": 2, "y": 0, "z": 0}, "runs": [{"dir": "U", "n": 3}], "mark": "O", "note": "Leave one empty space next to the X Tower, then stack 4 more. Put the O on top!"}
    ]
  }'::jsonb,
  1,
  200,
  'live',
  '/photos/tic-tac-toe-twin-towers.jpg',
  (select coalesce(max(sort_order), 0) + 1 from public.blueprints)
)
on conflict (slug) do nothing;

insert into private.blueprint_keys (blueprint_id)
select id from public.blueprints where slug = 'tic-tac-toe-twin-towers'
on conflict (blueprint_id) do nothing;

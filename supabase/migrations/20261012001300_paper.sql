-- Packing paper builds: sheets scrunched into one long rope and laid on the
-- floor in a shape, like a snake. Other builds leave `paper` null; a paper build
-- keeps a one-block placeholder in `sections`, which stays required.
alter table public.blueprints
  add column if not exists paper jsonb
    check (paper is null or (jsonb_typeof(paper) = 'object' and pg_column_size(paper) <= 20000));

create or replace function public.hq_save_blueprint(p_token text, p_data jsonb)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_id uuid := nullif(p_data ->> 'id', '')::uuid;
  v_slug text := p_data ->> 'slug';
  v_structure jsonb := case when jsonb_typeof(p_data -> 'structure') = 'object' then p_data -> 'structure' end;
  v_tiles jsonb := case when jsonb_typeof(p_data -> 'tiles') = 'object' then p_data -> 'tiles' end;
  v_bricks jsonb := case when jsonb_typeof(p_data -> 'bricks') = 'object' then p_data -> 'bricks' end;
  v_boxes jsonb := case when jsonb_typeof(p_data -> 'boxes') = 'object' then p_data -> 'boxes' end;
  v_dice jsonb := case when jsonb_typeof(p_data -> 'dice') = 'object' then p_data -> 'dice' end;
  v_paper jsonb := case when jsonb_typeof(p_data -> 'paper') = 'object' then p_data -> 'paper' end;
begin
  if not private.hq_ok(p_token) then return jsonb_build_object('error', 'not_signed_in'); end if;
  if exists (select 1 from public.blueprints where slug = v_slug and id is distinct from v_id) then
    return jsonb_build_object('error', 'slug_taken');
  end if;

  if v_id is null then
    insert into public.blueprints (
      slug, number, name, tagline, description, inspired_by, fun_fact, sections, structure, tiles, bricks, boxes, dice, paper,
      difficulty, price_cents, checkout_url, status, designer, sort_order
    )
    values (
      v_slug,
      (select coalesce(max(number), 0) + 1 from public.blueprints),
      p_data ->> 'name',
      coalesce(p_data ->> 'tagline', ''),
      coalesce(p_data ->> 'description', ''),
      coalesce(p_data ->> 'inspired_by', ''),
      coalesce(p_data ->> 'fun_fact', ''),
      p_data -> 'sections',
      v_structure,
      v_tiles,
      v_bricks,
      v_boxes,
      v_dice,
      v_paper,
      coalesce((p_data ->> 'difficulty')::int, 2),
      coalesce((p_data ->> 'price_cents')::int, 500),
      nullif(p_data ->> 'checkout_url', ''),
      coalesce(p_data ->> 'status', 'draft'),
      coalesce(p_data ->> 'designer', ''),
      (select coalesce(max(sort_order), 0) + 1 from public.blueprints)
    )
    returning id into v_id;
    insert into private.blueprint_keys (blueprint_id) values (v_id);
  else
    update public.blueprints set
      slug = v_slug,
      name = p_data ->> 'name',
      tagline = coalesce(p_data ->> 'tagline', ''),
      description = coalesce(p_data ->> 'description', ''),
      inspired_by = coalesce(p_data ->> 'inspired_by', ''),
      fun_fact = coalesce(p_data ->> 'fun_fact', ''),
      sections = p_data -> 'sections',
      structure = v_structure,
      tiles = v_tiles,
      bricks = v_bricks,
      boxes = v_boxes,
      dice = v_dice,
      paper = v_paper,
      difficulty = coalesce((p_data ->> 'difficulty')::int, 2),
      price_cents = coalesce((p_data ->> 'price_cents')::int, 500),
      checkout_url = nullif(p_data ->> 'checkout_url', ''),
      status = coalesce(p_data ->> 'status', 'draft'),
      designer = coalesce(p_data ->> 'designer', ''),
      updated_at = now()
    where id = v_id;
    if not found then return jsonb_build_object('error', 'not_found'); end if;
  end if;

  return jsonb_build_object('ok', true, 'id', v_id, 'slug', v_slug);
exception
  when check_violation or not_null_violation or invalid_text_representation then
    return jsonb_build_object('error', 'invalid');
end
$$;


-- Blueprint No. 012: the Cardboard Snake, Sawyer's first build from packing paper.
insert into public.blueprints (
  slug, number, name, tagline, description, inspired_by, fun_fact, sections, paper,
  difficulty, price_cents, status, photo_url, designer, sort_order
)
values (
  'cardboard-snake',
  (select coalesce(max(number), 0) + 1 from public.blueprints),
  'Cardboard Snake',
  'A giant floor snake made from the packing paper that came in a box.',
  'Sawyer''s first blueprint made from packing paper! He saved the crinkly paper that came stuffed in a delivery box, scrunched it into one long rope, and turned it into a snake: a curly tail, a long wiggly body, a big U-turn, and a crumpled-up head.',
  '',
  'The longest snakes in the world, reticulated pythons, can grow more than 20 feet long. That''s about as long as this paper snake!',
  '[{"w": 1, "d": 1, "count": 1}]'::jsonb,
  '{
    "sheets": 1,
    "face": true,
    "need": "Packing paper from a delivery box, about 21 feet of it (one long strip, or a few pieces twisted together)",
    "steps": [
      {"label": "The Curly Tail", "note": "Start at the dot in the middle. Wind the rope around and around like a snail shell, then let it come out at the bottom.", "path": [[2.5, 7.1], [2.2, 7.4], [1.8, 7.0], [1.7, 6.3], [1.9, 5.9], [2.3, 6.1], [2.7, 6.2], [3.1, 6.5], [3.4, 7.0], [3.3, 7.5], [2.9, 8.1], [2.6, 8.3], [2.0, 8.5], [1.5, 7.9], [1.3, 7.0], [1.3, 6.2]]},
      {"label": "The Long Wiggle", "note": "Swoop down past the tail toward you, with a gentle wiggle.", "path": [[1.4, 5.5], [1.6, 5.1], [1.9, 4.6], [2.3, 4.0], [2.4, 3.4], [2.5, 2.4], [2.6, 1.3]]},
      {"label": "The Big U-Turn", "note": "Curve all the way around in a big U, so the snake heads back the other way.", "path": [[2.5, 0.5], [2.3, 0.1], [1.8, 0.0], [1.5, 0.3], [1.3, 1.2]]},
      {"label": "Neck & Head", "note": "Run back up beside the body, then bend to the left. Leave the end big and crumpled up: that''s the head!", "path": [[1.2, 2.4], [1.1, 3.8], [0.8, 4.7], [0.5, 4.9], [0.1, 4.9]]}
    ]
  }'::jsonb,
  1,
  200,
  'live',
  '/photos/cardboard-snake.webp',
  '',
  (select coalesce(max(sort_order), 0) + 1 from public.blueprints)
)
on conflict (slug) do nothing;

insert into private.blueprint_keys (blueprint_id)
select id from public.blueprints where slug = 'cardboard-snake'
on conflict (blueprint_id) do nothing;

notify pgrst, 'reload schema';

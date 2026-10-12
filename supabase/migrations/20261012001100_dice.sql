-- Dice builds: dice placed step by step, each with the numbers facing front and up.
-- Other builds leave `dice` null; a dice build keeps a one-block
-- placeholder in `sections`, which stays required.
alter table public.blueprints
  add column if not exists dice jsonb
    check (dice is null or (jsonb_typeof(dice) = 'object' and pg_column_size(dice) <= 20000));

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
begin
  if not private.hq_ok(p_token) then return jsonb_build_object('error', 'not_signed_in'); end if;
  if exists (select 1 from public.blueprints where slug = v_slug and id is distinct from v_id) then
    return jsonb_build_object('error', 'slug_taken');
  end if;

  if v_id is null then
    insert into public.blueprints (
      slug, number, name, tagline, description, inspired_by, fun_fact, sections, structure, tiles, bricks, boxes, dice,
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

-- Blueprint No. 011: the Dice Wall, Sawyer's first build from dice.
insert into public.blueprints (
  slug, number, name, tagline, description, inspired_by, fun_fact, sections, dice,
  difficulty, price_cents, status, photo_url, designer, sort_order
)
values (
  'dice-wall',
  (select coalesce(max(number), 0) + 1 from public.blueprints),
  'Dice Wall',
  'A little wall of 8 dice. Add up the dots to find its secret number!',
  'Sawyer''s smallest blueprint yet, and the first one with math built in! Two rows of colorful dice, with every number facing out on purpose. Add up all the dots to find the wall''s secret number.',
  '',
  'On every regular die, the dots on opposite sides add up to 7: 1 is across from 6, 2 from 5, and 3 from 4. Check your dice!',
  '[{"w": 1, "d": 1, "count": 1}]'::jsonb,
  '{
    "need": "8 dice: 2 red, 2 yellow, 2 blue and 2 green (any colors work)",
    "steps": [
      {"label": "The Bottom Row", "note": "Line up 4 dice side by side. Turn each one so the right number faces you: 5, 5, 5 and 4.", "dice": [
        {"x": 0, "y": 0, "z": 0, "color": "red", "front": 5, "top": 1},
        {"x": 1, "y": 0, "z": 0, "color": "blue", "front": 5, "top": 1},
        {"x": 2, "y": 0, "z": 0, "color": "blue", "front": 5, "top": 1},
        {"x": 3, "y": 0, "z": 0, "color": "green", "front": 4, "top": 1}
      ]},
      {"label": "The Top Row", "note": "Stack 4 more dice right on top: red on red, yellow on the blue ones, green on green. Turn them so 1, 6, 5 and 1 face you.", "dice": [
        {"x": 0, "y": 0, "z": 1, "color": "red", "front": 1, "top": 2},
        {"x": 1, "y": 0, "z": 1, "color": "yellow", "front": 6, "top": 3},
        {"x": 2, "y": 0, "z": 1, "color": "yellow", "front": 5, "top": 1},
        {"x": 3, "y": 0, "z": 1, "color": "green", "front": 1, "top": 5}
      ]}
    ]
  }'::jsonb,
  1,
  200,
  'live',
  '/photos/dice-wall.jpg',
  '',
  (select coalesce(max(sort_order), 0) + 1 from public.blueprints)
)
on conflict (slug) do nothing;

insert into private.blueprint_keys (blueprint_id)
select id from public.blueprints where slug = 'dice-wall'
on conflict (blueprint_id) do nothing;

notify pgrst, 'reload schema';

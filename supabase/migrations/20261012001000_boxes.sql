-- Cardboard box builds: boxes stacked bottom to top, one box per step.
-- Other builds leave `boxes` null; a box build keeps a one-block
-- placeholder in `sections`, which stays required.
alter table public.blueprints
  add column if not exists boxes jsonb
    check (boxes is null or (jsonb_typeof(boxes) = 'object' and pg_column_size(boxes) <= 20000));

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
begin
  if not private.hq_ok(p_token) then return jsonb_build_object('error', 'not_signed_in'); end if;
  if exists (select 1 from public.blueprints where slug = v_slug and id is distinct from v_id) then
    return jsonb_build_object('error', 'slug_taken');
  end if;

  if v_id is null then
    insert into public.blueprints (
      slug, number, name, tagline, description, inspired_by, fun_fact, sections, structure, tiles, bricks, boxes,
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

-- Blueprint No. 010: the Box Tower, Sawyer's first build from cardboard boxes.
insert into public.blueprints (
  slug, number, name, tagline, description, inspired_by, fun_fact, sections, boxes,
  difficulty, price_cents, status, photo_url, designer, sort_order
)
values (
  'box-tower',
  (select coalesce(max(number), 0) + 1 from public.blueprints),
  'Box Tower',
  'A tower of cardboard boxes, with a lookout box poking out the top.',
  'Sawyer''s first blueprint built from cardboard boxes! A big box upside down with its flaps spread out, a tall box on top, and a small box inside that pokes out like a lookout. All you need is 3 boxes from the recycling bin.',
  '',
  'Cardboard boxes are strong because of the wavy layer hidden inside the cardboard. The waves work like lots of tiny arches holding up the weight!',
  '[{"w": 1, "d": 1, "count": 1}]'::jsonb,
  '{
    "need": "3 cardboard boxes: one big, one tall, and one small enough to fit inside the tall one",
    "photos": ["/photos/box-tower-back.jpg"],
    "boxes": [
      {"label": "The Base", "size": "A big box", "w": 18, "d": 14, "h": 9, "x": 0, "y": 0, "z": 0, "flaps": "floor", "tape": true, "note": "Turn the biggest box upside down. Open its 4 flaps and spread them flat on the floor, like a skirt. That keeps the tower steady!"},
      {"label": "The Tower Box", "size": "A tall box", "w": 8, "d": 8, "h": 10, "x": 5, "y": 3, "z": 9, "flaps": "up", "note": "Stand a tall box on top of the big box, right in the middle. Open its top flaps so they stick up."},
      {"label": "The Lookout", "size": "A small box that fits inside the tall box", "w": 7, "d": 7, "h": 14, "x": 5.5, "y": 3.5, "z": 9, "flaps": "up", "inside": true, "note": "Stand a smaller box inside the tall box so it pokes out the top. Open its flaps too. Now it''s a lookout!"}
    ]
  }'::jsonb,
  1,
  200,
  'live',
  '/photos/box-tower.jpg',
  '',
  (select coalesce(max(sort_order), 0) + 1 from public.blueprints)
)
on conflict (slug) do nothing;

insert into private.blueprint_keys (blueprint_id)
select id from public.blueprints where slug = 'box-tower'
on conflict (blueprint_id) do nothing;

notify pgrst, 'reload schema';

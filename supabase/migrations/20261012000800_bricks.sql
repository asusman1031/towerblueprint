-- Brick builds: LEGO-style bricks with studs, listed step by step.
-- Other builds leave `bricks` null; a brick build keeps a one-block
-- placeholder in `sections`, which stays required.
alter table public.blueprints
  add column if not exists bricks jsonb
    check (bricks is null or (jsonb_typeof(bricks) = 'object' and pg_column_size(bricks) <= 20000));

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
begin
  if not private.hq_ok(p_token) then return jsonb_build_object('error', 'not_signed_in'); end if;
  if exists (select 1 from public.blueprints where slug = v_slug and id is distinct from v_id) then
    return jsonb_build_object('error', 'slug_taken');
  end if;

  if v_id is null then
    insert into public.blueprints (
      slug, number, name, tagline, description, inspired_by, fun_fact, sections, structure, tiles, bricks,
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

-- Blueprint No. 008: the Crazy Lego Tower, by guest architect Ashton (Sawyer's little brother).
insert into public.blueprints (
  slug, number, name, tagline, description, inspired_by, fun_fact, sections, bricks,
  difficulty, price_cents, status, photo_url, designer, sort_order
)
values (
  'crazy-lego-tower',
  (select coalesce(max(number), 0) + 1 from public.blueprints),
  'Crazy Lego Tower',
  'A rainbow brick tower with a zig-zag top that sticks way out.',
  'Ashton''s third blueprint, built with big LEGO DUPLO bricks! A strong yellow base, a patchwork middle, rainbow stripes, and a crazy zig-zag top that sticks way out to the side.',
  '',
  'DUPLO bricks are exactly twice as long, twice as wide and twice as tall as regular LEGO bricks, and the two kinds can even click together!',
  '[{"w": 1, "d": 1, "count": 1}]'::jsonb,
  '{
    "need": "21 DUPLO-size bricks, including one thin 2×4 plate",
    "photos": ["/photos/crazy-lego-tower-back.jpg"],
    "steps": [
      {"label": "The Base", "note": "Start with the thin green plate. Then stack the yellow layers: two small bricks, one long brick, two small, one long. Switching keeps the tower strong!", "bricks": [
        {"x": 0, "y": 0, "z": 0, "w": 4, "d": 2, "h": 1, "color": "lime"},
        {"x": 0, "y": 0, "z": 1, "w": 2, "d": 2, "h": 3, "color": "yellow"},
        {"x": 2, "y": 0, "z": 1, "w": 2, "d": 2, "h": 3, "color": "yellow"},
        {"x": 0, "y": 0, "z": 4, "w": 4, "d": 2, "h": 3, "color": "yellow"},
        {"x": 0, "y": 0, "z": 7, "w": 2, "d": 2, "h": 3, "color": "yellow"},
        {"x": 2, "y": 0, "z": 7, "w": 2, "d": 2, "h": 3, "color": "yellow"},
        {"x": 0, "y": 0, "z": 10, "w": 4, "d": 2, "h": 3, "color": "yellow"}
      ]},
      {"label": "The Patchwork", "note": "Two small bricks side by side on each layer. The yellow star brick is two bricks tall, so the top layer only needs one small blue brick next to it.", "bricks": [
        {"x": 0, "y": 0, "z": 13, "w": 2, "d": 2, "h": 3, "color": "green"},
        {"x": 2, "y": 0, "z": 13, "w": 2, "d": 2, "h": 3, "color": "red"},
        {"x": 0, "y": 0, "z": 16, "w": 2, "d": 2, "h": 3, "color": "lime"},
        {"x": 2, "y": 0, "z": 16, "w": 2, "d": 2, "h": 3, "color": "orange"},
        {"x": 0, "y": 0, "z": 19, "w": 2, "d": 2, "h": 3, "color": "red"},
        {"x": 2, "y": 0, "z": 19, "w": 2, "d": 2, "h": 6, "color": "yellow"},
        {"x": 0, "y": 0, "z": 22, "w": 2, "d": 2, "h": 3, "color": "blue"}
      ]},
      {"label": "The Stripes", "note": "Three long bricks, each one lined up right on top of the last.", "bricks": [
        {"x": 0, "y": 0, "z": 25, "w": 4, "d": 2, "h": 3, "color": "lime"},
        {"x": 0, "y": 0, "z": 28, "w": 4, "d": 2, "h": 3, "color": "sky"},
        {"x": 0, "y": 0, "z": 31, "w": 4, "d": 2, "h": 3, "color": "lime"}
      ]},
      {"label": "The Crazy Top", "note": "The extra-long blue brick sits on just half of the top and sticks way out. Then zig-zag: orange over the tower, orange shifted back, red on top. Hold it while you press!", "bricks": [
        {"x": -6, "y": 0, "z": 34, "w": 8, "d": 2, "h": 3, "color": "blue"},
        {"x": 0, "y": 0, "z": 37, "w": 4, "d": 2, "h": 3, "color": "orange"},
        {"x": -2, "y": 0, "z": 40, "w": 4, "d": 2, "h": 3, "color": "orange"},
        {"x": 0, "y": 0, "z": 43, "w": 4, "d": 2, "h": 3, "color": "red"}
      ]}
    ]
  }'::jsonb,
  2,
  500,
  'live',
  '/photos/crazy-lego-tower.jpg',
  'Ashton (age 5)',
  (select coalesce(max(sort_order), 0) + 1 from public.blueprints)
)
on conflict (slug) do nothing;

insert into private.blueprint_keys (blueprint_id)
select id from public.blueprints where slug = 'crazy-lego-tower'
on conflict (blueprint_id) do nothing;

notify pgrst, 'reload schema';

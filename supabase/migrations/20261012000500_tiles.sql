-- Magnetic tile builds: rooms made of flat squares that click together.
-- Towers and structures leave `tiles` null; a tile build keeps a one-block
-- placeholder in `sections`, which stays required.
alter table public.blueprints
  add column if not exists tiles jsonb
    check (tiles is null or (jsonb_typeof(tiles) = 'object' and pg_column_size(tiles) <= 20000));

create or replace function public.hq_save_blueprint(p_token text, p_data jsonb)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_id uuid := nullif(p_data ->> 'id', '')::uuid;
  v_slug text := p_data ->> 'slug';
  v_structure jsonb := case when jsonb_typeof(p_data -> 'structure') = 'object' then p_data -> 'structure' end;
  v_tiles jsonb := case when jsonb_typeof(p_data -> 'tiles') = 'object' then p_data -> 'tiles' end;
begin
  if not private.hq_ok(p_token) then return jsonb_build_object('error', 'not_signed_in'); end if;
  if exists (select 1 from public.blueprints where slug = v_slug and id is distinct from v_id) then
    return jsonb_build_object('error', 'slug_taken');
  end if;

  if v_id is null then
    insert into public.blueprints (
      slug, number, name, tagline, description, inspired_by, fun_fact, sections, structure, tiles,
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

-- Blueprint No. 005: the Museum of Tiles, by guest architect Ashton (Sawyer's little brother).
insert into public.blueprints (
  slug, number, name, tagline, description, inspired_by, fun_fact, sections, tiles,
  difficulty, price_cents, status, photo_url, designer, sort_order
)
values (
  'museum-of-tiles',
  (select coalesce(max(number), 0) + 1 from public.blueprints),
  'Museum of Tiles',
  'A see-through museum with two halls, a courtyard, and a tower on top.',
  'Ashton''s second blueprint, and the first one built with magnetic tiles instead of blocks! Two halls, an open courtyard with a floor, a gallery upstairs, and a tower on top.',
  '',
  'The Louvre in Paris is the most visited art museum in the world. Its famous entrance is a giant pyramid made of 673 glass panes, kind of like a huge build of see-through tiles!',
  '[{"w": 1, "d": 1, "count": 1}]'::jsonb,
  '{
    "photos": ["/photos/museum-of-tiles-back.jpg"],
    "rooms": [
      {"label": "The Left Hall", "x": 0, "y": 0, "z": 0, "w": 1, "d": 2, "h": 2, "roof": true, "floor": false, "note": "Build it right on the floor: walls all the way around, then the roof."},
      {"label": "The Courtyard", "x": 1, "y": 0, "z": 0, "w": 2, "d": 2, "h": 2, "roof": false, "floor": true, "note": "Lay the floor down first, then build the walls. Leave the top open so visitors can look in!"},
      {"label": "The Right Hall", "x": 3, "y": 0, "z": 0, "w": 1, "d": 2, "h": 2, "roof": true, "floor": false, "note": "Build it on the other side of the courtyard, then put on its roof."},
      {"label": "The Gallery", "x": 1, "y": 0, "z": 2, "w": 2, "d": 1, "h": 1, "roof": true, "floor": false, "note": "Stand it on the back half of the courtyard. It rests on the tops of the walls."},
      {"label": "The Tower", "x": 1, "y": 0, "z": 3, "w": 1, "d": 1, "h": 2, "roof": true, "floor": false, "note": "Stand it on the left side of the gallery roof. Go slow, it gets tall!"}
    ]
  }'::jsonb,
  1,
  500,
  'live',
  '/photos/museum-of-tiles.jpg',
  'Ashton (age 5)',
  (select coalesce(max(sort_order), 0) + 1 from public.blueprints)
)
on conflict (slug) do nothing;

insert into private.blueprint_keys (blueprint_id)
select id from public.blueprints where slug = 'museum-of-tiles'
on conflict (blueprint_id) do nothing;

notify pgrst, 'reload schema';

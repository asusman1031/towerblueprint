-- Sideways builds ("structures"), like a bridge across two chairs: one long path
-- of blocks plus the pillars that hold it up. Towers leave `structure` null; a
-- structure keeps a one-block placeholder in `sections`, which stays required.
alter table public.blueprints
  add column if not exists structure jsonb
    check (structure is null or (jsonb_typeof(structure) = 'object' and pg_column_size(structure) <= 20000));

create or replace function public.hq_save_blueprint(p_token text, p_data jsonb)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_id uuid := nullif(p_data ->> 'id', '')::uuid;
  v_slug text := p_data ->> 'slug';
  v_structure jsonb := case when jsonb_typeof(p_data -> 'structure') = 'object' then p_data -> 'structure' end;
begin
  if not private.hq_ok(p_token) then return jsonb_build_object('error', 'not_signed_in'); end if;
  if exists (select 1 from public.blueprints where slug = v_slug and id is distinct from v_id) then
    return jsonb_build_object('error', 'slug_taken');
  end if;

  if v_id is null then
    insert into public.blueprints (
      slug, number, name, tagline, description, inspired_by, fun_fact, sections, structure,
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

-- Jeddah's photo now has a clean background.
update public.blueprints
set photo_url = '/photos/jeddah-tower-v2.jpg', updated_at = now()
where slug = 'jeddah-tower' and photo_url = '/photos/jeddah-tower.jpg';

-- Blueprint No. 002: Sawyer's Snaking Pillar Structure.
insert into public.blueprints (
  slug, number, name, tagline, description, inspired_by, fun_fact, sections, structure,
  difficulty, price_cents, status, photo_url, sort_order
)
values (
  'snaking-pillar-structure',
  (select coalesce(max(number), 0) + 1 from public.blueprints),
  'Snaking Pillar Structure',
  'A bridge on pillars that leaps across two chairs and snakes over the table.',
  'Sawyer''s second blueprint, and his first one that goes sideways! Three pillars hold up a long beam. It crosses two chairs, drops down, and turns into a zig-zag snake on the table.',
  'Sawyer''s imagination',
  'Bridges and buildings use pillars (engineers call them columns) to carry weight down to the ground. The longer the beam between two pillars, the stronger it has to be. That''s why Pillar C stands right under the lower beam.',
  '[{"w": 1, "d": 1, "count": 1}]'::jsonb,
  '{
    "startLayer": 19,
    "photos": ["/photos/snaking-pillar-structure-chairs.jpg"],
    "parts": [
      {"kind": "pillar", "label": "Pillar A", "on": "first chair", "base": {"w": 3, "d": 2, "layers": 4}, "holds": {"part": 2, "block": 1}, "note": "Build it on the seat of the first chair, near the back."},
      {"kind": "pillar", "label": "Pillar B", "on": "first chair", "base": {"w": 3, "d": 2, "layers": 4}, "holds": {"part": 2, "block": 9}, "note": "Build it on the same chair seat, next to Pillar A."},
      {"kind": "path", "label": "The Top Beam", "runs": [{"dir": "E", "n": 13}], "note": "Start on top of Pillar A. The beam sits right on top of Pillar B, then keeps going until it reaches the back of the second chair."},
      {"kind": "path", "label": "The Drop", "runs": [{"dir": "D", "n": 4}], "note": "Hang blocks straight down from the end of the top beam. Sawyer used a TNT block here!"},
      {"kind": "pillar", "label": "Pillar C", "on": "second chair", "base": {"w": 3, "d": 2, "layers": 7}, "holds": {"part": 5, "block": 3}, "note": "Build it on the seat of the second chair, between the chair back and the table."},
      {"kind": "path", "label": "The Lower Beam", "runs": [{"dir": "E", "n": 8}], "note": "Stick it to the side of the last block of the drop and head for the table. Pillar C holds it up."},
      {"kind": "path", "label": "The Snake", "on": "table", "runs": [{"dir": "E", "n": 7}, {"dir": "N", "n": 10}, {"dir": "E", "n": 5}, {"dir": "N", "n": 8}, {"dir": "E", "n": 2}, {"dir": "N", "n": 1}, {"dir": "E", "n": 16}, {"dir": "N", "n": 11}], "note": "Keep going onto the table and zig-zag like a snake!"}
    ]
  }'::jsonb,
  3,
  500,
  'live',
  '/photos/snaking-pillar-structure.jpg',
  (select coalesce(max(sort_order), 0) + 1 from public.blueprints)
)
on conflict (slug) do nothing;

insert into private.blueprint_keys (blueprint_id)
select id from public.blueprints where slug = 'snaking-pillar-structure'
on conflict (blueprint_id) do nothing;

notify pgrst, 'reload schema';

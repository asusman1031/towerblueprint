-- Free-form magnetic block builds: steps of boxes of cubes, so a build can have
-- arms, a head and anything else that isn't a stack of rectangles. Other builds
-- leave `cubes` null; a cube build keeps a one-block placeholder in `sections`.
alter table public.blueprints
  add column if not exists cubes jsonb
    check (cubes is null or (jsonb_typeof(cubes) = 'object' and pg_column_size(cubes) <= 20000));

-- A prize a blueprint won, like "Best Design". Shown as a ribbon.
alter table public.blueprints
  add column if not exists award text check (award is null or char_length(award) <= 40);

-- A fourth level: Ultra Expert.
alter table public.blueprints drop constraint if exists blueprints_difficulty_check;
alter table public.blueprints add constraint blueprints_difficulty_check check (difficulty between 1 and 4);

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
  v_cubes jsonb := case when jsonb_typeof(p_data -> 'cubes') = 'object' then p_data -> 'cubes' end;
begin
  if not private.hq_ok(p_token) then return jsonb_build_object('error', 'not_signed_in'); end if;
  if exists (select 1 from public.blueprints where slug = v_slug and id is distinct from v_id) then
    return jsonb_build_object('error', 'slug_taken');
  end if;

  if v_id is null then
    insert into public.blueprints (
      slug, number, name, tagline, description, inspired_by, fun_fact, sections, structure, tiles, bricks, boxes, dice, paper, cubes,
      difficulty, price_cents, checkout_url, status, designer, award, sort_order
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
      v_cubes,
      coalesce((p_data ->> 'difficulty')::int, 2),
      coalesce((p_data ->> 'price_cents')::int, 500),
      nullif(p_data ->> 'checkout_url', ''),
      coalesce(p_data ->> 'status', 'draft'),
      coalesce(p_data ->> 'designer', ''),
      nullif(p_data ->> 'award', ''),
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
      cubes = v_cubes,
      difficulty = coalesce((p_data ->> 'difficulty')::int, 2),
      price_cents = coalesce((p_data ->> 'price_cents')::int, 500),
      checkout_url = nullif(p_data ->> 'checkout_url', ''),
      status = coalesce(p_data ->> 'status', 'draft'),
      designer = coalesce(p_data ->> 'designer', ''),
      award = nullif(p_data ->> 'award', ''),
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


-- Blueprint No. 014: Sawyer's Flying Ant Tower, the first Ultra Expert build.
insert into public.blueprints (
  slug, number, name, tagline, description, inspired_by, fun_fact, sections, cubes,
  difficulty, price_cents, status, photo_url, designer, award, sort_order
)
values (
  'flying-ant-tower',
  (select coalesce(max(number), 0) + 1 from public.blueprints),
  'The Flying Ant Tower',
  'A giant flying ant with long arms, a big head, and a propeller on top!',
  'Sawyer''s biggest blueprint ever, and the first one at Ultra Expert level! A huge ant made of 415 magnetic blocks: a wide body, long arms that reach way out, a collar, a big head, and a propeller on top so it can fly. Winner of the Best Design award!',
  '',
  'Some ants really can fly! Young queen ants and male ants grow wings and fly off to start new colonies. Ants are super strong too: they can carry things many times heavier than they are.',
  '[{"w": 1, "d": 1, "count": 1}]'::jsonb,
  '{
    "need": "415 magnetic cube blocks (any pictures or colors)",
    "photos": ["/photos/flying-ant-tower-side.webp"],
    "steps": [
      {"label": "The Body: Bottom Half", "note": "Make a wall of blocks 9 wide and 3 deep. Build the same layer 5 times.", "boxes": [{"x": 3, "y": 0, "z": 0, "w": 9, "d": 3, "h": 5}]},
      {"label": "The Body: Top Half", "note": "Five more layers just like the first ones. Now the body is 10 blocks tall!", "boxes": [{"x": 3, "y": 0, "z": 5, "w": 9, "d": 3, "h": 5}]},
      {"label": "The Long Arms", "note": "One long layer, 15 blocks wide. The arms hang out 3 blocks past each side of the body, so hold them while the magnets click.", "boxes": [{"x": 0, "y": 0, "z": 10, "w": 15, "d": 3, "h": 1}]},
      {"label": "The Chest", "note": "A 3 × 3 tower right in the middle, 3 layers tall.", "boxes": [{"x": 6, "y": 0, "z": 11, "w": 3, "d": 3, "h": 3}]},
      {"label": "The Collar", "note": "A 5 × 5 layer that sticks out one block on every side, like a collar.", "boxes": [{"x": 5, "y": -1, "z": 14, "w": 5, "d": 5, "h": 1}]},
      {"label": "The Head", "note": "Back to 3 × 3, for 4 layers.", "boxes": [{"x": 6, "y": 0, "z": 15, "w": 3, "d": 3, "h": 4}]},
      {"label": "The Neck", "note": "Three single blocks straight up from the middle of the head.", "boxes": [{"x": 7, "y": 1, "z": 19, "w": 1, "d": 1, "h": 3}]},
      {"label": "The Propeller", "note": "A plus sign on top: one block in the middle, with 2 more sticking out each way. Now it can fly!", "boxes": [{"x": 5, "y": 1, "z": 22, "w": 5, "d": 1, "h": 1}, {"x": 7, "y": -1, "z": 22, "w": 1, "d": 5, "h": 1}]}
    ]
  }'::jsonb,
  4,
  500,
  'live',
  '/photos/flying-ant-tower.webp',
  '',
  'Best Design',
  (select coalesce(max(sort_order), 0) + 1 from public.blueprints)
)
on conflict (slug) do nothing;

insert into private.blueprint_keys (blueprint_id)
select id from public.blueprints where slug = 'flying-ant-tower'
on conflict (blueprint_id) do nothing;

notify pgrst, 'reload schema';

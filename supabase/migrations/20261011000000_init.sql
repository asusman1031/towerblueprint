-- Tower Blueprints for Kids: initial schema.
--
-- Security model: the website talks to Supabase only from the server.
-- Public tables (blueprints, site_settings) are read-only to the API.
-- Everything private (emails, sales, print keys, HQ sessions) lives in the
-- `private` schema, which the API cannot see; it is reached only through the
-- SECURITY DEFINER functions below, which validate their inputs. HQ functions
-- require a session token issued by hq_login(passcode).

create extension if not exists pgcrypto with schema extensions;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- Blueprints -----------------------------------------------------------------

create table public.blueprints (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 60),
  number int not null unique check (number > 0),
  name text not null check (length(name) between 1 and 80),
  tagline text not null default '' check (length(tagline) <= 160),
  description text not null default '' check (length(description) <= 2000),
  inspired_by text not null default '' check (length(inspired_by) <= 120),
  fun_fact text not null default '' check (length(fun_fact) <= 600),
  sections jsonb not null
    check (jsonb_typeof(sections) = 'array' and jsonb_array_length(sections) between 1 and 20),
  difficulty int not null default 2 check (difficulty between 1 and 3),
  price_cents int not null default 500 check (price_cents between 0 and 100000),
  checkout_url text check (checkout_url is null or checkout_url ~ '^https://'),
  status text not null default 'draft' check (status in ('draft', 'coming_soon', 'live')),
  photo_url text check (photo_url is null or length(photo_url) <= 300),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.blueprints enable row level security;

create policy "Published blueprints are public"
  on public.blueprints for select
  to anon, authenticated
  using (status <> 'draft');

revoke insert, update, delete, truncate on public.blueprints from anon, authenticated;

create table public.site_settings (
  key text primary key check (key in ('architect_note')),
  value text not null default '' check (length(value) <= 2000),
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

create policy "Site settings are public"
  on public.site_settings for select
  to anon, authenticated
  using (true);

revoke insert, update, delete, truncate on public.site_settings from anon, authenticated;

-- Private tables ---------------------------------------------------------------

create table private.blueprint_keys (
  blueprint_id uuid primary key references public.blueprints (id) on delete cascade,
  print_key text not null default encode(extensions.gen_random_bytes(12), 'hex')
);

create table private.blueprint_photos (
  blueprint_id uuid primary key references public.blueprints (id) on delete cascade,
  mime text not null check (mime in ('image/jpeg', 'image/png', 'image/webp')),
  data_b64 text not null check (length(data_b64) <= 1400000),
  updated_at timestamptz not null default now()
);

create table private.signups (
  id bigint generated always as identity primary key,
  email text not null,
  kind text not null check (kind in ('club', 'preorder')),
  blueprint_slug text,
  created_at timestamptz not null default now(),
  unique nulls not distinct (email, kind, blueprint_slug)
);

create table private.events_daily (
  day date not null,
  event text not null check (event in ('visit', 'view_blueprint', 'click_buy')),
  slug text not null default '',
  count int not null default 0,
  primary key (day, event, slug)
);

create table private.sales (
  id bigint generated always as identity primary key,
  blueprint_id uuid references public.blueprints (id) on delete set null,
  amount_cents int not null check (amount_cents between 0 and 100000),
  note text not null default '' check (length(note) <= 200),
  created_at timestamptz not null default now()
);

create table private.hq_secret (
  id int primary key default 1 check (id = 1),
  passcode_hash text not null
);

create table private.hq_sessions (
  token_hash text primary key,
  expires_at timestamptz not null
);

create table private.hq_login_failures (
  at timestamptz not null default now()
);

-- Helpers ----------------------------------------------------------------------

create function private.today() returns date
language sql stable set search_path = ''
as $$ select (now() at time zone 'America/New_York')::date $$;

create function private.hq_ok(p_token text) returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from private.hq_sessions
    where token_hash = encode(extensions.digest(coalesce(p_token, ''), 'sha256'), 'hex')
      and expires_at > now()
  )
$$;

-- Public functions -------------------------------------------------------------

create function public.join_list(p_email text, p_kind text, p_slug text, p_grown_up boolean)
returns text
language plpgsql security definer set search_path = ''
as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_slug text := nullif(trim(coalesce(p_slug, '')), '');
begin
  if p_grown_up is not true then return 'need_grown_up'; end if;
  if length(v_email) > 254 or v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    return 'bad_email';
  end if;
  if p_kind not in ('club', 'preorder') then return 'bad_kind'; end if;
  if p_kind = 'club' then
    v_slug := null;
  elsif not exists (select 1 from public.blueprints b where b.slug = v_slug and b.status <> 'draft') then
    return 'bad_blueprint';
  end if;
  if (select count(*) from private.signups where created_at > now() - interval '1 day') >= 500 then
    return 'busy';
  end if;
  insert into private.signups (email, kind, blueprint_slug)
  values (v_email, p_kind, v_slug)
  on conflict do nothing;
  if found then return 'joined'; end if;
  return 'already';
end
$$;

create function public.track_event(p_event text, p_slug text default '')
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_slug text := coalesce(p_slug, '');
begin
  if p_event not in ('visit', 'view_blueprint', 'click_buy') then return; end if;
  if v_slug <> '' and not exists (select 1 from public.blueprints b where b.slug = v_slug) then
    v_slug := '';
  end if;
  insert into private.events_daily (day, event, slug, count)
  values (private.today(), p_event, v_slug, 1)
  on conflict (day, event, slug) do update set count = private.events_daily.count + 1;
end
$$;

create function public.get_print(p_slug text, p_key text)
returns setof public.blueprints
language sql stable security definer set search_path = ''
as $$
  select b.*
  from public.blueprints b
  join private.blueprint_keys k on k.blueprint_id = b.id
  where b.slug = p_slug and k.print_key = p_key
$$;

create function public.get_blueprint_photo(p_slug text)
returns table (mime text, data_b64 text)
language sql stable security definer set search_path = ''
as $$
  select p.mime, p.data_b64
  from private.blueprint_photos p
  join public.blueprints b on b.id = p.blueprint_id
  where b.slug = p_slug
$$;

-- HQ (Sawyer's dashboard) ----------------------------------------------------

create function public.hq_login(p_passcode text)
returns text
language plpgsql security definer set search_path = ''
as $$
declare
  v_hash text;
  v_token text;
begin
  delete from private.hq_login_failures where at < now() - interval '1 day';
  if (select count(*) from private.hq_login_failures where at > now() - interval '15 minutes') >= 10 then
    return null;
  end if;
  select passcode_hash into v_hash from private.hq_secret where id = 1;
  if v_hash is null or extensions.crypt(coalesce(p_passcode, ''), v_hash) <> v_hash then
    insert into private.hq_login_failures default values;
    return null;
  end if;
  delete from private.hq_sessions where expires_at < now();
  v_token := encode(extensions.gen_random_bytes(24), 'hex');
  insert into private.hq_sessions (token_hash, expires_at)
  values (encode(extensions.digest(v_token, 'sha256'), 'hex'), now() + interval '30 days');
  return v_token;
end
$$;

create function public.hq_logout(p_token text)
returns void
language sql security definer set search_path = ''
as $$
  delete from private.hq_sessions
  where token_hash = encode(extensions.digest(coalesce(p_token, ''), 'sha256'), 'hex')
$$;

create function public.hq_dashboard(p_token text)
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_today date := private.today();
begin
  if not private.hq_ok(p_token) then return null; end if;
  return jsonb_build_object(
    'today', (
      select coalesce(jsonb_object_agg(event, n), '{}'::jsonb)
      from (select event, sum(count) as n from private.events_daily where day = v_today group by event) t
    ),
    'total', (
      select coalesce(jsonb_object_agg(event, n), '{}'::jsonb)
      from (select event, sum(count) as n from private.events_daily group by event) t
    ),
    'daily_visits', (
      select coalesce(jsonb_agg(jsonb_build_object('day', d::date, 'visits', coalesce(v.n, 0)) order by d), '[]'::jsonb)
      from generate_series(v_today - 13, v_today, interval '1 day') d
      left join (
        select day, sum(count) as n from private.events_daily where event = 'visit' group by day
      ) v on v.day = d::date
    ),
    'club', (select count(*) from private.signups where kind = 'club'),
    'preorders', (select count(*) from private.signups where kind = 'preorder'),
    'sales_count', (select count(*) from private.sales),
    'sales_cents', (select coalesce(sum(amount_cents), 0) from private.sales),
    'recent_sales', (
      select coalesce(jsonb_agg(s order by s.created_at desc), '[]'::jsonb)
      from (
        select sa.id, sa.amount_cents, sa.note, sa.created_at, b.name as blueprint
        from private.sales sa
        left join public.blueprints b on b.id = sa.blueprint_id
        order by sa.created_at desc
        limit 12
      ) s
    ),
    'blueprints', (
      select coalesce(jsonb_agg(x order by x.sort_order, x.number), '[]'::jsonb)
      from (
        select
          b.*,
          k.print_key,
          (select count(*) from private.signups s where s.kind = 'preorder' and s.blueprint_slug = b.slug) as preorders,
          (select coalesce(sum(e.count), 0) from private.events_daily e where e.event = 'view_blueprint' and e.slug = b.slug) as views,
          (select coalesce(sum(e.count), 0) from private.events_daily e where e.event = 'click_buy' and e.slug = b.slug) as buy_clicks,
          (select count(*) from private.sales sa where sa.blueprint_id = b.id) as sales
        from public.blueprints b
        left join private.blueprint_keys k on k.blueprint_id = b.id
      ) x
    )
  );
end
$$;

create function public.hq_save_blueprint(p_token text, p_data jsonb)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_id uuid := nullif(p_data ->> 'id', '')::uuid;
  v_slug text := p_data ->> 'slug';
begin
  if not private.hq_ok(p_token) then return jsonb_build_object('error', 'not_signed_in'); end if;
  if exists (select 1 from public.blueprints where slug = v_slug and id is distinct from v_id) then
    return jsonb_build_object('error', 'slug_taken');
  end if;

  if v_id is null then
    insert into public.blueprints (
      slug, number, name, tagline, description, inspired_by, fun_fact, sections,
      difficulty, price_cents, checkout_url, status, sort_order
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
      coalesce((p_data ->> 'difficulty')::int, 2),
      coalesce((p_data ->> 'price_cents')::int, 500),
      nullif(p_data ->> 'checkout_url', ''),
      coalesce(p_data ->> 'status', 'draft'),
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
      difficulty = coalesce((p_data ->> 'difficulty')::int, 2),
      price_cents = coalesce((p_data ->> 'price_cents')::int, 500),
      checkout_url = nullif(p_data ->> 'checkout_url', ''),
      status = coalesce(p_data ->> 'status', 'draft'),
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

create function public.hq_set_photo(p_token text, p_slug text, p_mime text, p_b64 text)
returns text
language plpgsql security definer set search_path = ''
as $$
declare
  v_id uuid;
  v_url text;
begin
  if not private.hq_ok(p_token) then return null; end if;
  select id into v_id from public.blueprints where slug = p_slug;
  if v_id is null then return null; end if;
  insert into private.blueprint_photos (blueprint_id, mime, data_b64, updated_at)
  values (v_id, p_mime, p_b64, now())
  on conflict (blueprint_id) do update
    set mime = excluded.mime, data_b64 = excluded.data_b64, updated_at = now();
  v_url := '/api/photo/' || p_slug || '?v=' || extract(epoch from now())::bigint;
  update public.blueprints set photo_url = v_url, updated_at = now() where id = v_id;
  return v_url;
end
$$;

create function public.hq_add_sale(p_token text, p_blueprint_id uuid, p_amount_cents int, p_note text)
returns boolean
language plpgsql security definer set search_path = ''
as $$
begin
  if not private.hq_ok(p_token) then return false; end if;
  insert into private.sales (blueprint_id, amount_cents, note)
  values (p_blueprint_id, p_amount_cents, left(coalesce(p_note, ''), 200));
  return true;
end
$$;

create function public.hq_delete_sale(p_token text, p_id bigint)
returns boolean
language plpgsql security definer set search_path = ''
as $$
begin
  if not private.hq_ok(p_token) then return false; end if;
  delete from private.sales where id = p_id;
  return found;
end
$$;

create function public.hq_set_setting(p_token text, p_key text, p_value text)
returns boolean
language plpgsql security definer set search_path = ''
as $$
begin
  if not private.hq_ok(p_token) then return false; end if;
  insert into public.site_settings (key, value, updated_at)
  values (p_key, left(coalesce(p_value, ''), 2000), now())
  on conflict (key) do update set value = excluded.value, updated_at = now();
  return true;
end
$$;

-- Only the functions meant for the website are callable through the API.
revoke execute on all functions in schema private from public, anon, authenticated;
revoke execute on function
  public.join_list(text, text, text, boolean),
  public.track_event(text, text),
  public.get_print(text, text),
  public.get_blueprint_photo(text),
  public.hq_login(text),
  public.hq_logout(text),
  public.hq_dashboard(text),
  public.hq_save_blueprint(text, jsonb),
  public.hq_set_photo(text, text, text, text),
  public.hq_add_sale(text, uuid, int, text),
  public.hq_delete_sale(text, bigint),
  public.hq_set_setting(text, text, text)
from public;
grant execute on function
  public.join_list(text, text, text, boolean),
  public.track_event(text, text),
  public.get_print(text, text),
  public.get_blueprint_photo(text),
  public.hq_login(text),
  public.hq_logout(text),
  public.hq_dashboard(text),
  public.hq_save_blueprint(text, jsonb),
  public.hq_set_photo(text, text, text, text),
  public.hq_add_sale(text, uuid, int, text),
  public.hq_delete_sale(text, bigint),
  public.hq_set_setting(text, text, text)
to anon, authenticated, service_role;

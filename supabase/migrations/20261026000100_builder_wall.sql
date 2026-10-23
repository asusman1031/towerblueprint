-- The Builder Wall: young architects from around the country show off their towers.
-- Only a grown-up can send an entry, only a first name, age and state are ever shown,
-- and nothing appears until it is approved in Architect HQ.
create table private.wall_entries (
  id bigint generated always as identity primary key,
  first_name text not null check (length(first_name) between 1 and 30),
  age int check (age is null or age between 2 and 17),
  state text not null check (length(state) between 2 and 40),
  tower_name text not null default '' check (length(tower_name) <= 80),
  blurb text not null default '' check (length(blurb) <= 200),
  parent_email text not null check (length(parent_email) <= 254),
  photo_mime text not null check (photo_mime in ('image/jpeg', 'image/png')),
  photo_b64 text not null check (length(photo_b64) <= 1400000),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create function public.submit_wall_entry(
  p_email text,
  p_consent boolean,
  p_first_name text,
  p_age int,
  p_state text,
  p_tower_name text,
  p_blurb text,
  p_photo_mime text,
  p_photo_b64 text
)
returns text
language plpgsql security definer set search_path = ''
as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_name text := left(trim(coalesce(p_first_name, '')), 30);
  v_state text := left(trim(coalesce(p_state, '')), 40);
  v_photo text := nullif(p_photo_b64, '');
begin
  if p_consent is not true then return 'need_consent'; end if;
  if length(v_email) > 254 or v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    return 'bad_email';
  end if;
  if length(v_name) < 1 then return 'need_name'; end if;
  if p_age is not null and (p_age < 2 or p_age > 17) then return 'bad_age'; end if;
  if length(v_state) < 2 then return 'need_state'; end if;
  if v_photo is null or p_photo_mime not in ('image/jpeg', 'image/png') or length(v_photo) > 1400000 then
    return 'bad_photo';
  end if;
  if (select count(*) from private.wall_entries where created_at > now() - interval '1 day') >= 30 then
    return 'busy';
  end if;
  insert into private.wall_entries (first_name, age, state, tower_name, blurb, parent_email, photo_mime, photo_b64)
  values (
    v_name, p_age, v_state,
    left(trim(coalesce(p_tower_name, '')), 80),
    left(trim(coalesce(p_blurb, '')), 200),
    v_email, p_photo_mime, v_photo
  );
  return 'sent';
end
$$;

-- What the public wall shows: approved entries, no email, no photo data.
create function public.wall_entries()
returns jsonb
language sql stable security definer set search_path = ''
as $$
  select coalesce(jsonb_agg(w order by w.id desc), '[]'::jsonb)
  from (
    select id, first_name, age, state, tower_name, blurb
    from private.wall_entries
    where status = 'approved'
    order by id desc
    limit 200
  ) w
$$;

create function public.wall_photo(p_id bigint)
returns table (mime text, data_b64 text)
language sql stable security definer set search_path = ''
as $$
  select e.photo_mime, e.photo_b64
  from private.wall_entries e
  where e.id = p_id and e.status = 'approved'
$$;

-- Architect HQ: review entries, see the photo, approve or remove.
create function public.hq_wall(p_token text)
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not private.hq_ok(p_token) then return null; end if;
  return (
    select coalesce(jsonb_agg(w order by w.id desc), '[]'::jsonb)
    from (
      select id, first_name, age, state, tower_name, blurb, parent_email, status, created_at
      from private.wall_entries
      order by id desc
      limit 300
    ) w
  );
end
$$;

create function public.hq_wall_photo(p_token text, p_id bigint)
returns table (mime text, data_b64 text)
language sql stable security definer set search_path = ''
as $$
  select e.photo_mime, e.photo_b64
  from private.wall_entries e
  where e.id = p_id and private.hq_ok(p_token)
$$;

create function public.hq_set_wall(p_token text, p_id bigint, p_status text)
returns boolean
language plpgsql security definer set search_path = ''
as $$
begin
  if not private.hq_ok(p_token) then return false; end if;
  if p_status = 'delete' then
    delete from private.wall_entries where id = p_id;
    return found;
  end if;
  update private.wall_entries set status = p_status where id = p_id;
  return found;
exception
  when check_violation then return false;
end
$$;

revoke execute on function
  public.submit_wall_entry(text, boolean, text, int, text, text, text, text, text),
  public.wall_entries(),
  public.wall_photo(bigint),
  public.hq_wall(text),
  public.hq_wall_photo(text, bigint),
  public.hq_set_wall(text, bigint, text)
from public;
grant execute on function
  public.submit_wall_entry(text, boolean, text, int, text, text, text, text, text),
  public.wall_entries(),
  public.wall_photo(bigint),
  public.hq_wall(text),
  public.hq_wall_photo(text, bigint),
  public.hq_set_wall(text, bigint, text)
to anon, authenticated, service_role;

notify pgrst, 'reload schema';

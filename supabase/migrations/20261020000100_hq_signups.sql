-- Lets Architect HQ show who has signed up (Builders Club and reservations).
create or replace function public.hq_signups(p_token text)
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not private.hq_ok(p_token) then return null; end if;
  return (
    select coalesce(jsonb_agg(s order by s.created_at desc), '[]'::jsonb)
    from (
      select email, kind, blueprint_slug, created_at
      from private.signups
      order by created_at desc
      limit 500
    ) s
  );
end
$$;

revoke execute on function public.hq_signups(text) from public;
grant execute on function public.hq_signups(text) to anon, authenticated, service_role;

notify pgrst, 'reload schema';

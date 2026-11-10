-- =====================================================================
--  AZ Arena — 5-ci yeniləmə: təhlükəsizlik
--  * İstifadəçilərin IP ünvanları (yalnız "users" icazəli adminlər görür;
--    baş adminin IP-sini yalnız baş admin görür)
--  * Tor çıxış nöqtələrindən girişin qeydə alınması
--  * DevTools (F12): 2 xəbərdarlıq, 3-cüdə avtomatik blok
-- =====================================================================

alter table public.profiles add column if not exists devtools_strikes int not null default 0;

create table if not exists public.user_ips (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  ip         inet not null,
  is_tor     boolean not null default false,
  user_agent text,
  first_seen timestamptz not null default now(),
  last_seen  timestamptz not null default now(),
  hits       int not null default 1,
  primary key (user_id, ip)
);
create index if not exists user_ips_ip_idx on public.user_ips (ip);

create table if not exists public.security_events (
  id         bigint generated always as identity primary key,
  user_id    uuid references public.profiles(id) on delete cascade,
  kind       text not null check (kind in ('devtools', 'tor')),
  ip         inet,
  created_at timestamptz not null default now()
);
create index if not exists security_events_created_idx on public.security_events (created_at desc);

-- Baş adminin gizliliyi üçün (RLS-dən asılı olmadan yoxlayır)
create or replace function public.is_super_admin_user(p_user uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from staff where user_id = p_user and role = 'super_admin')
$$;
revoke execute on function public.is_super_admin_user(uuid) from public, anon;
grant execute on function public.is_super_admin_user(uuid) to authenticated;

alter table public.user_ips enable row level security;
alter table public.security_events enable row level security;
drop policy if exists user_ips_read on public.user_ips;
drop policy if exists security_events_read on public.security_events;
create policy user_ips_read on public.user_ips for select to authenticated
  using (public.has_perm('users') and (public.is_super_admin() or not public.is_super_admin_user(user_id)));
create policy security_events_read on public.security_events for select to authenticated
  using (public.has_perm('users') and (public.is_super_admin() or not public.is_super_admin_user(user_id)));
revoke insert, update, delete on public.user_ips, public.security_events from anon, authenticated;
revoke all on public.user_ips, public.security_events from anon;

-- IP qeydi: yalnız server (Edge Function "guard", service_role) çağırır
create or replace function public.record_ip(p_user uuid, p_ip text, p_tor boolean, p_ua text) returns void
language plpgsql security definer set search_path = public as $$
begin
  insert into user_ips (user_id, ip, is_tor, user_agent)
  values (p_user, p_ip::inet, coalesce(p_tor, false), left(p_ua, 300))
  on conflict (user_id, ip) do update
    set last_seen = now(), hits = user_ips.hits + 1, is_tor = excluded.is_tor, user_agent = excluded.user_agent;
  if p_tor then
    insert into security_events (user_id, kind, ip) values (p_user, 'tor', p_ip::inet);
  end if;
end $$;
revoke execute on function public.record_ip(uuid, text, boolean, text) from public, anon, authenticated;
grant execute on function public.record_ip(uuid, text, boolean, text) to service_role;

-- DevTools: 1-ci və 2-ci dəfə xəbərdarlıq, 3-cü dəfə blok. Adminlərə tətbiq olunmur.
create or replace function public.security_strike(p_kind text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v int; v_last timestamptz; v_banned boolean;
begin
  if auth.uid() is null then return jsonb_build_object('strikes', 0, 'banned', false); end if;
  if p_kind <> 'devtools' then raise exception 'Naməlum hadisə'; end if;
  if public.is_staff() then return jsonb_build_object('strikes', 0, 'banned', false, 'staff', true); end if;

  select max(created_at) into v_last from security_events where user_id = auth.uid() and kind = 'devtools';
  if v_last is null or v_last < now() - interval '15 seconds' then
    insert into security_events (user_id, kind) values (auth.uid(), 'devtools');
    update profiles set devtools_strikes = devtools_strikes + 1 where id = auth.uid() returning devtools_strikes, is_banned into v, v_banned;
  else
    select devtools_strikes, is_banned into v, v_banned from profiles where id = auth.uid();
  end if;

  if v >= 3 and not v_banned then
    update profiles set is_banned = true, ban_reason = 'DevTools (F12) istifadəsi. Admin blokdan çıxarmalıdır.' where id = auth.uid();
    insert into audit_log (actor_id, action, target_type, target_id, details)
    values (null, 'devtools_ban', 'user', auth.uid()::text, jsonb_build_object('strikes', v));
  end if;
  return jsonb_build_object('strikes', v, 'banned', v >= 3);
end $$;
revoke execute on function public.security_strike(text) from public, anon;
grant execute on function public.security_strike(text) to authenticated;

-- Blokdan çıxaranda DevTools sayğacı sıfırlanır
create or replace function public.set_ban(p_user uuid, p_value boolean, p_reason text default null) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.has_perm('users') then raise exception 'İcazə yoxdur'; end if;
  if not public.can_act_on(p_user) then raise exception 'Bu istifadəçiyə bu əməliyyat tətbiq edilə bilməz'; end if;
  update profiles
     set is_banned = p_value,
         ban_reason = case when p_value then left(p_reason, 200) end,
         devtools_strikes = case when p_value then devtools_strikes else 0 end
   where id = p_user;
  if not found then raise exception 'İstifadəçi tapılmadı'; end if;
  perform public.log_action(case when p_value then 'ban' else 'unban' end, 'user', p_user::text,
                            jsonb_build_object('reason', p_reason));
end $$;

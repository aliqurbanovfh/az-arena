-- =====================================================================
--  AZ Arena — 3-cü yeniləmə: M10 ödənişi və klan yaratma icazəsi
--  Supabase → SQL Editor → bu faylın hamısını yapışdır → Run (bir dəfə)
-- =====================================================================

-- ---------- M10 ----------
alter table public.events add column if not exists m10_number text
  check (m10_number is null or m10_number ~ '^\+?[0-9 ()-]{9,20}$');
grant update (m10_number) on public.events to authenticated;

alter table public.event_entries add column if not exists pay_method text
  check (pay_method is null or pay_method in ('card', 'm10'));

-- Ödənişli tədbirdə kart və ya M10 nömrəsindən biri olmalıdır
create or replace function public.events_validate() returns trigger
language plpgsql security definer set search_path = public as $$
declare s settings%rowtype; v_uid uuid := auth.uid(); v_open int;
begin
  select * into s from settings where id = 1;

  if tg_op = 'INSERT' then
    if v_uid is not null then new.creator_id := v_uid; end if;
    new.taken := 0;
    new.status := 'open';
    if new.starts_at < now() then raise exception 'Başlama vaxtı keçmiş ola bilməz'; end if;
  end if;

  if v_uid is null then return new; end if;

  if tg_op = 'UPDATE' and (new.kind, new.entry_fee, new.slots, new.card_number, new.m10_number)
       is not distinct from (old.kind, old.entry_fee, old.slots, old.card_number, old.m10_number) then
    return new;
  end if;

  if new.kind = 'tournament' and (tg_op = 'INSERT' or old.kind <> 'tournament') and not public.can_host_tournament() then
    raise exception 'Böyük turnir yaratmaq üçün icazəniz yoxdur. Scream yarada bilərsiniz.';
  end if;

  if new.kind = 'scream' and not public.has_perm('events') then
    if new.entry_fee > s.max_scream_fee then
      raise exception 'Scream üçün giriş haqqı ən çox % AZN ola bilər', s.max_scream_fee;
    end if;
    if new.slots > s.max_scream_slots then
      raise exception 'Scream üçün ən çox % yer ola bilər', s.max_scream_slots;
    end if;
    if tg_op = 'INSERT' then
      select count(*) into v_open from events
      where creator_id = v_uid and kind = 'scream' and status in ('open', 'closed') and starts_at > now();
      if v_open >= s.max_open_screams then
        raise exception 'Eyni anda ən çox % açıq scream ola bilər', s.max_open_screams;
      end if;
    end if;
  end if;

  if new.entry_fee > 0 and coalesce(trim(new.card_number), '') = '' and coalesce(trim(new.m10_number), '') = '' then
    raise exception 'Ödənişli tədbir üçün kart və ya M10 nömrəsi yazın';
  end if;
  if tg_op = 'UPDATE' and new.slots < old.taken then
    raise exception 'Yer sayı artıq qoşulanlardan (%) az ola bilməz', old.taken;
  end if;
  return new;
end $$;

-- ---------- Klan yaratma icazəsi ----------
alter table public.profiles add column if not exists can_create_clan boolean not null default false;

create or replace function public.squads_before_insert() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null then
    new.leader_id := auth.uid();
    if new.kind = 'clan' and not public.has_perm('squads')
       and not coalesce((select can_create_clan from profiles where id = auth.uid()), false) then
      raise exception 'Klan yaratmaq üçün admin icazəsi lazımdır';
    end if;
  end if;
  new.members_count := 1;
  if exists (select 1 from squad_members where user_id = new.leader_id and kind = new.kind and status = 'member') then
    raise exception 'Siz artıq bir % üzvüsünüz', case new.kind when 'clan' then 'klanın' else 'komandanın' end;
  end if;
  return new;
end $$;

create or replace function public.set_clan_creator(p_user uuid, p_value boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.has_perm('squads') or public.is_banned() then raise exception 'İcazə yoxdur'; end if;
  update profiles set can_create_clan = p_value where id = p_user;
  if not found then raise exception 'İstifadəçi tapılmadı'; end if;
  perform public.log_action(case when p_value then 'clan_creator_on' else 'clan_creator_off' end, 'user', p_user::text);
end $$;
revoke execute on function public.set_clan_creator(uuid, boolean) from public, anon;
grant execute on function public.set_clan_creator(uuid, boolean) to authenticated;

create or replace function public.get_my_access() returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'role',            coalesce(s.role, 'user'),
    'permissions',     case when s.role = 'super_admin' then to_jsonb(public.all_permissions())
                            else to_jsonb(coalesce(s.permissions, '{}'::text[])) end,
    'is_organizer',    coalesce(p.is_organizer, false),
    'can_create_clan', coalesce(p.can_create_clan, false),
    'is_banned',       coalesce(p.is_banned, false),
    'ban_reason',      p.ban_reason
  )
  from (select auth.uid() as uid) me
  left join profiles p on p.id = me.uid
  left join staff s on s.user_id = me.uid
$$;

-- AZ Arena — 02 + 03 + 04 yeniləmələri bir yerdə (şəkillər, M10, klan icazəsi, çat)
-- Supabase → SQL Editor → hamısını yapışdır → Run. Bir neçə dəfə işlətmək də zərərsizdir.

-- =====================================================================
--  AZ Arena — 2-ci yeniləmə: şəkillər
--  Qarşılama ekranı şəkilləri (baş admin yükləyir) və tədbir örtük şəkilləri.
--  Supabase → SQL Editor → bu faylın hamısını yapışdır → Run (bir dəfə)
-- =====================================================================

alter table public.settings add column if not exists hero_images text[] not null default '{}';
alter table public.events   add column if not exists cover_url text
  check (cover_url is null or (cover_url like 'https://%' and char_length(cover_url) <= 500));

grant update (hero_images) on public.settings to authenticated;
grant update (cover_url)   on public.events   to authenticated;

-- Açıq şəkil yaddaşı (qarşılama və örtük şəkilləri hər kəsə görünür)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists media_upload on storage.objects;
drop policy if exists media_delete_own on storage.objects;

-- Hər kəs yalnız öz qovluğuna yükləyə bilər: {user_id}/...
create policy media_upload on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text and not public.is_banned());

create policy media_delete_own on storage.objects for delete to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);

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

-- =====================================================================
--  AZ Arena — 4-cü yeniləmə: çat
--  Ümumi çat + hər klan/komanda üçün ayrıca çat.
--  30 dəqiqədən köhnə mesajlar görünmür və avtomatik silinir.
--  Supabase → SQL Editor → bu faylın hamısını yapışdır → Run (bir dəfə)
-- =====================================================================

create table if not exists public.messages (
  id         bigint generated always as identity primary key,
  room       text not null check (room = 'global' or room ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'),
  user_id    uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  body       text not null check (char_length(btrim(body)) between 1 and 500),
  created_at timestamptz not null default now()
);
create index if not exists messages_room_idx on public.messages (room, id desc);
create index if not exists messages_created_idx on public.messages (created_at);

-- Otağa giriş: ümumi çat hər kəsə, klan çatı yalnız üzvlərə (və klan adminlərinə)
create or replace function public.can_chat(p_room text) returns boolean
language sql stable security definer set search_path = public as $$
  select auth.uid() is not null and (
    p_room = 'global'
    or public.has_perm('squads')
    or exists (select 1 from squad_members
               where squad_id::text = p_room and user_id = auth.uid() and status = 'member')
  )
$$;

-- Göndərmədən əvvəl: müəllif, vaxt, sürət limiti (2 saniyədə 1 mesaj)
create or replace function public.messages_before_insert() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null then new.user_id := auth.uid(); end if;
  new.created_at := now();
  new.body := btrim(new.body);
  if exists (select 1 from messages where user_id = new.user_id and created_at > now() - interval '2 seconds') then
    raise exception 'Çox tez yazırsınız, bir az gözləyin';
  end if;
  return new;
end $$;

-- Göndərdikdən sonra: 30 dəqiqədən köhnə mesajları sil
create or replace function public.messages_cleanup() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  delete from messages where created_at < now() - interval '30 minutes';
  return null;
end $$;

drop trigger if exists messages_before_insert on public.messages;
create trigger messages_before_insert before insert on public.messages
  for each row execute function public.messages_before_insert();
drop trigger if exists messages_cleanup on public.messages;
create trigger messages_cleanup after insert on public.messages
  for each statement execute function public.messages_cleanup();

alter table public.messages enable row level security;
drop policy if exists messages_read on public.messages;
drop policy if exists messages_insert on public.messages;
drop policy if exists messages_delete on public.messages;
create policy messages_read on public.messages for select to authenticated
  using (created_at > now() - interval '30 minutes' and public.can_chat(room));
create policy messages_insert on public.messages for insert to authenticated
  with check (user_id = auth.uid() and not public.is_banned() and public.can_chat(room));
create policy messages_delete on public.messages for delete to authenticated
  using (user_id = auth.uid() or public.has_perm('moderation'));

revoke update on public.messages from anon, authenticated;
revoke all on public.messages from anon;

-- Canlı mesajlar (Realtime)
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'messages') then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;

-- Əlavə: heç kim yazmasa belə, hər 30 dəqiqədən bir təmizləmə (pg_cron varsa)
do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    create extension if not exists pg_cron;
    perform cron.unschedule(jobid) from cron.job where jobname = 'chat-cleanup';
    perform cron.schedule('chat-cleanup', '*/30 * * * *',
      $c$delete from public.messages where created_at < now() - interval '30 minutes'$c$);
  end if;
exception when others then
  raise notice 'pg_cron qurulmadı (%). Təmizləmə yenə də hər yeni mesajda işləyir.', sqlerrm;
end $$;

-- ---------- Təhlükəsizlik: daxili trigger funksiyaları kənardan çağırıla bilməz ----------
alter function public.all_permissions() set search_path = public;
alter function public.squad_max(text) set search_path = public;
do $$
declare f text;
begin
  foreach f in array array[
    'public.handle_new_user()', 'public.events_validate()', 'public.events_after_delete()',
    'public.entries_before_insert()', 'public.entries_recount()',
    'public.squads_before_insert()', 'public.squads_after_insert()', 'public.squad_members_recount()', 'public.squads_after_delete()',
    'public.listings_before_insert()', 'public.listings_after_delete()',
    'public.messages_before_insert()', 'public.messages_cleanup()'
  ] loop
    execute format('revoke execute on function %s from public, anon, authenticated', f);
  end loop;
end $$;

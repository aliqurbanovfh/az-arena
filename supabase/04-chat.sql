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

-- =====================================================================
--  AZ Arena — Supabase verilənlər bazası
--  Supabase → SQL Editor → bu faylın hamısını yapışdır → Run
--  (Bir dəfə işə salınır. Yenidən işə salmaq lazım olsa, əvvəlcə
--   README-dəki "Bazanı sıfırlamaq" bölməsinə bax.)
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------
-- 1. CƏDVƏLLƏR
-- ---------------------------------------------------------------------

-- İstifadəçi profilləri (hər qeydiyyatda avtomatik yaranır)
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  username     text not null unique check (username ~ '^[a-z0-9_]{3,20}$'),
  nick         text not null check (char_length(nick) between 1 and 30),
  pubg_id      text check (pubg_id is null or pubg_id ~ '^[0-9]{5,15}$'),
  telegram     text check (telegram is null or char_length(telegram) <= 40),
  bio          text check (bio is null or char_length(bio) <= 300),
  is_organizer boolean not null default false,   -- böyük turnir yarada bilər
  is_banned    boolean not null default false,
  ban_reason   text,
  created_at   timestamptz not null default now()
);

-- Adminlər. Baş admin də buradadır, amma heç kimə görünmür.
create table public.staff (
  user_id     uuid primary key references public.profiles(id) on delete cascade,
  role        text not null check (role in ('admin', 'super_admin')),
  permissions text[] not null default '{}',
  created_at  timestamptz not null default now()
);

-- Sayt ayarları (tək sətir)
create table public.settings (
  id                 int primary key default 1 check (id = 1),
  site_notice        text,                         -- yuxarıdakı elan zolağı
  telegram_group     text,                         -- Telegram qrupunun linki
  max_scream_fee     numeric(8,2) not null default 2.00,
  max_scream_slots   int not null default 100,
  max_open_screams   int not null default 3,       -- bir adamın eyni anda açıq scream sayı
  updated_at         timestamptz not null default now()
);
insert into public.settings (id) values (1);

-- Turnirlər və screamlər
create table public.events (
  id             uuid primary key default gen_random_uuid(),
  kind           text not null check (kind in ('scream', 'tournament')),
  title          text not null check (char_length(title) between 3 and 80),
  description    text check (description is null or char_length(description) <= 2000),
  mode           text check (mode is null or char_length(mode) <= 40),   -- Solo / Duo / Squad / TDM ...
  map            text check (map is null or char_length(map) <= 40),
  org_name       text check (org_name is null or char_length(org_name) <= 40), -- "Təşkilatçı" kimi göstərilən ad
  starts_at      timestamptz not null,
  reveal_minutes int not null default 10 check (reveal_minutes between 0 and 180),
  entry_fee      numeric(8,2) not null default 0 check (entry_fee >= 0),
  prize          text check (prize is null or char_length(prize) <= 200),
  slots          int not null check (slots between 1 and 1000),
  taken          int not null default 0,           -- gözləyən + təsdiqlənmiş
  card_number    text check (card_number is null or char_length(card_number) <= 30),
  card_holder    text check (card_holder is null or char_length(card_holder) <= 60),
  status         text not null default 'open' check (status in ('open', 'closed', 'finished', 'cancelled')),
  results        text check (results is null or char_length(results) <= 2000),
  creator_id     uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  created_at     timestamptz not null default now()
);
create index events_starts_idx on public.events (starts_at);

-- Otaq ID və şifrəsi — ayrıca saxlanılır, yalnız təsdiqlənmişlərə açılır
create table public.event_secrets (
  event_id      uuid primary key references public.events(id) on delete cascade,
  room_id       text check (room_id is null or char_length(room_id) <= 40),
  room_password text check (room_password is null or char_length(room_password) <= 40),
  updated_at    timestamptz not null default now()
);

-- Qoşulma sorğuları (çek şəkli ilə)
create table public.event_entries (
  id            uuid primary key default gen_random_uuid(),
  event_id      uuid not null references public.events(id) on delete cascade,
  user_id       uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  team_name     text check (team_name is null or char_length(team_name) <= 40),
  pubg_nick     text,
  pubg_id       text,
  receipt_path  text,
  status        text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reject_reason text check (reject_reason is null or char_length(reject_reason) <= 200),
  reviewed_at   timestamptz,
  created_at    timestamptz not null default now(),
  unique (event_id, user_id)
);
create index entries_status_idx on public.event_entries (status);

-- Klanlar və komandalar (ekiplər)
create table public.squads (
  id            uuid primary key default gen_random_uuid(),
  kind          text not null check (kind in ('clan', 'team')),
  name          text not null check (char_length(name) between 2 and 30),
  tag           text check (tag is null or char_length(tag) <= 6),
  description   text check (description is null or char_length(description) <= 1000),
  recruiting    boolean not null default true,
  leader_id     uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  members_count int not null default 1,
  created_at    timestamptz not null default now()
);
create unique index squads_name_uq on public.squads (kind, lower(name));

create table public.squad_members (
  squad_id   uuid not null references public.squads(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  kind       text not null check (kind in ('clan', 'team')),
  role       text not null default 'member' check (role in ('leader', 'officer', 'member')),
  status     text not null default 'pending' check (status in ('pending', 'member')),
  created_at timestamptz not null default now(),
  primary key (squad_id, user_id)
);
-- Hər adam yalnız 1 klanda və 1 komandada üzv ola bilər
create unique index squad_one_per_kind on public.squad_members (user_id, kind) where status = 'member';

-- Elanlar
create table public.listings (
  id          uuid primary key default gen_random_uuid(),
  category    text not null check (category in ('account_sale', 'account_rent', 'looking_for_team', 'looking_for_players', 'clan_recruit', 'other')),
  title       text not null check (char_length(title) between 3 and 80),
  description text check (description is null or char_length(description) <= 1500),
  price       numeric(10,2) check (price is null or price >= 0),
  price_unit  text check (price_unit is null or char_length(price_unit) <= 20),
  contact     text check (contact is null or char_length(contact) <= 60),
  is_active   boolean not null default true,
  author_id   uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null default now() + interval '30 days'
);
create index listings_created_idx on public.listings (created_at desc);

-- Şikayətlər
create table public.reports (
  id          uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('listing', 'user', 'event', 'squad')),
  target_id   uuid not null,
  reason      text not null check (char_length(reason) between 3 and 500),
  reporter_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  status      text not null default 'open' check (status in ('open', 'resolved')),
  created_at  timestamptz not null default now(),
  unique (reporter_id, target_type, target_id)
);

-- Əməliyyat jurnalı (kim nəyi təsdiqlədi, kimi blokladı və s.)
create table public.audit_log (
  id          bigint generated always as identity primary key,
  actor_id    uuid,
  action      text not null,
  target_type text,
  target_id   text,
  details     jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 2. KÖMƏKÇİ FUNKSİYALAR (icazə yoxlamaları)
-- ---------------------------------------------------------------------

create or replace function public.all_permissions() returns text[]
language sql immutable as $$
  select array['payments', 'events', 'organizers', 'users', 'moderation', 'squads', 'audit']
$$;

create or replace function public.is_super_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from staff where user_id = auth.uid() and role = 'super_admin')
$$;

create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from staff where user_id = auth.uid())
$$;

create or replace function public.has_perm(p text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from staff
    where user_id = auth.uid() and (role = 'super_admin' or p = any (permissions))
  )
$$;

create or replace function public.is_banned() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select is_banned from profiles where id = auth.uid()), false)
$$;

create or replace function public.can_host_tournament() returns boolean
language sql stable security definer set search_path = public as $$
  select public.has_perm('events')
      or coalesce((select is_organizer from profiles where id = auth.uid()), false)
$$;

-- Jurnala yazmaq (yalnız daxili funksiyalar çağırır)
create or replace function public.log_action(p_action text, p_target_type text, p_target_id text, p_details jsonb default '{}')
returns void language sql security definer set search_path = public as $$
  insert into audit_log (actor_id, action, target_type, target_id, details)
  values (auth.uid(), p_action, p_target_type, p_target_id, coalesce(p_details, '{}'))
$$;
revoke execute on function public.log_action(text, text, text, jsonb) from public, anon, authenticated;

-- Hədəf istifadəçiyə admin əməliyyatı tətbiq etmək olarmı?
-- (Baş admin heç vaxt hədəf ola bilməz, adminlər yalnız baş admin tərəfindən.)
create or replace function public.can_act_on(p_user uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select auth.uid() is not null and p_user <> auth.uid()
     and not exists (select 1 from staff where user_id = p_user and role = 'super_admin')
     and (public.is_super_admin() or not exists (select 1 from staff where user_id = p_user))
$$;
revoke execute on function public.can_act_on(uuid) from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- 3. QEYDİYYAT: yeni istifadəçi → profil
-- ---------------------------------------------------------------------

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_meta jsonb := coalesce(new.raw_user_meta_data, '{}');
  v_username text;
begin
  v_username := lower(coalesce(nullif(v_meta->>'username', ''), split_part(new.email, '@', 1)));
  v_username := regexp_replace(v_username, '[^a-z0-9_]', '', 'g');
  if char_length(v_username) < 3 then
    v_username := 'user_' || substr(replace(new.id::text, '-', ''), 1, 8);
  end if;
  insert into public.profiles (id, username, nick, pubg_id, telegram)
  values (
    new.id,
    left(v_username, 20),
    left(coalesce(nullif(v_meta->>'nick', ''), v_username), 30),
    nullif(v_meta->>'pubg_id', ''),
    nullif(v_meta->>'telegram', '')
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.username_available(p_username text) returns boolean
language sql stable security definer set search_path = public as $$
  select not exists (select 1 from profiles where username = lower(p_username))
$$;

-- Daxil olmuş istifadəçinin öz hüquqları (sayt menyusu üçün)
create or replace function public.get_my_access() returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'role',         coalesce(s.role, 'user'),
    'permissions',  case when s.role = 'super_admin' then to_jsonb(public.all_permissions())
                         else to_jsonb(coalesce(s.permissions, '{}'::text[])) end,
    'is_organizer', coalesce(p.is_organizer, false),
    'is_banned',    coalesce(p.is_banned, false),
    'ban_reason',   p.ban_reason
  )
  from (select auth.uid() as uid) me
  left join profiles p on p.id = me.uid
  left join staff s on s.user_id = me.uid
$$;

-- ---------------------------------------------------------------------
-- 4. ADMİN İDARƏETMƏSİ
-- ---------------------------------------------------------------------

-- Adminlik vermək / icazələri dəyişmək (YALNIZ baş admin)
create or replace function public.grant_admin(p_user uuid, p_perms text[]) returns void
language plpgsql security definer set search_path = public as $$
declare v_perms text[];
begin
  if not public.is_super_admin() then raise exception 'İcazə yoxdur'; end if;
  if p_user = auth.uid() then raise exception 'Bu əməliyyat mümkün deyil'; end if;
  if not exists (select 1 from profiles where id = p_user) then raise exception 'İstifadəçi tapılmadı'; end if;
  select coalesce(array_agg(distinct x), '{}') into v_perms
  from unnest(coalesce(p_perms, '{}')) x where x = any (public.all_permissions());
  insert into staff (user_id, role, permissions) values (p_user, 'admin', v_perms)
  on conflict (user_id) do update set permissions = excluded.permissions
  where staff.role = 'admin';
  perform public.log_action('admin_grant', 'user', p_user::text, jsonb_build_object('permissions', v_perms));
end $$;

create or replace function public.revoke_admin(p_user uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_super_admin() then raise exception 'İcazə yoxdur'; end if;
  delete from staff where user_id = p_user and role = 'admin';
  perform public.log_action('admin_revoke', 'user', p_user::text);
end $$;

-- Böyük turnir yaratmaq icazəsi (təşkilatçı)
create or replace function public.set_organizer(p_user uuid, p_value boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.has_perm('organizers') or public.is_banned() then raise exception 'İcazə yoxdur'; end if;
  update profiles set is_organizer = p_value where id = p_user;
  if not found then raise exception 'İstifadəçi tapılmadı'; end if;
  perform public.log_action(case when p_value then 'organizer_on' else 'organizer_off' end, 'user', p_user::text);
end $$;

-- Bloklamaq / blokdan çıxarmaq
create or replace function public.set_ban(p_user uuid, p_value boolean, p_reason text default null) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.has_perm('users') then raise exception 'İcazə yoxdur'; end if;
  if not public.can_act_on(p_user) then raise exception 'Bu istifadəçiyə bu əməliyyat tətbiq edilə bilməz'; end if;
  update profiles set is_banned = p_value, ban_reason = case when p_value then left(p_reason, 200) end where id = p_user;
  if not found then raise exception 'İstifadəçi tapılmadı'; end if;
  perform public.log_action(case when p_value then 'ban' else 'unban' end, 'user', p_user::text,
                            jsonb_build_object('reason', p_reason));
end $$;

-- Şifrəni unudan istifadəçiyə yeni şifrə təyin etmək
create or replace function public.admin_reset_password(p_user uuid, p_password text) returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  if not public.has_perm('users') then raise exception 'İcazə yoxdur'; end if;
  if not public.can_act_on(p_user) then raise exception 'Bu istifadəçiyə bu əməliyyat tətbiq edilə bilməz'; end if;
  if char_length(coalesce(p_password, '')) < 6 then raise exception 'Şifrə ən azı 6 simvol olmalıdır'; end if;
  update auth.users set encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf')), updated_at = now()
  where id = p_user;
  if not found then raise exception 'İstifadəçi tapılmadı'; end if;
  perform public.log_action('password_reset', 'user', p_user::text);
end $$;

-- Jurnal: baş adminin etdikləri digər adminlərə "Sistem" kimi görünür
create or replace function public.get_audit(p_limit int default 50, p_offset int default 0)
returns table (id bigint, created_at timestamptz, actor text, action text, target_type text, target_id text, target_name text, details jsonb)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.has_perm('audit') then raise exception 'İcazə yoxdur'; end if;
  return query
  select a.id, a.created_at,
         case
           when a.actor_id is null then 'Sistem'
           when not public.is_super_admin()
                and exists (select 1 from staff s where s.user_id = a.actor_id and s.role = 'super_admin') then 'Sistem'
           else coalesce(p.nick || ' (@' || p.username || ')', 'silinmiş')
         end,
         a.action, a.target_type, a.target_id,
         case a.target_type
           when 'user'  then (select t.nick || ' (@' || t.username || ')' from profiles t where t.id::text = a.target_id)
           when 'event' then (select e.title from events e where e.id::text = a.target_id)
           else null
         end,
         a.details
  from audit_log a
  left join profiles p on p.id = a.actor_id
  order by a.id desc
  limit least(greatest(p_limit, 1), 200) offset greatest(p_offset, 0);
end $$;

-- ---------------------------------------------------------------------
-- 5. TURNİR / SCREAM QAYDALARI
-- ---------------------------------------------------------------------

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

  -- SQL Editor-dan (auth.uid() boş) edilən dəyişikliklərə məhdudiyyət yoxdur
  if v_uid is null then return new; end if;

  -- Yalnız "taken" sayı yenilənirsə (daxili), yoxlamaya ehtiyac yoxdur
  if tg_op = 'UPDATE' and (new.kind, new.entry_fee, new.slots, new.card_number)
       is not distinct from (old.kind, old.entry_fee, old.slots, old.card_number) then
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

  if new.entry_fee > 0 and coalesce(trim(new.card_number), '') = '' then
    raise exception 'Ödənişli tədbir üçün kart nömrəsi yazın';
  end if;
  if tg_op = 'UPDATE' and new.slots < old.taken then
    raise exception 'Yer sayı artıq qoşulanlardan (%) az ola bilməz', old.taken;
  end if;
  return new;
end $$;

create trigger events_validate before insert or update on public.events
  for each row execute function public.events_validate();

-- Admin başqasının turnirini silsə — jurnala düşür
create or replace function public.events_after_delete() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and auth.uid() <> old.creator_id then
    perform public.log_action('event_delete', 'event', old.id::text, jsonb_build_object('title', old.title));
  end if;
  return old;
end $$;
create trigger events_after_delete after delete on public.events
  for each row execute function public.events_after_delete();

-- Qoşulma: yer, vaxt, çek yoxlaması; pulsuz tədbirdə avtomatik təsdiq
create or replace function public.entries_before_insert() returns trigger
language plpgsql security definer set search_path = public as $$
declare e events%rowtype; p profiles%rowtype;
begin
  select * into e from events where id = new.event_id for update;
  if not found then raise exception 'Tədbir tapılmadı'; end if;
  if e.status <> 'open' then raise exception 'Qeydiyyat bağlıdır'; end if;
  if e.starts_at <= now() then raise exception 'Tədbir artıq başlayıb'; end if;
  if e.taken >= e.slots then raise exception 'Təəssüf, yer qalmayıb'; end if;

  if e.entry_fee > 0 then
    if new.receipt_path is null or new.receipt_path not like new.user_id::text || '/' || e.id::text || '/%' then
      raise exception 'Ödəniş çekinin şəklini yükləyin';
    end if;
    new.status := 'pending';
    new.reviewed_at := null;
  else
    new.receipt_path := null;
    new.status := 'approved';
    new.reviewed_at := now();
  end if;
  new.reject_reason := null;

  select * into p from profiles where id = new.user_id;
  new.pubg_nick := coalesce(nullif(trim(new.pubg_nick), ''), p.nick);
  new.pubg_id   := coalesce(nullif(trim(new.pubg_id), ''), p.pubg_id);
  return new;
end $$;
create trigger entries_before_insert before insert on public.event_entries
  for each row execute function public.entries_before_insert();

-- "taken" sayını həmişə düzgün saxlamaq
create or replace function public.entries_recount() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_event uuid := coalesce(new.event_id, old.event_id);
begin
  update events set taken = (
    select count(*) from event_entries where event_id = v_event and status in ('pending', 'approved')
  ) where id = v_event;
  return null;
end $$;
create trigger entries_recount after insert or update or delete on public.event_entries
  for each row execute function public.entries_recount();

-- Ödənişi təsdiq / ləğv etmək (tədbirin sahibi və ya "payments" icazəli admin)
create or replace function public.review_entry(p_entry uuid, p_approve boolean, p_reason text default null) returns void
language plpgsql security definer set search_path = public as $$
declare r event_entries%rowtype; e events%rowtype;
begin
  select * into r from event_entries where id = p_entry for update;
  if not found then raise exception 'Sorğu tapılmadı'; end if;
  select * into e from events where id = r.event_id;
  if auth.uid() is null or public.is_banned() or not (coalesce(e.creator_id = auth.uid(), false) or public.has_perm('payments')) then
    raise exception 'İcazə yoxdur';
  end if;
  if p_approve and r.status = 'rejected' and e.taken >= e.slots then
    raise exception 'Yer qalmayıb, təsdiqləmək mümkün deyil';
  end if;
  update event_entries
     set status = case when p_approve then 'approved' else 'rejected' end,
         reject_reason = case when p_approve then null else left(nullif(trim(p_reason), ''), 200) end,
         reviewed_at = now()
   where id = p_entry;
  perform public.log_action(case when p_approve then 'entry_approve' else 'entry_reject' end, 'event', e.id::text,
          jsonb_build_object('user_id', r.user_id, 'nick', r.pubg_nick, 'reason', p_reason, 'fee', e.entry_fee));
end $$;

-- Ləğv olunmuş sorğu üçün yeni çek yükləmək
create or replace function public.resubmit_entry(p_entry uuid, p_path text) returns void
language plpgsql security definer set search_path = public as $$
declare r event_entries%rowtype; e events%rowtype;
begin
  select * into r from event_entries where id = p_entry and user_id = auth.uid() for update;
  if not found then raise exception 'Sorğu tapılmadı'; end if;
  if r.status <> 'rejected' then raise exception 'Yalnız ləğv olunmuş sorğu üçün yeni çek göndərmək olar'; end if;
  select * into e from events where id = r.event_id for update;
  if e.status <> 'open' or e.starts_at <= now() then raise exception 'Qeydiyyat bağlıdır'; end if;
  if e.taken >= e.slots then raise exception 'Təəssüf, yer qalmayıb'; end if;
  if p_path is null or p_path not like auth.uid()::text || '/' || e.id::text || '/%' then
    raise exception 'Çek şəkli düzgün deyil';
  end if;
  update event_entries set receipt_path = p_path, status = 'pending', reject_reason = null, reviewed_at = null
   where id = p_entry;
end $$;

-- Otaq kodu: təsdiqlənmişlərə başlamadan "reveal_minutes" dəqiqə əvvəl açılır
create or replace function public.get_room(p_event uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare e events%rowtype; sec event_secrets%rowtype; v_reveal timestamptz; v_manager boolean; v_approved boolean;
begin
  select * into e from events where id = p_event;
  if not found then raise exception 'Tədbir tapılmadı'; end if;
  v_reveal := e.starts_at - make_interval(mins => e.reveal_minutes);
  v_manager := coalesce(e.creator_id = auth.uid(), false) or public.has_perm('events');
  v_approved := exists (select 1 from event_entries where event_id = p_event and user_id = auth.uid() and status = 'approved');
  select * into sec from event_secrets where event_id = p_event;

  if v_manager or (v_approved and now() >= v_reveal and e.status <> 'cancelled') then
    return jsonb_build_object('available', sec.room_id is not null, 'room_id', sec.room_id,
                              'room_password', sec.room_password, 'reveal_at', v_reveal, 'manager', v_manager);
  end if;
  return jsonb_build_object('available', false, 'reveal_at', v_reveal, 'approved', v_approved, 'manager', false);
end $$;

-- ---------------------------------------------------------------------
-- 6. KLANLAR VƏ KOMANDALAR
-- ---------------------------------------------------------------------

create or replace function public.squad_max(p_kind text) returns int
language sql immutable as $$
  select case p_kind when 'team' then 6 else 100 end   -- komanda: 4 əsas + 2 ehtiyat, klan: 100
$$;

create or replace function public.squads_before_insert() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null then new.leader_id := auth.uid(); end if;
  new.members_count := 1;
  if exists (select 1 from squad_members where user_id = new.leader_id and kind = new.kind and status = 'member') then
    raise exception 'Siz artıq bir % üzvüsünüz', case new.kind when 'clan' then 'klanın' else 'komandanın' end;
  end if;
  return new;
end $$;
create trigger squads_before_insert before insert on public.squads
  for each row execute function public.squads_before_insert();

create or replace function public.squads_after_insert() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  delete from squad_members where user_id = new.leader_id and kind = new.kind and status = 'pending';
  insert into squad_members (squad_id, user_id, kind, role, status)
  values (new.id, new.leader_id, new.kind, 'leader', 'member');
  return null;
end $$;
create trigger squads_after_insert after insert on public.squads
  for each row execute function public.squads_after_insert();

create or replace function public.squad_members_recount() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_squad uuid := coalesce(new.squad_id, old.squad_id);
begin
  update squads set members_count = (select count(*) from squad_members where squad_id = v_squad and status = 'member')
  where id = v_squad;
  return null;
end $$;
create trigger squad_members_recount after insert or update or delete on public.squad_members
  for each row execute function public.squad_members_recount();

create or replace function public.squads_after_delete() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and auth.uid() <> old.leader_id then
    perform public.log_action('squad_delete', 'squad', old.id::text, jsonb_build_object('name', old.name, 'kind', old.kind));
  end if;
  return old;
end $$;
create trigger squads_after_delete after delete on public.squads
  for each row execute function public.squads_after_delete();

-- Qoşulma sorğusu göndərmək
create or replace function public.squad_join(p_squad uuid) returns void
language plpgsql security definer set search_path = public as $$
declare q squads%rowtype;
begin
  if auth.uid() is null or public.is_banned() then raise exception 'İcazə yoxdur'; end if;
  select * into q from squads where id = p_squad;
  if not found then raise exception 'Tapılmadı'; end if;
  if not q.recruiting then raise exception 'Hazırda üzv qəbulu bağlıdır'; end if;
  if exists (select 1 from squad_members where user_id = auth.uid() and kind = q.kind and status = 'member') then
    raise exception 'Siz artıq bir % üzvüsünüz', case q.kind when 'clan' then 'klanın' else 'komandanın' end;
  end if;
  if (select count(*) from squad_members where user_id = auth.uid() and status = 'pending') >= 5 then
    raise exception 'Eyni anda ən çox 5 gözləyən sorğunuz ola bilər';
  end if;
  insert into squad_members (squad_id, user_id, kind, role, status)
  values (p_squad, auth.uid(), q.kind, 'member', 'pending')
  on conflict (squad_id, user_id) do nothing;
end $$;

-- Çıxmaq / sorğunu geri götürmək
create or replace function public.squad_leave(p_squad uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from squad_members where squad_id = p_squad and user_id = auth.uid() and role = 'leader') then
    raise exception 'Lider əvvəlcə liderliyi başqasına verməli və ya qrupu silməlidir';
  end if;
  delete from squad_members where squad_id = p_squad and user_id = auth.uid();
end $$;

-- Lider/zabit idarəsi: approve, reject, kick, promote, demote, make_leader
create or replace function public.squad_manage(p_squad uuid, p_user uuid, p_action text) returns void
language plpgsql security definer set search_path = public as $$
declare q squads%rowtype; me squad_members%rowtype; t squad_members%rowtype;
        v_staff boolean; v_leader boolean; v_officer boolean;
begin
  select * into q from squads where id = p_squad for update;
  if not found then raise exception 'Tapılmadı'; end if;
  select * into me from squad_members where squad_id = p_squad and user_id = auth.uid() and status = 'member';
  select * into t  from squad_members where squad_id = p_squad and user_id = p_user;
  if not found then raise exception 'Üzv tapılmadı'; end if;
  v_staff   := public.has_perm('squads');
  v_leader  := coalesce(me.role = 'leader', false);
  v_officer := coalesce(me.role in ('leader', 'officer'), false);
  if auth.uid() is null or public.is_banned() or not (v_staff or v_officer) then raise exception 'İcazə yoxdur'; end if;

  if p_action = 'approve' then
    if t.status <> 'pending' then raise exception 'Bu sorğu artıq qəbul olunub'; end if;
    if q.members_count >= public.squad_max(q.kind) then raise exception 'Yer qalmayıb (maks. %)', public.squad_max(q.kind); end if;
    if exists (select 1 from squad_members where user_id = p_user and kind = q.kind and status = 'member') then
      delete from squad_members where squad_id = p_squad and user_id = p_user;
      raise exception 'Bu oyunçu artıq başqa bir qrupa qoşulub';
    end if;
    update squad_members set status = 'member' where squad_id = p_squad and user_id = p_user;
    delete from squad_members where user_id = p_user and kind = q.kind and status = 'pending' and squad_id <> p_squad;

  elsif p_action in ('reject', 'kick') then
    if t.role = 'leader' then raise exception 'Lideri çıxarmaq olmaz'; end if;
    if t.role = 'officer' and not (v_staff or v_leader) then raise exception 'Zabiti yalnız lider çıxara bilər'; end if;
    delete from squad_members where squad_id = p_squad and user_id = p_user;

  elsif p_action in ('promote', 'demote') then
    if not (v_staff or v_leader) then raise exception 'Yalnız lider'; end if;
    if t.status <> 'member' or t.role = 'leader' then raise exception 'Mümkün deyil'; end if;
    update squad_members set role = case p_action when 'promote' then 'officer' else 'member' end
     where squad_id = p_squad and user_id = p_user;

  elsif p_action = 'make_leader' then
    if not (v_staff or v_leader) then raise exception 'Yalnız lider'; end if;
    if t.status <> 'member' then raise exception 'Əvvəlcə üzv olmalıdır'; end if;
    update squad_members set role = 'officer' where squad_id = p_squad and role = 'leader';
    update squad_members set role = 'leader' where squad_id = p_squad and user_id = p_user;
    update squads set leader_id = p_user where id = p_squad;
  else
    raise exception 'Naməlum əməliyyat';
  end if;

  if v_staff and not v_officer then
    perform public.log_action('squad_' || p_action, 'squad', p_squad::text, jsonb_build_object('user_id', p_user, 'name', q.name));
  end if;
end $$;

-- ---------------------------------------------------------------------
-- 7. ELANLAR VƏ ŞİKAYƏTLƏR
-- ---------------------------------------------------------------------

create or replace function public.listings_before_insert() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null then new.author_id := auth.uid(); end if;
  new.is_active := true;
  new.expires_at := now() + interval '30 days';
  if (select count(*) from listings where author_id = new.author_id and is_active and expires_at > now()) >= 5 then
    raise exception 'Eyni anda ən çox 5 aktiv elanınız ola bilər';
  end if;
  return new;
end $$;
create trigger listings_before_insert before insert on public.listings
  for each row execute function public.listings_before_insert();

create or replace function public.listings_after_delete() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and auth.uid() <> old.author_id then
    perform public.log_action('listing_delete', 'listing', old.id::text, jsonb_build_object('title', old.title, 'author_id', old.author_id));
  end if;
  return old;
end $$;
create trigger listings_after_delete after delete on public.listings
  for each row execute function public.listings_after_delete();

-- Elanı 30 gün uzatmaq
create or replace function public.renew_listing(p_listing uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  update listings set expires_at = now() + interval '30 days', is_active = true
   where id = p_listing and author_id = auth.uid();
  if not found then raise exception 'Elan tapılmadı'; end if;
end $$;

-- ---------------------------------------------------------------------
-- 8. TƏHLÜKƏSİZLİK (Row Level Security)
-- ---------------------------------------------------------------------

alter table public.profiles      enable row level security;
alter table public.staff         enable row level security;
alter table public.settings      enable row level security;
alter table public.events        enable row level security;
alter table public.event_secrets enable row level security;
alter table public.event_entries enable row level security;
alter table public.squads        enable row level security;
alter table public.squad_members enable row level security;
alter table public.listings      enable row level security;
alter table public.reports       enable row level security;
alter table public.audit_log     enable row level security;

-- profiles
create policy profiles_read on public.profiles for select to anon, authenticated using (true);
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- staff: hər kəs özünü görür; adminlər digər adminləri görür; baş admini yalnız özü görür
create policy staff_read on public.staff for select to authenticated
  using (user_id = auth.uid() or public.is_super_admin() or (public.is_staff() and role = 'admin'));

-- settings
create policy settings_read on public.settings for select to anon, authenticated using (true);
create policy settings_update on public.settings for update to authenticated
  using (public.is_super_admin()) with check (public.is_super_admin());

-- events
create policy events_read on public.events for select to anon, authenticated using (true);
create policy events_insert on public.events for insert to authenticated
  with check (creator_id = auth.uid() and not public.is_banned());
create policy events_update on public.events for update to authenticated
  using ((creator_id = auth.uid() and not public.is_banned()) or public.has_perm('events'))
  with check ((creator_id = auth.uid() and not public.is_banned()) or public.has_perm('events'));
create policy events_delete on public.events for delete to authenticated
  using ((creator_id = auth.uid() and taken = 0) or public.has_perm('events'));

-- event_secrets
create policy secrets_manage on public.event_secrets for all to authenticated
  using (exists (select 1 from public.events e where e.id = event_id and e.creator_id = auth.uid()) or public.has_perm('events'))
  with check (exists (select 1 from public.events e where e.id = event_id and e.creator_id = auth.uid()) or public.has_perm('events'));

-- event_entries
create policy entries_read on public.event_entries for select to anon, authenticated
  using (
    status = 'approved'
    or user_id = auth.uid()
    or exists (select 1 from public.events e where e.id = event_id and e.creator_id = auth.uid())
    or public.has_perm('payments')
  );
create policy entries_insert on public.event_entries for insert to authenticated
  with check (user_id = auth.uid() and not public.is_banned());
create policy entries_delete_own on public.event_entries for delete to authenticated
  using (user_id = auth.uid() and status <> 'approved');

-- squads
create policy squads_read on public.squads for select to anon, authenticated using (true);
create policy squads_insert on public.squads for insert to authenticated
  with check (leader_id = auth.uid() and not public.is_banned());
create policy squads_update on public.squads for update to authenticated
  using (leader_id = auth.uid() or public.has_perm('squads'))
  with check (leader_id = auth.uid() or public.has_perm('squads'));
create policy squads_delete on public.squads for delete to authenticated
  using (leader_id = auth.uid() or public.has_perm('squads'));

create policy squad_members_read on public.squad_members for select to anon, authenticated using (true);

-- listings
create policy listings_read on public.listings for select to anon, authenticated
  using ((is_active and expires_at > now()) or author_id = auth.uid() or public.has_perm('moderation'));
create policy listings_insert on public.listings for insert to authenticated
  with check (author_id = auth.uid() and not public.is_banned());
create policy listings_update on public.listings for update to authenticated
  using (author_id = auth.uid() or public.has_perm('moderation'))
  with check (author_id = auth.uid() or public.has_perm('moderation'));
create policy listings_delete on public.listings for delete to authenticated
  using (author_id = auth.uid() or public.has_perm('moderation'));

-- reports
create policy reports_insert on public.reports for insert to authenticated
  with check (reporter_id = auth.uid() and not public.is_banned());
create policy reports_read on public.reports for select to authenticated
  using (reporter_id = auth.uid() or public.has_perm('moderation'));
create policy reports_update on public.reports for update to authenticated
  using (public.has_perm('moderation')) with check (public.has_perm('moderation'));

-- audit_log: birbaşa yalnız baş admin; digərləri get_audit() ilə
create policy audit_read on public.audit_log for select to authenticated using (public.is_super_admin());

-- Sütun səviyyəsində hüquqlar (kimsə özünü "təşkilatçı" və ya "blokdan çıxmış" edə bilməsin)
revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (nick, pubg_id, telegram, bio) on public.profiles to authenticated;

revoke insert, update, delete on public.staff from anon, authenticated;

revoke insert, update, delete on public.settings from anon, authenticated;
grant update (site_notice, telegram_group, max_scream_fee, max_scream_slots, max_open_screams) on public.settings to authenticated;

revoke update on public.events from anon, authenticated;
grant update (title, description, mode, map, org_name, starts_at, reveal_minutes, entry_fee, prize, slots,
              card_number, card_holder, status, results) on public.events to authenticated;

revoke update on public.event_entries from anon, authenticated;

revoke update on public.squads from anon, authenticated;
grant update (name, tag, description, recruiting) on public.squads to authenticated;

revoke insert, update, delete on public.squad_members from anon, authenticated;

revoke update on public.listings from anon, authenticated;
grant update (category, title, description, price, price_unit, contact, is_active) on public.listings to authenticated;

revoke update on public.reports from anon, authenticated;
grant update (status) on public.reports to authenticated;

revoke insert, update, delete on public.audit_log from anon, authenticated;


-- Funksiyaları yalnız daxil olmuş istifadəçilər çağıra bilsin
do $$
declare f text;
begin
  foreach f in array array[
    'public.grant_admin(uuid, text[])', 'public.revoke_admin(uuid)', 'public.set_organizer(uuid, boolean)',
    'public.set_ban(uuid, boolean, text)', 'public.admin_reset_password(uuid, text)', 'public.get_audit(int, int)',
    'public.review_entry(uuid, boolean, text)', 'public.resubmit_entry(uuid, text)',
    'public.squad_join(uuid)', 'public.squad_leave(uuid)', 'public.squad_manage(uuid, uuid, text)',
    'public.renew_listing(uuid)'
  ] loop
    execute format('revoke execute on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated', f);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- 9. ÇEK ŞƏKİLLƏRİ ÜÇÜN YADDAŞ (Storage)
--    Fayl yolu: {user_id}/{event_id}/{vaxt}.jpg
-- ---------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('receipts', 'receipts', false, 3145728, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy receipts_upload on storage.objects for insert to authenticated
  with check (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text and not public.is_banned());

create policy receipts_read on storage.objects for select to authenticated
  using (
    bucket_id = 'receipts' and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.has_perm('payments')
      or exists (select 1 from public.events e
                 where e.id::text = (storage.foldername(name))[2] and e.creator_id = auth.uid())
    )
  );

create policy receipts_delete_own on storage.objects for delete to authenticated
  using (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text);

-- =====================================================================
-- HAZIRDIR. İndi saytda qeydiyyatdan keç və README-dəki
-- "Baş admin olmaq" addımını et.
-- =====================================================================

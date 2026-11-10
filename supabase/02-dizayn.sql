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

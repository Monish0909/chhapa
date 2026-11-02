-- Run once in Supabase SQL editor: creates the public bucket for product photos.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

-- Anyone can view product photos
drop policy if exists "Public read product images" on storage.objects;
create policy "Public read product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- Uploads from the admin panel (uses the public anon key until admin auth is hardened)
drop policy if exists "Anon upload product images" on storage.objects;
create policy "Anon upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images');

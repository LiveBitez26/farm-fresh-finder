-- =========================================================================
-- MarketConnect — market contact info + photo storage
--
-- markets already had name/description/address/city/hero_image_url etc.
-- since the very first migration, but there was no UI to edit any of it
-- (only the bare name gets set when a market is created), and no
-- contact info field existed at all. Adding both now.
-- =========================================================================

alter table markets
  add column contact_email text,
  add column contact_phone text;

insert into storage.buckets (id, name, public)
values ('market-photos', 'market-photos', true)
on conflict (id) do nothing;

create policy "market_photos_staff_upload" on storage.objects
  for insert
  with check (
    bucket_id = 'market-photos'
    and (storage.foldername(name))[1] in (
      select id::text from markets where is_org_member(organization_id)
    )
  );

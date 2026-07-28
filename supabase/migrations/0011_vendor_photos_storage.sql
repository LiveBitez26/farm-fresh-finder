-- =========================================================================
-- MarketConnect — vendor profile photo gallery storage
--
-- vendors.photos (text[]) has existed in the schema since the very first
-- migration but was never wired to anything — no upload path, no display.
-- This adds a public bucket for it, following the same ownership pattern
-- as product-photos and compliance-documents.
-- =========================================================================

insert into storage.buckets (id, name, public)
values ('vendor-photos', 'vendor-photos', true)
on conflict (id) do nothing;

create policy "vendor_photos_vendor_upload" on storage.objects
  for insert
  with check (
    bucket_id = 'vendor-photos'
    and (storage.foldername(name))[1] in (
      select id::text from vendors where owner_user_id = auth.uid()
    )
  );

create policy "vendor_photos_staff_upload" on storage.objects
  for insert
  with check (
    bucket_id = 'vendor-photos'
    and (storage.foldername(name))[1] in (
      select v.id::text from vendors v where is_org_member(v.organization_id)
    )
  );

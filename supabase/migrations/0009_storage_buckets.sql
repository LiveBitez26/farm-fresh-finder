-- =========================================================================
-- MarketConnect — real file storage for compliance documents & product photos
--
-- Until now, "documents" only ever had a title/type/expiry typed in by the
-- organizer — no actual file. This adds two public storage buckets and
-- scopes uploads so a vendor can only ever write into their own folder
-- (named after their vendor id), or organization staff into any vendor's
-- folder within their own org.
--
-- Both buckets are public for read (simplest: a stored file_url/photo_url
-- is just a plain public URL, no signed-URL logic needed) — these aren't
-- sensitive files (business licenses, product photos), so this is a
-- reasonable tradeoff for simplicity.
-- =========================================================================

insert into storage.buckets (id, name, public)
values
  ('compliance-documents', 'compliance-documents', true),
  ('product-photos', 'product-photos', true)
on conflict (id) do nothing;

-- A vendor may upload into a path prefixed with their own vendor id
-- (e.g. "{vendor_id}/insurance.pdf").
create policy "compliance_documents_vendor_upload" on storage.objects
  for insert
  with check (
    bucket_id = 'compliance-documents'
    and (storage.foldername(name))[1] in (
      select id::text from vendors where owner_user_id = auth.uid()
    )
  );

-- Organization staff may upload into any vendor folder belonging to
-- their own organization (matches the existing "Log Document" flow).
create policy "compliance_documents_staff_upload" on storage.objects
  for insert
  with check (
    bucket_id = 'compliance-documents'
    and (storage.foldername(name))[1] in (
      select v.id::text from vendors v where is_org_member(v.organization_id)
    )
  );

create policy "product_photos_vendor_upload" on storage.objects
  for insert
  with check (
    bucket_id = 'product-photos'
    and (storage.foldername(name))[1] in (
      select id::text from vendors where owner_user_id = auth.uid()
    )
  );

create policy "product_photos_staff_upload" on storage.objects
  for insert
  with check (
    bucket_id = 'product-photos'
    and (storage.foldername(name))[1] in (
      select v.id::text from vendors v where is_org_member(v.organization_id)
    )
  );

-- A vendor can now also insert their own compliance document ROWS (the
-- earlier vendor-portal migration only let them SELECT documents; this
-- adds the missing INSERT, scoped to 'pending_review' only — approving
-- or verifying stays exclusively the organizer's job).
create policy "documents_owner_insert" on documents
  for insert
  with check (
    status = 'pending_review'
    and vendor_id in (select id from vendors where owner_user_id = auth.uid())
  );

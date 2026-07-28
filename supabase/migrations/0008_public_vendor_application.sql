-- =========================================================================
-- MarketConnect — public vendor application submissions
--
-- Until now, a vendor record could only be created by an authenticated
-- organization staff member (vendors_org_all requires is_org_member).
-- That meant there was no real "apply to become a vendor" entry point —
-- only vendors already seeded/created by staff could ever exist.
--
-- These policies let anyone (including fully anonymous visitors) submit
-- a new vendor application, but only ever in a harmless "pending" state
-- with no owner — they can never create an already-active or
-- already-claimed vendor, and they can never modify existing rows.
-- =========================================================================

create policy "vendors_public_apply_insert" on vendors
  for insert
  with check (status = 'pending' and owner_user_id is null);

create policy "vendor_applications_public_insert" on vendor_applications
  for insert
  with check (status = 'submitted');

-- =========================================================================
-- MarketConnect — make organizations publicly readable
--
-- The previous fix (a trigger to auto-bootstrap membership) assumed the
-- trigger's membership row would exist before Postgres re-checks the
-- SELECT policy for the INSERT...RETURNING step. In practice this still
-- produced "new row violates row-level security policy for table
-- organizations" — so rather than depend on that timing, we widen the
-- SELECT policy instead.
--
-- This is also just correct for the product: organization name, slug,
-- and country are directory information customers need to see while
-- browsing markets — nothing sensitive lives on this table. Staff-only
-- data (billing, staff list, etc.) stays protected on other tables.
-- =========================================================================

drop policy if exists "organizations_member_select" on organizations;

create policy "organizations_public_read" on organizations
  for select
  using (true);

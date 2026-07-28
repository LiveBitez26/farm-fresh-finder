-- =========================================================================
-- MarketConnect — allow org staff to update their own organization
--
-- organizations had SELECT and INSERT policies but no UPDATE policy at
-- all, so editing the org name/country from Organization Settings would
-- have failed with the same kind of RLS error we hit earlier. Org staff
-- (anyone in organization_members for that org) can now update it.
-- =========================================================================

create policy "organizations_member_update" on organizations
  for update
  using (is_org_member(id))
  with check (is_org_member(id));

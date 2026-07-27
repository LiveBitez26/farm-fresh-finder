-- =========================================================================
-- MarketConnect — fix onboarding RLS gaps
-- The original schema only allowed SELECT on `organizations`, so signed-up
-- users could never create their own organization during onboarding. It
-- also had no way to insert the FIRST `organization_members` row for a
-- brand-new org, since the existing policy required already being a member
-- of that org (a chicken-and-egg problem for the very first owner).
-- =========================================================================

-- Any signed-in user may create a new organization (this is exactly what
-- happens once, during onboarding).
create policy "organizations_authenticated_insert" on organizations
  for insert
  with check (auth.uid() is not null);

-- A signed-in user may always insert a membership row for themselves —
-- this is what lets a brand-new organization get its first (owner) member,
-- before any organization_members row exists for that org yet.
create policy "organization_members_self_insert" on organization_members
  for insert
  with check (user_id = auth.uid());

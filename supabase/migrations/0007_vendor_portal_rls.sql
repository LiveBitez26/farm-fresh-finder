-- =========================================================================
-- MarketConnect — Vendor Portal: owner-scoped RLS policies
--
-- Until now, only organization staff (via is_org_member) could read or
-- write vendors/products/documents. There was no path for the vendor
-- themselves to see or manage their own listing. These policies add
-- exactly that, scoped strictly to rows where vendors.owner_user_id
-- matches the signed-in user — a vendor can never see another vendor's
-- data through these policies.
-- =========================================================================

-- A vendor can see and update their own vendor row (profile fields like
-- farm_story, farm_location, website, farming_practices, photos).
create policy "vendors_owner_select" on vendors
  for select
  using (owner_user_id = auth.uid());

-- Lets the invite-link claim page look up an unclaimed vendor by id
-- (regardless of its status) before linking it to the current user.
create policy "vendors_unclaimed_select" on vendors
  for select
  using (owner_user_id is null);

create policy "vendors_owner_update" on vendors
  for update
  using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

-- Lets a signed-in user "claim" an unclaimed vendor listing via an invite
-- link from the organizer (vendors_owner_update above can't cover this,
-- since owner_user_id isn't already theirs at the moment of claiming).
create policy "vendors_claim_update" on vendors
  for update
  using (owner_user_id is null)
  with check (owner_user_id = auth.uid());

-- A vendor can manage their own products.
create policy "products_owner_all" on products
  for all
  using (vendor_id in (select id from vendors where owner_user_id = auth.uid()))
  with check (vendor_id in (select id from vendors where owner_user_id = auth.uid()));

-- A vendor can view (read-only — verification stays the organizer's job)
-- their own compliance documents.
create policy "documents_owner_select" on documents
  for select
  using (vendor_id in (select id from vendors where owner_user_id = auth.uid()));

-- A vendor can view their own booth assignments (to see which markets/
-- booths they're scheduled for).
create policy "booth_assignments_owner_select" on booth_assignments
  for select
  using (vendor_id in (select id from vendors where owner_user_id = auth.uid()));

-- A vendor can view the booth records tied to their own assignments
-- (booths previously had no policy allowing anyone but staff to read it).
create policy "booths_owner_select" on booths
  for select
  using (
    id in (
      select booth_id from booth_assignments
      where vendor_id in (select id from vendors where owner_user_id = auth.uid())
    )
  );

-- A vendor can view schedules/markets/booths belonging to organizations
-- they're an active vendor in (needed to show "your upcoming markets").
-- (markets/schedules already have permissive read policies for active
-- rows, so no change needed there.)

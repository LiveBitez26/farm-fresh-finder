-- =========================================================================
-- MarketConnect — real, editable onboarding checklist fields on vendors
--
-- The Vendor Management drawer's onboarding checklist ("Insurance
-- uploaded", "Permit verified", "Agreement signed", "Fees paid") had
-- nothing behind it — those four boxes were hardcoded unchecked with no
-- way to toggle them. Adding real boolean columns so a market manager can
-- actually check them off as a vendor completes each step.
--
-- "Application completed" stays implicit (true once the vendor row
-- exists). "Booth assigned" stays derived from booth_assignments —
-- it's more trustworthy as an automatic signal than a manual checkbox.
-- =========================================================================

alter table vendors
  add column insurance_uploaded boolean not null default false,
  add column permit_verified boolean not null default false,
  add column agreement_signed boolean not null default false,
  add column fees_paid boolean not null default false;

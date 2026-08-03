-- =========================================================================
-- MarketConnect — public read access for customer-facing announcements
--
-- The Communication Hub already let an organizer target an announcement
-- at "Customers" (audience = 'customers'), but announcements had no
-- public SELECT policy at all — only org staff could ever read them.
-- There was a way to write customer announcements but no way for an
-- actual customer to ever see one. This adds exactly that, scoped
-- strictly to the 'customers' audience — vendor-facing announcements
-- stay staff-only.
-- =========================================================================

create policy "announcements_public_customer_read" on announcements
  for select
  using (audience = 'customers');

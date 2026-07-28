-- =========================================================================
-- MarketConnect — multiple product photos + subscription frequency options
--
-- products.photo_url only ever held a single image. Adding photo_urls
-- (an array) for a real photo gallery — photo_url stays as the "primary"
-- photo for anywhere that only shows one (kept in sync automatically via
-- application code, not a trigger, to keep this simple).
--
-- Also adding subscription_frequencies so a vendor can specify exactly
-- which cadences they offer a subscription-eligible product at (weekly,
-- biweekly, monthly) rather than just a single yes/no flag.
-- =========================================================================

alter table products
  add column photo_urls text[],
  add column subscription_frequencies subscription_frequency[];

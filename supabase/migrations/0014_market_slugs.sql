-- =========================================================================
-- MarketConnect — shareable market slugs
--
-- Organizations already had a public slug for shareable links
-- (/apply/:slug). Markets didn't have an equivalent, so there was no
-- clean, human-readable URL an organizer could put on a flyer or social
-- media bio to send people straight to their market's page.
-- =========================================================================

alter table markets
  add column slug text;

-- Backfill existing markets with a generated slug (lowercased name +
-- a short random suffix for uniqueness, same pattern used for
-- organizations at onboarding time).
update markets
set slug = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(md5(random()::text), 1, 6)
where slug is null;

alter table markets
  alter column slug set not null,
  add constraint markets_slug_unique unique (slug);

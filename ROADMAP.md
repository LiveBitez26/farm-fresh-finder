# MarketConnect — Roadmap

This tracks known remaining work, roughly in priority order. Last updated
after the Phase 3 session that connected the Customer Marketplace, added
real customer accounts, and wired subscriptions end to end.

## Needs verification (built, not yet confirmed working by the user)

- **Location-based market search** — "Find Farmers Near Me", manual
  city/ZIP entry, distance sorting/badges, and auto-geocoding a
  market's address on save. Requires re-saving each existing market
  through Edit Market once to trigger geocoding retroactively (it only
  runs on save, not for markets that existed before this shipped).

## Next up (the big one)

- **Stripe Connect + real Orders** — the last major piece making the
  platform fully transactional:
  - Vendor Stripe Connect account onboarding
  - Real one-time orders (not just subscriptions) with a real cart/checkout
  - Connecting subscriptions to actual recurring charges
  - Payments & Fees page wired to real transaction data (currently 100%
    sample data)
  - Orders & Pickup wired to real order data (currently 100% sample data)

## Right after Stripe — closely related, high value

1. **Analytics** — currently an empty-state placeholder. Becomes genuinely
   useful once real orders/payments exist (sales trends, vendor
   performance, attendance patterns).
2. **Real per-market vendor assignment** — "farmers at this market" is
   currently approximated as "all active vendors in the organization."
   Fine for a single-market org; breaks down for multi-market orgs with
   different vendor lineups per market. The `vendor_market_participation`
   table already exists in the schema but nothing writes to it yet.
3. **Order fulfillment/pickup tied to real data** — once real orders
   exist, Orders & Pickup becomes the actual day-of-market operational
   tool instead of a sample report.

## Things that would surprise a real user today

4. **Communication Hub doesn't actually send email or SMS** — channel
   selection exists in the UI, but nothing is wired to an email/SMS
   provider (e.g. Resend, Twilio). Announcements only ever show up
   in-app / on the marketplace regardless of which channel is picked.
5. **No "forgot password" flow** anywhere in the app.
6. **No staff invite system** — Organization Settings shows staff but
   there's no way to invite a second person into the same org; every
   signup becomes its own separate org owner.
7. **Email confirmation is currently disabled** in Supabase Auth — fine
   for internal testing, worth reconsidering before real public signups.

## Trust & legitimacy gaps for a real public launch

8. **No Terms of Service / Privacy Policy** — needed once real customers,
   payments, and personal data are involved.
9. **No spam protection** (CAPTCHA/rate limiting) on the public vendor
   application form or signup forms.
10. **Still on a `.vercel.app` subdomain** — a custom domain would read
    as more finished/trustworthy to a skeptical visitor.

## Longer-term / lower urgency

11. Favoriting farmers (mentioned in Profile copy, never built).
12. CSV/report exports for the Finance Manager role.
13. Automated tests (none exist yet — matters more as the codebase grows).

## Already fully real (for context, not remaining work)

Auth, organizations, onboarding, currency, Vendor Management (products
with photos/subscriptions/descriptions, editable checklist, delete),
Compliance Vault (vendor uploads + organizer approve/reject), Schedule &
Booth Map (self-service market/date/booth creation, market bio/photo/
location/contact), Communication Hub (send/edit/delete, market-scoped),
two vendor onboarding paths (public application + organizer invite),
real file storage (documents, product photos, vendor photos, market
photos), the Marketplace showing real markets/vendors/products/schedules/
announcements with a proper desktop nav + footer, real customer accounts
with persisted, manageable subscriptions, location-based market search
("Find Farmers Near Me" using the browser's geolocation, or manual
city/ZIP entry, both via free OpenStreetMap geocoding — no API key/paid
service required — with markets auto-geocoded from their address
whenever an organizer saves one via Edit Market), and a real, shareable
public market page (/market/:slug) an organizer can post anywhere,
separate from the in-app browsing experience.

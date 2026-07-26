# Welcome to your Lovable project

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

## MarketConnect — Phase 1 (Foundation)

This phase adds:

- `supabase/migrations/0001_init_schema.sql` — full multi-tenant Postgres schema (organizations, roles, markets, vendors, compliance documents, booths/schedules, products, orders, subscriptions, payments, analytics) with row-level security policies.
- `src/lib/supabase.ts` / `src/lib/types.ts` — Supabase client + hand-maintained domain types.
- `src/hooks/use-auth.tsx` — auth context (sign in / sign up / sign out, current profile + org role).
- `src/routes/login.tsx` — sign-in / sign-up page.
- `src/routes/organizer/*` — Organizer SaaS Console: sidebar shell + Overview dashboard (metric cards, Market Impact Report) + Vendor Management (application pipeline, vendor directory, onboarding checklist) + Compliance Vault, with the remaining sections (Schedule, Communications, Orders, Payments, Analytics, Settings) scaffolded as scoped placeholders describing what ships in later phases.

### Connecting Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Run the SQL in `supabase/migrations/0001_init_schema.sql` via the Supabase SQL editor (or the Supabase CLI).
3. Copy `.env.example` to `.env.local` and fill in `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` from Project Settings → API.
4. Restart the dev server. The console will automatically switch out of "preview mode" once credentials are present.

Until Supabase is connected, `/organizer` renders with mock data so the UI can be reviewed without a live backend.

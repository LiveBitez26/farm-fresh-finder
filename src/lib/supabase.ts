import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Loud in dev, non-fatal in build — lets the UI still render with mock
  // data until real Supabase credentials are wired up in `.env.local`.
  console.warn(
    "[MarketConnect] Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. " +
      "Copy .env.example to .env.local and add your Supabase project credentials.",
  );
}

// NOTE: once a live Supabase project exists, run
//   `npx supabase gen types typescript --project-id <id> > src/lib/database.types.ts`
// and swap this for `createClient<Database>(...)` for full query type-safety.
// Domain types in `./types.ts` are hand-maintained against the schema in
// `supabase/migrations/0001_init_schema.sql` in the meantime.
export const supabase = createClient(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseAnonKey ?? "placeholder-anon-key",
);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

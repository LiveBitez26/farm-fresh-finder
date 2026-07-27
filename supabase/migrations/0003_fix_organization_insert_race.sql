-- =========================================================================
-- MarketConnect — fix the organizations insert/return RLS race
--
-- Symptom: creating a new organization during onboarding failed with
-- "new row violates row-level security policy for table organizations",
-- even though the INSERT policy itself was correct.
--
-- Root cause: `supabase.from("organizations").insert(...).select().single()`
-- asks PostgREST to both insert AND return the new row in one request.
-- Returning it requires a SELECT policy to pass, and our SELECT policy
-- checks organization membership — which doesn't exist yet at that exact
-- moment (the membership row was being created in a *separate*, later
-- request from the client). PostgREST reports that timing gap as if the
-- whole operation violated RLS.
--
-- Fix: move membership bootstrapping into a database trigger that runs as
-- part of the same INSERT statement, before the RETURNING clause is
-- evaluated, so the membership already exists by the time the row is
-- returned.
-- =========================================================================

create or replace function handle_new_organization()
returns trigger as $$
begin
  insert into public.organization_members (organization_id, user_id, role)
  values (new.id, auth.uid(), 'org_owner');

  update public.profiles
  set organization_id = new.id
  where id = auth.uid();

  return new;
end;
$$ language plpgsql security definer;

create trigger on_organization_created
  after insert on organizations
  for each row execute function handle_new_organization();

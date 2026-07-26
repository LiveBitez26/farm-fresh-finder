import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Building2 } from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingPage,
});

function slugify(name: string) {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base || "org"}-${suffix}`;
}

function OnboardingPage() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setSubmitting(true);

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .insert({ name, slug: slugify(name), country: country || null })
      .select()
      .single();

    if (orgError || !org) {
      setError(orgError?.message ?? "Couldn't create organization. Please try again.");
      setSubmitting(false);
      return;
    }

    const { error: memberError } = await supabase
      .from("organization_members")
      .insert({ organization_id: org.id, user_id: user.id, role: "org_owner" });

    if (memberError) {
      setError(memberError.message);
      setSubmitting(false);
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ organization_id: org.id })
      .eq("id", user.id);

    if (profileError) {
      setError(profileError.message);
      setSubmitting(false);
      return;
    }

    await refreshProfile();
    setSubmitting(false);
    navigate({ to: "/organizer" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Building2 className="h-6 w-6" />
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
            Set up your organization
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            This becomes the tenant for all your markets, vendors, and staff.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Organization name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Portland Farmers Market Alliance"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="United States"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create organization
          </Button>
        </form>
      </div>
    </div>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Leaf } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useAuth } from "../../hooks/use-auth";
import { useClaimVendor, useUnclaimedVendor } from "../../hooks/use-vendor-portal-data";

export const Route = createFileRoute("/vendor/claim/$vendorId")({
  component: ClaimVendorPage,
});

function ClaimVendorPage() {
  const { vendorId } = Route.useParams();
  const { user, signInWithPassword, signUpWithPassword, isLoading } = useAuth();
  const { data: vendor, isLoading: vendorLoading } = useUnclaimedVendor(vendorId);
  const claimVendor = useClaimVendor();
  const navigate = useNavigate();

  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-up");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result =
      mode === "sign-in"
        ? await signInWithPassword(email, password)
        : await signUpWithPassword(email, password, fullName);
    setSubmitting(false);
    if (result.error) setError(result.error);
  }

  function handleClaim() {
    setError(null);
    claimVendor.mutate(vendorId, {
      onSuccess: () => navigate({ to: "/vendor" }),
      onError: (e: Error) => setError(e.message),
    });
  }

  if (isLoading || vendorLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold text-foreground">
            Invite link not found
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This vendor invite link is invalid, or has already been used to link an account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Leaf className="h-6 w-6" />
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
            Claim {vendor.business_name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {user
              ? "Confirm below to link this vendor listing to your account."
              : "Sign in or create an account to claim this vendor listing."}
          </p>
        </div>

        {!user ? (
          <>
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {mode === "sign-up" && (
                <div className="space-y-1.5">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jordan Rivera"
                    required
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@yourfarm.com"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              {error && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "sign-in" ? "Sign in" : "Create account"}
              </Button>
            </form>
            <button
              type="button"
              onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
              className="mt-6 w-full text-center text-sm text-muted-foreground hover:text-foreground"
            >
              {mode === "sign-in" ? "Need an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </>
        ) : (
          <div className="space-y-4">
            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}
            <Button className="w-full" onClick={handleClaim} disabled={claimVendor.isPending}>
              {claimVendor.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm — this is my business
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Signed in as {user.email}. Not you?{" "}
              <Link to="/login" className="underline">
                Sign in with a different account
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

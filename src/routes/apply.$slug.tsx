import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Leaf, CheckCircle2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  useOrganizationBySlug,
  usePublicMarkets,
  useSubmitVendorApplication,
} from "../hooks/use-public-application-data";

export const Route = createFileRoute("/apply/$slug")({
  component: ApplyPage,
});

function ApplyPage() {
  const { slug } = Route.useParams();
  const { data: organization, isLoading: orgLoading } = useOrganizationBySlug(slug);
  const { data: markets } = usePublicMarkets(organization?.id);
  const submitApplication = useSubmitVendorApplication();

  const [marketId, setMarketId] = useState("");
  const [applicantName, setApplicantName] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [categories, setCategories] = useState("");
  const [farmStory, setFarmStory] = useState("");
  const [farmLocation, setFarmLocation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!organization) return;
    if (!applicantName.trim() || !applicantEmail.trim() || !businessName.trim()) {
      setError("Please fill in your name, email, and business name.");
      return;
    }
    submitApplication.mutate(
      {
        organizationId: organization.id,
        marketId: marketId || undefined,
        applicantName: applicantName.trim(),
        applicantEmail: applicantEmail.trim(),
        businessName: businessName.trim(),
        productCategories: categories
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
        farmStory: farmStory.trim(),
        farmLocation: farmLocation.trim(),
      },
      {
        onSuccess: () => setSubmitted(true),
        onError: (e: Error) => setError(e.message),
      },
    );
  }

  if (orgLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold text-foreground">
            Application link not found
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This application link doesn't match any organization. Double-check the link with your
            market organizer.
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
        <div className="max-w-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold text-foreground">
            Application submitted
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Thanks for applying to sell with <strong>{organization.name}</strong>. They'll review
            your application and reach out at the email you provided.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Leaf className="h-6 w-6" />
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
            Apply to sell with {organization.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tell us about your farm or business — we'll follow up by email.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {markets && markets.length > 0 && (
            <div className="space-y-1.5">
              <Label>Which market? (optional)</Label>
              <Select value={marketId} onValueChange={setMarketId}>
                <SelectTrigger>
                  <SelectValue placeholder="No preference" />
                </SelectTrigger>
                <SelectContent>
                  {markets.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="applicantName">Your name</Label>
            <Input
              id="applicantName"
              value={applicantName}
              onChange={(e) => setApplicantName(e.target.value)}
              placeholder="Jordan Rivera"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="applicantEmail">Your email</Label>
            <Input
              id="applicantEmail"
              type="email"
              value={applicantEmail}
              onChange={(e) => setApplicantEmail(e.target.value)}
              placeholder="you@yourfarm.com"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="businessName">Business / farm name</Label>
            <Input
              id="businessName"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Green Fields Farm"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="categories">What do you sell?</Label>
            <Input
              id="categories"
              value={categories}
              onChange={(e) => setCategories(e.target.value)}
              placeholder="Vegetables, Herbs (comma-separated)"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="farmLocation">Farm location</Label>
            <Input
              id="farmLocation"
              value={farmLocation}
              onChange={(e) => setFarmLocation(e.target.value)}
              placeholder="City, State"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="farmStory">Tell us about your business</Label>
            <Textarea
              id="farmStory"
              value={farmStory}
              onChange={(e) => setFarmStory(e.target.value)}
              placeholder="A few sentences about what you grow or make…"
              className="min-h-[90px]"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={submitApplication.isPending}>
            {submitApplication.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit application
          </Button>
        </form>
      </div>
    </div>
  );
}

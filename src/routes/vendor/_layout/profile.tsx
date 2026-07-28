import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Check } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Label } from "../../../components/ui/label";
import { useMyVendor, useUpdateMyVendorProfile } from "../../../hooks/use-vendor-portal-data";

export const Route = createFileRoute("/vendor/_layout/profile")({
  component: VendorProfilePage,
});

function VendorProfilePage() {
  const { data: vendor, isLoading } = useMyVendor();
  const updateProfile = useUpdateMyVendorProfile();

  const [businessName, setBusinessName] = useState("");
  const [farmStory, setFarmStory] = useState("");
  const [farmLocation, setFarmLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [categories, setCategories] = useState("");
  const [practices, setPractices] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (vendor) {
      setBusinessName(vendor.business_name);
      setFarmStory(vendor.farm_story ?? "");
      setFarmLocation(vendor.farm_location ?? "");
      setWebsite(vendor.website ?? "");
      setCategories((vendor.product_categories ?? []).join(", "));
      setPractices((vendor.farming_practices ?? []).join(", "));
    }
  }, [vendor]);

  function handleSave() {
    if (!vendor) return;
    updateProfile.mutate(
      {
        vendorId: vendor.id,
        businessName: businessName.trim(),
        farmStory: farmStory.trim(),
        farmLocation: farmLocation.trim(),
        website: website.trim(),
        productCategories: categories
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
        farmingPractices: practices
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean),
      },
      {
        onSuccess: () => {
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        },
      },
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 p-16 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading…
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-[family-name:var(--font-display)] text-[19px] font-semibold text-foreground">
          Farm Profile
        </h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          This is what customers and market organizers see about your business.
        </p>
      </div>

      <div className="max-w-lg space-y-4 rounded-xl border border-border bg-card p-5">
        <div className="space-y-1.5">
          <Label>Business name</Label>
          <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Farm story</Label>
          <Textarea
            value={farmStory}
            onChange={(e) => setFarmStory(e.target.value)}
            placeholder="Tell customers about your farm…"
            className="min-h-[90px]"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Farm location</Label>
          <Input
            value={farmLocation}
            onChange={(e) => setFarmLocation(e.target.value)}
            placeholder="City, State"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Website</Label>
          <Input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://…"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Product categories</Label>
          <Input
            value={categories}
            onChange={(e) => setCategories(e.target.value)}
            placeholder="Vegetables, Herbs (comma-separated)"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Farming practices</Label>
          <Input
            value={practices}
            onChange={(e) => setPractices(e.target.value)}
            placeholder="Organic, Regenerative (comma-separated)"
          />
        </div>

        <Button onClick={handleSave} disabled={updateProfile.isPending}>
          {updateProfile.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : saved ? (
            <Check className="mr-2 h-4 w-4" />
          ) : null}
          {saved ? "Saved" : "Save profile"}
        </Button>
      </div>
    </div>
  );
}

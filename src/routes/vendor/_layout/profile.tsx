import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Loader2, Check, ImagePlus, X, ExternalLink, Copy } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Label } from "../../../components/ui/label";
import { useMyVendor, useUpdateMyVendorProfile } from "../../../hooks/use-vendor-portal-data";

export const Route = createFileRoute("/vendor/_layout/profile")({
  component: VendorProfilePage,
});

const MAX_VENDOR_PHOTOS = 6;

function VendorProfilePage() {
  const { data: vendor, isLoading } = useMyVendor();
  const updateProfile = useUpdateMyVendorProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [businessName, setBusinessName] = useState("");
  const [farmStory, setFarmStory] = useState("");
  const [farmLocation, setFarmLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [categories, setCategories] = useState("");
  const [practices, setPractices] = useState("");
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [newPhotoFiles, setNewPhotoFiles] = useState<File[]>([]);
  const [newPhotoPreviews, setNewPhotoPreviews] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (vendor) {
      setBusinessName(vendor.business_name);
      setFarmStory(vendor.farm_story ?? "");
      setFarmLocation(vendor.farm_location ?? "");
      setWebsite(vendor.website ?? "");
      setCategories((vendor.product_categories ?? []).join(", "));
      setPractices((vendor.farming_practices ?? []).join(", "));
      setExistingPhotos(vendor.photos ?? []);
    }
  }, [vendor]);

  const totalPhotos = existingPhotos.length + newPhotoFiles.length;

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, MAX_VENDOR_PHOTOS - totalPhotos);
    if (files.length === 0) return;
    setNewPhotoFiles((prev) => [...prev, ...files].slice(0, MAX_VENDOR_PHOTOS));
    setNewPhotoPreviews((prev) =>
      [...prev, ...files.map((f) => URL.createObjectURL(f))].slice(0, MAX_VENDOR_PHOTOS),
    );
  }

  function removeExistingPhoto(index: number) {
    setExistingPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  function removeNewPhoto(index: number) {
    setNewPhotoFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  }

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
        keptPhotoUrls: existingPhotos,
        newPhotoFiles,
      },
      {
        onSuccess: () => {
          setSaved(true);
          setNewPhotoFiles([]);
          setNewPhotoPreviews([]);
          if (fileInputRef.current) fileInputRef.current.value = "";
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

  const storefrontUrl = vendor ? `${window.location.origin}/store/${vendor.id}` : "";

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-[19px] font-semibold text-foreground">
            Farm Profile
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            This is what customers and market organizers see about your business.
          </p>
        </div>
        {vendor && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-border"
              onClick={() => {
                navigator.clipboard.writeText(storefrontUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              <Copy className="mr-2 h-4 w-4" />
              {copied ? "Copied!" : "Copy Storefront Link"}
            </Button>
            <Button variant="outline" className="border-border" asChild>
              <a href={storefrontUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                View
              </a>
            </Button>
          </div>
        )}
      </div>

      <div className="max-w-lg space-y-4 rounded-xl border border-border bg-card p-5">
        <div className="space-y-1.5">
          <Label>Farm photos (up to {MAX_VENDOR_PHOTOS})</Label>
          <div className="flex flex-wrap gap-2">
            {existingPhotos.map((src, i) => (
              <div
                key={`existing-${i}`}
                className="relative h-[80px] w-[80px] overflow-hidden rounded-lg border border-border"
              >
                <img src={src} alt="Farm" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeExistingPhoto(i)}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-background/90 text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {newPhotoPreviews.map((src, i) => (
              <div
                key={`new-${i}`}
                className="relative h-[80px] w-[80px] overflow-hidden rounded-lg border border-border"
              >
                <img src={src} alt="Farm" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeNewPhoto(i)}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-background/90 text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {totalPhotos < MAX_VENDOR_PHOTOS && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-[80px] w-[80px] items-center justify-center rounded-lg border border-dashed border-border bg-background text-muted-foreground hover:border-primary hover:text-primary"
              >
                <ImagePlus className="h-5 w-5" />
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>
        </div>

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

import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Loader2, Plus, Repeat, ImagePlus, X } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Label } from "../../../components/ui/label";
import { Checkbox } from "../../../components/ui/checkbox";
import { Badge } from "../../../components/ui/badge";
import { formatMoney } from "../../../lib/currency";
import {
  useCreateMyProduct,
  useMyProducts,
  useMyVendor,
} from "../../../hooks/use-vendor-portal-data";
import { useToggleProductActive } from "../../../hooks/use-organization-data";

export const Route = createFileRoute("/vendor/_layout/products")({
  component: VendorProductsPage,
});

const FREQUENCY_OPTIONS: { key: "weekly" | "biweekly" | "monthly"; label: string }[] = [
  { key: "weekly", label: "Weekly" },
  { key: "biweekly", label: "Bi-weekly" },
  { key: "monthly", label: "Monthly" },
];

const FREQUENCY_LABEL: Record<string, string> = {
  weekly: "Weekly",
  biweekly: "Bi-weekly",
  monthly: "Monthly",
};

const MAX_PHOTOS = 4;

function VendorProductsPage() {
  const { data: vendor } = useMyVendor();
  const { data: products, isLoading } = useMyProducts(vendor?.id);
  const createProduct = useCreateMyProduct();
  const toggleActive = useToggleProductActive();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("");
  const [isSubscriptionEligible, setIsSubscriptionEligible] = useState(false);
  const [frequencies, setFrequencies] = useState<("weekly" | "biweekly" | "monthly")[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, MAX_PHOTOS - photoFiles.length);
    if (files.length === 0) return;
    setPhotoFiles((prev) => [...prev, ...files].slice(0, MAX_PHOTOS));
    setPhotoPreviews((prev) =>
      [...prev, ...files.map((f) => URL.createObjectURL(f))].slice(0, MAX_PHOTOS),
    );
  }

  function removePhoto(index: number) {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  function toggleFrequency(freq: "weekly" | "biweekly" | "monthly") {
    setFrequencies((prev) =>
      prev.includes(freq) ? prev.filter((f) => f !== freq) : [...prev, freq],
    );
  }

  function resetForm() {
    setName("");
    setDescription("");
    setCategory("");
    setPrice("");
    setUnit("");
    setIsSubscriptionEligible(false);
    setFrequencies([]);
    setPhotoFiles([]);
    setPhotoPreviews([]);
    setShowForm(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleAdd() {
    setError(null);
    const parsedPrice = Number(price);
    if (!vendor) return;
    if (!name.trim() || Number.isNaN(parsedPrice)) {
      setError("Enter a product name and a valid price.");
      return;
    }
    if (isSubscriptionEligible && frequencies.length === 0) {
      setError("Pick at least one subscription frequency, or uncheck subscriptions.");
      return;
    }
    createProduct.mutate(
      {
        vendorId: vendor.id,
        organizationId: vendor.organization_id,
        name: name.trim(),
        description: description.trim(),
        category: category.trim(),
        price: parsedPrice,
        unit: unit.trim(),
        currency: "USD",
        isSubscriptionEligible,
        subscriptionFrequencies: frequencies,
        photoFiles,
      },
      {
        onSuccess: resetForm,
        onError: (e: Error) => setError(e.message),
      },
    );
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-[19px] font-semibold text-foreground">
            My Products
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {(products ?? []).length} product{(products ?? []).length === 1 ? "" : "s"} listed
          </p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {showForm && (
        <div className="mb-5 rounded-xl border border-border bg-card p-5">
          <Label className="mb-1.5 block">Photos (up to {MAX_PHOTOS})</Label>
          <div className="mb-4 flex flex-wrap gap-2">
            {photoPreviews.map((src, i) => (
              <div
                key={i}
                className="relative h-[80px] w-[80px] overflow-hidden rounded-lg border border-border"
              >
                <img src={src} alt="Product" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-background/90 text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {photoFiles.length < MAX_PHOTOS && (
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

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Product name"
            />
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Category"
            />
            <Input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Price"
              type="number"
              step="0.01"
            />
            <Input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="Unit (lb, dozen…)"
            />
          </div>

          <div className="mt-3 space-y-1.5">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell customers what makes this product worth trying…"
              className="min-h-[70px]"
            />
          </div>

          <label className="mt-4 flex items-center gap-2.5 text-sm text-foreground">
            <Checkbox
              checked={isSubscriptionEligible}
              onCheckedChange={(v) => setIsSubscriptionEligible(v === true)}
            />
            Customers can subscribe to this product (recurring order), in addition to buying it
            one-time
          </label>

          {isSubscriptionEligible && (
            <div className="ml-6 mt-2 flex flex-wrap gap-3">
              {FREQUENCY_OPTIONS.map((f) => (
                <label key={f.key} className="flex items-center gap-1.5 text-sm text-foreground">
                  <Checkbox
                    checked={frequencies.includes(f.key)}
                    onCheckedChange={() => toggleFrequency(f.key)}
                  />
                  {f.label}
                </label>
              ))}
            </div>
          )}

          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
          <Button className="mt-3" onClick={handleAdd} disabled={createProduct.isPending}>
            {createProduct.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save product
          </Button>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-1.5">
        {isLoading ? (
          <p className="p-8 text-center text-sm text-muted-foreground">Loading…</p>
        ) : (products ?? []).length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No products yet — add your first one above.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {products!.map((p) => (
              <div key={p.id} className="flex items-start gap-3 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary">
                  {p.photo_url ? (
                    <img src={p.photo_url} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <ImagePlus className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="text-[13.5px] font-semibold text-foreground">{p.name}</p>
                    {(p.photo_urls?.length ?? 0) > 1 && (
                      <Badge variant="secondary" className="text-[10px]">
                        +{(p.photo_urls?.length ?? 1) - 1} more photo
                        {(p.photo_urls?.length ?? 1) - 1 === 1 ? "" : "s"}
                      </Badge>
                    )}
                    {p.is_subscription_eligible && (
                      <Badge variant="secondary" className="gap-1 text-[10px]">
                        <Repeat className="h-2.5 w-2.5" />
                        {(p.subscription_frequencies ?? [])
                          .map((f) => FREQUENCY_LABEL[f])
                          .join(" / ") || "Subscribable"}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                    {p.category ?? "—"} · {formatMoney(p.price, p.currency)}
                    {p.unit ? ` / ${p.unit}` : ""}
                  </p>
                  {p.description && (
                    <p className="mt-1 text-[12px] text-muted-foreground">{p.description}</p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleActive.mutate({ productId: p.id, isActive: !p.is_active })}
                >
                  {p.is_active ? "Active" : "Inactive"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

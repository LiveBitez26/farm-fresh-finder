import { useRef } from "react";
import { Loader2, ImagePlus, X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";

export type ProductFrequency = "weekly" | "biweekly" | "monthly";

export const FREQUENCY_OPTIONS: { key: ProductFrequency; label: string }[] = [
  { key: "weekly", label: "Weekly" },
  { key: "biweekly", label: "Bi-weekly" },
  { key: "monthly", label: "Monthly" },
];

export const FREQUENCY_LABEL: Record<string, string> = {
  weekly: "Weekly",
  biweekly: "Bi-weekly",
  monthly: "Monthly",
};

export const MAX_PRODUCT_PHOTOS = 4;

export interface ProductFormState {
  name: string;
  description: string;
  category: string;
  price: string;
  unit: string;
  isSubscriptionEligible: boolean;
  frequencies: ProductFrequency[];
  existingPhotoUrls: string[];
  newPhotoFiles: File[];
  newPhotoPreviews: string[];
}

export const EMPTY_PRODUCT_FORM: ProductFormState = {
  name: "",
  description: "",
  category: "",
  price: "",
  unit: "",
  isSubscriptionEligible: false,
  frequencies: [],
  existingPhotoUrls: [],
  newPhotoFiles: [],
  newPhotoPreviews: [],
};

export function validateProductForm(form: ProductFormState): string | null {
  if (!form.name.trim() || Number.isNaN(Number(form.price))) {
    return "Enter a product name and a valid price.";
  }
  if (form.isSubscriptionEligible && form.frequencies.length === 0) {
    return "Pick at least one subscription frequency, or uncheck subscriptions.";
  }
  return null;
}

export function ProductForm({
  form,
  setForm,
  error,
  submitting,
  onSubmit,
  submitLabel,
}: {
  form: ProductFormState;
  setForm: React.Dispatch<React.SetStateAction<ProductFormState>>;
  error: string | null;
  submitting: boolean;
  onSubmit: () => void;
  submitLabel: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const totalPhotos = form.existingPhotoUrls.length + form.newPhotoFiles.length;

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, MAX_PRODUCT_PHOTOS - totalPhotos);
    if (files.length === 0) return;
    setForm((f) => ({
      ...f,
      newPhotoFiles: [...f.newPhotoFiles, ...files].slice(0, MAX_PRODUCT_PHOTOS),
      newPhotoPreviews: [
        ...f.newPhotoPreviews,
        ...files.map((file) => URL.createObjectURL(file)),
      ].slice(0, MAX_PRODUCT_PHOTOS),
    }));
  }

  function removeExistingPhoto(index: number) {
    setForm((f) => ({
      ...f,
      existingPhotoUrls: f.existingPhotoUrls.filter((_, i) => i !== index),
    }));
  }

  function removeNewPhoto(index: number) {
    setForm((f) => ({
      ...f,
      newPhotoFiles: f.newPhotoFiles.filter((_, i) => i !== index),
      newPhotoPreviews: f.newPhotoPreviews.filter((_, i) => i !== index),
    }));
  }

  function toggleFrequency(freq: ProductFrequency) {
    setForm((f) => ({
      ...f,
      frequencies: f.frequencies.includes(freq)
        ? f.frequencies.filter((x) => x !== freq)
        : [...f.frequencies, freq],
    }));
  }

  return (
    <div>
      <Label className="mb-1.5 block">Photos (up to {MAX_PRODUCT_PHOTOS})</Label>
      <div className="mb-4 flex flex-wrap gap-2">
        {form.existingPhotoUrls.map((src, i) => (
          <div
            key={`existing-${i}`}
            className="relative h-[80px] w-[80px] overflow-hidden rounded-lg border border-border"
          >
            <img src={src} alt="Product" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeExistingPhoto(i)}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-background/90 text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {form.newPhotoPreviews.map((src, i) => (
          <div
            key={`new-${i}`}
            className="relative h-[80px] w-[80px] overflow-hidden rounded-lg border border-border"
          >
            <img src={src} alt="Product" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeNewPhoto(i)}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-background/90 text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {totalPhotos < MAX_PRODUCT_PHOTOS && (
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
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Product name"
        />
        <Input
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          placeholder="Category"
        />
        <Input
          value={form.price}
          onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          placeholder="Price"
          type="number"
          step="0.01"
        />
        <Input
          value={form.unit}
          onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
          placeholder="Unit (lb, dozen…)"
        />
      </div>

      <div className="mt-3 space-y-1.5">
        <Label>Description</Label>
        <Textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Tell customers what makes this product worth trying…"
          className="min-h-[70px]"
        />
      </div>

      <label className="mt-4 flex items-center gap-2.5 text-sm text-foreground">
        <Checkbox
          checked={form.isSubscriptionEligible}
          onCheckedChange={(v) => setForm((f) => ({ ...f, isSubscriptionEligible: v === true }))}
        />
        Customers can subscribe to this product (recurring order), in addition to buying it one-time
      </label>

      {form.isSubscriptionEligible && (
        <div className="ml-6 mt-2 flex flex-wrap gap-3">
          {FREQUENCY_OPTIONS.map((f) => (
            <label key={f.key} className="flex items-center gap-1.5 text-sm text-foreground">
              <Checkbox
                checked={form.frequencies.includes(f.key)}
                onCheckedChange={() => toggleFrequency(f.key)}
              />
              {f.label}
            </label>
          ))}
        </div>
      )}

      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      <Button className="mt-3" onClick={onSubmit} disabled={submitting}>
        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {submitLabel}
      </Button>
    </div>
  );
}

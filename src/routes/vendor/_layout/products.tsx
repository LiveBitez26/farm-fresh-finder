import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Loader2, Plus, Repeat, ImagePlus, X, Pencil } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Label } from "../../../components/ui/label";
import { Checkbox } from "../../../components/ui/checkbox";
import { Badge } from "../../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { formatMoney } from "../../../lib/currency";
import {
  useCreateMyProduct,
  useMyProducts,
  useMyVendor,
  useUpdateMyProduct,
} from "../../../hooks/use-vendor-portal-data";
import { useToggleProductActive } from "../../../hooks/use-organization-data";
import type { Product } from "../../../lib/types";

export const Route = createFileRoute("/vendor/_layout/products")({
  component: VendorProductsPage,
});

type Frequency = "weekly" | "biweekly" | "monthly";

const FREQUENCY_OPTIONS: { key: Frequency; label: string }[] = [
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

interface FormState {
  name: string;
  description: string;
  category: string;
  price: string;
  unit: string;
  isSubscriptionEligible: boolean;
  frequencies: Frequency[];
  existingPhotoUrls: string[];
  newPhotoFiles: File[];
  newPhotoPreviews: string[];
}

const EMPTY_FORM: FormState = {
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

function ProductForm({
  form,
  setForm,
  error,
  submitting,
  onSubmit,
  submitLabel,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  error: string | null;
  submitting: boolean;
  onSubmit: () => void;
  submitLabel: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const totalPhotos = form.existingPhotoUrls.length + form.newPhotoFiles.length;

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, MAX_PHOTOS - totalPhotos);
    if (files.length === 0) return;
    setForm((f) => ({
      ...f,
      newPhotoFiles: [...f.newPhotoFiles, ...files].slice(0, MAX_PHOTOS),
      newPhotoPreviews: [
        ...f.newPhotoPreviews,
        ...files.map((file) => URL.createObjectURL(file)),
      ].slice(0, MAX_PHOTOS),
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

  function toggleFrequency(freq: Frequency) {
    setForm((f) => ({
      ...f,
      frequencies: f.frequencies.includes(freq)
        ? f.frequencies.filter((x) => x !== freq)
        : [...f.frequencies, freq],
    }));
  }

  return (
    <div>
      <Label className="mb-1.5 block">Photos (up to {MAX_PHOTOS})</Label>
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
        {totalPhotos < MAX_PHOTOS && (
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

function VendorProductsPage() {
  const { data: vendor } = useMyVendor();
  const { data: products, isLoading } = useMyProducts(vendor?.id);
  const createProduct = useCreateMyProduct();
  const updateProduct = useUpdateMyProduct();
  const toggleActive = useToggleProductActive();

  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<FormState>(EMPTY_FORM);
  const [addError, setAddError] = useState<string | null>(null);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    if (editingProduct) {
      setEditForm({
        name: editingProduct.name,
        description: editingProduct.description ?? "",
        category: editingProduct.category ?? "",
        price: String(editingProduct.price),
        unit: editingProduct.unit ?? "",
        isSubscriptionEligible: editingProduct.is_subscription_eligible,
        frequencies: (editingProduct.subscription_frequencies ?? []) as Frequency[],
        existingPhotoUrls:
          editingProduct.photo_urls ?? (editingProduct.photo_url ? [editingProduct.photo_url] : []),
        newPhotoFiles: [],
        newPhotoPreviews: [],
      });
      setEditError(null);
    }
  }, [editingProduct]);

  function validate(form: FormState): string | null {
    if (!form.name.trim() || Number.isNaN(Number(form.price))) {
      return "Enter a product name and a valid price.";
    }
    if (form.isSubscriptionEligible && form.frequencies.length === 0) {
      return "Pick at least one subscription frequency, or uncheck subscriptions.";
    }
    return null;
  }

  function handleAdd() {
    setAddError(null);
    if (!vendor) return;
    const validationError = validate(addForm);
    if (validationError) {
      setAddError(validationError);
      return;
    }
    createProduct.mutate(
      {
        vendorId: vendor.id,
        organizationId: vendor.organization_id,
        name: addForm.name.trim(),
        description: addForm.description.trim(),
        category: addForm.category.trim(),
        price: Number(addForm.price),
        unit: addForm.unit.trim(),
        currency: "USD",
        isSubscriptionEligible: addForm.isSubscriptionEligible,
        subscriptionFrequencies: addForm.frequencies,
        photoFiles: addForm.newPhotoFiles,
      },
      {
        onSuccess: () => {
          setAddForm(EMPTY_FORM);
          setShowAddForm(false);
        },
        onError: (e: Error) => setAddError(e.message),
      },
    );
  }

  function handleUpdate() {
    setEditError(null);
    if (!vendor || !editingProduct) return;
    const validationError = validate(editForm);
    if (validationError) {
      setEditError(validationError);
      return;
    }
    updateProduct.mutate(
      {
        productId: editingProduct.id,
        vendorId: vendor.id,
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        category: editForm.category.trim(),
        price: Number(editForm.price),
        unit: editForm.unit.trim(),
        isSubscriptionEligible: editForm.isSubscriptionEligible,
        subscriptionFrequencies: editForm.frequencies,
        keptPhotoUrls: editForm.existingPhotoUrls,
        newPhotoFiles: editForm.newPhotoFiles,
      },
      {
        onSuccess: () => setEditingProduct(null),
        onError: (e: Error) => setEditError(e.message),
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
        <Button
          onClick={() => {
            setAddForm(EMPTY_FORM);
            setShowAddForm((v) => !v);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {showAddForm && (
        <div className="mb-5 rounded-xl border border-border bg-card p-5">
          <ProductForm
            form={addForm}
            setForm={setAddForm}
            error={addError}
            submitting={createProduct.isPending}
            onSubmit={handleAdd}
            submitLabel="Save product"
          />
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
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <Button size="sm" variant="ghost" onClick={() => setEditingProduct(p)}>
                    <Pencil className="mr-1.5 h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleActive.mutate({ productId: p.id, isActive: !p.is_active })}
                  >
                    {p.is_active ? "Active" : "Inactive"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={Boolean(editingProduct)}
        onOpenChange={(open) => !open && setEditingProduct(null)}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-display)]">
              Edit Product
            </DialogTitle>
          </DialogHeader>
          <ProductForm
            form={editForm}
            setForm={setEditForm}
            error={editError}
            submitting={updateProduct.isPending}
            onSubmit={handleUpdate}
            submitLabel="Save changes"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

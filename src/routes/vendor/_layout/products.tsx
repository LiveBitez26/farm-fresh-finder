import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Repeat, ImagePlus, Pencil, Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";
import {
  ProductForm,
  EMPTY_PRODUCT_FORM,
  FREQUENCY_LABEL,
  validateProductForm,
  type ProductFormState,
} from "../../../components/shared/product-form";
import { formatMoney } from "../../../lib/currency";
import {
  useCreateMyProduct,
  useMyProducts,
  useMyVendor,
  useUpdateMyProduct,
} from "../../../hooks/use-vendor-portal-data";
import { useDeleteProduct, useToggleProductActive } from "../../../hooks/use-organization-data";
import type { Product } from "../../../lib/types";

export const Route = createFileRoute("/vendor/_layout/products")({
  component: VendorProductsPage,
});

function VendorProductsPage() {
  const { data: vendor } = useMyVendor();
  const { data: products, isLoading } = useMyProducts(vendor?.id);
  const createProduct = useCreateMyProduct();
  const updateProduct = useUpdateMyProduct();
  const deleteProduct = useDeleteProduct();
  const toggleActive = useToggleProductActive();

  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<ProductFormState>(EMPTY_PRODUCT_FORM);
  const [addError, setAddError] = useState<string | null>(null);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState<ProductFormState>(EMPTY_PRODUCT_FORM);
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
        frequencies: (editingProduct.subscription_frequencies ??
          []) as ProductFormState["frequencies"],
        existingPhotoUrls:
          editingProduct.photo_urls ?? (editingProduct.photo_url ? [editingProduct.photo_url] : []),
        newPhotoFiles: [],
        newPhotoPreviews: [],
      });
      setEditError(null);
    }
  }, [editingProduct]);

  function handleAdd() {
    setAddError(null);
    if (!vendor) return;
    const validationError = validateProductForm(addForm);
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
          setAddForm(EMPTY_PRODUCT_FORM);
          setShowAddForm(false);
        },
        onError: (e: Error) => setAddError(e.message),
      },
    );
  }

  function handleUpdate() {
    setEditError(null);
    if (!vendor || !editingProduct) return;
    const validationError = validateProductForm(editForm);
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
            setAddForm(EMPTY_PRODUCT_FORM);
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
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setProductToDelete(p)}
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Delete
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

      <AlertDialog
        open={Boolean(productToDelete)}
        onOpenChange={(open) => !open && setProductToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{productToDelete?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the product permanently. Customers will no longer be able to find or
              order it. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (productToDelete) deleteProduct.mutate(productToDelete.id);
                setProductToDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

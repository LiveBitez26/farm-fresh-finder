import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
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

function VendorProductsPage() {
  const { data: vendor } = useMyVendor();
  const { data: products, isLoading } = useMyProducts(vendor?.id);
  const createProduct = useCreateMyProduct();
  const toggleActive = useToggleProductActive();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleAdd() {
    setError(null);
    const parsedPrice = Number(price);
    if (!vendor) return;
    if (!name.trim() || Number.isNaN(parsedPrice)) {
      setError("Enter a product name and a valid price.");
      return;
    }
    createProduct.mutate(
      {
        vendorId: vendor.id,
        organizationId: vendor.organization_id,
        name: name.trim(),
        category: category.trim(),
        price: parsedPrice,
        unit: unit.trim(),
        currency: "USD",
      },
      {
        onSuccess: () => {
          setName("");
          setCategory("");
          setPrice("");
          setUnit("");
          setShowForm(false);
        },
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
              <div key={p.id} className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="text-[13.5px] font-semibold text-foreground">{p.name}</p>
                  <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                    {p.category ?? "—"} · {formatMoney(p.price, p.currency)}
                    {p.unit ? ` / ${p.unit}` : ""}
                  </p>
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

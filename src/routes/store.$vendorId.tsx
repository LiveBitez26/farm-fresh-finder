import { createFileRoute } from "@tanstack/react-router";
import { Loader2, MapPin, Globe, Repeat, ImagePlus, Leaf } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { formatMoney } from "../lib/currency";
import { usePublicVendor, usePublicVendorProducts } from "../hooks/use-public-storefront-data";

export const Route = createFileRoute("/store/$vendorId")({
  component: StorefrontPage,
});

const FREQUENCY_LABEL: Record<string, string> = {
  weekly: "Weekly",
  biweekly: "Bi-weekly",
  monthly: "Monthly",
};

function StorefrontPage() {
  const { vendorId } = Route.useParams();
  const { data: vendor, isLoading: vendorLoading } = usePublicVendor(vendorId);
  const { data: products, isLoading: productsLoading } = usePublicVendorProducts(vendorId);

  if (vendorLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="organizer-theme flex min-h-screen items-center justify-center bg-background px-4 text-center">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold text-foreground">
            Vendor not found
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This storefront doesn't exist, or the vendor isn't active yet.
          </p>
        </div>
      </div>
    );
  }

  const photos = vendor.photos ?? [];

  return (
    <div className="organizer-theme min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <div className="flex items-center gap-2 text-primary">
            <Leaf className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-wide">
              MarketConnect Vendor
            </span>
          </div>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-foreground">
            {vendor.business_name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {vendor.farm_location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {vendor.farm_location}
              </span>
            )}
            {vendor.website && (
              <a
                href={vendor.website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-primary underline"
              >
                <Globe className="h-3.5 w-3.5" />
                Website
              </a>
            )}
          </div>
          {vendor.product_categories && vendor.product_categories.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {vendor.product_categories.map((c) => (
                <Badge key={c} variant="secondary">
                  {c}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {photos.length > 0 && (
          <div className="mb-8 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {photos.map((src, i) => (
              <div key={i} className="aspect-square overflow-hidden rounded-xl bg-secondary">
                <img
                  src={src}
                  alt={`${vendor.business_name} photo ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {vendor.farm_story && (
          <div className="mb-8">
            <h2 className="mb-2 font-[family-name:var(--font-display)] text-lg font-semibold text-foreground">
              Our story
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{vendor.farm_story}</p>
          </div>
        )}

        {vendor.farming_practices && vendor.farming_practices.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-2 font-[family-name:var(--font-display)] text-lg font-semibold text-foreground">
              How we grow
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {vendor.farming_practices.map((p) => (
                <Badge key={p} className="bg-moss-soft text-primary" variant="secondary">
                  {p}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-lg font-semibold text-foreground">
            Products
          </h2>
          {productsLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (products ?? []).length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
              No products listed yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {products!.map((p) => (
                <div key={p.id} className="flex gap-3 rounded-xl border border-border bg-card p-3">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary">
                    {p.photo_url ? (
                      <img src={p.photo_url} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                      <ImagePlus className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{p.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatMoney(p.price, p.currency)}
                      {p.unit ? ` / ${p.unit}` : ""}
                    </p>
                    {p.description && (
                      <p className="mt-1 text-xs text-muted-foreground">{p.description}</p>
                    )}
                    {p.is_subscription_eligible && (
                      <Badge variant="secondary" className="mt-1.5 gap-1 text-[10px]">
                        <Repeat className="h-2.5 w-2.5" />
                        {(p.subscription_frequencies ?? [])
                          .map((f) => FREQUENCY_LABEL[f])
                          .join(" / ") || "Subscribable"}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

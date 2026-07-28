import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, ChevronRight, Loader2, Plus, Trash2 } from "lucide-react";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../../../components/ui/sheet";
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
  validateProductForm,
  type ProductFormState,
} from "../../../components/shared/product-form";
import { useAuth } from "../../../hooks/use-auth";
import { formatMoney } from "../../../lib/currency";
import {
  useCreateProduct,
  useDeleteProduct,
  useOrganization,
  useProductsForVendor,
  useToggleProductActive,
  useUpdateProduct,
  useUpdateVendorChecklist,
  useVendorApplications,
  useVendorBoothAssignment,
  useVendorBoothAssignmentsMap,
  useVendorHasVerifiedInsurance,
  useVendors,
} from "../../../hooks/use-organization-data";
import type { Product, Vendor, VendorApplicationStatus } from "../../../lib/types";

export const Route = createFileRoute("/organizer/_layout/vendors")({
  component: VendorsPage,
});

type VendorRow = {
  id: string;
  name: string;
  category: string;
  stage: VendorApplicationStatus;
  booth: string;
  since: string;
  story: string;
  cert: string;
  checklist: boolean[];
  isLive: boolean;
  farmLocation?: string;
  website?: string;
  farmingPractices?: string;
  vendorData?: Vendor;
};

const CHECKLIST_LABELS = [
  "Application completed",
  "Insurance uploaded",
  "Permit verified",
  "Agreement signed",
  "Fees paid",
  "Booth assigned",
];

const EDITABLE_CHECKLIST_FIELDS: Record<
  number,
  "permit_verified" | "agreement_signed" | "fees_paid"
> = {
  2: "permit_verified",
  3: "agreement_signed",
  4: "fees_paid",
};

const STAGES: { key: VendorApplicationStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "submitted", label: "Submitted" },
  { key: "document_review", label: "Review" },
  { key: "approved", label: "Approval" },
  { key: "agreement_signed", label: "Agreement" },
  { key: "activated", label: "Active" },
];

const STAGE_LABEL: Record<VendorApplicationStatus, string> = {
  submitted: "Application Submitted",
  document_review: "Document Review",
  approved: "Approval",
  agreement_signed: "Agreement Signed",
  payment_setup: "Payment Setup",
  activated: "Vendor Activated",
  rejected: "Rejected",
};

const MOCK_VENDORS: VendorRow[] = [
  {
    id: "1",
    name: "Green Fields Farm",
    category: "Produce",
    stage: "activated",
    booth: "A03",
    since: "2024",
    story:
      "Family-run vegetable farm using regenerative growing practices on 40 acres outside town.",
    cert: "USDA Organic — expires Mar 2027",
    checklist: [true, true, true, true, true, true],
    isLive: false,
  },
  {
    id: "2",
    name: "Miller's Honey Co.",
    category: "Honey & Preserves",
    stage: "activated",
    booth: "B01",
    since: "2023",
    story: "Small-batch raw honey and fruit preserves from a third-generation apiary.",
    cert: "Food Handler's Permit — expires Aug 6",
    checklist: [true, true, true, true, true, true],
    isLive: false,
  },
  {
    id: "3",
    name: "Blue Creek Dairy",
    category: "Dairy",
    stage: "activated",
    booth: "A07",
    since: "2022",
    story: "Grass-fed dairy producing raw milk cheese and cultured butter.",
    cert: "Liability Insurance — expires Aug 9",
    checklist: [true, true, true, true, true, true],
    isLive: false,
  },
  {
    id: "4",
    name: "Sunroot Bakery",
    category: "Baked Goods",
    stage: "activated",
    booth: "B04",
    since: "2023",
    story: "Sourdough and pastries baked fresh each market morning with local grain.",
    cert: "Health Dept. Inspection — expires Jul 16",
    checklist: [true, true, true, true, true, true],
    isLive: false,
  },
  {
    id: "5",
    name: "Rustling Oaks Orchard",
    category: "Fruit",
    stage: "agreement_signed",
    booth: "—",
    since: "2026",
    story: "Heirloom apple and pear orchard, third season selling direct to market.",
    cert: "Business License — verified",
    checklist: [true, true, true, true, false, false],
    isLive: false,
  },
  {
    id: "6",
    name: "Wildflower Apiary",
    category: "Honey",
    stage: "approved",
    booth: "—",
    since: "2026",
    story: "Backyard beekeeping operation expanding to its first farmers market.",
    cert: "Insurance — under review",
    checklist: [true, true, true, false, false, false],
    isLive: false,
  },
  {
    id: "7",
    name: "Copper Kettle Ferments",
    category: "Fermented Foods",
    stage: "document_review",
    booth: "—",
    since: "2026",
    story: "Small-batch kraut, kimchi, and hot sauce made with local produce.",
    cert: "Permit — pending upload",
    checklist: [true, true, false, false, false, false],
    isLive: false,
  },
  {
    id: "8",
    name: "Hollow Bend Herbs",
    category: "Herbs & Tea",
    stage: "document_review",
    booth: "—",
    since: "2026",
    story: "Dried culinary and medicinal herb blends grown on a half-acre plot.",
    cert: "Awaiting documents",
    checklist: [true, false, false, false, false, false],
    isLive: false,
  },
  {
    id: "9",
    name: "Prairie Wool Co.",
    category: "Fiber & Crafts",
    stage: "submitted",
    booth: "—",
    since: "2026",
    story: "Hand-spun wool and knitwear from a small sheep flock.",
    cert: "No documents yet",
    checklist: [true, false, false, false, false, false],
    isLive: false,
  },
];

function stagePillClass(stage: VendorApplicationStatus) {
  if (stage === "activated") return "bg-moss-soft text-primary";
  if (stage === "submitted" || stage === "rejected")
    return "bg-secondary text-secondary-foreground";
  if (stage === "document_review") return "bg-clay-soft text-accent";
  return "bg-moss-soft text-primary";
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
}

function buildLiveVendorRows(vendors: Vendor[]): VendorRow[] {
  return vendors.map((v) => ({
    id: v.id,
    name: v.business_name,
    category: (v.product_categories ?? []).join(", ") || "—",
    stage:
      v.status === "active"
        ? "activated"
        : v.status === "pending"
          ? "submitted"
          : "document_review",
    booth: "—",
    since: new Date(v.created_at).getFullYear().toString(),
    story: v.farm_story ?? "No farm story added yet.",
    cert: "See Compliance Vault for documents",
    checklist: [true, false, false, false, v.status === "active", false],
    isLive: true,
    farmLocation: v.farm_location ?? undefined,
    website: v.website ?? undefined,
    farmingPractices: (v.farming_practices ?? []).join(", ") || undefined,
    vendorData: v,
  }));
}

function VendorProductsSection({
  vendorId,
  currency,
}: {
  vendorId: string;
  currency: string | null | undefined;
}) {
  const { data: products, isLoading } = useProductsForVendor(vendorId);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
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
    const validationError = validateProductForm(addForm);
    if (validationError) {
      setAddError(validationError);
      return;
    }
    createProduct.mutate(
      {
        vendorId,
        name: addForm.name.trim(),
        description: addForm.description.trim(),
        category: addForm.category.trim(),
        price: Number(addForm.price),
        unit: addForm.unit.trim(),
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
    if (!editingProduct) return;
    const validationError = validateProductForm(editForm);
    if (validationError) {
      setEditError(validationError);
      return;
    }
    updateProduct.mutate(
      {
        productId: editingProduct.id,
        vendorId,
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
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <p className="text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">
          Products
        </p>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setAddForm(EMPTY_PRODUCT_FORM);
            setShowAddForm((v) => !v);
          }}
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          Add
        </Button>
      </div>

      {showAddForm && (
        <div className="mt-2 rounded-lg border border-border bg-card p-3">
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

      {isLoading ? (
        <p className="py-3 text-center text-xs text-muted-foreground">Loading…</p>
      ) : products && products.length > 0 ? (
        products.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between border-b border-border py-2 text-[13px] last:border-b-0"
          >
            <div>
              <p className="text-foreground">{p.name}</p>
              <p className="text-[11.5px] text-muted-foreground">
                {p.category ?? "—"} · {formatMoney(p.price, currency)}
                {p.unit ? ` / ${p.unit}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" onClick={() => setEditingProduct(p)}>
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
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))
      ) : (
        <p className="py-3 text-center text-xs text-muted-foreground">No products yet.</p>
      )}

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

function VendorsPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const hasOrg = Boolean(profile?.organization_id);
  const { data: vendors, isLoading } = useVendors();
  const { data: organization } = useOrganization();
  const { data: boothMap } = useVendorBoothAssignmentsMap();
  const { data: applications } = useVendorApplications();
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState<VendorApplicationStatus | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null);
  const [copiedApplyLink, setCopiedApplyLink] = useState(false);
  const updateChecklist = useUpdateVendorChecklist();

  const rows: VendorRow[] = useMemo(() => {
    if (vendors && vendors.length > 0) return buildLiveVendorRows(vendors);
    if (hasOrg) return [];
    return MOCK_VENDORS;
  }, [vendors, hasOrg]);

  const selected = rows.find((r) => r.id === selectedId) ?? null;
  const { data: realBoothAssignment } = useVendorBoothAssignment(
    selected?.isLive ? selected.id : undefined,
  );
  const { data: hasVerifiedInsurance } = useVendorHasVerifiedInsurance(
    selected?.isLive ? selected.id : undefined,
  );

  const filtered = rows.filter((r) => {
    const matchesStage = stage === "all" || r.stage === stage;
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase());
    return matchesStage && matchesSearch;
  });

  const pendingCount = hasOrg
    ? (applications ?? []).filter((a) => a.status !== "activated" && a.status !== "rejected").length
    : rows.filter((r) => r.stage !== "activated").length;

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-[19px] font-semibold text-foreground">
            Vendor Management
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {rows.length} active · {pendingCount} in onboarding
          </p>
        </div>
        {hasOrg && organization && (
          <Button
            variant="outline"
            className="border-border"
            onClick={() => {
              const url = `${window.location.origin}/apply/${organization.slug}`;
              navigator.clipboard.writeText(url);
              setCopiedApplyLink(true);
              setTimeout(() => setCopiedApplyLink(false), 2000);
            }}
          >
            {copiedApplyLink ? "Copied!" : "Copy Application Link"}
          </Button>
        )}
      </div>

      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2.5">
        <div className="relative min-w-[220px] max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vendors…"
            className="border-border bg-card pl-8 text-[13px]"
          />
        </div>
        <div className="flex gap-1 rounded-lg bg-secondary p-1">
          {STAGES.map((s) => (
            <button
              key={s.key}
              onClick={() => setStage(s.key)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                stage === s.key
                  ? "bg-card text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-1.5">
        {hasOrg && isLoading ? (
          <p className="p-8 text-center text-sm text-muted-foreground">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No vendors match this view.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Booth</TableHead>
                <TableHead>Since</TableHead>
                <TableHead className="w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer hover:bg-moss-soft/60"
                  onClick={() => setSelectedId(row.id)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2.5 font-semibold text-foreground">
                      <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-wheat font-[family-name:var(--font-display)] text-xs font-bold text-primary">
                        {initials(row.name)}
                      </div>
                      {row.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{row.category}</TableCell>
                  <TableCell>
                    <Badge className={stagePillClass(row.stage)} variant="secondary">
                      {STAGE_LABEL[row.stage]}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-muted-foreground">
                    {row.isLive ? (boothMap?.[row.id] ?? "—") : row.booth}
                  </TableCell>
                  <TableCell className="font-mono text-muted-foreground">{row.since}</TableCell>
                  <TableCell className="text-muted-foreground">
                    <ChevronRight className="h-4 w-4" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Sheet open={Boolean(selected)} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent className="w-full max-w-md overflow-y-auto bg-background">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="font-[family-name:var(--font-display)] text-xl">
                  {selected.name}
                </SheetTitle>
                <SheetDescription>
                  {selected.category} · Vendor since {selected.since}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-2 space-y-0 px-4">
                <div className="flex justify-between border-b border-border py-2.5 text-[13px]">
                  <span className="text-muted-foreground">Stage</span>
                  <span className="font-semibold text-foreground">
                    {STAGE_LABEL[selected.stage]}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border py-2.5 text-[13px]">
                  <span className="text-muted-foreground">Booth</span>
                  <span className="font-semibold text-foreground">
                    {selected.isLive
                      ? realBoothAssignment
                        ? `${realBoothAssignment.boothCode} · ${realBoothAssignment.marketName}`
                        : "Not assigned yet"
                      : selected.booth}
                  </span>
                </div>
                <div className="flex justify-between gap-4 border-b border-border py-2.5 text-[13px]">
                  <span className="shrink-0 text-muted-foreground">Certification</span>
                  <span className="text-right font-semibold text-foreground">{selected.cert}</span>
                </div>

                <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
                  {selected.story}
                </p>

                {selected.isLive &&
                  (selected.farmLocation || selected.website || selected.farmingPractices) && (
                    <div className="mt-3 space-y-1.5 text-[13px]">
                      {selected.farmLocation && (
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Location</span>
                          <span className="text-right font-medium text-foreground">
                            {selected.farmLocation}
                          </span>
                        </div>
                      )}
                      {selected.website && (
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Website</span>
                          <a
                            href={selected.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-right font-medium text-primary underline"
                          >
                            {selected.website}
                          </a>
                        </div>
                      )}
                      {selected.farmingPractices && (
                        <div className="flex justify-between gap-4">
                          <span className="shrink-0 text-muted-foreground">Practices</span>
                          <span className="text-right font-medium text-foreground">
                            {selected.farmingPractices}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                <p className="mb-2 mt-4 text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Onboarding checklist
                </p>
                {CHECKLIST_LABELS.map((label, i) => {
                  const isBoothStep = i === CHECKLIST_LABELS.length - 1;
                  const isInsuranceStep = i === 1;
                  const isAutoStep = isBoothStep || isInsuranceStep;
                  const editableField = EDITABLE_CHECKLIST_FIELDS[i];
                  const isEditable =
                    selected.isLive && Boolean(editableField) && Boolean(selected.vendorData);

                  const checked =
                    selected.isLive && isBoothStep
                      ? Boolean(realBoothAssignment)
                      : selected.isLive && isInsuranceStep
                        ? Boolean(hasVerifiedInsurance)
                        : isEditable
                          ? selected.vendorData![editableField]
                          : selected.checklist[i];

                  const toggle = () => {
                    if (!isEditable || !selected.vendorData) return;
                    updateChecklist.mutate({
                      vendorId: selected.id,
                      field: editableField,
                      value: !selected.vendorData[editableField],
                    });
                  };

                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={toggle}
                      disabled={!isEditable}
                      className={`flex w-full items-center gap-2.5 py-1.5 text-left text-[13px] ${
                        isEditable ? "cursor-pointer hover:text-primary" : "cursor-default"
                      }`}
                    >
                      <span
                        className={`flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-[5px] border text-[10px] ${
                          checked
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border"
                        }`}
                      >
                        {checked ? "✓" : ""}
                      </span>
                      {label}
                      {isAutoStep && selected.isLive && (
                        <span className="ml-auto text-[10.5px] text-muted-foreground">auto</span>
                      )}
                    </button>
                  );
                })}

                {selected.isLive && (
                  <VendorProductsSection
                    vendorId={selected.id}
                    currency={organization?.default_currency}
                  />
                )}

                <div className="mt-5 flex flex-wrap gap-2">
                  <Button
                    onClick={() =>
                      navigate({
                        to: "/organizer/communications",
                        search: { vendor: selected.name },
                      })
                    }
                  >
                    Message vendor
                  </Button>
                  {selected.isLive && selected.vendorData && !selected.vendorData.owner_user_id && (
                    <Button
                      variant="outline"
                      className="border-border"
                      onClick={() => {
                        const url = `${window.location.origin}/vendor/claim/${selected.id}`;
                        navigator.clipboard.writeText(url);
                        setCopiedInviteId(selected.id);
                        setTimeout(() => setCopiedInviteId(null), 2000);
                      }}
                    >
                      {copiedInviteId === selected.id ? "Copied!" : "Copy vendor invite link"}
                    </Button>
                  )}
                  {selected.isLive && selected.vendorData?.owner_user_id && (
                    <Badge variant="secondary" className="self-center">
                      Vendor Portal linked
                    </Badge>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Check, Clock, AlertTriangle, Plus, Loader2 } from "lucide-react";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { useAuth } from "../../../hooks/use-auth";
import {
  useComplianceDocuments,
  useCreateComplianceDocument,
  useUpdateDocumentStatus,
  useVendors,
} from "../../../hooks/use-organization-data";
import type { DocumentStatus, DocumentType } from "../../../lib/types";

export const Route = createFileRoute("/organizer/_layout/compliance")({
  component: CompliancePage,
});

type DocRow = {
  id: string;
  farm: string;
  type: string;
  status: "verified" | "pending" | "expiring";
  meta: string;
  isLive: boolean;
};

const TABS: { key: "all" | "verified" | "pending" | "expiring"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "verified", label: "Verified" },
  { key: "pending", label: "Pending" },
  { key: "expiring", label: "Expiring" },
];

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  business_license: "Business License",
  food_permit: "Food Permit",
  insurance_certificate: "Insurance Certificate",
  organic_certification: "USDA Organic Certificate",
  health_department_document: "Health Department Document",
  safety_document: "Safety Document",
  other_certification: "Certification",
};

const MOCK_DOCS: DocRow[] = [
  {
    id: "1",
    farm: "Green Fields Farm",
    type: "USDA Organic Certificate",
    status: "expiring",
    meta: "Mar 12, 2027 — flagged for annual review",
    isLive: false,
  },
  {
    id: "2",
    farm: "Sunroot Bakery",
    type: "Health Department Inspection",
    status: "expiring",
    meta: "Jul 16, 2026 — 6 days",
    isLive: false,
  },
  {
    id: "3",
    farm: "Miller's Honey Co.",
    type: "Food Handler's Permit",
    status: "expiring",
    meta: "Aug 6, 2026 — 28 days",
    isLive: false,
  },
  {
    id: "4",
    farm: "Blue Creek Dairy",
    type: "Liability Insurance",
    status: "expiring",
    meta: "Aug 9, 2026 — 30 days",
    isLive: false,
  },
  {
    id: "5",
    farm: "Rustling Oaks Orchard",
    type: "Business License",
    status: "verified",
    meta: "Verified · Jan 2027",
    isLive: false,
  },
  {
    id: "6",
    farm: "Wildflower Apiary",
    type: "Liability Insurance",
    status: "pending",
    meta: "Submitted Jul 7 — awaiting review",
    isLive: false,
  },
  {
    id: "7",
    farm: "Copper Kettle Ferments",
    type: "Home Kitchen Permit",
    status: "pending",
    meta: "Submitted Jul 9 — awaiting review",
    isLive: false,
  },
  {
    id: "8",
    farm: "Prairie Wool Co.",
    type: "Business License",
    status: "pending",
    meta: "Not yet submitted",
    isLive: false,
  },
];

function mapDbStatus(status: DocumentStatus): "verified" | "pending" | "expiring" {
  if (status === "verified") return "verified";
  if (status === "expiring_soon" || status === "expired") return "expiring";
  return "pending";
}

function stampClasses(status: DocRow["status"]) {
  if (status === "verified") return "border-primary text-primary bg-moss-soft";
  if (status === "pending") return "border-accent text-accent bg-clay-soft";
  return "border-destructive text-destructive bg-danger-soft";
}

const DOC_TYPE_OPTIONS: { key: DocumentType; label: string }[] = [
  { key: "business_license", label: "Business License" },
  { key: "food_permit", label: "Food Permit" },
  { key: "insurance_certificate", label: "Insurance Certificate" },
  { key: "organic_certification", label: "USDA Organic Certificate" },
  { key: "health_department_document", label: "Health Department Document" },
  { key: "safety_document", label: "Safety Document" },
  { key: "other_certification", label: "Other Certification" },
];

function LogDocumentDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { data: vendors } = useVendors();
  const createDocument = useCreateComplianceDocument();

  const [vendorId, setVendorId] = useState("");
  const [documentType, setDocumentType] = useState<DocumentType | "">("");
  const [title, setTitle] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    setError(null);
    if (!vendorId || !documentType || !title.trim()) {
      setError("Choose a vendor, document type, and title.");
      return;
    }
    createDocument.mutate(
      { vendorId, documentType, title: title.trim(), expiresAt: expiresAt || undefined },
      {
        onSuccess: () => {
          onOpenChange(false);
          setTitle("");
          setExpiresAt("");
        },
        onError: (e: Error) => setError(e.message),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-display)]">
            Log a Document
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Vendor</Label>
            <Select value={vendorId} onValueChange={setVendorId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a vendor" />
              </SelectTrigger>
              <SelectContent>
                {(vendors ?? []).map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.business_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Document type</Label>
            <Select value={documentType} onValueChange={(v) => setDocumentType(v as DocumentType)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a type" />
              </SelectTrigger>
              <SelectContent>
                {DOC_TYPE_OPTIONS.map((t) => (
                  <SelectItem key={t.key} value={t.key}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="USDA Organic Certificate"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Expiration date (optional)</Label>
            <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={createDocument.isPending}>
            {createDocument.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Log document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CompliancePage() {
  const { profile } = useAuth();
  const hasOrg = Boolean(profile?.organization_id);
  const { data: documents, isLoading } = useComplianceDocuments();
  const updateStatus = useUpdateDocumentStatus();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | "verified" | "pending" | "expiring">("all");
  const [logDialogOpen, setLogDialogOpen] = useState(false);

  const rows: DocRow[] = useMemo(() => {
    if (documents && documents.length > 0) {
      return documents.map((d) => ({
        id: d.id,
        farm: d.vendor_name,
        type: DOCUMENT_TYPE_LABELS[d.document_type],
        status: mapDbStatus(d.status),
        meta: d.expires_at ? `Expires ${d.expires_at}` : "No expiration on file",
        isLive: true,
      }));
    }
    if (hasOrg) return [];
    return MOCK_DOCS;
  }, [documents, hasOrg]);

  const filtered = rows.filter((r) => {
    const matchesTab = tab === "all" || r.status === tab;
    const matchesSearch =
      r.farm.toLowerCase().includes(search.toLowerCase()) ||
      r.type.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const needsAttention = rows.filter((r) => r.status !== "verified").length;

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-[19px] font-semibold text-foreground">
            Compliance Vault
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {needsAttention} document{needsAttention === 1 ? "" : "s"} need attention
          </p>
        </div>
        {hasOrg && (
          <Button onClick={() => setLogDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Log Document
          </Button>
        )}
      </div>

      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2.5">
        <div className="relative min-w-[220px] max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents…"
            className="border-border bg-card pl-8 text-[13px]"
          />
        </div>
        <div className="flex gap-1 rounded-lg bg-secondary p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                tab === t.key
                  ? "bg-card text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {hasOrg && isLoading ? (
        <p className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Loading…
        </p>
      ) : filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
          No documents match this view.
        </p>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
            >
              <div
                className={`flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border-2 ${stampClasses(doc.status)}`}
              >
                {doc.status === "verified" && <Check className="h-5 w-5" />}
                {doc.status === "pending" && <Clock className="h-5 w-5" />}
                {doc.status === "expiring" && <AlertTriangle className="h-5 w-5" />}
              </div>
              <div className="flex-1">
                <p className="text-[13.5px] font-bold text-foreground">{doc.farm}</p>
                <p className="mt-0.5 text-[12.5px] text-muted-foreground">{doc.type}</p>
              </div>
              <div className="mr-1.5 text-right text-xs text-muted-foreground">{doc.meta}</div>
              <div className="flex shrink-0 gap-1.5">
                {doc.status !== "verified" && (
                  <Button
                    size="sm"
                    disabled={!doc.isLive || updateStatus.isPending}
                    onClick={() => updateStatus.mutate({ documentId: doc.id, status: "verified" })}
                  >
                    Approve
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="border-border"
                  disabled={!doc.isLive || updateStatus.isPending}
                  onClick={() =>
                    updateStatus.mutate({ documentId: doc.id, status: "update_requested" })
                  }
                >
                  Request update
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <LogDocumentDialog open={logDialogOpen} onOpenChange={setLogDialogOpen} />
    </div>
  );
}

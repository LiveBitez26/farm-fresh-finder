import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Check, Clock, AlertTriangle } from "lucide-react";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { useAuth } from "../../../hooks/use-auth";
import { useComplianceDocuments } from "../../../hooks/use-organization-data";
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
  },
  {
    id: "2",
    farm: "Sunroot Bakery",
    type: "Health Department Inspection",
    status: "expiring",
    meta: "Jul 16, 2026 — 6 days",
  },
  {
    id: "3",
    farm: "Miller's Honey Co.",
    type: "Food Handler's Permit",
    status: "expiring",
    meta: "Aug 6, 2026 — 28 days",
  },
  {
    id: "4",
    farm: "Blue Creek Dairy",
    type: "Liability Insurance",
    status: "expiring",
    meta: "Aug 9, 2026 — 30 days",
  },
  {
    id: "5",
    farm: "Rustling Oaks Orchard",
    type: "Business License",
    status: "verified",
    meta: "Verified · Jan 2027",
  },
  {
    id: "6",
    farm: "Wildflower Apiary",
    type: "Liability Insurance",
    status: "pending",
    meta: "Submitted Jul 7 — awaiting review",
  },
  {
    id: "7",
    farm: "Copper Kettle Ferments",
    type: "Home Kitchen Permit",
    status: "pending",
    meta: "Submitted Jul 9 — awaiting review",
  },
  {
    id: "8",
    farm: "Prairie Wool Co.",
    type: "Business License",
    status: "pending",
    meta: "Not yet submitted",
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

function CompliancePage() {
  const { profile } = useAuth();
  const hasOrg = Boolean(profile?.organization_id);
  const { data: documents, isLoading } = useComplianceDocuments();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | "verified" | "pending" | "expiring">("all");

  const rows: DocRow[] = useMemo(() => {
    if (documents && documents.length > 0) {
      return documents.map((d) => ({
        id: d.id,
        farm: d.vendor_name,
        type: DOCUMENT_TYPE_LABELS[d.document_type],
        status: mapDbStatus(d.status),
        meta: d.expires_at ? `Expires ${d.expires_at}` : "No expiration on file",
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
      <div className="mb-5">
        <h1 className="font-[family-name:var(--font-display)] text-[19px] font-semibold text-foreground">
          Compliance Vault
        </h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {needsAttention} document{needsAttention === 1 ? "" : "s"} need attention
        </p>
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
                {doc.status !== "verified" && <Button size="sm">Approve</Button>}
                <Button size="sm" variant="outline" className="border-border">
                  Request update
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

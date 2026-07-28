import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Loader2, Upload, FileText, Check, Clock, AlertTriangle } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Badge } from "../../../components/ui/badge";
import {
  useMyDocuments,
  useMyVendor,
  useUploadComplianceDocument,
} from "../../../hooks/use-vendor-portal-data";
import type { DocumentType } from "../../../lib/types";

export const Route = createFileRoute("/vendor/_layout/documents")({
  component: VendorDocumentsPage,
});

const DOC_TYPE_OPTIONS: { key: DocumentType; label: string }[] = [
  { key: "business_license", label: "Business License" },
  { key: "food_permit", label: "Food Permit" },
  { key: "insurance_certificate", label: "Insurance Certificate" },
  { key: "organic_certification", label: "USDA Organic Certificate" },
  { key: "health_department_document", label: "Health Department Document" },
  { key: "safety_document", label: "Safety Document" },
  { key: "other_certification", label: "Other Certification" },
];

function statusMeta(status: string) {
  if (status === "verified")
    return { label: "Verified", icon: Check, className: "bg-moss-soft text-primary" };
  if (status === "expiring_soon" || status === "expired")
    return {
      label: status === "expired" ? "Expired" : "Expiring Soon",
      icon: AlertTriangle,
      className: "bg-danger-soft text-destructive",
    };
  return { label: "Pending Review", icon: Clock, className: "bg-clay-soft text-accent" };
}

function VendorDocumentsPage() {
  const { data: vendor } = useMyVendor();
  const { data: documents, isLoading } = useMyDocuments(vendor?.id);
  const uploadDocument = useUploadComplianceDocument();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [documentType, setDocumentType] = useState<DocumentType | "">("");
  const [title, setTitle] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleUpload() {
    setError(null);
    if (!vendor) return;
    if (!documentType || !title.trim() || !file) {
      setError("Choose a document type, title, and a file to upload.");
      return;
    }
    uploadDocument.mutate(
      {
        vendorId: vendor.id,
        organizationId: vendor.organization_id,
        documentType,
        title: title.trim(),
        expiresAt: expiresAt || undefined,
        file,
      },
      {
        onSuccess: () => {
          setDocumentType("");
          setTitle("");
          setExpiresAt("");
          setFile(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
        },
        onError: (e: Error) => setError(e.message),
      },
    );
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-[family-name:var(--font-display)] text-[19px] font-semibold text-foreground">
          Documents
        </h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Upload your business license, permits, and insurance — your organizer reviews and verifies
          each one.
        </p>
      </div>

      <div className="mb-5 rounded-xl border border-border bg-card p-5">
        <h3 className="mb-3 text-[15px] font-semibold text-foreground">Upload a document</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
              placeholder="e.g. 2026 Liability Insurance"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Expiration date (optional)</Label>
            <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>File</Label>
            <Input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        <Button className="mt-3" onClick={handleUpload} disabled={uploadDocument.isPending}>
          {uploadDocument.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          Upload document
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-1.5">
        {isLoading ? (
          <p className="p-8 text-center text-sm text-muted-foreground">Loading…</p>
        ) : (documents ?? []).length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No documents uploaded yet.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {documents!.map((d) => {
              const meta = statusMeta(d.status);
              return (
                <div key={d.id} className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13.5px] font-semibold text-foreground">{d.title}</p>
                    <p className="mt-0.5 text-[12px] text-muted-foreground">
                      {d.expires_at ? `Expires ${d.expires_at}` : "No expiration on file"}
                    </p>
                  </div>
                  <Badge className={meta.className} variant="secondary">
                    <meta.icon className="mr-1 h-3 w-3" />
                    {meta.label}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

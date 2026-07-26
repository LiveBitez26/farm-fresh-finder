import { createFileRoute } from "@tanstack/react-router";
import { FileCheck2, FileClock, FileX2, Upload } from "lucide-react";
import { PageHeader } from "../../components/organizer/page-header";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import type { DocumentStatus, DocumentType } from "../../lib/types";

export const Route = createFileRoute("/organizer/compliance")({
  component: CompliancePage,
});

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  business_license: "Business License",
  food_permit: "Food Permit",
  insurance_certificate: "Insurance Certificate",
  organic_certification: "USDA Organic Certificate",
  health_department_document: "Health Department Document",
  safety_document: "Safety Document",
  other_certification: "Certification",
};

const STATUS_STYLE: Record<
  DocumentStatus,
  { label: string; className: string; icon: typeof FileCheck2 }
> = {
  verified: { label: "Verified", className: "bg-primary/10 text-primary", icon: FileCheck2 },
  pending_review: {
    label: "Pending Review",
    className: "bg-secondary text-secondary-foreground",
    icon: FileClock,
  },
  expiring_soon: {
    label: "Expiring Soon",
    className: "bg-accent/15 text-accent-foreground",
    icon: FileClock,
  },
  expired: { label: "Expired", className: "bg-destructive/10 text-destructive", icon: FileX2 },
  update_requested: {
    label: "Update Requested",
    className: "bg-accent/15 text-accent-foreground",
    icon: FileClock,
  },
  rejected: { label: "Rejected", className: "bg-destructive/10 text-destructive", icon: FileX2 },
};

const RECORDS: {
  vendor: string;
  type: DocumentType;
  status: DocumentStatus;
  expires: string;
}[] = [
  {
    vendor: "Green Fields Farm",
    type: "organic_certification",
    status: "verified",
    expires: "March 2027",
  },
  {
    vendor: "Hilltop Honey Co.",
    type: "insurance_certificate",
    status: "expiring_soon",
    expires: "Aug 14, 2026",
  },
  { vendor: "Cascade Creamery", type: "food_permit", status: "pending_review", expires: "—" },
  {
    vendor: "River Bend Orchard",
    type: "business_license",
    status: "expired",
    expires: "May 2, 2026",
  },
  {
    vendor: "Sunfield Herbs",
    type: "health_department_document",
    status: "update_requested",
    expires: "—",
  },
];

function CompliancePage() {
  return (
    <div>
      <PageHeader
        title="Compliance Vault"
        description="Every vendor document, its verification status, and expiration in one place."
        actions={
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Request Documents
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {RECORDS.map((record) => {
          const style = STATUS_STYLE[record.status];
          return (
            <Card key={`${record.vendor}-${record.type}`}>
              <CardContent className="flex items-start justify-between gap-4 p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{record.vendor}</p>
                  <p className="text-sm text-muted-foreground">
                    {DOCUMENT_TYPE_LABELS[record.type]}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge className={style.className} variant="secondary">
                      <style.icon className="mr-1 h-3 w-3" />
                      {style.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">Expires: {record.expires}</span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-1.5">
                  <Button size="sm" variant="ghost">
                    Review
                  </Button>
                  <Button size="sm" variant="ghost">
                    Approve
                  </Button>
                  <Button size="sm" variant="ghost">
                    Request Update
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

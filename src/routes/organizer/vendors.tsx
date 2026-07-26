import { createFileRoute } from "@tanstack/react-router";
import { MoreHorizontal, Loader2 } from "lucide-react";
import { PageHeader } from "../../components/organizer/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../hooks/use-auth";
import { useVendorApplications, useVendors } from "../../hooks/use-organization-data";
import type { Vendor, VendorApplication, VendorApplicationStatus } from "../../lib/types";

export const Route = createFileRoute("/organizer/vendors")({
  component: VendorsPage,
});

const PIPELINE_STAGES: { key: VendorApplicationStatus; label: string }[] = [
  { key: "submitted", label: "Application Submitted" },
  { key: "document_review", label: "Document Review" },
  { key: "approved", label: "Approval" },
  { key: "agreement_signed", label: "Agreement Signed" },
  { key: "payment_setup", label: "Payment Setup" },
  { key: "activated", label: "Vendor Activated" },
];

// Fallback shown in preview mode / before an org has real applications yet.
const MOCK_APPLICATIONS: Record<VendorApplicationStatus, { name: string; category: string }[]> = {
  submitted: [{ name: "River Bend Orchard", category: "Fruit" }],
  document_review: [
    { name: "Blue Ridge Apiary", category: "Honey" },
    { name: "Cascade Creamery", category: "Dairy" },
  ],
  approved: [{ name: "Sunfield Herbs", category: "Herbs" }],
  agreement_signed: [],
  payment_setup: [{ name: "Willow Creek Bakery", category: "Baked goods" }],
  activated: [],
  rejected: [],
};

const MOCK_VENDORS = [
  {
    name: "Green Fields Farm",
    owner: "Maria Chen",
    categories: "Vegetables, Herbs",
    markets: 3,
    status: "active" as const,
  },
  {
    name: "Hilltop Honey Co.",
    owner: "Devon Okafor",
    categories: "Honey, Preserves",
    markets: 2,
    status: "active" as const,
  },
  {
    name: "Cascade Creamery",
    owner: "Lena Petrova",
    categories: "Dairy, Cheese",
    markets: 1,
    status: "pending" as const,
  },
];

function groupApplications(applications: VendorApplication[]) {
  const grouped: Record<VendorApplicationStatus, VendorApplication[]> = {
    submitted: [],
    document_review: [],
    approved: [],
    agreement_signed: [],
    payment_setup: [],
    activated: [],
    rejected: [],
  };
  for (const app of applications) grouped[app.status]?.push(app);
  return grouped;
}

function VendorsPage() {
  const { profile } = useAuth();
  const hasOrg = Boolean(profile?.organization_id);
  const { data: vendors, isLoading: vendorsLoading } = useVendors();
  const { data: applications, isLoading: appsLoading } = useVendorApplications();

  const liveGrouped = applications ? groupApplications(applications) : null;

  return (
    <div>
      <PageHeader
        title="Vendor Management"
        description={
          hasOrg
            ? "Applications, onboarding, and the full vendor directory."
            : "Preview mode — showing sample vendors and applications."
        }
        actions={<Button>Invite Vendor</Button>}
      />

      <Tabs defaultValue="pipeline">
        <TabsList>
          <TabsTrigger value="pipeline">Application Pipeline</TabsTrigger>
          <TabsTrigger value="directory">Vendor Directory</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="mt-6">
          {hasOrg && appsLoading ? (
            <LoadingRow />
          ) : (
            <div className="grid grid-cols-1 gap-4 overflow-x-auto sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {PIPELINE_STAGES.map((stage) => {
                const items = liveGrouped
                  ? liveGrouped[stage.key].map((a) => ({ name: a.applicant_name, category: "—" }))
                  : MOCK_APPLICATIONS[stage.key];
                return (
                  <div key={stage.key} className="min-w-[220px]">
                    <div className="mb-2 flex items-center justify-between px-1">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {stage.label}
                      </h3>
                      <Badge variant="secondary" className="rounded-full">
                        {items.length}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {items.map((app) => (
                        <Card
                          key={app.name}
                          className="cursor-pointer transition-shadow hover:shadow-md"
                        >
                          <CardContent className="p-3">
                            <p className="text-sm font-medium text-foreground">{app.name}</p>
                            <p className="text-xs text-muted-foreground">{app.category}</p>
                          </CardContent>
                        </Card>
                      ))}
                      {items.length === 0 && (
                        <div className="rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                          No applications
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="directory" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">All Vendors</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {hasOrg && vendorsLoading ? (
                <LoadingRow />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Categories</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendors && vendors.length > 0
                      ? vendors.map((vendor: Vendor) => (
                          <VendorRow
                            key={vendor.id}
                            name={vendor.business_name}
                            categories={(vendor.product_categories ?? []).join(", ") || "—"}
                            status={vendor.status}
                          />
                        ))
                      : !hasOrg &&
                        MOCK_VENDORS.map((vendor) => (
                          <VendorRow
                            key={vendor.name}
                            name={vendor.name}
                            categories={vendor.categories}
                            status={vendor.status}
                            owner={vendor.owner}
                          />
                        ))}
                  </TableBody>
                </Table>
              )}
              {hasOrg && !vendorsLoading && vendors && vendors.length === 0 && (
                <p className="p-6 text-center text-sm text-muted-foreground">
                  No vendors yet — use "Load sample data" on the Overview page, or invite your first
                  vendor.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function VendorRow({
  name,
  categories,
  status,
  owner,
}: {
  name: string;
  categories: string;
  status: string;
  owner?: string;
}) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-secondary text-xs">
              {name
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-foreground">{name}</p>
            {owner && <p className="text-xs text-muted-foreground">{owner}</p>}
          </div>
        </div>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">{categories}</TableCell>
      <TableCell>
        <Badge variant={status === "active" ? "default" : "secondary"}>{status}</Badge>
      </TableCell>
      <TableCell>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

function LoadingRow() {
  return (
    <div className="flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      Loading…
    </div>
  );
}

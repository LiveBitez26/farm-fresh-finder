import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Circle, MoreHorizontal } from "lucide-react";
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
import type { VendorApplicationStatus } from "../../lib/types";

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

const APPLICATIONS: Record<VendorApplicationStatus, { name: string; category: string }[]> = {
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

const VENDORS = [
  {
    name: "Green Fields Farm",
    owner: "Maria Chen",
    categories: "Vegetables, Herbs",
    markets: 3,
    status: "active" as const,
    checklist: {
      application: true,
      insurance: true,
      permit: true,
      agreement: true,
      fees: true,
      booth: true,
    },
  },
  {
    name: "Hilltop Honey Co.",
    owner: "Devon Okafor",
    categories: "Honey, Preserves",
    markets: 2,
    status: "active" as const,
    checklist: {
      application: true,
      insurance: true,
      permit: true,
      agreement: true,
      fees: false,
      booth: false,
    },
  },
  {
    name: "Cascade Creamery",
    owner: "Lena Petrova",
    categories: "Dairy, Cheese",
    markets: 1,
    status: "pending" as const,
    checklist: {
      application: true,
      insurance: true,
      permit: false,
      agreement: false,
      fees: false,
      booth: false,
    },
  },
];

function VendorsPage() {
  return (
    <div>
      <PageHeader
        title="Vendor Management"
        description="Applications, onboarding, and the full vendor directory."
        actions={<Button>Invite Vendor</Button>}
      />

      <Tabs defaultValue="pipeline">
        <TabsList>
          <TabsTrigger value="pipeline">Application Pipeline</TabsTrigger>
          <TabsTrigger value="directory">Vendor Directory</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="mt-6">
          <div className="grid grid-cols-1 gap-4 overflow-x-auto sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {PIPELINE_STAGES.map((stage) => (
              <div key={stage.key} className="min-w-[220px]">
                <div className="mb-2 flex items-center justify-between px-1">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {stage.label}
                  </h3>
                  <Badge variant="secondary" className="rounded-full">
                    {APPLICATIONS[stage.key].length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {APPLICATIONS[stage.key].map((app) => (
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
                  {APPLICATIONS[stage.key].length === 0 && (
                    <div className="rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                      No applications
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="directory" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">All Vendors</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Categories</TableHead>
                    <TableHead>Markets</TableHead>
                    <TableHead>Onboarding</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {VENDORS.map((vendor) => {
                    const checklistDone = Object.values(vendor.checklist).filter(Boolean).length;
                    const checklistTotal = Object.values(vendor.checklist).length;
                    return (
                      <TableRow key={vendor.name}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-secondary text-xs">
                                {vendor.name
                                  .split(" ")
                                  .map((w) => w[0])
                                  .slice(0, 2)
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-foreground">{vendor.name}</p>
                              <p className="text-xs text-muted-foreground">{vendor.owner}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {vendor.categories}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {vendor.markets}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {checklistDone === checklistTotal ? (
                              <CheckCircle2 className="h-4 w-4 text-primary" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="text-xs text-muted-foreground">
                              {checklistDone}/{checklistTotal}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={vendor.status === "active" ? "default" : "secondary"}>
                            {vendor.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Users,
  CalendarDays,
  Footprints,
  DollarSign,
  FileClock,
  ShieldAlert,
  FileBarChart,
  X,
} from "lucide-react";
import { PageHeader } from "../../components/organizer/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Separator } from "../../components/ui/separator";

export const Route = createFileRoute("/organizer/")({
  component: OverviewPage,
});

// Mock data — replace with Supabase queries against `analytics_events`,
// `vendors`, `schedules`, and `documents` once a project is connected.
const METRICS = [
  { label: "Active Vendors", value: "68", change: "+4 this month", icon: Users },
  { label: "Upcoming Markets", value: "6", change: "next 30 days", icon: CalendarDays },
  { label: "Customer Visits", value: "3,240", change: "+12% vs last month", icon: Footprints },
  { label: "Revenue Generated", value: "$41,280", change: "+8% vs last month", icon: DollarSign },
  { label: "Pending Applications", value: "9", change: "3 awaiting docs", icon: FileClock },
  { label: "Expiring Certifications", value: "5", change: "within 30 days", icon: ShieldAlert },
] as const;

const IMPACT_REPORT = {
  vendorCount: 68,
  salesVolume: "$41,280",
  attendance: "3,240 visits",
  communityImpact: "412 lbs of surplus produce donated to local food banks",
  localEconomicContribution: "$1.9M estimated annual local economic contribution",
};

function OverviewPage() {
  const [reportOpen, setReportOpen] = useState(false);

  return (
    <div>
      <PageHeader
        title="Overview"
        description="A daily pulse on your markets, vendors, and revenue."
        actions={
          <Button onClick={() => setReportOpen(true)}>
            <FileBarChart className="mr-2 h-4 w-4" />
            Generate Market Impact Report
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {METRICS.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.label}
              </CardTitle>
              <metric.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-foreground">{metric.value}</div>
              <p className="mt-1 text-xs text-muted-foreground">{metric.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-display)]">
              Market Impact Report
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <ReportRow label="Vendor count" value={String(IMPACT_REPORT.vendorCount)} />
            <ReportRow label="Sales volume" value={IMPACT_REPORT.salesVolume} />
            <ReportRow label="Customer attendance" value={IMPACT_REPORT.attendance} />
            <Separator />
            <ReportRow label="Community impact" value={IMPACT_REPORT.communityImpact} />
            <ReportRow
              label="Local economic contribution"
              value={IMPACT_REPORT.localEconomicContribution}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Generated from mock data — will pull live totals from{" "}
            <code className="rounded bg-muted px-1 py-0.5">analytics_events</code>,{" "}
            <code className="rounded bg-muted px-1 py-0.5">orders</code>, and{" "}
            <code className="rounded bg-muted px-1 py-0.5">vendors</code> once Supabase is
            connected.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setReportOpen(false)}>
              <X className="mr-2 h-4 w-4" />
              Close
            </Button>
            <Button>Export PDF</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ReportRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

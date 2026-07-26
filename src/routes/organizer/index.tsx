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
  Sparkles,
  Loader2,
} from "lucide-react";
import { PageHeader } from "../../components/organizer/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Separator } from "../../components/ui/separator";
import { useAuth } from "../../hooks/use-auth";
import { useOverviewMetrics, useSeedDemoData } from "../../hooks/use-organization-data";

export const Route = createFileRoute("/organizer/")({
  component: OverviewPage,
});

// Fallback shown in preview mode (no Supabase connection) or before an
// organization has any real data yet.
const MOCK_METRICS = {
  activeVendors: 68,
  upcomingMarkets: 6,
  customerVisits: 3240,
  revenue: 41280,
  pendingApplications: 9,
  expiringCertifications: 5,
};

const IMPACT_REPORT = {
  communityImpact: "412 lbs of surplus produce donated to local food banks",
  localEconomicContribution: "$1.9M estimated annual local economic contribution",
};

function formatCurrency(n: number) {
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function OverviewPage() {
  const [reportOpen, setReportOpen] = useState(false);
  const { profile } = useAuth();
  const { data: liveMetrics, isLoading } = useOverviewMetrics();
  const seedDemoData = useSeedDemoData();

  const hasOrg = Boolean(profile?.organization_id);
  const m = liveMetrics ?? MOCK_METRICS;
  const isEmptyOrg = hasOrg && liveMetrics && liveMetrics.activeVendors === 0;

  const METRICS = [
    { label: "Active Vendors", value: String(m.activeVendors), icon: Users },
    { label: "Upcoming Markets", value: String(m.upcomingMarkets), icon: CalendarDays },
    { label: "Customer Visits", value: m.customerVisits.toLocaleString(), icon: Footprints },
    { label: "Revenue Generated", value: formatCurrency(m.revenue), icon: DollarSign },
    { label: "Pending Applications", value: String(m.pendingApplications), icon: FileClock },
    {
      label: "Expiring Certifications",
      value: String(m.expiringCertifications),
      icon: ShieldAlert,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Overview"
        description={
          hasOrg
            ? "A daily pulse on your markets, vendors, and revenue."
            : "Preview mode — connect Supabase and create an organization for live data."
        }
        actions={
          <Button onClick={() => setReportOpen(true)}>
            <FileBarChart className="mr-2 h-4 w-4" />
            Generate Market Impact Report
          </Button>
        }
      />

      {isEmptyOrg && (
        <div className="mb-6 flex flex-col items-start justify-between gap-3 rounded-2xl border border-dashed border-border bg-card/50 p-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-foreground">Your organization is empty.</p>
            <p className="text-sm text-muted-foreground">
              Add a market and a few vendors to see the dashboard come alive.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => seedDemoData.mutate()}
            disabled={seedDemoData.isPending}
          >
            {seedDemoData.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Load sample data
          </Button>
        </div>
      )}

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
              <div className="text-2xl font-semibold text-foreground">
                {hasOrg && isLoading ? "—" : metric.value}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {hasOrg ? "live from your organization" : "sample data"}
              </p>
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
            <ReportRow label="Vendor count" value={String(m.activeVendors)} />
            <ReportRow label="Sales volume" value={formatCurrency(m.revenue)} />
            <ReportRow
              label="Customer attendance"
              value={`${m.customerVisits.toLocaleString()} visits`}
            />
            <Separator />
            <ReportRow label="Community impact" value={IMPACT_REPORT.communityImpact} />
            <ReportRow
              label="Local economic contribution"
              value={IMPACT_REPORT.localEconomicContribution}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {hasOrg
              ? "Vendor count, sales, and attendance are live from your organization. Community impact figures are illustrative until donation tracking ships."
              : "Showing sample data — connect Supabase and create an organization for live totals."}
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

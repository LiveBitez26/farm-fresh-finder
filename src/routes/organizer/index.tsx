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
  Flag,
  Mail,
  ArrowRight,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Separator } from "../../components/ui/separator";
import { useAuth } from "../../hooks/use-auth";
import {
  useOrganization,
  useOverviewMetrics,
  useSeedDemoData,
  useUpcomingSchedules,
  useVendorApplicationsAwaitingAction,
} from "../../hooks/use-organization-data";
import type { VendorApplicationStatus } from "../../lib/types";

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

const MOCK_APPLICATIONS: {
  applicant_name: string;
  categories: string;
  status: VendorApplicationStatus;
}[] = [
  { applicant_name: "Wildflower Apiary", categories: "Honey", status: "approved" },
  {
    applicant_name: "Copper Kettle Ferments",
    categories: "Fermented Foods",
    status: "document_review",
  },
  { applicant_name: "Hollow Bend Herbs", categories: "Herbs & Tea", status: "document_review" },
  { applicant_name: "Prairie Wool Co.", categories: "Fiber & Textiles", status: "submitted" },
];

const MOCK_SCHEDULES = [
  {
    id: "1",
    marketName: "Saturday Downtown Market",
    eventDate: "2026-08-01",
    startTime: "09:00",
    endTime: "13:00",
  },
  {
    id: "2",
    marketName: "Tuesday Riverside Market",
    eventDate: "2026-08-04",
    startTime: "15:00",
    endTime: "19:00",
  },
  {
    id: "3",
    marketName: "Harvest Festival Special",
    eventDate: "2026-08-16",
    startTime: "10:00",
    endTime: "16:00",
  },
];

const IMPACT_REPORT = {
  communityImpact: "412 lbs of surplus produce donated to local food banks",
  localEconomicContribution: "$1.9M estimated annual local economic contribution",
};

const STATUS_LABEL: Record<VendorApplicationStatus, string> = {
  submitted: "Application Submitted",
  document_review: "Document Review",
  approved: "Approval",
  agreement_signed: "Agreement Signed",
  payment_setup: "Payment Setup",
  activated: "Activated",
  rejected: "Rejected",
};

function formatCurrency(n: number) {
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function formatEventDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function formatTimeRange(start: string | null, end: string | null) {
  if (!start || !end) return null;
  const fmt = (t: string) => {
    const [h, m] = t.split(":");
    const hour = Number(h);
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour}${m === "00" ? "" : `:${m}`} ${period}`;
  };
  return `${fmt(start)} – ${fmt(end)}`;
}

function OverviewPage() {
  const [reportOpen, setReportOpen] = useState(false);
  const { profile } = useAuth();
  const { data: organization } = useOrganization();
  const { data: liveMetrics, isLoading } = useOverviewMetrics();
  const { data: liveApplications, isLoading: applicationsLoading } =
    useVendorApplicationsAwaitingAction();
  const { data: liveSchedules, isLoading: schedulesLoading } = useUpcomingSchedules();
  const seedDemoData = useSeedDemoData();

  const hasOrg = Boolean(profile?.organization_id);
  const m = liveMetrics ?? MOCK_METRICS;
  const isEmptyOrg = hasOrg && liveMetrics && liveMetrics.activeVendors === 0;
  const applications = liveApplications ?? (hasOrg ? [] : MOCK_APPLICATIONS);
  const schedules = liveSchedules ?? (hasOrg ? [] : MOCK_SCHEDULES);

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const METRICS = [
    {
      label: "Active Vendors",
      value: String(m.activeVendors),
      delta: "+4 this month",
      icon: Users,
    },
    {
      label: "Upcoming Markets",
      value: String(m.upcomingMarkets),
      delta: `${m.upcomingMarkets} scheduled`,
      icon: CalendarDays,
    },
    {
      label: "Customer Visits",
      value: m.customerVisits.toLocaleString(),
      delta: "+12% vs last week",
      icon: Footprints,
    },
    {
      label: "Revenue Generated",
      value: formatCurrency(m.revenue),
      delta: "+8% vs last week",
      icon: DollarSign,
    },
    {
      label: "Pending Applications",
      value: String(m.pendingApplications),
      delta: "awaiting review",
      icon: FileClock,
    },
    {
      label: "Expiring Certifications",
      value: String(m.expiringCertifications),
      delta: "within 30 days",
      icon: ShieldAlert,
    },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Overview
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {today} · {organization?.name ?? (hasOrg ? "Your organization" : "Preview mode")}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" size="icon" title="Flag an issue">
            <Flag className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" title="Communication Hub" asChild>
            <Link to="/organizer/communications">
              <Mail className="h-4 w-4" />
            </Link>
          </Button>
          <Button onClick={() => setReportOpen(true)}>
            <FileBarChart className="mr-2 h-4 w-4" />
            Generate Market Impact Report
          </Button>
        </div>
      </div>

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

      <h2 className="mb-3 font-[family-name:var(--font-display)] text-base font-semibold text-foreground">
        This week at a glance
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {METRICS.map((metric) => (
          <Card key={metric.label} className="relative overflow-hidden border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-[family-name:var(--font-display)] text-3xl font-semibold text-foreground">
                {hasOrg && isLoading ? "—" : metric.value}
              </div>
              <p className="mt-1 text-xs text-primary">{metric.delta}</p>
            </CardContent>
            <metric.icon className="absolute right-3 top-3 h-4 w-4 text-muted-foreground/50" />
          </Card>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-[family-name:var(--font-display)] text-base">
              Vendor applications awaiting action
            </CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link to="/organizer/vendors">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {hasOrg && applicationsLoading ? (
              <LoadingRow />
            ) : applications.length === 0 ? (
              <EmptyRow text="No applications awaiting action." />
            ) : (
              <div className="divide-y divide-border">
                {applications.map((app) => (
                  <div
                    key={app.applicant_name}
                    className="flex items-center justify-between gap-4 px-6 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{app.applicant_name}</p>
                      <p className="text-xs text-muted-foreground">{app.categories}</p>
                    </div>
                    <Badge variant="secondary">{STATUS_LABEL[app.status]}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-[family-name:var(--font-display)] text-base">
              Upcoming markets
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {hasOrg && schedulesLoading ? (
              <LoadingRow />
            ) : schedules.length === 0 ? (
              <EmptyRow text="No markets scheduled yet." />
            ) : (
              <div className="divide-y divide-border">
                {schedules.map((s) => (
                  <div key={s.id} className="flex items-center justify-between gap-4 px-6 py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{s.marketName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatEventDate(s.eventDate)}
                        {formatTimeRange(s.startTime, s.endTime) &&
                          ` · ${formatTimeRange(s.startTime, s.endTime)}`}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
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

function LoadingRow() {
  return (
    <div className="flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      Loading…
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return <p className="p-6 text-center text-sm text-muted-foreground">{text}</p>;
}

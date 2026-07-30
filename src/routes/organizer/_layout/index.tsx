import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { FileBarChart, Flag, Mail, X, Sparkles, Loader2, ExternalLink } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Separator } from "../../../components/ui/separator";
import { TicketCard } from "../../../components/organizer/ticket-card";
import { formatMoney } from "../../../lib/currency";
import { useAuth } from "../../../hooks/use-auth";
import {
  useComplianceDocuments,
  useOrganization,
  useOverviewMetrics,
  useSeedDemoData,
  useUpcomingSchedules,
  useVendorApplicationsAwaitingAction,
} from "../../../hooks/use-organization-data";
import type { VendorApplicationStatus } from "../../../lib/types";

export const Route = createFileRoute("/organizer/_layout/")({
  component: OverviewPage,
});

const MOCK_METRICS = {
  activeVendors: 58,
  upcomingMarkets: 3,
  customerVisits: 2140,
  revenue: 41200,
  pendingApplications: 7,
  expiringCertifications: 4,
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
  { applicant_name: "Prairie Wool Co.", categories: "Fiber & Crafts", status: "submitted" },
];

const MOCK_SCHEDULES = [
  {
    id: "1",
    marketName: "Saturday Downtown Market",
    eventDate: "2026-08-01",
    startTime: "09:00",
    endTime: "13:00",
    boothLabel: "42 booths set",
    boothTone: "good" as const,
  },
  {
    id: "2",
    marketName: "Tuesday Riverside Market",
    eventDate: "2026-08-04",
    startTime: "15:00",
    endTime: "19:00",
    boothLabel: "6 open booths",
    boothTone: "warn" as const,
  },
  {
    id: "3",
    marketName: "Harvest Festival Special",
    eventDate: "2026-08-16",
    startTime: "10:00",
    endTime: "16:00",
    boothLabel: "Planning",
    boothTone: "neutral" as const,
  },
];

const MOCK_COMPLIANCE_SNAPSHOT = [
  {
    vendor: "Green Fields Farm",
    doc: "USDA Organic Certificate",
    label: "Expires in 12 days",
    tone: "bad" as const,
  },
  {
    vendor: "Miller's Honey Co.",
    doc: "Food Handler's Permit",
    label: "Expires in 28 days",
    tone: "warn" as const,
  },
  {
    vendor: "Blue Creek Dairy",
    doc: "Liability Insurance",
    label: "Expires in 30 days",
    tone: "warn" as const,
  },
  {
    vendor: "Sunroot Bakery",
    doc: "Health Dept. Inspection",
    label: "Expires in 6 days",
    tone: "bad" as const,
  },
];

const IMPACT_REPORT = {
  communityImpact: "3 SNAP/EBT matching programs · 2 school field trips hosted",
  localEconomicContribution: "$226,900 estimated local economic contribution",
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

const STATUS_TONE: Record<VendorApplicationStatus, "good" | "warn" | "neutral"> = {
  submitted: "neutral",
  document_review: "warn",
  approved: "good",
  agreement_signed: "good",
  payment_setup: "good",
  activated: "good",
  rejected: "neutral",
};

function pillClass(tone: "good" | "warn" | "bad" | "neutral") {
  if (tone === "good") return "bg-moss-soft text-primary";
  if (tone === "warn") return "bg-clay-soft text-accent";
  if (tone === "bad") return "bg-danger-soft text-destructive";
  return "bg-secondary text-secondary-foreground";
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

function daysUntil(dateStr: string) {
  const diff = Math.ceil(
    (new Date(`${dateStr}T00:00:00`).getTime() - new Date().setHours(0, 0, 0, 0)) / 86_400_000,
  );
  if (diff < 0) return "Expired";
  if (diff === 0) return "Expires today";
  return `Expires in ${diff} day${diff === 1 ? "" : "s"}`;
}

function OverviewPage() {
  const [reportOpen, setReportOpen] = useState(false);
  const { profile } = useAuth();
  const { data: organization } = useOrganization();
  const { data: liveMetrics, isLoading } = useOverviewMetrics();
  const { data: liveApplications } = useVendorApplicationsAwaitingAction();
  const { data: liveSchedules } = useUpcomingSchedules();
  const { data: liveDocuments } = useComplianceDocuments();
  const seedDemoData = useSeedDemoData();

  const hasOrg = Boolean(profile?.organization_id);
  const m = liveMetrics ?? MOCK_METRICS;
  const isEmptyOrg = hasOrg && liveMetrics && liveMetrics.activeVendors === 0;
  const applications = liveApplications ?? (hasOrg ? [] : MOCK_APPLICATIONS);
  const schedules: {
    id: string;
    marketName: string;
    eventDate: string;
    startTime: string | null;
    endTime: string | null;
    boothLabel?: string;
    boothTone?: "good" | "warn" | "neutral";
  }[] = liveSchedules
    ? liveSchedules.map((s) => ({ ...s, boothLabel: undefined, boothTone: undefined }))
    : hasOrg
      ? []
      : MOCK_SCHEDULES;
  const complianceSnapshot =
    liveDocuments
      ?.filter((d) => d.status !== "verified" && d.expires_at)
      .slice(0, 4)
      .map((d) => ({
        vendor: d.vendor_name,
        doc: d.title,
        label: daysUntil(d.expires_at as string),
        tone:
          d.status === "expired"
            ? ("bad" as const)
            : d.status === "expiring_soon"
              ? ("bad" as const)
              : ("warn" as const),
      })) ?? (hasOrg ? [] : MOCK_COMPLIANCE_SNAPSHOT);

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const TICKETS = [
    {
      label: "Active Vendors",
      value: String(m.activeVendors),
      delta: "+4 this month",
      tone: "good" as const,
    },
    {
      label: "Upcoming Markets",
      value: String(m.upcomingMarkets),
      delta: `${m.upcomingMarkets} scheduled`,
      tone: "good" as const,
    },
    {
      label: "Customer Visits",
      value: m.customerVisits.toLocaleString(),
      delta: "+12% vs last week",
      tone: "good" as const,
    },
    {
      label: "Revenue Generated",
      value: (
        <span className="font-mono">{formatMoney(m.revenue, organization?.default_currency)}</span>
      ),
      delta: "+8% vs last week",
      tone: "good" as const,
    },
    {
      label: "Pending Applications",
      value: String(m.pendingApplications),
      delta: "awaiting review",
      tone: "warn" as const,
    },
    {
      label: "Expiring Certifications",
      value: String(m.expiringCertifications),
      delta: "within 30 days",
      tone: "bad" as const,
    },
  ];

  return (
    <div>
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-[19px] font-semibold text-foreground">
            Overview
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {today} · {organization?.name ?? (hasOrg ? "Your organization" : "Ohio Valley Markets")}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            title="Flag an issue"
            className="border-border bg-card"
          >
            <Flag className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            title="Communication Hub"
            className="border-border bg-card"
            asChild
          >
            <Link to="/organizer/communications">
              <Mail className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" className="border-border bg-card" asChild>
            <a href="/" target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              View Live Marketplace
            </a>
          </Button>
          <Button onClick={() => setReportOpen(true)}>
            <FileBarChart className="mr-2 h-4 w-4" />
            Generate Market Impact Report
          </Button>
        </div>
      </div>

      {isEmptyOrg && (
        <div className="mb-6 flex flex-col items-start justify-between gap-3 rounded-xl border border-dashed border-border bg-card p-4 sm:flex-row sm:items-center">
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

      <h2 className="mb-3 font-[family-name:var(--font-display)] text-[15.5px] font-semibold text-primary">
        This week at a glance
      </h2>
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
        {TICKETS.map((t) => (
          <TicketCard
            key={t.label}
            label={t.label}
            value={hasOrg && isLoading ? "—" : t.value}
            delta={t.delta}
            deltaTone={t.tone}
          />
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-foreground">
              Vendor applications awaiting action
            </h3>
            <Button variant="outline" size="sm" className="border-border bg-background" asChild>
              <Link to="/organizer/vendors">View all</Link>
            </Button>
          </div>
          {applications.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No applications awaiting action.
            </p>
          ) : (
            applications.map((app, i) => (
              <div
                key={app.applicant_name + i}
                className="flex items-center justify-between gap-4 border-b border-border py-2.5 text-[13px] last:border-b-0"
              >
                <div>
                  <p className="text-foreground">{app.applicant_name}</p>
                  <p className="mt-0.5 text-[11.5px] text-muted-foreground">{app.categories}</p>
                </div>
                <Badge className={pillClass(STATUS_TONE[app.status])} variant="secondary">
                  {STATUS_LABEL[app.status]}
                </Badge>
              </div>
            ))
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-3 text-[15px] font-semibold text-foreground">Upcoming markets</h3>
          {schedules.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No markets scheduled yet.
            </p>
          ) : (
            schedules.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-4 border-b border-border py-2.5 text-[13px] last:border-b-0"
              >
                <div>
                  <p className="font-medium text-foreground">{s.marketName}</p>
                  <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                    {formatEventDate(s.eventDate)}
                    {formatTimeRange(s.startTime, s.endTime) &&
                      ` · ${formatTimeRange(s.startTime, s.endTime)}`}
                  </p>
                </div>
                {s.boothLabel && (
                  <Badge
                    className={pillClass(
                      s.boothTone === "good" ? "good" : s.boothTone === "warn" ? "warn" : "neutral",
                    )}
                    variant="secondary"
                  >
                    {s.boothLabel}
                  </Badge>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <h2 className="mb-3 mt-7 font-[family-name:var(--font-display)] text-[15.5px] font-semibold text-primary">
        Compliance snapshot
      </h2>
      <div className="rounded-xl border border-border bg-card p-5">
        {complianceSnapshot.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nothing needs attention right now.
          </p>
        ) : (
          complianceSnapshot.map((row, i) => (
            <div
              key={row.vendor + row.doc + i}
              className="flex items-center justify-between gap-4 border-b border-border py-2.5 text-[13px] last:border-b-0"
            >
              <span className="text-foreground">
                {row.vendor} — {row.doc}
              </span>
              <Badge className={pillClass(row.tone)} variant="secondary">
                {row.label}
              </Badge>
            </div>
          ))
        )}
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
            <ReportRow
              label="Sales volume"
              value={formatMoney(m.revenue, organization?.default_currency)}
            />
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
              : "Showing sample data — create an organization for live totals."}
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setReportOpen(false)}>
              <X className="mr-2 h-4 w-4" />
              Close
            </Button>
            <Button>Export as PDF</Button>
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

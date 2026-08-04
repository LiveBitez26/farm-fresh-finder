import { createFileRoute, Link } from "@tanstack/react-router";
import { Flag, Building2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { TicketCard } from "../../../components/organizer/ticket-card";
import {
  usePlatformStats,
  useNewOrganizationsByMonth,
  useRecentOrganizations,
  useOrganizationsNeedingAttention,
} from "../../../hooks/use-platform-admin-data";

export const Route = createFileRoute("/admin/_layout/")({
  component: AdminOverviewPage,
});

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

function AdminOverviewPage() {
  const { data: stats, isLoading } = usePlatformStats();
  const { data: monthly } = useNewOrganizationsByMonth();
  const { data: recentOrgs } = useRecentOrganizations();
  const needingAttention = useOrganizationsNeedingAttention();

  const maxCount = Math.max(1, ...(monthly ?? []).map((m) => m.count));

  return (
    <div>
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-[19px] font-semibold text-foreground">
            Platform Overview
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Totals across every organization on MarketConnect.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="border-border bg-card"
            title="Flag an issue"
          >
            <Flag className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
        <TicketCard
          label="Organizations"
          value={isLoading ? "—" : String(stats?.organizations ?? 0)}
          delta="total"
          deltaTone="good"
        />
        <TicketCard
          label="Markets"
          value={isLoading ? "—" : String(stats?.markets ?? 0)}
          delta="total"
          deltaTone="good"
        />
        <TicketCard
          label="Vendors"
          value={isLoading ? "—" : String(stats?.vendors ?? 0)}
          delta="total"
          deltaTone="good"
        />
        <TicketCard
          label="Accounts"
          value={isLoading ? "—" : String(stats?.profiles ?? 0)}
          delta="all roles"
          deltaTone="good"
        />
        <TicketCard
          label="Active Subscriptions"
          value={isLoading ? "—" : String(stats?.activeSubscriptions ?? 0)}
          delta="customer boxes"
          deltaTone="good"
        />
        <TicketCard
          label="Orders"
          value={isLoading ? "—" : String(stats?.orders ?? 0)}
          delta="all time"
          deltaTone="warn"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-[15px] font-semibold text-foreground">
            New organizations, last 6 months
          </h3>
          <div className="flex items-end gap-3" style={{ height: 120 }}>
            {(monthly ?? []).map((m) => (
              <div key={m.label} className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className="w-full rounded-t-md bg-primary/80"
                  style={{ height: `${Math.max(4, (m.count / maxCount) * 90)}px` }}
                  title={`${m.count} new`}
                />
                <span className="text-[10px] font-medium text-muted-foreground">{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-3 text-[15px] font-semibold text-foreground">Recent organizations</h3>
          {(recentOrgs ?? []).length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No organizations yet.</p>
          ) : (
            recentOrgs!.map((org) => (
              <div
                key={org.id}
                className="flex items-center justify-between gap-4 border-b border-border py-2.5 text-[13px] last:border-b-0"
              >
                <span className="text-foreground">{org.name}</span>
                <span className="text-[11px] text-muted-foreground">{timeAgo(org.created_at)}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <h2 className="mb-3 mt-7 font-[family-name:var(--font-display)] text-[15.5px] font-semibold text-primary">
        Organizations needing attention
      </h2>
      <div className="rounded-xl border border-border bg-card p-5">
        {needingAttention.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Nothing needs attention right now.
          </p>
        ) : (
          needingAttention.map((org) => (
            <div
              key={org.id}
              className="flex items-center justify-between gap-4 border-b border-border py-2.5 text-[13px] last:border-b-0"
            >
              <div className="flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-foreground">{org.name}</span>
              </div>
              <div className="flex gap-1.5">
                {org.marketCount === 0 && (
                  <Badge className="bg-clay-soft text-accent" variant="secondary">
                    No markets yet
                  </Badge>
                )}
                {org.vendorCount === 0 && (
                  <Badge className="bg-clay-soft text-accent" variant="secondary">
                    No vendors yet
                  </Badge>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <Button variant="outline" className="border-border" asChild>
          <Link to="/admin/organizations">View all organizations</Link>
        </Button>
      </div>
    </div>
  );
}

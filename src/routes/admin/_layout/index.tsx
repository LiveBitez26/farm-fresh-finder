import { createFileRoute } from "@tanstack/react-router";
import { Building2, Users, Store, UserCircle, Package } from "lucide-react";
import { TicketCard } from "../../../components/organizer/ticket-card";
import { usePlatformStats } from "../../../hooks/use-platform-admin-data";

export const Route = createFileRoute("/admin/_layout/")({
  component: AdminOverviewPage,
});

function AdminOverviewPage() {
  const { data: stats, isLoading } = usePlatformStats();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-display)] text-[19px] font-semibold text-foreground">
          Platform Overview
        </h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Totals across every organization on MarketConnect.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
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
          label="Orders"
          value={isLoading ? "—" : String(stats?.orders ?? 0)}
          delta="all time"
          deltaTone="good"
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Manage organizations</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              View every organization on the platform, and suspend or reactivate one if needed.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-secondary text-secondary-foreground">
            <Package className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Coming later</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Platform-wide revenue and subscription-plan billing management, once Stripe Connect is
              wired up.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-6 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Store className="h-3.5 w-3.5" /> Markets
        </span>
        <span className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" /> Vendors
        </span>
        <span className="flex items-center gap-1.5">
          <UserCircle className="h-3.5 w-3.5" /> All accounts (staff + vendors + customers)
        </span>
      </div>
    </div>
  );
}

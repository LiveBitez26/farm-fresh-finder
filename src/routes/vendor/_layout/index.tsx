import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Package, CalendarDays, ShieldCheck, ExternalLink } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { TicketCard } from "../../../components/organizer/ticket-card";
import { formatMoney } from "../../../lib/currency";
import {
  useMyDocuments,
  useMyProducts,
  useMyUpcomingAssignments,
  useMyVendor,
} from "../../../hooks/use-vendor-portal-data";

export const Route = createFileRoute("/vendor/_layout/")({
  component: VendorOverviewPage,
});

function formatEventDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function attendancePill(status: "attending" | "late" | "absent") {
  if (status === "attending") return "bg-moss-soft text-primary";
  if (status === "late") return "bg-clay-soft text-accent";
  return "bg-danger-soft text-destructive";
}

function VendorOverviewPage() {
  const { data: vendor, isLoading: vendorLoading } = useMyVendor();
  const { data: products, isLoading: productsLoading } = useMyProducts(vendor?.id);
  const { data: assignments, isLoading: assignmentsLoading } = useMyUpcomingAssignments(vendor?.id);
  const { data: documents, isLoading: documentsLoading } = useMyDocuments(vendor?.id);

  if (vendorLoading) {
    return (
      <div className="flex items-center justify-center gap-2 p-16 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading…
      </div>
    );
  }

  const activeProducts = (products ?? []).filter((p) => p.is_active).length;
  const upcomingCount = (assignments ?? []).filter(
    (a) => new Date(`${a.eventDate}T00:00:00`).getTime() >= new Date().setHours(0, 0, 0, 0),
  ).length;
  const needsAttention = (documents ?? []).filter((d) => d.status !== "verified").length;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-[19px] font-semibold text-foreground">
            Welcome back, {vendor?.business_name}
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Here's what's happening with your listing.
          </p>
        </div>
        {vendor && (
          <Button variant="outline" className="border-border" asChild>
            <a href={`/store/${vendor.id}`} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              View My Storefront
            </a>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <TicketCard
          label="Active Products"
          value={productsLoading ? "—" : String(activeProducts)}
          delta={`${(products ?? []).length} total`}
          deltaTone="good"
        />
        <TicketCard
          label="Upcoming Markets"
          value={assignmentsLoading ? "—" : String(upcomingCount)}
          delta="scheduled"
          deltaTone="good"
        />
        <TicketCard
          label="Documents Needing Attention"
          value={documentsLoading ? "—" : String(needsAttention)}
          delta={needsAttention > 0 ? "action needed" : "all clear"}
          deltaTone={needsAttention > 0 ? "warn" : "good"}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            <h3 className="text-[15px] font-semibold text-foreground">Upcoming markets</h3>
          </div>
          {assignmentsLoading ? (
            <p className="py-4 text-center text-sm text-muted-foreground">Loading…</p>
          ) : (assignments ?? []).length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No upcoming market assignments yet. Your organizer assigns your booth from Schedule &
              Booth Map.
            </p>
          ) : (
            assignments!.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between gap-4 border-b border-border py-2.5 text-[13px] last:border-b-0"
              >
                <div>
                  <p className="font-medium text-foreground">{a.marketName}</p>
                  <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                    {formatEventDate(a.eventDate)} · Booth {a.boothCode}
                  </p>
                </div>
                <Badge className={attendancePill(a.attendance)} variant="secondary">
                  {a.attendance === "attending"
                    ? "Attending"
                    : a.attendance === "late"
                      ? "Late"
                      : "Absent"}
                </Badge>
              </div>
            ))
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <h3 className="text-[15px] font-semibold text-foreground">Your products</h3>
          </div>
          {productsLoading ? (
            <p className="py-4 text-center text-sm text-muted-foreground">Loading…</p>
          ) : (products ?? []).length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No products yet — add your first one from "My Products."
            </p>
          ) : (
            products!.slice(0, 5).map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-4 border-b border-border py-2.5 text-[13px] last:border-b-0"
              >
                <span className="text-foreground">{p.name}</span>
                <span className="font-mono text-muted-foreground">
                  {formatMoney(p.price, p.currency)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card p-5">
        <div className="mb-3 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <h3 className="text-[15px] font-semibold text-foreground">Compliance status</h3>
        </div>
        {documentsLoading ? (
          <p className="py-4 text-center text-sm text-muted-foreground">Loading…</p>
        ) : (documents ?? []).length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No documents on file yet. Your organizer logs compliance documents on your behalf in
            Compliance Vault.
          </p>
        ) : (
          documents!.map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between gap-4 border-b border-border py-2.5 text-[13px] last:border-b-0"
            >
              <span className="text-foreground">{d.title}</span>
              <Badge variant={d.status === "verified" ? "default" : "secondary"}>{d.status}</Badge>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

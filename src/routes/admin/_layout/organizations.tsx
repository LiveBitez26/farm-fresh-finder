import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Loader2, Store, Users } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../../../components/ui/sheet";
import {
  useAllOrganizations,
  useOrganizationMarkets,
  useOrganizationVendors,
  useToggleOrganizationActive,
} from "../../../hooks/use-platform-admin-data";

export const Route = createFileRoute("/admin/_layout/organizations")({
  component: AdminOrganizationsPage,
});

const PLAN_TABS = ["all", "trial", "growth", "enterprise"] as const;

function planLabel(plan: string) {
  if (plan === "trial") return "Trial";
  if (plan === "growth") return "Growth";
  if (plan === "enterprise") return "Enterprise";
  return plan;
}

function AdminOrganizationsPage() {
  const { data: organizations, isLoading } = useAllOrganizations();
  const toggleActive = useToggleOrganizationActive();
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState<(typeof PLAN_TABS)[number]>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return (organizations ?? []).filter((org) => {
      const matchesPlan = plan === "all" || org.subscription_plan === plan;
      const matchesSearch = org.name.toLowerCase().includes(search.toLowerCase());
      return matchesPlan && matchesSearch;
    });
  }, [organizations, plan, search]);

  const selected = (organizations ?? []).find((o) => o.id === selectedId) ?? null;
  const { data: markets, isLoading: marketsLoading } = useOrganizationMarkets(selected?.id);
  const { data: vendors, isLoading: vendorsLoading } = useOrganizationVendors(selected?.id);

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-[family-name:var(--font-display)] text-[19px] font-semibold text-foreground">
          Organizations
        </h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {organizations?.length ?? 0} organization{(organizations?.length ?? 0) === 1 ? "" : "s"}{" "}
          on MarketConnect
        </p>
      </div>

      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2.5">
        <div className="relative min-w-[220px] max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search organizations…"
            className="border-border bg-card pl-8 text-[13px]"
          />
        </div>
        <div className="flex gap-1 rounded-lg bg-secondary p-1">
          {PLAN_TABS.map((p) => (
            <button
              key={p}
              onClick={() => setPlan(p)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                plan === p
                  ? "bg-card text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p === "all" ? "All" : planLabel(p)}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-1.5">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No organizations match this view.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Markets</TableHead>
                <TableHead>Vendors</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((org) => (
                <TableRow
                  key={org.id}
                  className="cursor-pointer hover:bg-plum-soft/50"
                  onClick={() => setSelectedId(org.id)}
                >
                  <TableCell className="font-medium text-foreground">{org.name}</TableCell>
                  <TableCell className="text-muted-foreground">{org.country ?? "—"}</TableCell>
                  <TableCell className="font-mono text-muted-foreground">
                    {org.default_currency}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {planLabel(org.subscription_plan)}
                  </TableCell>
                  <TableCell className="font-mono text-muted-foreground">
                    {org.marketCount}
                  </TableCell>
                  <TableCell className="font-mono text-muted-foreground">
                    {org.vendorCount}
                  </TableCell>
                  <TableCell>
                    <Badge variant={org.is_active ? "default" : "secondary"}>
                      {org.is_active ? "Active" : "Suspended"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      className={org.is_active ? "text-destructive hover:text-destructive" : ""}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleActive.mutate({ organizationId: org.id, isActive: !org.is_active });
                      }}
                    >
                      {org.is_active ? "Suspend" : "Reactivate"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Sheet open={Boolean(selected)} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent className="w-full max-w-md overflow-y-auto bg-background">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="font-[family-name:var(--font-display)] text-xl">
                  {selected.name}
                </SheetTitle>
                <SheetDescription>
                  {planLabel(selected.subscription_plan)} plan ·{" "}
                  {selected.country ?? "Country not set"}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-2 space-y-0 px-4">
                <div className="flex justify-between border-b border-border py-2.5 text-[13px]">
                  <span className="text-muted-foreground">Currency</span>
                  <span className="font-mono font-semibold text-foreground">
                    {selected.default_currency}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border py-2.5 text-[13px]">
                  <span className="text-muted-foreground">Markets</span>
                  <span className="font-semibold text-foreground">{selected.marketCount}</span>
                </div>
                <div className="flex justify-between border-b border-border py-2.5 text-[13px]">
                  <span className="text-muted-foreground">Vendors</span>
                  <span className="font-semibold text-foreground">{selected.vendorCount}</span>
                </div>
                <div className="flex justify-between border-b border-border py-2.5 text-[13px]">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-semibold text-foreground">
                    {new Date(selected.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between py-2.5 text-[13px]">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={selected.is_active ? "default" : "secondary"}>
                    {selected.is_active ? "Active" : "Suspended"}
                  </Badge>
                </div>

                <p className="mb-2 mt-4 text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Markets
                </p>
                {marketsLoading ? (
                  <p className="py-3 text-center text-xs text-muted-foreground">Loading…</p>
                ) : (markets ?? []).length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border bg-secondary/40 px-3 py-4 text-center text-xs text-muted-foreground">
                    No markets yet.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {markets!.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <Store className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <div>
                            <p className="text-[13px] font-medium text-foreground">{m.name}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {[m.city, m.market_type].filter(Boolean).join(" · ") ||
                                "No details set"}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={m.is_active ? "default" : "secondary"}
                          className="text-[10px]"
                        >
                          {m.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}

                <p className="mb-2 mt-4 text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Vendors
                </p>
                {vendorsLoading ? (
                  <p className="py-3 text-center text-xs text-muted-foreground">Loading…</p>
                ) : (vendors ?? []).length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border bg-secondary/40 px-3 py-4 text-center text-xs text-muted-foreground">
                    No vendors yet.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {vendors!.map((v) => (
                      <div
                        key={v.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <Users className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <div>
                            <p className="text-[13px] font-medium text-foreground">
                              {v.business_name}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {(v.product_categories ?? []).join(", ") || "No categories set"}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={v.status === "active" ? "default" : "secondary"}
                          className="text-[10px] capitalize"
                        >
                          {v.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  className="mt-5 w-full"
                  variant={selected.is_active ? "outline" : "default"}
                  onClick={() =>
                    toggleActive.mutate({
                      organizationId: selected.id,
                      isActive: !selected.is_active,
                    })
                  }
                >
                  {selected.is_active ? "Suspend organization" : "Reactivate organization"}
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

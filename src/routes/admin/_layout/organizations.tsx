import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  useAllOrganizations,
  useToggleOrganizationActive,
} from "../../../hooks/use-platform-admin-data";

export const Route = createFileRoute("/admin/_layout/organizations")({
  component: AdminOrganizationsPage,
});

function AdminOrganizationsPage() {
  const { data: organizations, isLoading } = useAllOrganizations();
  const toggleActive = useToggleOrganizationActive();

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

      <div className="rounded-xl border border-border bg-card p-1.5">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading…
          </div>
        ) : (organizations ?? []).length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No organizations yet.</p>
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
              {organizations!.map((org) => (
                <TableRow key={org.id}>
                  <TableCell className="font-medium text-foreground">{org.name}</TableCell>
                  <TableCell className="text-muted-foreground">{org.country ?? "—"}</TableCell>
                  <TableCell className="font-mono text-muted-foreground">
                    {org.default_currency}
                  </TableCell>
                  <TableCell className="capitalize text-muted-foreground">
                    {org.subscription_plan}
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
                      onClick={() =>
                        toggleActive.mutate({ organizationId: org.id, isActive: !org.is_active })
                      }
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
    </div>
  );
}

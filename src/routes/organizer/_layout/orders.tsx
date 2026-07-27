import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "../../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";

export const Route = createFileRoute("/organizer/_layout/orders")({
  component: OrdersPage,
});

const PICKUP_REPORT = [
  {
    farmer: "Green Fields Farm",
    orders: 42,
    subscriptions: 18,
    bags: 60,
    status: "Ready" as const,
  },
  {
    farmer: "Miller's Honey Co.",
    orders: 21,
    subscriptions: 9,
    bags: 30,
    status: "Packing" as const,
  },
  { farmer: "Blue Creek Dairy", orders: 16, subscriptions: 12, bags: 28, status: "Ready" as const },
  {
    farmer: "Sunroot Bakery",
    orders: 33,
    subscriptions: 4,
    bags: 37,
    status: "Not started" as const,
  },
];

function statusPill(status: string) {
  if (status === "Ready") return "bg-moss-soft text-primary";
  if (status === "Packing") return "bg-clay-soft text-accent";
  return "bg-secondary text-secondary-foreground";
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
}

function OrdersPage() {
  return (
    <div>
      <div className="mb-5">
        <h1 className="font-[family-name:var(--font-display)] text-[19px] font-semibold text-foreground">
          Orders & Pickup Logistics
        </h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Market Pickup Report — Saturday Downtown Market
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-1.5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Farmer</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Subscriptions</TableHead>
              <TableHead>Pickup bags</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {PICKUP_REPORT.map((row) => (
              <TableRow key={row.farmer}>
                <TableCell>
                  <div className="flex items-center gap-2.5 font-semibold text-foreground">
                    <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-wheat font-[family-name:var(--font-display)] text-xs font-bold text-primary">
                      {initials(row.farmer)}
                    </div>
                    {row.farmer}
                  </div>
                </TableCell>
                <TableCell className="font-mono">{row.orders}</TableCell>
                <TableCell className="font-mono">{row.subscriptions}</TableCell>
                <TableCell className="font-mono">{row.bags}</TableCell>
                <TableCell>
                  <Badge className={statusPill(row.status)} variant="secondary">
                    {row.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="mt-5 text-xs text-muted-foreground">
        Showing sample data — this report will pull live totals from the{" "}
        <code className="rounded bg-secondary px-1 py-0.5">orders</code> and{" "}
        <code className="rounded bg-secondary px-1 py-0.5">subscriptions</code> tables once Commerce
        (Phase 3) is wired up.
      </p>
    </div>
  );
}

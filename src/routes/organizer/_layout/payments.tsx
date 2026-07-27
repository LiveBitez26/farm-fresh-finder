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
import { TicketCard } from "../../../components/organizer/ticket-card";

export const Route = createFileRoute("/organizer/_layout/payments")({
  component: PaymentsPage,
});

const TRANSACTIONS = [
  {
    vendor: "Green Fields Farm",
    type: "Booth fee",
    amount: "$65.00",
    date: "Jul 08",
    status: "Paid" as const,
  },
  {
    vendor: "Sunroot Bakery",
    type: "Membership",
    amount: "$120.00",
    date: "Jul 05",
    status: "Paid" as const,
  },
  {
    vendor: "Miller's Honey Co.",
    type: "Booth fee",
    amount: "$65.00",
    date: "Jul 01",
    status: "Pending" as const,
  },
  {
    vendor: "Blue Creek Dairy",
    type: "Refund — rained out",
    amount: "-$65.00",
    date: "Jun 29",
    status: "Processed" as const,
  },
];

function statusPill(status: string) {
  if (status === "Paid") return "bg-moss-soft text-primary";
  if (status === "Pending") return "bg-clay-soft text-accent";
  return "bg-secondary text-secondary-foreground";
}

function PaymentsPage() {
  return (
    <div>
      <div className="mb-5">
        <h1 className="font-[family-name:var(--font-display)] text-[19px] font-semibold text-foreground">
          Payments & Fees
        </h1>
        <p className="mt-0.5 text-xs text-muted-foreground">Stripe Connect</p>
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <TicketCard
          label="Monthly Revenue"
          value={<span className="font-mono">$41,200</span>}
          delta="+8% MoM"
          deltaTone="good"
        />
        <TicketCard
          label="Vendor Payments"
          value={<span className="font-mono">$36,900</span>}
          delta="Booth + membership fees"
          deltaTone="good"
        />
        <TicketCard
          label="Platform Fees"
          value={<span className="font-mono">$4,300</span>}
          delta="10.4% take rate"
          deltaTone="good"
        />
      </div>

      <h2 className="mb-3 mt-6 font-[family-name:var(--font-display)] text-[15.5px] font-semibold text-primary">
        Recent transactions
      </h2>
      <div className="rounded-xl border border-border bg-card p-1.5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {TRANSACTIONS.map((t, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium text-foreground">{t.vendor}</TableCell>
                <TableCell className="text-muted-foreground">{t.type}</TableCell>
                <TableCell className="font-mono">{t.amount}</TableCell>
                <TableCell className="font-mono">{t.date}</TableCell>
                <TableCell>
                  <Badge className={statusPill(t.status)} variant="secondary">
                    {t.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-5 rounded-lg border border-accent bg-clay-soft px-3.5 py-2.5 text-[12.5px] text-accent">
        Stripe Connect powers real billing here — payouts, invoices, and refund processing all run
        through it once connected in Organization Settings.
      </div>
    </div>
  );
}

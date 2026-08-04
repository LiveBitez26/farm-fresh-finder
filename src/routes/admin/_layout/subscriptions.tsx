import { createFileRoute } from "@tanstack/react-router";
import { CreditCard } from "lucide-react";
import { usePlanDistribution } from "../../../hooks/use-platform-admin-data";

export const Route = createFileRoute("/admin/_layout/subscriptions")({
  component: AdminSubscriptionsPage,
});

const PLAN_INFO = [
  { key: "trial", label: "Trial", suggestedPrice: "Free" },
  { key: "growth", label: "Growth", suggestedPrice: "$49/mo (suggested)" },
  { key: "enterprise", label: "Enterprise", suggestedPrice: "$149/mo (suggested)" },
];

function AdminSubscriptionsPage() {
  const { data: distribution, isLoading } = usePlanDistribution();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-display)] text-[19px] font-semibold text-foreground">
          Subscriptions & Billing
        </h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          How organizations are distributed across plans.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {PLAN_INFO.map((p) => (
          <div key={p.key} className="rounded-xl border border-border bg-card p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {p.label}
            </p>
            <p className="my-1.5 font-[family-name:var(--font-display)] text-[30px] font-semibold text-primary">
              {isLoading ? "—" : (distribution?.[p.key] ?? 0)}
            </p>
            <p className="text-[11.5px] text-muted-foreground">
              organization(s) · {p.suggestedPrice}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-xl border border-accent/30 bg-accent/10 p-5">
        <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
        <div>
          <p className="text-sm font-semibold text-foreground">Billing isn't connected yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            The plan distribution above is real (each organization's{" "}
            <code className="rounded bg-background px-1 py-0.5">subscription_plan</code> field), but
            no actual billing, invoicing, or payment collection exists yet — that's part of the
            Stripe Connect work still ahead. Prices shown are suggestions, not live billing amounts.
          </p>
        </div>
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp } from "lucide-react";

export const Route = createFileRoute("/organizer/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  return (
    <div>
      <div className="mb-5">
        <h1 className="font-[family-name:var(--font-display)] text-[19px] font-semibold text-foreground">
          Analytics
        </h1>
        <p className="mt-0.5 text-xs text-muted-foreground">Phase 4 — coming soon</p>
      </div>

      <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
        <TrendingUp className="mb-3 h-8 w-8 text-muted-foreground" />
        <p className="font-semibold text-foreground">Analytics is coming together</p>
        <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
          Vendor growth, sales trends, and customer attendance charts land in Phase 4, once Orders
          and Payments have real data flowing through them.
        </p>
      </div>
    </div>
  );
}

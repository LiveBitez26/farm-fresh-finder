import { createFileRoute } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";
import { ComingSoon } from "../../components/organizer/coming-soon";

export const Route = createFileRoute("/organizer/analytics")({
  component: () => (
    <ComingSoon
      title="Analytics"
      description="Cross-market trends in vendor performance, sales, and attendance."
      phase="Phase 4 — Growth"
      icon={BarChart3}
      features={[
        "Sales and attendance trends across all markets",
        "Vendor-level performance breakdowns",
        "Personalized recommendations and demand forecasting (AI features)",
        "Backed by the analytics_events table",
      ]}
    />
  ),
});

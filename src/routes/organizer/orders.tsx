import { createFileRoute } from "@tanstack/react-router";
import { PackageCheck } from "lucide-react";
import { ComingSoon } from "../../components/organizer/coming-soon";

export const Route = createFileRoute("/organizer/orders")({
  component: () => (
    <ComingSoon
      title="Orders & Pickup Logistics"
      description="Connect customer orders to farmer fulfillment at each market."
      phase="Phase 3 — Commerce"
      icon={PackageCheck}
      features={[
        "Per-market Pickup Report grouped by farmer",
        "Order and subscription counts, pickup bag totals",
        "Pickup scheduling and delivery-option handling",
        "Backed by the orders, order_items, and subscriptions tables",
      ]}
    />
  ),
});

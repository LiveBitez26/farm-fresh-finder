import { createFileRoute } from "@tanstack/react-router";
import { CreditCard } from "lucide-react";
import { ComingSoon } from "../../components/organizer/coming-soon";

export const Route = createFileRoute("/organizer/payments")({
  component: () => (
    <ComingSoon
      title="Payments & Fees"
      description="Stripe Connect billing for booth fees, memberships, and subscriptions."
      phase="Phase 4 — Growth"
      icon={CreditCard}
      features={[
        "Automatic billing, invoices, payment history, and refunds",
        "Revenue dashboard: monthly revenue, vendor payouts, platform fees",
        "Stripe Connect for direct vendor payouts",
        "Backed by the payments table with Stripe payment-intent references",
      ]}
    />
  ),
});

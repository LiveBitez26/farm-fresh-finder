import { createFileRoute } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";
import { ComingSoon } from "../../components/organizer/coming-soon";

export const Route = createFileRoute("/organizer/communications")({
  component: () => (
    <ComingSoon
      title="Communication Hub"
      description="Announcements to vendors and customers across channels."
      phase="Phase 2 — Operations"
      icon={MessageSquare}
      features={[
        "Send to all vendors, specific vendors, or customers",
        "In-app notification, email, and SMS channels",
        "Automated reminders (e.g. certification expiring in 14 days)",
        "Backed by the announcements and notifications tables",
      ]}
    />
  ),
});

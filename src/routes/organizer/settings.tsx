import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { ComingSoon } from "../../components/organizer/coming-soon";

export const Route = createFileRoute("/organizer/settings")({
  component: () => (
    <ComingSoon
      title="Organization Settings"
      description="Manage organization profile, staff, roles, and billing."
      phase="Phase 1 — Foundation (next up)"
      icon={Settings}
      features={[
        "Organization profile, branding, and locale/currency defaults",
        "Staff management with role assignment (org_owner, market_manager, etc.)",
        "Subscription plan and platform billing",
        "Backed by the organizations and organization_members tables",
      ]}
    />
  ),
});

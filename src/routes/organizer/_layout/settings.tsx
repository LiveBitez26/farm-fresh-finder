import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { useOrganization } from "../../../hooks/use-organization-data";
import { useAuth } from "../../../hooks/use-auth";

export const Route = createFileRoute("/organizer/_layout/settings")({
  component: SettingsPage,
});

function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2.5 text-[13px] last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}

function SettingsPage() {
  const { profile } = useAuth();
  const hasOrg = Boolean(profile?.organization_id);
  const { data: organization } = useOrganization();

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-[family-name:var(--font-display)] text-[19px] font-semibold text-foreground">
          Organization Settings
        </h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {organization?.name ?? (hasOrg ? "Your organization" : "Ohio Valley Markets")}
        </p>
      </div>

      <div className="max-w-lg rounded-xl border border-border bg-card p-5">
        <h3 className="mb-2 text-[15px] font-semibold text-foreground">Organization profile</h3>
        <FieldRow label="Organization name" value={organization?.name ?? "Ohio Valley Markets"} />
        <FieldRow label="Country" value={organization?.country ?? "United States"} />
        <FieldRow
          label="Plan"
          value={organization?.subscription_plan === "trial" ? "Trial" : "Growth — $149/mo"}
        />
        <FieldRow label="Stripe Connect" value={<Badge variant="secondary">Not connected</Badge>} />
        <FieldRow label="Staff seats used" value="4 of 6" />
        <Button variant="outline" className="mt-4 border-border">
          Manage staff & roles
        </Button>
      </div>
    </div>
  );
}

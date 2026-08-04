import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "../../../components/ui/badge";

export const Route = createFileRoute("/admin/_layout/settings")({
  component: AdminSettingsPage,
});

function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2.5 text-[13px] last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}

function AdminSettingsPage() {
  return (
    <div>
      <div className="mb-5">
        <h1 className="font-[family-name:var(--font-display)] text-[19px] font-semibold text-foreground">
          Platform Settings
        </h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Global configuration for MarketConnect as a whole.
        </p>
      </div>

      <div className="max-w-lg rounded-xl border border-border bg-card p-5">
        <h3 className="mb-2 text-[15px] font-semibold text-foreground">Platform</h3>
        <FieldRow label="Platform name" value="MarketConnect" />
        <FieldRow label="Stripe Connect" value={<Badge variant="secondary">Not connected</Badge>} />
        <FieldRow
          label="Platform take rate"
          value={<Badge variant="secondary">Not configured</Badge>}
        />
        <p className="mt-4 text-xs text-muted-foreground">
          Platform-wide settings like take rate, supported currencies, and Stripe Connect
          credentials aren't configurable through the app yet — this page shows the current state
          honestly rather than pretending these are editable already.
        </p>
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Pencil, Check, X } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { useAuth } from "../../../hooks/use-auth";
import { CURRENCY_OPTIONS } from "../../../lib/currency";
import {
  useOrganization,
  useOrganizationStaff,
  useUpdateOrganization,
} from "../../../hooks/use-organization-data";

export const Route = createFileRoute("/organizer/_layout/settings")({
  component: SettingsPage,
});

const ROLE_LABEL: Record<string, string> = {
  platform_owner: "Platform Owner",
  org_owner: "Organization Owner",
  market_manager: "Market Manager",
  compliance_manager: "Compliance Manager",
  finance_manager: "Finance Manager",
};

function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2.5 text-[13px] last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}

function StaffDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { data: staff, isLoading } = useOrganizationStaff();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-display)]">
            Staff & Roles
          </DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <p className="py-4 text-center text-sm text-muted-foreground">Loading…</p>
        ) : (
          <div className="space-y-2">
            {(staff ?? []).map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-sm"
              >
                <span className="font-medium text-foreground">{s.name}</span>
                <Badge variant="secondary">{ROLE_LABEL[s.role] ?? s.role}</Badge>
              </div>
            ))}
            {(staff ?? []).length === 0 && (
              <p className="py-2 text-center text-sm text-muted-foreground">No staff found.</p>
            )}
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Inviting new staff isn't available yet — currently every account is added automatically as
          Organization Owner when they create the organization.
        </p>
      </DialogContent>
    </Dialog>
  );
}

function SettingsPage() {
  const { profile } = useAuth();
  const hasOrg = Boolean(profile?.organization_id);
  const { data: organization } = useOrganization();
  const { data: staff } = useOrganizationStaff();
  const updateOrganization = useUpdateOrganization();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [staffDialogOpen, setStaffDialogOpen] = useState(false);

  useEffect(() => {
    if (organization) {
      setName(organization.name);
      setCountry(organization.country ?? "");
      setCurrency(organization.default_currency ?? "USD");
    }
  }, [organization]);

  function handleSave() {
    if (!name.trim()) return;
    updateOrganization.mutate(
      { name: name.trim(), country: country.trim(), defaultCurrency: currency },
      { onSuccess: () => setEditing(false) },
    );
  }

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
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-foreground">Organization profile</h3>
          {hasOrg && !editing && (
            <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Edit
            </Button>
          )}
        </div>

        {editing ? (
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Organization name
              </label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Country</label>
              <Input value={country} onChange={(e) => setCountry(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Currency</label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCY_OPTIONS.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Used for all prices, orders, and payments across this organization.
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} disabled={updateOrganization.isPending}>
                {updateOrganization.isPending ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="mr-1.5 h-3.5 w-3.5" />
                )}
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-border"
                onClick={() => setEditing(false)}
              >
                <X className="mr-1.5 h-3.5 w-3.5" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <FieldRow
              label="Organization name"
              value={organization?.name ?? "Ohio Valley Markets"}
            />
            <FieldRow label="Country" value={organization?.country ?? "United States"} />
            <FieldRow label="Currency" value={organization?.default_currency ?? "USD"} />
            <FieldRow
              label="Plan"
              value={organization?.subscription_plan === "trial" ? "Trial" : "Growth — $149/mo"}
            />
            <FieldRow
              label="Stripe Connect"
              value={<Badge variant="secondary">Not connected</Badge>}
            />
            <FieldRow
              label="Staff"
              value={hasOrg ? `${(staff ?? []).length} member(s)` : "4 of 6 seats"}
            />
            <Button
              variant="outline"
              className="mt-4 border-border"
              onClick={() => setStaffDialogOpen(true)}
            >
              Manage staff & roles
            </Button>
          </>
        )}
      </div>

      <StaffDialog open={staffDialogOpen} onOpenChange={setStaffDialogOpen} />
    </div>
  );
}

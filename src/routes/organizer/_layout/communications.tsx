import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { z } from "zod";
import { Textarea } from "../../../components/ui/textarea";
import { Button } from "../../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";
import { useAuth } from "../../../hooks/use-auth";
import {
  useAnnouncements,
  useDeleteAnnouncement,
  useMarkets,
  useSendAnnouncement,
  useUpdateAnnouncement,
} from "../../../hooks/use-organization-data";

const communicationsSearchSchema = z.object({
  vendor: z.string().optional(),
});

export const Route = createFileRoute("/organizer/_layout/communications")({
  validateSearch: communicationsSearchSchema,
  component: CommunicationsPage,
});

const AUDIENCES = [
  { key: "all_vendors" as const, label: "All vendors" },
  { key: "specific_vendors" as const, label: "Specific vendors" },
  { key: "customers" as const, label: "Customers" },
];
const CHANNELS = [
  { key: "in_app" as const, label: "In-app" },
  { key: "email" as const, label: "Email" },
  { key: "sms" as const, label: "SMS" },
];

const AUDIENCE_LABEL: Record<string, string> = {
  all_vendors: "All vendors",
  specific_vendors: "Specific vendors",
  customers: "Customers",
};
const CHANNEL_LABEL: Record<string, string> = { in_app: "In-app", email: "Email", sms: "SMS" };

type MockAnnouncement = { audience: string; channel: string; text: string; when: string };

const MOCK_LOG: MockAnnouncement[] = [
  {
    audience: "All vendors",
    channel: "Email",
    text: "Market canceled due to weather.",
    when: "Jul 6, 8:12 AM",
  },
  {
    audience: "Specific vendors",
    channel: "In-app",
    text: "Insurance expires in 14 days.",
    when: "Jul 3, 2:40 PM",
  },
  {
    audience: "Customers",
    channel: "SMS",
    text: "Saturday market starts at 9 AM.",
    when: "Jul 2, 6:00 PM",
  },
];

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`mb-1.5 mr-1.5 inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:bg-secondary"
      }`}
    >
      {label}
    </button>
  );
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function EditAnnouncementDialog({
  open,
  onOpenChange,
  announcement,
  markets,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  announcement: {
    id: string;
    audience: "all_vendors" | "specific_vendors" | "customers";
    channel: "in_app" | "email" | "sms";
    message: string;
    market_id: string | null;
  } | null;
  markets: { id: string; name: string }[];
}) {
  const updateAnnouncement = useUpdateAnnouncement();
  const [audience, setAudience] = useState<(typeof AUDIENCES)[number]["key"]>("all_vendors");
  const [channel, setChannel] = useState<(typeof CHANNELS)[number]["key"]>("in_app");
  const [marketId, setMarketId] = useState("all");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (announcement) {
      setAudience(announcement.audience);
      setChannel(announcement.channel);
      setMarketId(announcement.market_id ?? "all");
      setMessage(announcement.message);
      setError(null);
    }
  }, [announcement]);

  function handleSave() {
    if (!announcement) return;
    const text = message.trim();
    if (!text) {
      setError("Message can't be empty.");
      return;
    }
    updateAnnouncement.mutate(
      {
        announcementId: announcement.id,
        audience,
        channel,
        message: text,
        marketId: audience === "customers" && marketId !== "all" ? marketId : undefined,
      },
      {
        onSuccess: () => onOpenChange(false),
        onError: (e: Error) => setError(e.message),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-display)]">
            Edit Announcement
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">
              Audience
            </label>
            <div>
              {AUDIENCES.map((a) => (
                <Chip
                  key={a.key}
                  label={a.label}
                  active={audience === a.key}
                  onClick={() => setAudience(a.key)}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">
              Channel
            </label>
            <div>
              {CHANNELS.map((c) => (
                <Chip
                  key={c.key}
                  label={c.label}
                  active={channel === c.key}
                  onClick={() => setChannel(c.key)}
                />
              ))}
            </div>
          </div>
          {audience === "customers" && markets.length > 0 && (
            <div>
              <label className="mb-1.5 block text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                Which market?
              </label>
              <Select value={marketId} onValueChange={setMarketId}>
                <SelectTrigger className="border-border bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All markets</SelectItem>
                  {markets.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">
              Message
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[90px] border-border bg-background text-[13px]"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <Button className="mt-1" onClick={handleSave} disabled={updateAnnouncement.isPending}>
          {updateAnnouncement.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save changes
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function CommunicationsPage() {
  const { profile } = useAuth();
  const hasOrg = Boolean(profile?.organization_id);
  const { data: announcements, isLoading } = useAnnouncements();
  const { data: markets } = useMarkets();
  const sendAnnouncement = useSendAnnouncement();
  const { vendor } = Route.useSearch();

  const [audience, setAudience] = useState<(typeof AUDIENCES)[number]["key"]>(
    vendor ? "specific_vendors" : "all_vendors",
  );
  const [channel, setChannel] = useState<(typeof CHANNELS)[number]["key"]>("in_app");
  const [marketId, setMarketId] = useState<string>("all");
  const [message, setMessage] = useState(
    vendor
      ? `Hi ${vendor}, `
      : "Insurance expires in 14 days — please upload a renewed certificate before Saturday's market.",
  );
  const [mockLog, setMockLog] = useState<MockAnnouncement[]>(MOCK_LOG);
  const deleteAnnouncement = useDeleteAnnouncement();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleSend() {
    const text = message.trim();
    if (!text) return;

    if (hasOrg) {
      sendAnnouncement.mutate(
        {
          audience,
          channel,
          message: text,
          marketId: audience === "customers" && marketId !== "all" ? marketId : undefined,
        },
        { onSuccess: () => setMessage("") },
      );
    } else {
      setMockLog([
        {
          audience: AUDIENCE_LABEL[audience],
          channel: CHANNEL_LABEL[channel],
          text,
          when: "Just now",
        },
        ...mockLog,
      ]);
      setMessage("");
    }
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-[family-name:var(--font-display)] text-[19px] font-semibold text-foreground">
          Communication Hub
        </h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Reach vendors and customers in one place
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-3 text-[15px] font-semibold text-foreground">New announcement</h3>

          {vendor && (
            <p className="mb-3 rounded-lg bg-moss-soft/60 px-3 py-2 text-xs text-primary">
              Messaging <span className="font-semibold">{vendor}</span> — audience is set to
              "Specific vendors."
            </p>
          )}

          <label className="mb-1.5 mt-2 block text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">
            Audience
          </label>
          <div>
            {AUDIENCES.map((a) => (
              <Chip
                key={a.key}
                label={a.label}
                active={audience === a.key}
                onClick={() => setAudience(a.key)}
              />
            ))}
          </div>

          <label className="mb-1.5 mt-3 block text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">
            Channel
          </label>
          <div>
            {CHANNELS.map((c) => (
              <Chip
                key={c.key}
                label={c.label}
                active={channel === c.key}
                onClick={() => setChannel(c.key)}
              />
            ))}
          </div>

          {audience === "customers" && markets && markets.length > 0 && (
            <>
              <label className="mb-1.5 mt-3 block text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                Which market?
              </label>
              <Select value={marketId} onValueChange={setMarketId}>
                <SelectTrigger className="border-border bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All markets</SelectItem>
                  {markets.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}

          <label className="mb-1.5 mt-3 block text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">
            Message
          </label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. Saturday market starts at 9 AM sharp — booth setup begins at 7:30 AM."
            className="min-h-[90px] border-border bg-background text-[13px]"
          />

          <Button className="mt-3.5" onClick={handleSend} disabled={sendAnnouncement.isPending}>
            {sendAnnouncement.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send announcement
          </Button>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-3 text-[15px] font-semibold text-foreground">Recent announcements</h3>
          {hasOrg ? (
            isLoading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading…
              </div>
            ) : announcements && announcements.length > 0 ? (
              announcements.map((a) => (
                <div
                  key={a.id}
                  className="flex items-start justify-between gap-3 border-b border-border py-2.5 text-[13px] last:border-b-0"
                >
                  <div>
                    <p className="text-foreground">{a.message}</p>
                    <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                      {AUDIENCE_LABEL[a.audience]} · {CHANNEL_LABEL[a.channel]}
                      {a.marketName && ` · ${a.marketName}`} · {formatWhen(a.created_at)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(a.id)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeletingId(a.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No announcements sent yet.
              </p>
            )
          ) : (
            mockLog.map((a, i) => (
              <div key={i} className="border-b border-border py-2.5 text-[13px] last:border-b-0">
                <p className="text-foreground">{a.text}</p>
                <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                  {a.audience} · {a.channel} · {a.when}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <EditAnnouncementDialog
        open={Boolean(editingId)}
        onOpenChange={(open) => !open && setEditingId(null)}
        announcement={announcements?.find((a) => a.id === editingId) ?? null}
        markets={markets ?? []}
      />

      <AlertDialog open={Boolean(deletingId)} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this announcement?</AlertDialogTitle>
            <AlertDialogDescription>
              It will be removed from anyone it was sent to, including its public market page if it
              was customer-facing. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deletingId) deleteAnnouncement.mutate(deletingId);
                setDeletingId(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

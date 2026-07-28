import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Textarea } from "../../../components/ui/textarea";
import { Button } from "../../../components/ui/button";
import { useAuth } from "../../../hooks/use-auth";
import { useAnnouncements, useSendAnnouncement } from "../../../hooks/use-organization-data";

export const Route = createFileRoute("/organizer/_layout/communications")({
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

function CommunicationsPage() {
  const { profile } = useAuth();
  const hasOrg = Boolean(profile?.organization_id);
  const { data: announcements, isLoading } = useAnnouncements();
  const sendAnnouncement = useSendAnnouncement();

  const [audience, setAudience] = useState<(typeof AUDIENCES)[number]["key"]>("all_vendors");
  const [channel, setChannel] = useState<(typeof CHANNELS)[number]["key"]>("in_app");
  const [message, setMessage] = useState(
    "Insurance expires in 14 days — please upload a renewed certificate before Saturday's market.",
  );
  const [mockLog, setMockLog] = useState<MockAnnouncement[]>(MOCK_LOG);

  function handleSend() {
    const text = message.trim();
    if (!text) return;

    if (hasOrg) {
      sendAnnouncement.mutate(
        { audience, channel, message: text },
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
                  className="border-b border-border py-2.5 text-[13px] last:border-b-0"
                >
                  <p className="text-foreground">{a.message}</p>
                  <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                    {AUDIENCE_LABEL[a.audience]} · {CHANNEL_LABEL[a.channel]} ·{" "}
                    {formatWhen(a.created_at)}
                  </p>
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
    </div>
  );
}

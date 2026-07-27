import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Textarea } from "../../../components/ui/textarea";
import { Button } from "../../../components/ui/button";

export const Route = createFileRoute("/organizer/_layout/communications")({
  component: CommunicationsPage,
});

const AUDIENCES = ["All vendors", "Specific vendors", "Customers"] as const;
const CHANNELS = ["In-app", "Email", "SMS"] as const;

type Announcement = { audience: string; channel: string; text: string; when: string };

const INITIAL_LOG: Announcement[] = [
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

function CommunicationsPage() {
  const [audience, setAudience] = useState<(typeof AUDIENCES)[number]>("All vendors");
  const [channel, setChannel] = useState<(typeof CHANNELS)[number]>("In-app");
  const [message, setMessage] = useState(
    "Insurance expires in 14 days — please upload a renewed certificate before Saturday's market.",
  );
  const [log, setLog] = useState<Announcement[]>(INITIAL_LOG);

  function handleSend() {
    const text = message.trim();
    if (!text) return;
    setLog([{ audience, channel, text, when: "Just now" }, ...log]);
    setMessage("");
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
              <Chip key={a} label={a} active={audience === a} onClick={() => setAudience(a)} />
            ))}
          </div>

          <label className="mb-1.5 mt-3 block text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">
            Channel
          </label>
          <div>
            {CHANNELS.map((c) => (
              <Chip key={c} label={c} active={channel === c} onClick={() => setChannel(c)} />
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

          <Button className="mt-3.5" onClick={handleSend}>
            Send announcement
          </Button>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-3 text-[15px] font-semibold text-foreground">Recent announcements</h3>
          {log.map((a, i) => (
            <div key={i} className="border-b border-border py-2.5 text-[13px] last:border-b-0">
              <p className="text-foreground">{a.text}</p>
              <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                {a.audience} · {a.channel} · {a.when}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

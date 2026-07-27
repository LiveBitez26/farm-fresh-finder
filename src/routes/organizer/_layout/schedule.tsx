import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";

export const Route = createFileRoute("/organizer/_layout/schedule")({
  component: SchedulePage,
});

type DayKey = "Sat" | "Tue" | "Fest";

const MARKET_DAYS: {
  key: DayKey;
  name: string;
  cadence: string;
  boothsFilled: string;
  tone: "good" | "warn" | "neutral";
}[] = [
  {
    key: "Sat",
    name: "Saturday Downtown Market",
    cadence: "Weekly · 9 AM – 1 PM",
    boothsFilled: "42/48 booths",
    tone: "good",
  },
  {
    key: "Tue",
    name: "Tuesday Riverside Market",
    cadence: "Weekly · 3 PM – 7 PM",
    boothsFilled: "18/24 booths",
    tone: "warn",
  },
  {
    key: "Fest",
    name: "Harvest Festival Special",
    cadence: "Seasonal · Jul 26",
    boothsFilled: "Layout not set",
    tone: "neutral",
  },
];

const BOOTH_LAYOUTS: Record<DayKey, string[]> = {
  Sat: [
    "A01",
    "A02",
    "A03",
    "A04",
    "",
    "A06",
    "A07",
    "A08",
    "B01",
    "",
    "B03",
    "B04",
    "",
    "B06",
    "B07",
    "",
    "C01",
    "C02",
    "",
    "C04",
    "C05",
    "C06",
    "",
    "C08",
  ],
  Tue: [
    "A01",
    "A02",
    "",
    "",
    "",
    "",
    "",
    "",
    "B01",
    "B02",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ],
  Fest: Array(24).fill(""),
};

const BOOTH_VENDOR_MAP: Record<string, string> = {
  A03: "Green Fields Farm",
  B01: "Miller's Honey Co.",
  A07: "Blue Creek Dairy",
  B04: "Sunroot Bakery",
};

const ATTENDANCE: { name: string; status: "attending" | "late" | "absent" }[] = [
  { name: "Green Fields Farm", status: "attending" },
  { name: "Sunroot Bakery", status: "attending" },
  { name: "Miller's Honey Co.", status: "late" },
  { name: "Blue Creek Dairy", status: "absent" },
];

function attendancePill(status: "attending" | "late" | "absent") {
  if (status === "attending") return "bg-moss-soft text-primary";
  if (status === "late") return "bg-clay-soft text-accent";
  return "bg-danger-soft text-destructive";
}

function boothTone(tone: "good" | "warn" | "neutral") {
  if (tone === "good") return "bg-moss-soft text-primary";
  if (tone === "warn") return "bg-clay-soft text-accent";
  return "bg-secondary text-secondary-foreground";
}

function SchedulePage() {
  const [selectedDay, setSelectedDay] = useState<DayKey>("Sat");
  const [selectedBooth, setSelectedBooth] = useState<string | null>(null);
  const layout = BOOTH_LAYOUTS[selectedDay];
  const marketName = MARKET_DAYS.find((m) => m.key === selectedDay)?.name;

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-[family-name:var(--font-display)] text-[19px] font-semibold text-foreground">
          Schedule & Booth Map
        </h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {MARKET_DAYS.length} upcoming markets
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-5">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-3 text-[15px] font-semibold text-foreground">Market calendar</h3>
            {MARKET_DAYS.map((day) => (
              <button
                key={day.key}
                onClick={() => {
                  setSelectedDay(day.key);
                  setSelectedBooth(null);
                }}
                className={`flex w-full items-center justify-between gap-4 rounded-lg border-b border-border px-2 py-2.5 text-left text-[13px] transition-colors last:border-b-0 hover:bg-moss-soft/50 ${
                  selectedDay === day.key ? "bg-moss-soft/60" : ""
                }`}
              >
                <div>
                  <p className="font-semibold text-foreground">{day.name}</p>
                  <p className="mt-0.5 text-[11.5px] text-muted-foreground">{day.cadence}</p>
                </div>
                <Badge className={boothTone(day.tone)} variant="secondary">
                  {day.boothsFilled}
                </Badge>
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-3 text-[15px] font-semibold text-foreground">Attendance — today</h3>
            {ATTENDANCE.map((a) => (
              <div
                key={a.name}
                className="flex items-center justify-between gap-4 border-b border-border py-2.5 text-[13px] last:border-b-0"
              >
                <span className="text-foreground">{a.name}</span>
                <Badge className={attendancePill(a.status)} variant="secondary">
                  {a.status === "attending" ? "Attending" : a.status === "late" ? "Late" : "Absent"}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-foreground">
              Booth map — <span className="text-primary">{marketName}</span>
            </h3>
            <Button size="sm" variant="outline" className="border-border">
              Save layout
            </Button>
          </div>
          <div className="grid grid-cols-8 gap-2.5">
            {layout.map((code, i) => {
              const vendor = code ? BOOTH_VENDOR_MAP[code] : undefined;
              if (!code) {
                return (
                  <div
                    key={i}
                    className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-border text-border"
                  >
                    ┄
                  </div>
                );
              }
              return (
                <button
                  key={code}
                  onClick={() => setSelectedBooth(code)}
                  className={`flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg border text-center transition-transform hover:-translate-y-0.5 ${
                    vendor
                      ? "border-primary bg-moss-soft text-primary"
                      : "border-border bg-background text-muted-foreground"
                  } ${selectedBooth === code ? "ring-2 ring-primary ring-offset-1" : ""}`}
                >
                  <span className="font-mono text-[11px] font-semibold">{code}</span>
                  {vendor && (
                    <span className="px-1 text-[9.5px] font-semibold leading-tight">
                      {vendor.split(" ")[0]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-[11.5px] text-muted-foreground">
            <span>■ Occupied</span>
            <span>┄ Empty</span>
            <span>Click a booth to assign a vendor</span>
          </div>
          {selectedBooth && (
            <p className="mt-3 rounded-lg bg-moss-soft/60 px-3 py-2 text-[13px] text-primary">
              Booth {selectedBooth}
              {BOOTH_VENDOR_MAP[selectedBooth]
                ? ` — reassign ${BOOTH_VENDOR_MAP[selectedBooth]}`
                : " — assign a vendor"}
            </p>
          )}
        </div>
      </div>

      <p className="mt-5 text-xs text-muted-foreground">
        Showing sample layouts for now — this page wires up to the real{" "}
        <code className="rounded bg-secondary px-1 py-0.5">schedules</code>,{" "}
        <code className="rounded bg-secondary px-1 py-0.5">booths</code>, and{" "}
        <code className="rounded bg-secondary px-1 py-0.5">booth_assignments</code> tables next.
      </p>
    </div>
  );
}

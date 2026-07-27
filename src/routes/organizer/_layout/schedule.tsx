import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { useAuth } from "../../../hooks/use-auth";
import {
  useAssignVendorToBooth,
  useBoothAssignmentsForSchedule,
  useBoothsForMarket,
  useSchedules,
  useVendors,
} from "../../../hooks/use-organization-data";

export const Route = createFileRoute("/organizer/_layout/schedule")({
  component: SchedulePage,
});

// ---- Mock fallback (preview mode / before any markets exist) ----
type DayKey = "Sat" | "Tue" | "Fest";

const MOCK_DAYS: {
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

const MOCK_LAYOUTS: Record<DayKey, string[]> = {
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

const MOCK_VENDOR_MAP: Record<string, string> = {
  A03: "Green Fields Farm",
  B01: "Miller's Honey Co.",
  A07: "Blue Creek Dairy",
  B04: "Sunroot Bakery",
};

const MOCK_ATTENDANCE: { name: string; status: "attending" | "late" | "absent" }[] = [
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

function formatEventDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function SchedulePage() {
  const { profile } = useAuth();
  const hasOrg = Boolean(profile?.organization_id);

  const { data: schedules, isLoading: schedulesLoading } = useSchedules();
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [mockDay, setMockDay] = useState<DayKey>("Sat");

  const selectedSchedule = schedules?.find((s) => s.id === selectedScheduleId) ?? schedules?.[0];

  useEffect(() => {
    if (!selectedScheduleId && schedules && schedules.length > 0) {
      setSelectedScheduleId(schedules[0].id);
    }
  }, [schedules, selectedScheduleId]);

  const { data: booths } = useBoothsForMarket(selectedSchedule?.marketId);
  const { data: assignments } = useBoothAssignmentsForSchedule(selectedSchedule?.id);
  const { data: vendors } = useVendors();
  const assignVendor = useAssignVendorToBooth();

  const [pickerBoothId, setPickerBoothId] = useState<string | null>(null);

  const hasLiveData = hasOrg && schedules && schedules.length > 0;

  if (hasOrg && schedulesLoading) {
    return (
      <div className="flex items-center justify-center gap-2 p-16 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading…
      </div>
    );
  }

  if (hasOrg && (!schedules || schedules.length === 0)) {
    return (
      <div>
        <div className="mb-5">
          <h1 className="font-[family-name:var(--font-display)] text-[19px] font-semibold text-foreground">
            Schedule & Booth Map
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">No markets scheduled yet</p>
        </div>
        <p className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Use "Load sample data" on the Overview page to generate a market with scheduled dates,
          booths, and vendor assignments.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-[family-name:var(--font-display)] text-[19px] font-semibold text-foreground">
          Schedule & Booth Map
        </h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {hasLiveData
            ? `${schedules!.length} scheduled dates`
            : `${MOCK_DAYS.length} upcoming markets`}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-5">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-3 text-[15px] font-semibold text-foreground">Market calendar</h3>
            {hasLiveData
              ? schedules!.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedScheduleId(s.id)}
                    className={`flex w-full items-center justify-between gap-4 rounded-lg border-b border-border px-2 py-2.5 text-left text-[13px] transition-colors last:border-b-0 hover:bg-moss-soft/50 ${
                      selectedSchedule?.id === s.id ? "bg-moss-soft/60" : ""
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-foreground">{s.marketName}</p>
                      <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                        {formatEventDate(s.eventDate)}
                        {s.startTime && s.endTime && ` · ${s.startTime}–${s.endTime}`}
                      </p>
                    </div>
                  </button>
                ))
              : MOCK_DAYS.map((day) => (
                  <button
                    key={day.key}
                    onClick={() => setMockDay(day.key)}
                    className={`flex w-full items-center justify-between gap-4 rounded-lg border-b border-border px-2 py-2.5 text-left text-[13px] transition-colors last:border-b-0 hover:bg-moss-soft/50 ${
                      mockDay === day.key ? "bg-moss-soft/60" : ""
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
            <h3 className="mb-3 text-[15px] font-semibold text-foreground">
              Attendance — this date
            </h3>
            {hasLiveData
              ? (assignments ?? [])
                  .filter((a) => a.vendorName)
                  .map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between gap-4 border-b border-border py-2.5 text-[13px] last:border-b-0"
                    >
                      <span className="text-foreground">{a.vendorName}</span>
                      <Badge className={attendancePill(a.attendance)} variant="secondary">
                        {a.attendance === "attending"
                          ? "Attending"
                          : a.attendance === "late"
                            ? "Late"
                            : "Absent"}
                      </Badge>
                    </div>
                  ))
              : MOCK_ATTENDANCE.map((a) => (
                  <div
                    key={a.name}
                    className="flex items-center justify-between gap-4 border-b border-border py-2.5 text-[13px] last:border-b-0"
                  >
                    <span className="text-foreground">{a.name}</span>
                    <Badge className={attendancePill(a.status)} variant="secondary">
                      {a.status === "attending"
                        ? "Attending"
                        : a.status === "late"
                          ? "Late"
                          : "Absent"}
                    </Badge>
                  </div>
                ))}
            {hasLiveData && (assignments ?? []).filter((a) => a.vendorName).length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No vendors assigned yet.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-foreground">
              Booth map —{" "}
              <span className="text-primary">
                {hasLiveData
                  ? selectedSchedule?.marketName
                  : MOCK_DAYS.find((d) => d.key === mockDay)?.name}
              </span>
            </h3>
            {!hasLiveData && (
              <Button size="sm" variant="outline" className="border-border">
                Save layout
              </Button>
            )}
          </div>

          {hasLiveData ? (
            <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-8">
              {(booths ?? []).map((booth) => {
                const assignment = (assignments ?? []).find((a) => a.boothId === booth.id);
                const isPicking = pickerBoothId === booth.id;
                return (
                  <div key={booth.id} className="relative">
                    <button
                      onClick={() => setPickerBoothId(isPicking ? null : booth.id)}
                      className={`flex aspect-square w-full flex-col items-center justify-center gap-0.5 rounded-lg border text-center transition-transform hover:-translate-y-0.5 ${
                        assignment?.vendorName
                          ? "border-primary bg-moss-soft text-primary"
                          : "border-border bg-background text-muted-foreground"
                      }`}
                    >
                      <span className="font-mono text-[11px] font-semibold">{booth.code}</span>
                      {assignment?.vendorName && (
                        <span className="px-1 text-[9.5px] font-semibold leading-tight">
                          {assignment.vendorName.split(" ")[0]}
                        </span>
                      )}
                    </button>
                    {isPicking && (
                      <div className="absolute left-0 top-full z-10 mt-1 w-40 rounded-lg border border-border bg-card p-2 shadow-lg">
                        <Select
                          onValueChange={(vendorId) => {
                            if (selectedSchedule) {
                              assignVendor.mutate(
                                { scheduleId: selectedSchedule.id, boothId: booth.id, vendorId },
                                { onSuccess: () => setPickerBoothId(null) },
                              );
                            }
                          }}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Assign vendor…" />
                          </SelectTrigger>
                          <SelectContent>
                            {(vendors ?? []).map((v) => (
                              <SelectItem key={v.id} value={v.id} className="text-xs">
                                {v.business_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-8 gap-2.5">
              {MOCK_LAYOUTS[mockDay].map((code, i) => {
                const vendorName = code ? MOCK_VENDOR_MAP[code] : undefined;
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
                  <div
                    key={code}
                    className={`flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg border text-center ${
                      vendorName
                        ? "border-primary bg-moss-soft text-primary"
                        : "border-border bg-background text-muted-foreground"
                    }`}
                  >
                    <span className="font-mono text-[11px] font-semibold">{code}</span>
                    {vendorName && (
                      <span className="px-1 text-[9.5px] font-semibold leading-tight">
                        {vendorName.split(" ")[0]}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-4 text-[11.5px] text-muted-foreground">
            <span>■ Occupied</span>
            <span>┄ Empty</span>
            <span>
              {hasLiveData
                ? "Click a booth to assign a vendor"
                : "Sample layout — connect a market to make this interactive"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

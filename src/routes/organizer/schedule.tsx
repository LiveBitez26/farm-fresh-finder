import { createFileRoute } from "@tanstack/react-router";
import { CalendarRange } from "lucide-react";
import { ComingSoon } from "../../components/organizer/coming-soon";

export const Route = createFileRoute("/organizer/schedule")({
  component: () => (
    <ComingSoon
      title="Market Schedule & Booth Map"
      description="Calendars, visual booth maps, and vendor attendance."
      phase="Phase 2 — Operations"
      icon={CalendarRange}
      features={[
        "Daily, weekly, seasonal, and special-event calendars",
        "Drag-and-drop visual booth map with saveable layouts",
        "Vendor attendance tracking (attending / absent / late)",
        "Backed by the schedules, booths, and booth_assignments tables",
      ]}
    />
  ),
});

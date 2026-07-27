import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

export function TicketCard({
  label,
  value,
  delta,
  deltaTone = "good",
  className,
}: {
  label: string;
  value: ReactNode;
  delta?: ReactNode;
  deltaTone?: "good" | "warn" | "bad";
  className?: string;
}) {
  return (
    <div className={cn("ticket-card rounded-[10px] border border-border bg-card p-4", className)}>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="my-1.5 font-[family-name:var(--font-display)] text-[30px] font-semibold leading-none text-primary">
        {value}
      </div>
      {delta && (
        <div
          className={cn(
            "text-[11.5px] font-semibold",
            deltaTone === "good" && "text-moss",
            deltaTone === "warn" && "text-clay",
            deltaTone === "bad" && "text-destructive",
          )}
        >
          {delta}
        </div>
      )}
    </div>
  );
}

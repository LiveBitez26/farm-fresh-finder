import type { LucideIcon } from "lucide-react";
import { PageHeader } from "./page-header";

export function ComingSoon({
  title,
  description,
  phase,
  icon: Icon,
  features,
}: {
  title: string;
  description: string;
  phase: string;
  icon: LucideIcon;
  features: string[];
}) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 md:p-12">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
            <Icon className="h-6 w-6" />
          </div>
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-foreground">
            Scheduled for {phase}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This section's data model already exists in the schema. Here's what will ship here:
          </p>
          <ul className="mt-4 w-full space-y-2 text-left">
            {features.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2 rounded-lg bg-muted/60 px-3 py-2 text-sm text-foreground"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

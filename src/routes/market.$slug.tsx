import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, MapPin, Mail, Phone, Leaf, ImageOff, Store } from "lucide-react";
import {
  usePublicMarketBySlug,
  usePublicMarketVendors,
  usePublicMarketSchedules,
  usePublicMarketAnnouncements,
} from "../hooks/use-marketplace-data";

export const Route = createFileRoute("/market/$slug")({
  component: MarketPage,
});

function formatEventDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function MarketPage() {
  const { slug } = Route.useParams();
  const { data: market, isLoading } = usePublicMarketBySlug(slug);
  const { data: vendors, isLoading: vendorsLoading } = usePublicMarketVendors(market?.id);
  const { data: schedules } = usePublicMarketSchedules(market?.id);
  const { data: announcements } = usePublicMarketAnnouncements(market?.id, market?.organization_id);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!market) {
    return (
      <div className="organizer-theme flex min-h-screen items-center justify-center bg-background px-4 text-center">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold text-foreground">
            Market not found
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This market link doesn't exist, or the market isn't active yet.
          </p>
          <Link to="/" className="mt-4 inline-block text-sm font-semibold text-primary underline">
            Browse all markets
          </Link>
        </div>
      </div>
    );
  }

  const addressLine = [market.address, market.city, market.region].filter(Boolean).join(", ");

  return (
    <div className="organizer-theme min-h-screen bg-background">
      <div className="relative h-[260px] overflow-hidden border-b border-border bg-gradient-to-br from-primary to-earth sm:h-[320px]">
        {market.hero_image_url && (
          <img
            src={market.hero_image_url}
            alt={market.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
        <div className="relative flex h-full flex-col justify-between p-6 text-white sm:p-10">
          <div className="flex items-center gap-2 text-sm font-medium">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-white/15 backdrop-blur">
              <Leaf className="h-4 w-4" />
            </div>
            <span className="tracking-wide">MarketConnect</span>
          </div>
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold sm:text-5xl">
              {market.name}
            </h1>
            {addressLine && (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-white/85">
                <MapPin className="h-4 w-4" />
                {addressLine}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {market.description && (
          <p className="text-sm leading-relaxed text-muted-foreground">{market.description}</p>
        )}

        {(market.contact_email || market.contact_phone) && (
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
            {market.contact_email && (
              <a
                href={`mailto:${market.contact_email}`}
                className="flex items-center gap-1.5 hover:text-primary"
              >
                <Mail className="h-3.5 w-3.5" />
                {market.contact_email}
              </a>
            )}
            {market.contact_phone && (
              <a
                href={`tel:${market.contact_phone}`}
                className="flex items-center gap-1.5 hover:text-primary"
              >
                <Phone className="h-3.5 w-3.5" />
                {market.contact_phone}
              </a>
            )}
          </div>
        )}

        {schedules && schedules.length > 0 && (
          <div className="mt-6">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-foreground">
              Upcoming Market Days
            </h2>
            <div className="mt-2 space-y-1.5">
              {schedules.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-2.5 text-sm"
                >
                  <span className="font-medium text-foreground">
                    {formatEventDate(s.event_date)}
                  </span>
                  {s.start_time && s.end_time && (
                    <span className="text-muted-foreground">
                      {s.start_time.slice(0, 5)} – {s.end_time.slice(0, 5)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {announcements && announcements.length > 0 && (
          <div className="mt-6 space-y-2">
            {announcements.map((a) => (
              <div
                key={a.id}
                className="rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-foreground"
              >
                {a.message}
              </div>
            ))}
          </div>
        )}

        <div className="mt-8">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-foreground">
            Farmers at This Market
          </h2>
          {vendorsLoading ? (
            <p className="mt-3 text-sm text-muted-foreground">Loading…</p>
          ) : (vendors ?? []).length === 0 ? (
            <p className="mt-3 rounded-xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
              No active vendors here yet.
            </p>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {vendors!.map((v) => (
                <a
                  key={v.id}
                  href={`/store/${v.id}`}
                  className="overflow-hidden rounded-xl border border-border bg-card transition hover:shadow-md"
                >
                  <div className="flex h-24 items-center justify-center overflow-hidden bg-secondary">
                    {v.photos?.[0] ? (
                      <img
                        src={v.photos[0]}
                        alt={v.business_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageOff className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-semibold text-foreground">{v.business_name}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {(v.product_categories ?? []).join(", ") || "Local goods"}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        {market.organizationSlug && (
          <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-5 text-center">
            <Store className="mx-auto h-5 w-5 text-primary" />
            <p className="mt-2 text-sm font-semibold text-foreground">
              Grow or make something local?
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Apply to sell at {market.name}, run by {market.organizationName}.
            </p>
            <a
              href={`/apply/${market.organizationSlug}`}
              className="mt-3 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Apply to Sell Here
            </a>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link to="/" className="text-sm font-semibold text-primary hover:underline">
            Browse all markets on MarketConnect →
          </Link>
        </div>
      </div>
    </div>
  );
}

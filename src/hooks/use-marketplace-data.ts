import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { Market, Product, Vendor } from "../lib/types";

/** All active markets, across every organization — this is the public,
 * cross-tenant marketplace view (relies on markets_public_read). */
export function usePublicMarkets() {
  return useQuery({
    queryKey: ["marketplace_markets"],
    queryFn: async (): Promise<Market[]> => {
      const { data, error } = await supabase
        .from("markets")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data as Market[]) ?? [];
    },
  });
}

export function usePublicMarket(marketId: string | undefined) {
  return useQuery({
    queryKey: ["marketplace_market", marketId],
    enabled: Boolean(marketId),
    queryFn: async (): Promise<
      (Market & { organizationSlug: string | null; organizationName: string | null }) | null
    > => {
      const { data, error } = await supabase
        .from("markets")
        .select("*, organizations(slug, name)")
        .eq("id", marketId)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      type Row = Market & { organizations: { slug: string; name: string } | null };
      const row = data as unknown as Row;
      return {
        ...row,
        organizationSlug: row.organizations?.slug ?? null,
        organizationName: row.organizations?.name ?? null,
      };
    },
  });
}

/** Active vendors belonging to the same organization as a given market.
 * (There's no populated vendor<->market join table yet, so this is the
 * best available proxy for "farmers at this market" today.) */
export function usePublicMarketVendors(marketId: string | undefined) {
  return useQuery({
    queryKey: ["marketplace_market_vendors", marketId],
    enabled: Boolean(marketId),
    queryFn: async (): Promise<Vendor[]> => {
      const { data: market, error: marketError } = await supabase
        .from("markets")
        .select("organization_id")
        .eq("id", marketId)
        .maybeSingle();
      if (marketError) throw marketError;
      if (!market) return [];

      const { data, error } = await supabase
        .from("vendors")
        .select("*")
        .eq("organization_id", market.organization_id)
        .eq("status", "active")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data as Vendor[]) ?? [];
    },
  });
}

export function usePublicVendor(vendorId: string | undefined) {
  return useQuery({
    queryKey: ["marketplace_vendor", vendorId],
    enabled: Boolean(vendorId),
    queryFn: async (): Promise<Vendor | null> => {
      const { data, error } = await supabase
        .from("vendors")
        .select("*")
        .eq("id", vendorId)
        .maybeSingle();
      if (error) throw error;
      return (data as Vendor) ?? null;
    },
  });
}

export function usePublicVendorProducts(vendorId: string | undefined) {
  return useQuery({
    queryKey: ["marketplace_vendor_products", vendorId],
    enabled: Boolean(vendorId),
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("vendor_id", vendorId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as Product[]) ?? [];
    },
  });
}

/** A market's upcoming scheduled dates — shown to customers so they
 * actually know when the market is open. */
export function usePublicMarketSchedules(marketId: string | undefined) {
  return useQuery({
    queryKey: ["marketplace_market_schedules", marketId],
    enabled: Boolean(marketId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("schedules")
        .select("id, event_date, start_time, end_time")
        .eq("market_id", marketId)
        .gte("event_date", new Date().toISOString().slice(0, 10))
        .order("event_date", { ascending: true })
        .limit(5);
      if (error) throw error;
      return (
        (data as {
          id: string;
          event_date: string;
          start_time: string | null;
          end_time: string | null;
        }[]) ?? []
      );
    },
  });
}

/** Announcements targeted at customers for a given market — either
 * market-specific (market_id matches) or organization-wide (market_id
 * is null), for that market's organization. */
export function usePublicMarketAnnouncements(
  marketId: string | undefined,
  organizationId: string | undefined,
) {
  return useQuery({
    queryKey: ["marketplace_market_announcements", marketId, organizationId],
    enabled: Boolean(marketId && organizationId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("id, message, created_at, market_id")
        .eq("organization_id", organizationId)
        .eq("audience", "customers")
        .or(`market_id.eq.${marketId},market_id.is.null`)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return (
        (data as { id: string; message: string; created_at: string; market_id: string | null }[]) ??
        []
      );
    },
  });
}

/** Active organizations, for the marketplace's 'Apply to sell here'
 * links — organization name/slug are public directory info. */
export function usePublicOrganizations() {
  return useQuery({
    queryKey: ["marketplace_organizations"],
    queryFn: async (): Promise<{ id: string; name: string; slug: string }[]> => {
      const { data, error } = await supabase
        .from("organizations")
        .select("id, name, slug")
        .eq("is_active", true)
        .order("name", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

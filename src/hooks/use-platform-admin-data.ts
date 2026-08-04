import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

/** Platform-wide totals for the admin Overview page. Every query here
 * relies on the is_platform_owner bypass already baked into
 * is_org_member() since the very first migration — a platform owner's
 * account can already read across every organization; this is just the
 * first UI that actually uses it. */
export function usePlatformStats() {
  return useQuery({
    queryKey: ["platform_stats"],
    queryFn: async () => {
      const [organizations, vendors, markets, profiles, orders, subscriptions] = await Promise.all([
        supabase.from("organizations").select("id", { count: "exact", head: true }),
        supabase.from("vendors").select("id", { count: "exact", head: true }),
        supabase.from("markets").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase
          .from("subscriptions")
          .select("id", { count: "exact", head: true })
          .eq("status", "active"),
      ]);
      return {
        organizations: organizations.count ?? 0,
        vendors: vendors.count ?? 0,
        markets: markets.count ?? 0,
        profiles: profiles.count ?? 0,
        orders: orders.count ?? 0,
        activeSubscriptions: subscriptions.count ?? 0,
      };
    },
  });
}

/** Organizations with no vendors or no markets yet — a real, honest
 * substitute for a fabricated "needs attention" list, since there's no
 * billing/trial data yet to flag instead. */
export function useOrganizationsNeedingAttention() {
  const { data: organizations } = useAllOrganizations();
  return (organizations ?? []).filter((o) => o.vendorCount === 0 || o.marketCount === 0);
}

/** Most recently created organizations, for a real "recent activity"
 * feed on the admin Overview page. */
export function useRecentOrganizations(limit = 6) {
  return useQuery({
    queryKey: ["recent_organizations", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("id, name, created_at")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data ?? [];
    },
  });
}

/** New organizations per month, last 6 months — a real substitute for
 * a fabricated MRR chart, since there's no billing data yet. */
export function useNewOrganizationsByMonth() {
  return useQuery({
    queryKey: ["new_organizations_by_month"],
    queryFn: async () => {
      const { data, error } = await supabase.from("organizations").select("created_at");
      if (error) throw error;

      const now = new Date();
      const months: { label: string; count: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({ label: d.toLocaleDateString(undefined, { month: "short" }), count: 0 });
      }
      for (const row of data ?? []) {
        const created = new Date(row.created_at);
        const monthsAgo =
          (now.getFullYear() - created.getFullYear()) * 12 + (now.getMonth() - created.getMonth());
        if (monthsAgo >= 0 && monthsAgo <= 5) {
          months[5 - monthsAgo].count += 1;
        }
      }
      return months;
    },
  });
}

/** Real distribution of organizations across subscription plans. */
export function usePlanDistribution() {
  return useQuery({
    queryKey: ["plan_distribution"],
    queryFn: async () => {
      const { data, error } = await supabase.from("organizations").select("subscription_plan");
      if (error) throw error;
      const counts: Record<string, number> = {};
      for (const row of data ?? []) {
        counts[row.subscription_plan] = (counts[row.subscription_plan] ?? 0) + 1;
      }
      return counts;
    },
  });
}

/** Every organization on the platform, with vendor/market counts, for
 * the admin Organizations list. */
export function useAllOrganizations() {
  return useQuery({
    queryKey: ["all_organizations"],
    queryFn: async () => {
      const { data: orgs, error } = await supabase
        .from("organizations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      const [{ data: vendorRows }, { data: marketRows }] = await Promise.all([
        supabase.from("vendors").select("organization_id"),
        supabase.from("markets").select("organization_id"),
      ]);

      const vendorCounts: Record<string, number> = {};
      for (const row of vendorRows ?? []) {
        vendorCounts[row.organization_id] = (vendorCounts[row.organization_id] ?? 0) + 1;
      }
      const marketCounts: Record<string, number> = {};
      for (const row of marketRows ?? []) {
        marketCounts[row.organization_id] = (marketCounts[row.organization_id] ?? 0) + 1;
      }

      return (orgs ?? []).map((org) => ({
        ...org,
        vendorCount: vendorCounts[org.id] ?? 0,
        marketCount: marketCounts[org.id] ?? 0,
      }));
    },
  });
}

/** Suspend or reactivate an organization platform-wide. */
export function useToggleOrganizationActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      organizationId,
      isActive,
    }: {
      organizationId: string;
      isActive: boolean;
    }) => {
      const { error } = await supabase
        .from("organizations")
        .update({ is_active: isActive })
        .eq("id", organizationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all_organizations"] });
    },
  });
}

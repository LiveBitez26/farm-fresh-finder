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
      const [organizations, vendors, markets, profiles, orders] = await Promise.all([
        supabase.from("organizations").select("id", { count: "exact", head: true }),
        supabase.from("vendors").select("id", { count: "exact", head: true }),
        supabase.from("markets").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }),
      ]);
      return {
        organizations: organizations.count ?? 0,
        vendors: vendors.count ?? 0,
        markets: markets.count ?? 0,
        profiles: profiles.count ?? 0,
        orders: orders.count ?? 0,
      };
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

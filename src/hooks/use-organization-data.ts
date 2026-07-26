import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "./use-auth";
import type {
  ComplianceDocument,
  DocumentStatus,
  DocumentType,
  Vendor,
  VendorApplication,
  VendorApplicationStatus,
} from "../lib/types";

/** All hooks below are scoped to the signed-in user's organization and are
 * inert (return no data, don't fire) until an org exists — the Overview /
 * Vendor Management / Compliance pages fall back to their built-in mock
 * arrays whenever `organizationId` is undefined (Supabase not configured,
 * or the user hasn't finished onboarding yet). */

function useOrganizationId() {
  const { profile } = useAuth();
  return profile?.organization_id ?? undefined;
}

export function useVendors() {
  const organizationId = useOrganizationId();
  return useQuery({
    queryKey: ["vendors", organizationId],
    enabled: Boolean(organizationId),
    queryFn: async (): Promise<Vendor[]> => {
      const { data, error } = await supabase
        .from("vendors")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as Vendor[]) ?? [];
    },
  });
}

export function useVendorApplications() {
  const organizationId = useOrganizationId();
  return useQuery({
    queryKey: ["vendor_applications", organizationId],
    enabled: Boolean(organizationId),
    queryFn: async (): Promise<VendorApplication[]> => {
      const { data, error } = await supabase
        .from("vendor_applications")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as VendorApplication[]) ?? [];
    },
  });
}

export function useComplianceDocuments() {
  const organizationId = useOrganizationId();
  return useQuery({
    queryKey: ["documents", organizationId],
    enabled: Boolean(organizationId),
    queryFn: async (): Promise<(ComplianceDocument & { vendor_name: string })[]> => {
      const { data, error } = await supabase
        .from("documents")
        .select("*, vendors(business_name)")
        .eq("organization_id", organizationId)
        .order("expires_at", { ascending: true });
      if (error) throw error;
      type DocumentJoinRow = ComplianceDocument & { vendors: { business_name: string } | null };
      return ((data as DocumentJoinRow[]) ?? []).map((row) => ({
        ...row,
        vendor_name: row.vendors?.business_name ?? "Unknown vendor",
      }));
    },
  });
}

export function useOverviewMetrics() {
  const organizationId = useOrganizationId();
  return useQuery({
    queryKey: ["overview_metrics", organizationId],
    enabled: Boolean(organizationId),
    queryFn: async () => {
      const [vendors, upcomingMarkets, applications, expiringDocs, orders] = await Promise.all([
        supabase
          .from("vendors")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", organizationId)
          .eq("status", "active"),
        supabase
          .from("schedules")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", organizationId)
          .gte("event_date", new Date().toISOString().slice(0, 10)),
        supabase
          .from("vendor_applications")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", organizationId)
          .not("status", "in", "(activated,rejected)"),
        supabase
          .from("documents")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", organizationId)
          .in("status", ["expiring_soon", "expired"]),
        supabase.from("orders").select("total_amount").eq("organization_id", organizationId),
      ]);

      const revenue = (orders.data ?? []).reduce(
        (sum, o: { total_amount: number }) => sum + Number(o.total_amount ?? 0),
        0,
      );

      return {
        activeVendors: vendors.count ?? 0,
        upcomingMarkets: upcomingMarkets.count ?? 0,
        pendingApplications: applications.count ?? 0,
        expiringCertifications: expiringDocs.count ?? 0,
        revenue,
        customerVisits: (orders.data ?? []).length,
      };
    },
  });
}

/** Populates the current organization with realistic sample data so a
 * freshly created tenant isn't an empty shell. Safe to run more than once
 * (each call adds another small batch) — intended for demo/dev use. */
export function useSeedDemoData() {
  const organizationId = useOrganizationId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!organizationId) throw new Error("No organization to seed");

      const { data: market, error: marketError } = await supabase
        .from("markets")
        .insert({
          organization_id: organizationId,
          name: "Downtown Saturday Market",
          city: "Portland",
          country: "United States",
          market_type: "weekly",
        })
        .select()
        .single();
      if (marketError) throw marketError;

      const vendorRows = [
        {
          organization_id: organizationId,
          business_name: "Green Fields Farm",
          farm_story: "A family farm growing sustainable vegetables using regenerative practices.",
          product_categories: ["Vegetables", "Herbs"],
          status: "active" as const,
        },
        {
          organization_id: organizationId,
          business_name: "Hilltop Honey Co.",
          farm_story: "Small-batch raw honey from wildflower meadows.",
          product_categories: ["Honey", "Preserves"],
          status: "active" as const,
        },
        {
          organization_id: organizationId,
          business_name: "Cascade Creamery",
          farm_story: "Artisan cheese and dairy from grass-fed cows.",
          product_categories: ["Dairy", "Cheese"],
          status: "pending" as const,
        },
      ];

      const { data: vendors, error: vendorError } = await supabase
        .from("vendors")
        .insert(vendorRows)
        .select();
      if (vendorError) throw vendorError;

      const applicationRows = (vendors ?? []).map((v: { id: string; business_name: string }) => ({
        organization_id: organizationId,
        vendor_id: v.id,
        market_id: market.id,
        applicant_name: v.business_name,
        applicant_email: `contact@${v.business_name.toLowerCase().replace(/\s+/g, "")}.example.com`,
        status:
          v.business_name === "Cascade Creamery"
            ? ("document_review" as VendorApplicationStatus)
            : ("activated" as VendorApplicationStatus),
      }));
      const { error: appError } = await supabase
        .from("vendor_applications")
        .insert(applicationRows);
      if (appError) throw appError;

      const greenFields = vendors?.find(
        (v: { business_name: string }) => v.business_name === "Green Fields Farm",
      );
      if (greenFields) {
        const documentRows: Partial<ComplianceDocument>[] = [
          {
            organization_id: organizationId,
            vendor_id: greenFields.id,
            document_type: "organic_certification" as DocumentType,
            title: "USDA Organic Certificate",
            status: "verified" as DocumentStatus,
            expires_at: "2027-03-01",
          },
        ];
        await supabase.from("documents").insert(documentRows);
      }

      return { market, vendors };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      queryClient.invalidateQueries({ queryKey: ["vendor_applications"] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["overview_metrics"] });
    },
  });
}

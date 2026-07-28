import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "./use-auth";
import type {
  ComplianceDocument,
  DocumentStatus,
  DocumentType,
  Organization,
  Product,
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

/** Approve, verify, or request an update on a compliance document. */
export function useUpdateDocumentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ documentId, status }: { documentId: string; status: DocumentStatus }) => {
      const { error } = await supabase
        .from("documents")
        .update({
          status,
          verified_at: status === "verified" ? new Date().toISOString() : null,
        })
        .eq("id", documentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["overview_metrics"] });
      queryClient.invalidateQueries({ queryKey: ["nav_badge_counts"] });
      queryClient.invalidateQueries({ queryKey: ["vendor_verified_insurance"] });
    },
  });
}

/** Log a new compliance document for a vendor (organizer entering it on
 * their behalf, since there's no vendor-facing upload flow yet). */
export function useCreateComplianceDocument() {
  const organizationId = useOrganizationId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      vendorId: string;
      documentType: DocumentType;
      title: string;
      expiresAt?: string;
    }) => {
      if (!organizationId) throw new Error("No organization");
      const { error } = await supabase.from("documents").insert({
        organization_id: organizationId,
        vendor_id: input.vendorId,
        document_type: input.documentType,
        title: input.title,
        expires_at: input.expiresAt || null,
        status: "pending_review",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["nav_badge_counts"] });
    },
  });
}

export function useOrganization() {
  const organizationId = useOrganizationId();
  return useQuery({
    queryKey: ["organization", organizationId],
    enabled: Boolean(organizationId),
    queryFn: async (): Promise<Organization | null> => {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", organizationId)
        .maybeSingle();
      if (error) throw error;
      return (data as Organization) ?? null;
    },
  });
}

/** Update the organization's own editable fields (name, country). */
export function useUpdateOrganization() {
  const organizationId = useOrganizationId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; country?: string }) => {
      if (!organizationId) throw new Error("No organization");
      const { error } = await supabase
        .from("organizations")
        .update({ name: input.name, country: input.country || null })
        .eq("id", organizationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization"] });
    },
  });
}

/** Real staff list for the organization (name/email + role), for
 * Organization Settings. */
export function useOrganizationStaff() {
  const organizationId = useOrganizationId();
  return useQuery({
    queryKey: ["organization_staff", organizationId],
    enabled: Boolean(organizationId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organization_members")
        .select("*, profiles(full_name, email)")
        .eq("organization_id", organizationId);
      if (error) throw error;
      type Row = {
        id: string;
        role: string;
        profiles: { full_name: string | null; email: string | null } | null;
      };
      return ((data as Row[]) ?? []).map((row) => ({
        id: row.id,
        role: row.role,
        name: row.profiles?.full_name || row.profiles?.email || "Unknown",
      }));
    },
  });
}

/** Small counts shown as sidebar nav badges. */
export function useNavBadgeCounts() {
  const organizationId = useOrganizationId();
  return useQuery({
    queryKey: ["nav_badge_counts", organizationId],
    enabled: Boolean(organizationId),
    queryFn: async () => {
      const [applications, documents] = await Promise.all([
        supabase
          .from("vendor_applications")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", organizationId)
          .not("status", "in", "(activated,rejected)"),
        supabase
          .from("documents")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", organizationId)
          .in("status", ["pending_review", "expiring_soon", "expired", "update_requested"]),
      ]);
      return { vendors: applications.count ?? 0, compliance: documents.count ?? 0 };
    },
  });
}

/** Applications not yet activated/rejected, newest first, for the Overview
 * "awaiting action" panel — includes the vendor's product categories. */
export function useVendorApplicationsAwaitingAction(limit = 4) {
  const organizationId = useOrganizationId();
  return useQuery({
    queryKey: ["vendor_applications_awaiting_action", organizationId, limit],
    enabled: Boolean(organizationId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendor_applications")
        .select("*, vendors(product_categories)")
        .eq("organization_id", organizationId)
        .not("status", "in", "(activated,rejected)")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      type Row = VendorApplication & { vendors: { product_categories: string[] | null } | null };
      return ((data as Row[]) ?? []).map((row) => ({
        ...row,
        categories: row.vendors?.product_categories?.join(", ") ?? "—",
      }));
    },
  });
}

/** Upcoming scheduled market dates with their market name, for the Overview
 * "upcoming markets" panel. */
export function useUpcomingSchedules(limit = 3) {
  const organizationId = useOrganizationId();
  return useQuery({
    queryKey: ["upcoming_schedules", organizationId, limit],
    enabled: Boolean(organizationId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("schedules")
        .select("*, markets(name)")
        .eq("organization_id", organizationId)
        .gte("event_date", new Date().toISOString().slice(0, 10))
        .order("event_date", { ascending: true })
        .limit(limit);
      if (error) throw error;
      type Row = {
        id: string;
        event_date: string;
        start_time: string | null;
        end_time: string | null;
        markets: { name: string } | null;
      };
      return ((data as Row[]) ?? []).map((row) => ({
        id: row.id,
        marketName: row.markets?.name ?? "Unnamed market",
        eventDate: row.event_date,
        startTime: row.start_time,
        endTime: row.end_time,
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

      // Booths for the market's layout.
      const boothCodes = ["A01", "A02", "A03", "A04", "B01", "B02", "B03", "B04"];
      const { data: booths, error: boothError } = await supabase
        .from("booths")
        .insert(
          boothCodes.map((code) => ({
            organization_id: organizationId,
            market_id: market.id,
            code,
          })),
        )
        .select();
      if (boothError) throw boothError;

      // A few upcoming schedule dates for this market.
      const today = new Date();
      const nextSaturday = new Date(today);
      nextSaturday.setDate(today.getDate() + ((6 - today.getDay() + 7) % 7 || 7));
      const scheduleDates = [0, 7, 14].map((offsetDays) => {
        const d = new Date(nextSaturday);
        d.setDate(d.getDate() + offsetDays);
        return d.toISOString().slice(0, 10);
      });

      const { data: schedules, error: scheduleError } = await supabase
        .from("schedules")
        .insert(
          scheduleDates.map((event_date) => ({
            organization_id: organizationId,
            market_id: market.id,
            event_date,
            start_time: "09:00",
            end_time: "13:00",
            event_type: "weekly",
          })),
        )
        .select();
      if (scheduleError) throw scheduleError;

      // Assign active vendors to the first couple of booths for the nearest
      // schedule date, with realistic attendance statuses.
      const activeVendors = (vendors ?? []).filter(
        (v: { status: string }) => v.status === "active",
      );
      const firstSchedule = schedules?.[0];
      if (firstSchedule && booths && activeVendors.length > 0) {
        const assignmentRows = activeVendors.map((v: { id: string }, i: number) => ({
          organization_id: organizationId,
          schedule_id: firstSchedule.id,
          booth_id: booths[i % booths.length].id,
          vendor_id: v.id,
          attendance: i === 0 ? ("attending" as const) : ("attending" as const),
        }));
        await supabase.from("booth_assignments").insert(assignmentRows);
      }

      // Sample products for the active vendors.
      const productsByVendor: Record<
        string,
        { name: string; category: string; price: number; unit: string }[]
      > = {
        "Green Fields Farm": [
          { name: "Heirloom Tomatoes", category: "Vegetables", price: 4.5, unit: "lb" },
          { name: "Mixed Salad Greens", category: "Vegetables", price: 3.75, unit: "bag" },
        ],
        "Hilltop Honey Co.": [
          { name: "Wildflower Honey", category: "Honey", price: 9.0, unit: "12oz jar" },
        ],
      };
      const productRows = activeVendors.flatMap((v: { id: string; business_name: string }) =>
        (productsByVendor[v.business_name] ?? []).map((p) => ({
          organization_id: organizationId,
          vendor_id: v.id,
          name: p.name,
          category: p.category,
          price: p.price,
          unit: p.unit,
          is_active: true,
        })),
      );
      if (productRows.length > 0) {
        await supabase.from("products").insert(productRows);
      }

      return { market, vendors };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      queryClient.invalidateQueries({ queryKey: ["vendor_applications"] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["overview_metrics"] });
      queryClient.invalidateQueries({ queryKey: ["upcoming_schedules"] });
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({ queryKey: ["booths"] });
      queryClient.invalidateQueries({ queryKey: ["booth_assignments"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

/** All schedules for the org (past + upcoming), with market name, for the
 * Schedule & Booth Map calendar list. */
export function useSchedules() {
  const organizationId = useOrganizationId();
  return useQuery({
    queryKey: ["schedules", organizationId],
    enabled: Boolean(organizationId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("schedules")
        .select("*, markets(name)")
        .eq("organization_id", organizationId)
        .order("event_date", { ascending: true });
      if (error) throw error;
      type Row = {
        id: string;
        market_id: string;
        event_date: string;
        start_time: string | null;
        end_time: string | null;
        event_type: string | null;
        markets: { name: string } | null;
      };
      return ((data as Row[]) ?? []).map((row) => ({
        id: row.id,
        marketId: row.market_id,
        marketName: row.markets?.name ?? "Unnamed market",
        eventDate: row.event_date,
        startTime: row.start_time,
        endTime: row.end_time,
        eventType: row.event_type,
      }));
    },
  });
}

/** Booth layout for a given market. */
export function useBoothsForMarket(marketId: string | undefined) {
  const organizationId = useOrganizationId();
  return useQuery({
    queryKey: ["booths", organizationId, marketId],
    enabled: Boolean(organizationId && marketId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("booths")
        .select("*")
        .eq("organization_id", organizationId)
        .eq("market_id", marketId)
        .order("code", { ascending: true });
      if (error) throw error;
      return (data as { id: string; code: string; market_id: string }[]) ?? [];
    },
  });
}

/** Vendor assignments (+ attendance) for a specific scheduled market day. */
export function useBoothAssignmentsForSchedule(scheduleId: string | undefined) {
  const organizationId = useOrganizationId();
  return useQuery({
    queryKey: ["booth_assignments", organizationId, scheduleId],
    enabled: Boolean(organizationId && scheduleId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("booth_assignments")
        .select("*, vendors(business_name), booths(code)")
        .eq("organization_id", organizationId)
        .eq("schedule_id", scheduleId);
      if (error) throw error;
      type Row = {
        id: string;
        booth_id: string;
        vendor_id: string | null;
        attendance: "attending" | "absent" | "late";
        vendors: { business_name: string } | null;
        booths: { code: string } | null;
      };
      return ((data as Row[]) ?? []).map((row) => ({
        id: row.id,
        boothId: row.booth_id,
        boothCode: row.booths?.code ?? "",
        vendorId: row.vendor_id,
        vendorName: row.vendors?.business_name ?? null,
        attendance: row.attendance,
      }));
    },
  });
}

/** Assign (or reassign) a vendor to a booth for a given schedule date. */
export function useAssignVendorToBooth() {
  const organizationId = useOrganizationId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      scheduleId,
      boothId,
      vendorId,
    }: {
      scheduleId: string;
      boothId: string;
      vendorId: string;
    }) => {
      if (!organizationId) throw new Error("No organization");
      const { error } = await supabase.from("booth_assignments").upsert(
        {
          organization_id: organizationId,
          schedule_id: scheduleId,
          booth_id: boothId,
          vendor_id: vendorId,
          attendance: "attending",
        },
        { onConflict: "schedule_id,booth_id" },
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booth_assignments"] });
    },
  });
}

/** Recent announcements for the Communication Hub log. */
export function useAnnouncements(limit = 10) {
  const organizationId = useOrganizationId();
  return useQuery({
    queryKey: ["announcements", organizationId, limit],
    enabled: Boolean(organizationId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (
        (data as {
          id: string;
          audience: "all_vendors" | "specific_vendors" | "customers";
          channel: "in_app" | "email" | "sms";
          message: string;
          created_at: string;
        }[]) ?? []
      );
    },
  });
}

/** Send (create) a new announcement. */
export function useSendAnnouncement() {
  const organizationId = useOrganizationId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      audience,
      channel,
      message,
    }: {
      audience: "all_vendors" | "specific_vendors" | "customers";
      channel: "in_app" | "email" | "sms";
      message: string;
    }) => {
      if (!organizationId) throw new Error("No organization");
      const { error } = await supabase.from("announcements").insert({
        organization_id: organizationId,
        audience,
        channel,
        message,
        sent_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });
}

/** Products belonging to a specific vendor (shown in the Vendor Management
 * drawer's Products tab). */
export function useProductsForVendor(vendorId: string | undefined) {
  const organizationId = useOrganizationId();
  return useQuery({
    queryKey: ["products", organizationId, vendorId],
    enabled: Boolean(organizationId && vendorId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("organization_id", organizationId)
        .eq("vendor_id", vendorId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as Product[]) ?? [];
    },
  });
}

/** Add a new product for a vendor. */
export function useCreateProduct() {
  const organizationId = useOrganizationId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      vendorId: string;
      name: string;
      category: string;
      price: number;
      unit: string;
    }) => {
      if (!organizationId) throw new Error("No organization");
      const { error } = await supabase.from("products").insert({
        organization_id: organizationId,
        vendor_id: input.vendorId,
        name: input.name,
        category: input.category || null,
        price: input.price,
        unit: input.unit || null,
        is_active: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

/** Toggle a product's active/inactive listing state. */
export function useToggleProductActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, isActive }: { productId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("products")
        .update({ is_active: isActive })
        .eq("id", productId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

/** All markets belonging to the org (for pickers / market management). */
export function useMarkets() {
  const organizationId = useOrganizationId();
  return useQuery({
    queryKey: ["markets", organizationId],
    enabled: Boolean(organizationId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("markets")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (
        (data as { id: string; name: string; city: string | null; market_type: string | null }[]) ??
        []
      );
    },
  });
}

/** Create a new market. */
export function useCreateMarket() {
  const organizationId = useOrganizationId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; city?: string; marketType?: string }) => {
      if (!organizationId) throw new Error("No organization");
      const { data, error } = await supabase
        .from("markets")
        .insert({
          organization_id: organizationId,
          name: input.name,
          city: input.city || null,
          market_type: input.marketType || null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["markets"] });
    },
  });
}

/** Create a new scheduled market date. */
export function useCreateSchedule() {
  const organizationId = useOrganizationId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      marketId: string;
      eventDate: string;
      startTime: string;
      endTime: string;
    }) => {
      if (!organizationId) throw new Error("No organization");
      const { error } = await supabase.from("schedules").insert({
        organization_id: organizationId,
        market_id: input.marketId,
        event_date: input.eventDate,
        start_time: input.startTime,
        end_time: input.endTime,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({ queryKey: ["upcoming_schedules"] });
      queryClient.invalidateQueries({ queryKey: ["overview_metrics"] });
    },
  });
}

/** Add a booth to a market's layout. */
export function useCreateBooth() {
  const organizationId = useOrganizationId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { marketId: string; code: string }) => {
      if (!organizationId) throw new Error("No organization");
      const { error } = await supabase.from("booths").insert({
        organization_id: organizationId,
        market_id: input.marketId,
        code: input.code,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booths"] });
    },
  });
}

/** Remove a booth from a market's layout. */
export function useDeleteBooth() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (boothId: string) => {
      const { error } = await supabase.from("booths").delete().eq("id", boothId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booths"] });
      queryClient.invalidateQueries({ queryKey: ["booth_assignments"] });
    },
  });
}

/** Whether a vendor has a verified insurance certificate on file —
 * used to auto-check 'Insurance uploaded' from real Compliance Vault
 * data instead of a manual, duplicate checkbox. */
export function useVendorHasVerifiedInsurance(vendorId: string | undefined) {
  const organizationId = useOrganizationId();
  return useQuery({
    queryKey: ["vendor_verified_insurance", organizationId, vendorId],
    enabled: Boolean(organizationId && vendorId),
    queryFn: async () => {
      const { count, error } = await supabase
        .from("documents")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", organizationId)
        .eq("vendor_id", vendorId)
        .eq("document_type", "insurance_certificate")
        .eq("status", "verified");
      if (error) throw error;
      return (count ?? 0) > 0;
    },
  });
}

/** Toggle one onboarding-checklist field on a vendor
 * (insurance_uploaded / permit_verified / agreement_signed / fees_paid). */
export function useUpdateVendorChecklist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      vendorId,
      field,
      value,
    }: {
      vendorId: string;
      field: "insurance_uploaded" | "permit_verified" | "agreement_signed" | "fees_paid";
      value: boolean;
    }) => {
      const { error } = await supabase
        .from("vendors")
        .update({ [field]: value })
        .eq("id", vendorId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
    },
  });
}

/** A vendor's most recent real booth assignment (if any), for showing
 * accurate booth/onboarding-checklist status in the Vendor Management
 * drawer instead of a guess. */
export function useVendorBoothAssignment(vendorId: string | undefined) {
  const organizationId = useOrganizationId();
  return useQuery({
    queryKey: ["vendor_booth_assignment", organizationId, vendorId],
    enabled: Boolean(organizationId && vendorId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("booth_assignments")
        .select("*, booths(code, markets(name))")
        .eq("organization_id", organizationId)
        .eq("vendor_id", vendorId)
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      type Row = {
        booths: { code: string; markets: { name: string } | null } | null;
      };
      const row = data as Row;
      return {
        boothCode: row.booths?.code ?? null,
        marketName: row.booths?.markets?.name ?? null,
      };
    },
  });
}

/** Every vendor's current booth code across the whole org, as a lookup
 * map — used so the Vendor Management table itself can show real booth
 * codes per row instead of always showing "—". */
export function useVendorBoothAssignmentsMap() {
  const organizationId = useOrganizationId();
  return useQuery({
    queryKey: ["vendor_booth_assignments_map", organizationId],
    enabled: Boolean(organizationId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("booth_assignments")
        .select("vendor_id, booths(code)")
        .eq("organization_id", organizationId)
        .not("vendor_id", "is", null);
      if (error) throw error;
      type Row = { vendor_id: string; booths: { code: string } | null };
      const map: Record<string, string> = {};
      for (const row of (data as unknown as Row[]) ?? []) {
        if (row.booths?.code && !map[row.vendor_id]) {
          map[row.vendor_id] = row.booths.code;
        }
      }
      return map;
    },
  });
}

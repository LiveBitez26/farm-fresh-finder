import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "./use-auth";
import type { Product, Vendor } from "../lib/types";

/** The vendor record linked to the signed-in user's own account, if any. */
export function useMyVendor() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my_vendor", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async (): Promise<Vendor | null> => {
      const { data, error } = await supabase
        .from("vendors")
        .select("*")
        .eq("owner_user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return (data as Vendor) ?? null;
    },
  });
}

/** Look up an unclaimed vendor by id, for the invite-link claim page. */
export function useUnclaimedVendor(vendorId: string | undefined) {
  return useQuery({
    queryKey: ["unclaimed_vendor", vendorId],
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

/** Claim an unclaimed vendor listing as the signed-in user's own. */
export function useClaimVendor() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vendorId: string) => {
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase
        .from("vendors")
        .update({ owner_user_id: user.id })
        .eq("id", vendorId)
        .is("owner_user_id", null);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my_vendor"] });
      queryClient.invalidateQueries({ queryKey: ["unclaimed_vendor"] });
    },
  });
}

/** Update the signed-in vendor's own profile fields. */
export function useUpdateMyVendorProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      vendorId: string;
      businessName: string;
      farmStory: string;
      farmLocation: string;
      website: string;
      productCategories: string[];
      farmingPractices: string[];
    }) => {
      const { error } = await supabase
        .from("vendors")
        .update({
          business_name: input.businessName,
          farm_story: input.farmStory || null,
          farm_location: input.farmLocation || null,
          website: input.website || null,
          product_categories: input.productCategories.length ? input.productCategories : null,
          farming_practices: input.farmingPractices.length ? input.farmingPractices : null,
        })
        .eq("id", input.vendorId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my_vendor", user?.id] });
    },
  });
}

/** A vendor's own products (RLS scopes this to the signed-in vendor's own
 * vendor_id, no organization-staff context needed). */
export function useMyProducts(vendorId: string | undefined) {
  return useQuery({
    queryKey: ["my_products", vendorId],
    enabled: Boolean(vendorId),
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("vendor_id", vendorId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as Product[]) ?? [];
    },
  });
}

/** Add a product for the signed-in vendor's own listing. */
export function useCreateMyProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      vendorId: string;
      organizationId: string;
      name: string;
      category: string;
      price: number;
      unit: string;
      currency: string;
      isSubscriptionEligible: boolean;
      photoFile?: File;
    }) => {
      let photoUrl: string | null = null;
      if (input.photoFile) {
        const path = `${input.vendorId}/${Date.now()}-${input.photoFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from("product-photos")
          .upload(path, input.photoFile);
        if (uploadError) throw uploadError;
        const {
          data: { publicUrl },
        } = supabase.storage.from("product-photos").getPublicUrl(path);
        photoUrl = publicUrl;
      }

      const { error } = await supabase.from("products").insert({
        organization_id: input.organizationId,
        vendor_id: input.vendorId,
        name: input.name,
        category: input.category || null,
        price: input.price,
        currency: input.currency,
        unit: input.unit || null,
        is_subscription_eligible: input.isSubscriptionEligible,
        photo_url: photoUrl,
        is_active: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my_products"] });
    },
  });
}

/** The vendor's own upcoming market/booth assignments. */
export function useMyUpcomingAssignments(vendorId: string | undefined) {
  return useQuery({
    queryKey: ["my_assignments", vendorId],
    enabled: Boolean(vendorId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("booth_assignments")
        .select("*, booths(code, markets(name)), schedules(event_date, start_time, end_time)")
        .eq("vendor_id", vendorId);
      if (error) throw error;
      type Row = {
        id: string;
        attendance: "attending" | "absent" | "late";
        booths: { code: string; markets: { name: string } | null } | null;
        schedules: {
          event_date: string;
          start_time: string | null;
          end_time: string | null;
        } | null;
      };
      return ((data as unknown as Row[]) ?? [])
        .filter((row) => row.schedules)
        .map((row) => ({
          id: row.id,
          boothCode: row.booths?.code ?? "",
          marketName: row.booths?.markets?.name ?? "Unnamed market",
          eventDate: row.schedules!.event_date,
          startTime: row.schedules!.start_time,
          endTime: row.schedules!.end_time,
          attendance: row.attendance,
        }))
        .sort((a, b) => a.eventDate.localeCompare(b.eventDate));
    },
  });
}

/** Upload a compliance document file and create its record in one step. */
export function useUploadComplianceDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      vendorId: string;
      organizationId: string;
      documentType: string;
      title: string;
      expiresAt?: string;
      file: File;
    }) => {
      const path = `${input.vendorId}/${Date.now()}-${input.file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("compliance-documents")
        .upload(path, input.file);
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("compliance-documents").getPublicUrl(path);

      const { error } = await supabase.from("documents").insert({
        organization_id: input.organizationId,
        vendor_id: input.vendorId,
        document_type: input.documentType,
        title: input.title,
        file_url: publicUrl,
        expires_at: input.expiresAt || null,
        status: "pending_review",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my_documents"] });
    },
  });
}

/** The vendor's own compliance documents (read-only view — verification
 * stays the organizer's job; uploading is handled by
 * useUploadComplianceDocument above). */
export function useMyDocuments(vendorId: string | undefined) {
  return useQuery({
    queryKey: ["my_documents", vendorId],
    enabled: Boolean(vendorId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("vendor_id", vendorId)
        .order("expires_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

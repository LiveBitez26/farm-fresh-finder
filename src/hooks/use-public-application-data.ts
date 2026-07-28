import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { Organization } from "../lib/types";

/** Look up an organization by its public slug — used by the public
 * vendor application page. Relies on the organizations_public_read
 * policy (name/slug/country are public directory info). */
export function useOrganizationBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["organization_by_slug", slug],
    enabled: Boolean(slug),
    queryFn: async (): Promise<Organization | null> => {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return (data as Organization) ?? null;
    },
  });
}

/** Public markets list for an organization (so an applicant can pick which
 * market they're applying for, if the org runs more than one). */
export function usePublicMarkets(organizationId: string | undefined) {
  return useQuery({
    queryKey: ["public_markets", organizationId],
    enabled: Boolean(organizationId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("markets")
        .select("id, name")
        .eq("organization_id", organizationId)
        .eq("is_active", true);
      if (error) throw error;
      return (data as { id: string; name: string }[]) ?? [];
    },
  });
}

/** Submit a new public vendor application — creates a pending, unclaimed
 * vendor row plus a vendor_applications row referencing it. No sign-in
 * required; relies on the public-apply RLS policies. */
export function useSubmitVendorApplication() {
  return useMutation({
    mutationFn: async (input: {
      organizationId: string;
      marketId?: string;
      applicantName: string;
      applicantEmail: string;
      businessName: string;
      productCategories: string[];
      farmStory: string;
      farmLocation: string;
    }) => {
      const { data: vendor, error: vendorError } = await supabase
        .from("vendors")
        .insert({
          organization_id: input.organizationId,
          business_name: input.businessName,
          farm_story: input.farmStory || null,
          farm_location: input.farmLocation || null,
          product_categories: input.productCategories.length ? input.productCategories : null,
          status: "pending",
        })
        .select()
        .single();
      if (vendorError || !vendor) {
        throw new Error(vendorError?.message ?? "Couldn't submit application.");
      }

      const { error: appError } = await supabase.from("vendor_applications").insert({
        organization_id: input.organizationId,
        vendor_id: vendor.id,
        market_id: input.marketId || null,
        applicant_name: input.applicantName,
        applicant_email: input.applicantEmail,
        status: "submitted",
      });
      if (appError) throw new Error(appError.message);

      return vendor;
    },
  });
}

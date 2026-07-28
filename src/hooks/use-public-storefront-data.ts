import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { Product, Vendor } from "../lib/types";

/** A vendor's public profile — relies on vendors_public_read (active
 * vendors only), same policy the customer marketplace will eventually use. */
export function usePublicVendor(vendorId: string | undefined) {
  return useQuery({
    queryKey: ["public_vendor", vendorId],
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

/** A vendor's public, active product listing. */
export function usePublicVendorProducts(vendorId: string | undefined) {
  return useQuery({
    queryKey: ["public_vendor_products", vendorId],
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

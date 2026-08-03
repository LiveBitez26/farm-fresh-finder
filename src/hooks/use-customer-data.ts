import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "./use-auth";

/** The signed-in customer's own subscriptions, joined with vendor and
 * product info for display. Relies on subscriptions_customer_all
 * (customer_id = auth.uid()), which already existed in the schema. */
export function useMyCustomerSubscriptions() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my_customer_subscriptions", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*, vendors(business_name), products(name, price, currency, unit)")
        .eq("customer_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      type Row = {
        id: string;
        frequency: "weekly" | "biweekly" | "monthly";
        status: "active" | "paused" | "cancelled";
        vendors: { business_name: string } | null;
        products: { name: string; price: number; currency: string; unit: string | null } | null;
      };
      return ((data as unknown as Row[]) ?? []).map((row) => ({
        id: row.id,
        frequency: row.frequency,
        status: row.status,
        vendorName: row.vendors?.business_name ?? "Unknown vendor",
        productName: row.products?.name ?? "Unknown product",
        price: row.products?.price ?? 0,
        currency: row.products?.currency ?? "USD",
        unit: row.products?.unit ?? null,
      }));
    },
  });
}

/** Subscribe the signed-in customer to a product at a given frequency. */
export function useCreateSubscription() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      organizationId: string;
      vendorId: string;
      productId: string;
      frequency: "weekly" | "biweekly" | "monthly";
    }) => {
      if (!user) throw new Error("Please sign in to subscribe.");
      const { error } = await supabase.from("subscriptions").insert({
        organization_id: input.organizationId,
        customer_id: user.id,
        vendor_id: input.vendorId,
        product_id: input.productId,
        frequency: input.frequency,
        status: "active",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my_customer_subscriptions"] });
    },
  });
}

/** Pause, resume, or cancel one of the customer's own subscriptions. */
export function useUpdateSubscriptionStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      subscriptionId,
      status,
    }: {
      subscriptionId: string;
      status: "active" | "paused" | "cancelled";
    }) => {
      const { error } = await supabase
        .from("subscriptions")
        .update({ status })
        .eq("id", subscriptionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my_customer_subscriptions"] });
    },
  });
}

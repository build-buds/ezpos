import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAppState } from "@/contexts/AppContext";

export type KitchenStatus = "pending" | "cooking" | "ready" | "served";

export interface KitchenOrderItem {
  productId?: string;
  name: string;
  qty: number;
  price?: number;
  subtotal?: number;
  note?: string;
}

export interface KitchenOrder {
  id: string;
  business_id: string;
  items: KitchenOrderItem[];
  total: number;
  order_type: string | null;
  payment_method: string | null;
  kitchen_status: KitchenStatus;
  kitchen_updated_at: string;
  created_at: string;
}

export const useKitchenOrders = (status: KitchenStatus | KitchenStatus[]) => {
  const { businessId } = useAppState();
  const queryClient = useQueryClient();
  const statuses = Array.isArray(status) ? status : [status];

  useEffect(() => {
    if (!businessId) return;
    const channel = supabase
      .channel(`kitchen-${businessId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions", filter: `business_id=eq.${businessId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["kitchen-orders", businessId] });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [businessId, queryClient]);

  return useQuery({
    queryKey: ["kitchen-orders", businessId, statuses.join(",")],
    queryFn: async () => {
      if (!businessId) return [] as KitchenOrder[];
      const { data, error } = await supabase
        .from("transactions")
        .select("id, business_id, items, total, order_type, payment_method, kitchen_status, kitchen_updated_at, created_at")
        .eq("business_id", businessId)
        .eq("status", "completed")
        .in("kitchen_status", statuses)
        .order("created_at", { ascending: true })
        .limit(100);
      if (error) throw error;
      return (data || []) as unknown as KitchenOrder[];
    },
    enabled: !!businessId,
    refetchInterval: 15000,
  });
};

export const useUpdateKitchenStatus = () => {
  const queryClient = useQueryClient();
  const { businessId } = useAppState();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: KitchenStatus }) => {
      const { error } = await supabase
        .from("transactions")
        .update({ kitchen_status: status, kitchen_updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kitchen-orders", businessId] });
    },
  });
};
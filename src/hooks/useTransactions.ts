import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAppState } from "@/contexts/AppContext";

export const useTransactions = (period?: string) => {
  const { businessId } = useAppState();

  return useQuery({
    queryKey: ["transactions", businessId, period],
    queryFn: async () => {
      if (!businessId) return [];
      let query = supabase
        .from("transactions")
        .select("*")
        .eq("business_id", businessId)
        .eq("status", "completed")
        .order("created_at", { ascending: false });

      if (period === "today") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        query = query.gte("created_at", today.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!businessId,
  });
};

export const useCreateTransaction = () => {
  const { businessId } = useAppState();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tx: {
      items: unknown[];
      total: number;
      discount: number;
      payment_method: string;
      order_type?: string;
    }) => {
      if (!businessId) throw new Error("No business");
      const { data, error } = await supabase
        .from("transactions")
        .insert({ ...tx, business_id: businessId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", businessId] });
    },
  });
};

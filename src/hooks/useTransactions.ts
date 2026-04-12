import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAppState } from "@/contexts/AppContext";

export type TransactionPeriod = "today" | "week" | "month" | "year";

export const useTransactions = (period?: TransactionPeriod) => {
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
      } else if (period === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0);
        query = query.gte("created_at", weekAgo.toISOString());
      } else if (period === "month") {
        const firstOfMonth = new Date();
        firstOfMonth.setDate(1);
        firstOfMonth.setHours(0, 0, 0, 0);
        query = query.gte("created_at", firstOfMonth.toISOString());
      } else if (period === "year") {
        const firstOfYear = new Date();
        firstOfYear.setMonth(0, 1);
        firstOfYear.setHours(0, 0, 0, 0);
        query = query.gte("created_at", firstOfYear.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!businessId,
  });
};

/** Returns daily revenue for the last 7 days (index 0 = 6 days ago, index 6 = today) */
export const useLast7DaysRevenue = () => {
  const { businessId } = useAppState();

  return useQuery({
    queryKey: ["transactions-7days", businessId],
    queryFn: async () => {
      if (!businessId) return [];
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 6);
      weekAgo.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from("transactions")
        .select("total, created_at")
        .eq("business_id", businessId)
        .eq("status", "completed")
        .gte("created_at", weekAgo.toISOString());

      if (error) throw error;

      const days: number[] = Array(7).fill(0);
      const dayLabels: string[] = [];
      const today = new Date();

      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
        dayLabels.push(dayNames[d.getDay()]);
      }

      (data || []).forEach((tx) => {
        const txDate = new Date(tx.created_at);
        const diffMs = today.getTime() - txDate.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays < 7) {
          days[6 - diffDays] += tx.total || 0;
        }
      });

      return days.map((revenue, i) => ({ revenue, label: dayLabels[i] }));
    },
    enabled: !!businessId,
  });
};

export const useMonthlyTransactionCount = () => {
  const { businessId } = useAppState();

  return useQuery({
    queryKey: ["transactions-month-count", businessId],
    queryFn: async () => {
      if (!businessId) return 0;
      const firstOfMonth = new Date();
      firstOfMonth.setDate(1);
      firstOfMonth.setHours(0, 0, 0, 0);

      const { count, error } = await supabase
        .from("transactions")
        .select("id", { count: "exact", head: true })
        .eq("business_id", businessId)
        .gte("created_at", firstOfMonth.toISOString());

      if (error) throw error;
      return count || 0;
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
        .insert([{
          business_id: businessId,
          items: tx.items as any,
          total: tx.total,
          discount: tx.discount,
          payment_method: tx.payment_method,
          order_type: tx.order_type,
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
};
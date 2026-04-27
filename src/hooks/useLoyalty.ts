import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAppState } from "@/contexts/AppContext";

export type LoyaltyTier = "bronze" | "silver" | "gold";

export interface LoyaltyMember {
  id: string;
  business_id: string;
  name: string;
  phone: string;
  email: string | null;
  birthday: string | null;
  tier: LoyaltyTier;
  points_balance: number;
  total_earned: number;
  total_spent_rupiah: number;
  visit_count: number;
  last_visit_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface LoyaltyVoucher {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  discount_type: "percent" | "fixed";
  discount_value: number;
  points_cost: number;
  min_purchase: number;
  max_redemptions: number | null;
  redemption_count: number;
  valid_until: string | null;
  active: boolean;
}

export interface LoyaltySettings {
  id: string;
  business_id: string;
  enabled: boolean;
  points_per_rupiah: number;
  point_value_rupiah: number;
  min_redeem_points: number;
  welcome_bonus: number;
  auto_create_member: boolean;
  terms: string | null;
}

export interface LoyaltyTxn {
  id: string;
  member_id: string;
  type: "earn" | "redeem" | "adjust" | "bonus";
  points: number;
  note: string | null;
  created_at: string;
  voucher_id: string | null;
  transaction_id: string | null;
}

export const useLoyaltySettings = () => {
  const { businessId } = useAppState();
  return useQuery({
    queryKey: ["loyalty-settings", businessId],
    queryFn: async (): Promise<LoyaltySettings | null> => {
      if (!businessId) return null;
      const { data, error } = await supabase
        .from("loyalty_settings")
        .select("*")
        .eq("business_id", businessId)
        .maybeSingle();
      if (error) throw error;
      return data as LoyaltySettings | null;
    },
    enabled: !!businessId,
  });
};

export const useUpsertLoyaltySettings = () => {
  const { businessId } = useAppState();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<LoyaltySettings>) => {
      if (!businessId) throw new Error("No business");
      const { data: existing } = await supabase
        .from("loyalty_settings")
        .select("id")
        .eq("business_id", businessId)
        .maybeSingle();
      if (existing) {
        const { error } = await supabase
          .from("loyalty_settings")
          .update(patch)
          .eq("business_id", businessId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("loyalty_settings")
          .insert([{ business_id: businessId, ...patch }]);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["loyalty-settings"] }),
  });
};

export const useLoyaltyMembers = () => {
  const { businessId } = useAppState();
  return useQuery({
    queryKey: ["loyalty-members", businessId],
    queryFn: async (): Promise<LoyaltyMember[]> => {
      if (!businessId) return [];
      const { data, error } = await supabase
        .from("loyalty_members")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as LoyaltyMember[];
    },
    enabled: !!businessId,
  });
};

export const useCreateMember = () => {
  const { businessId } = useAppState();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (m: { name: string; phone: string; email?: string; birthday?: string }) => {
      if (!businessId) throw new Error("No business");
      // Apply welcome bonus if configured
      const { data: settings } = await supabase
        .from("loyalty_settings")
        .select("welcome_bonus")
        .eq("business_id", businessId)
        .maybeSingle();
      const bonus = settings?.welcome_bonus || 0;
      const { data, error } = await supabase
        .from("loyalty_members")
        .insert([{
          business_id: businessId,
          name: m.name,
          phone: m.phone,
          email: m.email || null,
          birthday: m.birthday || null,
          points_balance: bonus,
          total_earned: bonus,
        }])
        .select()
        .single();
      if (error) throw error;
      if (bonus > 0) {
        await supabase.from("loyalty_transactions").insert([{
          business_id: businessId,
          member_id: data.id,
          type: "bonus",
          points: bonus,
          note: "Welcome bonus",
        }]);
      }
      return data as LoyaltyMember;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["loyalty-members"] }),
  });
};

export const useDeleteMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("loyalty_members").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["loyalty-members"] }),
  });
};

export const useMemberTransactions = (memberId: string | null) => {
  return useQuery({
    queryKey: ["loyalty-txn", memberId],
    queryFn: async (): Promise<LoyaltyTxn[]> => {
      if (!memberId) return [];
      const { data, error } = await supabase
        .from("loyalty_transactions")
        .select("*")
        .eq("member_id", memberId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as LoyaltyTxn[];
    },
    enabled: !!memberId,
  });
};

export const useAdjustPoints = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { memberId: string; delta: number; note: string }) => {
      const { error } = await supabase.rpc("adjust_loyalty_points", {
        _member_id: p.memberId,
        _delta: p.delta,
        _note: p.note,
      });
      if (error) throw error;
    },
    onSuccess: (_, p) => {
      qc.invalidateQueries({ queryKey: ["loyalty-members"] });
      qc.invalidateQueries({ queryKey: ["loyalty-txn", p.memberId] });
    },
  });
};

export const useLoyaltyVouchers = () => {
  const { businessId } = useAppState();
  return useQuery({
    queryKey: ["loyalty-vouchers", businessId],
    queryFn: async (): Promise<LoyaltyVoucher[]> => {
      if (!businessId) return [];
      const { data, error } = await supabase
        .from("loyalty_vouchers")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as LoyaltyVoucher[];
    },
    enabled: !!businessId,
  });
};

export const useUpsertVoucher = () => {
  const { businessId } = useAppState();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: Partial<LoyaltyVoucher> & { id?: string }) => {
      if (!businessId) throw new Error("No business");
      if (v.id) {
        const { id, ...patch } = v;
        const { error } = await supabase.from("loyalty_vouchers").update(patch).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("loyalty_vouchers").insert([{
          business_id: businessId,
          name: v.name || "Voucher",
          description: v.description || null,
          discount_type: v.discount_type || "fixed",
          discount_value: v.discount_value || 0,
          points_cost: v.points_cost || 0,
          min_purchase: v.min_purchase || 0,
          max_redemptions: v.max_redemptions || null,
          valid_until: v.valid_until || null,
          active: v.active ?? true,
        }]);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["loyalty-vouchers"] }),
  });
};

export const useDeleteVoucher = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("loyalty_vouchers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["loyalty-vouchers"] }),
  });
};

export const useAwardPoints = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { memberId: string; transactionId: string | null; amount: number }) => {
      const { data, error } = await supabase.rpc("award_loyalty_points", {
        _member_id: p.memberId,
        _transaction_id: p.transactionId,
        _amount: p.amount,
      });
      if (error) throw error;
      return data as number;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["loyalty-members"] });
    },
  });
};

export const findMemberByPhone = async (businessId: string, phone: string): Promise<LoyaltyMember | null> => {
  const { data, error } = await supabase
    .from("loyalty_members")
    .select("*")
    .eq("business_id", businessId)
    .eq("phone", phone)
    .maybeSingle();
  if (error) throw error;
  return data as LoyaltyMember | null;
};
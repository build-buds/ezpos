import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAppState } from "@/contexts/AppContext";

export interface KioskSettings {
  id: string;
  business_id: string;
  enabled: boolean;
  welcome_title: string;
  welcome_subtitle: string;
  accent_color: string;
  idle_timeout_seconds: number;
  ask_order_type: boolean;
  ask_loyalty: boolean;
  payment_methods: string[];
  success_message: string;
  terms: string | null;
}

export interface KioskSession {
  id: string;
  business_id: string;
  started_at: string;
  completed_at: string | null;
  transaction_id: string | null;
  order_type: string | null;
  total: number | null;
}

export const useKioskSettings = () => {
  const { businessId } = useAppState();
  return useQuery({
    queryKey: ["kiosk-settings", businessId],
    queryFn: async (): Promise<KioskSettings | null> => {
      if (!businessId) return null;
      const { data, error } = await supabase
        .from("kiosk_settings")
        .select("*")
        .eq("business_id", businessId)
        .maybeSingle();
      if (error) throw error;
      return data as KioskSettings | null;
    },
    enabled: !!businessId,
  });
};

export const useUpsertKioskSettings = () => {
  const { businessId } = useAppState();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<KioskSettings>) => {
      if (!businessId) throw new Error("No business");
      const { data: existing } = await supabase
        .from("kiosk_settings")
        .select("id")
        .eq("business_id", businessId)
        .maybeSingle();
      if (existing) {
        const { error } = await supabase
          .from("kiosk_settings")
          .update(patch)
          .eq("business_id", businessId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("kiosk_settings")
          .insert([{ business_id: businessId, ...patch }]);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["kiosk-settings"] }),
  });
};

export const useKioskSessions = (days = 7) => {
  const { businessId } = useAppState();
  return useQuery({
    queryKey: ["kiosk-sessions", businessId, days],
    queryFn: async (): Promise<KioskSession[]> => {
      if (!businessId) return [];
      const since = new Date(Date.now() - days * 86400000).toISOString();
      const { data, error } = await supabase
        .from("kiosk_sessions")
        .select("*")
        .eq("business_id", businessId)
        .gte("started_at", since)
        .order("started_at", { ascending: false });
      if (error) throw error;
      return (data || []) as KioskSession[];
    },
    enabled: !!businessId,
  });
};

/* ---------- Public (kiosk runtime) ---------- */

export const usePublicKioskSettings = (slug: string | undefined) => {
  return useQuery({
    queryKey: ["public-kiosk", slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data: bizRows, error: e1 } = await supabase
        .rpc("get_public_kiosk_business", { _slug: slug });
      if (e1) throw e1;
      const biz = Array.isArray(bizRows) ? bizRows[0] : bizRows;
      if (!biz) return null;
      const { data: settings, error: e2 } = await supabase
        .from("kiosk_settings")
        .select("*")
        .eq("business_id", biz.id)
        .eq("enabled", true)
        .maybeSingle();
      if (e2) throw e2;
      if (!settings) return null;
      return { business: biz, settings: settings as KioskSettings };
    },
    enabled: !!slug,
  });
};

export const usePublicKioskProducts = (businessId: string | undefined) => {
  return useQuery({
    queryKey: ["public-kiosk-products", businessId],
    queryFn: async () => {
      if (!businessId) return [];
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("business_id", businessId)
        .order("name");
      if (error) throw error;
      return data || [];
    },
    enabled: !!businessId,
  });
};

export const startKioskSession = async (businessId: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from("kiosk_sessions")
    .insert([{ business_id: businessId }])
    .select("id")
    .single();
  if (error) return null;
  return data?.id || null;
};

export const completeKioskSession = async (
  sessionId: string,
  payload: { transaction_id: string; order_type: string; total: number }
) => {
  await supabase
    .from("kiosk_sessions")
    .update({
      completed_at: new Date().toISOString(),
      transaction_id: payload.transaction_id,
      order_type: payload.order_type,
      total: payload.total,
    })
    .eq("id", sessionId);
};

export const createPublicTransaction = async (payload: {
  business_id: string;
  total: number;
  items: unknown[];
  payment_method: string;
  order_type: string;
}) => {
  const { data, error } = await supabase.rpc("create_kiosk_transaction", {
    _business_id: payload.business_id,
    _items: payload.items as never,
    _payment_method: payload.payment_method,
    _order_type: payload.order_type,
  });
  if (error) throw error;
  return data as string;
};

export const findMemberByPhonePublic = async (businessId: string, phone: string) => {
  const { data, error } = await supabase
    .from("loyalty_members")
    .select("id, name, tier, points_balance, phone")
    .eq("business_id", businessId)
    .eq("phone", phone)
    .maybeSingle();
  if (error) return null;
  return data;
};
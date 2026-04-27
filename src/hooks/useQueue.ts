import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAppState } from "@/contexts/AppContext";

export type QueueStatus = "waiting" | "called" | "served" | "skipped" | "cancelled";

export interface QueueSettings {
  id: string;
  business_id: string;
  enabled: boolean;
  welcome_title: string;
  welcome_subtitle: string;
  accent_color: string;
  prefix: string;
  ask_phone: boolean;
  ask_party_size: boolean;
  allow_preorder: boolean;
  avg_serve_minutes: number;
  closed_message: string;
  terms: string | null;
}

export interface QueueTicket {
  id: string;
  business_id: string;
  number: string;
  seq: number;
  name: string;
  phone: string | null;
  party_size: number | null;
  note: string | null;
  status: QueueStatus;
  preorder_transaction_id: string | null;
  called_at: string | null;
  served_at: string | null;
  created_at: string;
  updated_at: string;
}

/* ---------- Owner hooks ---------- */

export const useQueueSettings = () => {
  const { businessId } = useAppState();
  return useQuery({
    queryKey: ["queue-settings", businessId],
    queryFn: async (): Promise<QueueSettings | null> => {
      if (!businessId) return null;
      const { data, error } = await supabase
        .from("queue_settings")
        .select("*")
        .eq("business_id", businessId)
        .maybeSingle();
      if (error) throw error;
      return data as QueueSettings | null;
    },
    enabled: !!businessId,
  });
};

export const useUpsertQueueSettings = () => {
  const { businessId } = useAppState();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<QueueSettings>) => {
      if (!businessId) throw new Error("No business");
      const { data: existing } = await supabase
        .from("queue_settings")
        .select("id")
        .eq("business_id", businessId)
        .maybeSingle();
      if (existing) {
        const { error } = await supabase
          .from("queue_settings")
          .update(patch)
          .eq("business_id", businessId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("queue_settings")
          .insert([{ business_id: businessId, ...patch }]);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["queue-settings"] }),
  });
};

export const useQueueTickets = (range: "active" | "history" = "active") => {
  const { businessId } = useAppState();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["queue-tickets", businessId, range],
    queryFn: async (): Promise<QueueTicket[]> => {
      if (!businessId) return [];
      let q = supabase
        .from("queue_tickets")
        .select("*")
        .eq("business_id", businessId);

      if (range === "active") {
        q = q.in("status", ["waiting", "called"]).order("created_at", { ascending: true });
      } else {
        const since = new Date(Date.now() - 7 * 86400000).toISOString();
        q = q
          .in("status", ["served", "skipped", "cancelled"])
          .gte("created_at", since)
          .order("created_at", { ascending: false });
      }
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as QueueTicket[];
    },
    enabled: !!businessId,
  });

  // Realtime subscription for owner board
  useEffect(() => {
    if (!businessId) return;
    const channel = supabase
      .channel(`queue-tickets-${businessId}-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "queue_tickets", filter: `business_id=eq.${businessId}` },
        () => {
          qc.invalidateQueries({ queryKey: ["queue-tickets", businessId] });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [businessId, qc]);

  return query;
};

export const useUpdateTicketStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: QueueStatus }) => {
      const patch: Partial<QueueTicket> = { status };
      if (status === "called") patch.called_at = new Date().toISOString();
      if (status === "served") patch.served_at = new Date().toISOString();
      const { error } = await supabase.from("queue_tickets").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["queue-tickets"] }),
  });
};

/* ---------- Public ---------- */

export const usePublicQueueSettings = (slug: string | undefined) => {
  return useQuery({
    queryKey: ["public-queue", slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data: bizRows, error: e1 } = await supabase.rpc("get_public_queue_business", { _slug: slug });
      if (e1) throw e1;
      const biz = Array.isArray(bizRows) ? bizRows[0] : bizRows;
      if (!biz) return null;
      const { data: settings, error: e2 } = await supabase
        .from("queue_settings")
        .select("*")
        .eq("business_id", biz.id)
        .eq("enabled", true)
        .maybeSingle();
      if (e2) throw e2;
      if (!settings) return null;
      return { business: biz, settings: settings as QueueSettings };
    },
    enabled: !!slug,
  });
};

export const createPublicQueueTicket = async (payload: {
  business_id: string;
  name: string;
  phone?: string | null;
  party_size?: number | null;
  note?: string | null;
}) => {
  const { data, error } = await supabase.rpc("create_queue_ticket", {
    _business_id: payload.business_id,
    _name: payload.name,
    _phone: payload.phone ?? null,
    _party_size: payload.party_size ?? null,
    _note: payload.note ?? null,
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return row as { id: string; number: string; queue_position: number; eta_minutes: number };
};

export const usePublicTicket = (ticketId: string | null, businessId: string | null) => {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["public-ticket", ticketId],
    queryFn: async (): Promise<{ ticket: QueueTicket; position: number; ahead: number } | null> => {
      if (!ticketId) return null;
      const { data: ticket, error } = await supabase
        .from("queue_tickets")
        .select("*")
        .eq("id", ticketId)
        .maybeSingle();
      if (error) throw error;
      if (!ticket) return null;
      const t = ticket as QueueTicket;
      // Compute position: waiting/called tickets created earlier in same business
      const { count } = await supabase
        .from("queue_tickets")
        .select("id", { count: "exact", head: true })
        .eq("business_id", t.business_id)
        .in("status", ["waiting", "called"])
        .lt("created_at", t.created_at);
      const ahead = count ?? 0;
      return { ticket: t, position: ahead + 1, ahead };
    },
    enabled: !!ticketId,
    refetchInterval: 8000,
  });

  useEffect(() => {
    if (!businessId) return;
    const channel = supabase
      .channel(`public-queue-${businessId}-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "queue_tickets", filter: `business_id=eq.${businessId}` },
        () => qc.invalidateQueries({ queryKey: ["public-ticket", ticketId] })
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [businessId, ticketId, qc]);

  return query;
};

export const cancelPublicTicket = async (ticketId: string) => {
  const { error } = await supabase
    .from("queue_tickets")
    .update({ status: "cancelled" })
    .eq("id", ticketId);
  if (error) throw error;
};
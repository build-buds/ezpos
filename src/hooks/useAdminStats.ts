import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const invoke = async <T,>(query: Record<string, string>): Promise<T> => {
  const params = new URLSearchParams(query).toString();
  const { data, error } = await supabase.functions.invoke(`admin-stats?${params}`, { method: "GET" });
  if (error) throw error;
  return data as T;
};

export interface OverviewData {
  totals: {
    totalUsers: number;
    totalBusinesses: number;
    ownersWithBusiness: number;
    businessesWithProducts: number;
    businessesWithTx: number;
    totalProducts: number;
    totalTransactions: number;
    totalGmv: number;
    conversionSignupToActive: number;
    conversionSignupToBusiness: number;
  };
  funnel: { step: string; value: number }[];
}

export interface TimelinePoint {
  label: string;
  date: string;
  signups: number;
  businesses: number;
  activations: number;
}

export interface BusinessRow {
  id: string;
  name: string;
  email: string;
  category: string;
  created_at: string;
  products: number;
  transactions: number;
  gmv: number;
  last_tx: string | null;
  status: "active" | "dormant" | "inactive";
}

export interface DropoffRow {
  id: string;
  email: string;
  created_at: string;
  days_since: number;
  last_sign_in_at: string | null;
}

export const useAdminOverview = () =>
  useQuery({ queryKey: ["admin-overview"], queryFn: () => invoke<OverviewData>({ type: "overview" }) });

export const useAdminTimeline = (granularity: "day" | "week") =>
  useQuery({
    queryKey: ["admin-timeline", granularity],
    queryFn: () => invoke<{ granularity: string; series: TimelinePoint[] }>({ type: "timeline", granularity }),
  });

export const useAdminBusinesses = (page: number) =>
  useQuery({
    queryKey: ["admin-businesses", page],
    queryFn: () =>
      invoke<{ total: number; page: number; pageSize: number; rows: BusinessRow[] }>({
        type: "businesses",
        page: String(page),
      }),
  });

export const useAdminUsers = () =>
  useQuery({
    queryKey: ["admin-users"],
    queryFn: () =>
      invoke<{ dropoff: DropoffRow[]; admins: { id: string; email: string }[]; totalUsers: number }>({ type: "users" }),
  });

export const useBusinessDetail = (id: string | null) =>
  useQuery({
    queryKey: ["admin-business-detail", id],
    queryFn: () =>
      invoke<{
        business: { id: string; name: string; category: string; created_at: string; owner_email: string; address: string | null; phone: string | null };
        transactions: { id: string; total: number; payment_method: string; order_type: string | null; created_at: string; items: unknown }[];
        products: { id: string; name: string; price: number; stock: number }[];
      }>({ type: "business_detail", id: id! }),
    enabled: !!id,
  });
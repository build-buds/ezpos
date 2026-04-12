import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAppState } from "@/contexts/AppContext";

export interface Subscription {
  id: string;
  plan: string;
  status: string;
  expires_at: string | null;
  polar_subscription_id: string | null;
}

export const useSubscription = () => {
  const { user } = useAppState();

  return useQuery({
    queryKey: ["subscription", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("subscriptions")
        .select("id, plan, status, expires_at, polar_subscription_id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data as Subscription | null;
    },
    enabled: !!user,
  });
};

export const useIsPro = () => {
  const { data: subscription } = useSubscription();
  return subscription?.plan === "pro" && subscription?.status === "active";
};

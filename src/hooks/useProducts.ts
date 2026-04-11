import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAppState } from "@/contexts/AppContext";
import { Product } from "@/types";

export const useProducts = () => {
  const { businessId } = useAppState();

  return useQuery({
    queryKey: ["products", businessId],
    queryFn: async () => {
      if (!businessId) return [];
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description || undefined,
        price: p.price,
        costPrice: p.cost_price || undefined,
        image: p.image_url || undefined,
        category: p.category,
        stock: p.stock,
        minStock: p.min_stock || undefined,
      })) as Product[];
    },
    enabled: !!businessId,
  });
};

export const useAddProduct = () => {
  const { businessId } = useAppState();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: { name: string; price: number; category: string; stock: number; description?: string; image_url?: string; cost_price?: number }) => {
      if (!businessId) throw new Error("No business");
      const { data, error } = await supabase
        .from("products")
        .insert({ ...product, business_id: businessId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products", businessId] }),
  });
};

export const useUpdateProduct = () => {
  const { businessId } = useAppState();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; price?: number; category?: string; stock?: number; description?: string; image_url?: string }) => {
      const { error } = await supabase.from("products").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products", businessId] }),
  });
};

export const useDeleteProduct = () => {
  const { businessId } = useAppState();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products", businessId] }),
  });
};

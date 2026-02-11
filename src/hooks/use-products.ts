import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string;
  age_range: string | null;
  rating: number | null;
  net_weight_g: number | null;
  preparation: string | null;
  is_organic: boolean;
  is_gluten_free: boolean;
  is_new: boolean;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

const fetcher = async (url: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_available", true)
    .order("category")
    .order("name");
  if (error) throw error;
  return data as Product[];
};

export function useProducts(category?: string) {
  const { data, error, mutate } = useSWR<Product[]>("products", fetcher);
  const products = category && data
    ? data.filter((p) => p.category === category)
    : data ?? [];
  return { products, isLoading: !error && !data, error, refetch: mutate };
}

export function useProduct(id: string | null) {
  const { data, error, mutate } = useSWR(
    id ? `product-${id}` : null,
    async () => {
      if (!id) return null;
      const supabase = createClient();
      const { data: product, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return product as Product;
    }
  );
  return {
    product: data ?? null,
    isLoading: id ? !error && !data : false,
    error,
    refetch: mutate,
  };
}

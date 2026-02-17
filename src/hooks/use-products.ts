import useSWR from "swr";
import { getProducts, getProduct } from "@/actions/products";

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: string; // Decimal is string in JS/Drizzle
  imageUrl: string | null;
  category: "age_6_12" | "age_1_2" | "snack" | "drink"; // specific enum types
  ageRange: string | null;
  rating: number | null;
  netWeightG: string | null;
  preparation: string | null;
  isOrganic: boolean | null;
  isGlutenFree: boolean | null;
  isNew: boolean | null;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const fetcher = async () => {
  const data = await getProducts();
  return data as unknown as Product[];
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
      const product = await getProduct(id);
      return product as unknown as Product;
    }
  );
  return {
    product: data ?? null,
    isLoading: id ? !error && !data : false,
    error,
    refetch: mutate,
  };
}

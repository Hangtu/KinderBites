import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";

export interface DeliveryAddress {
  id: string;
  profile_id: string;
  label: string;
  address: string;
  school_name: string | null;
  preferred_time_slot: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

const fetcher = async () => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("delivery_addresses")
    .select("*")
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DeliveryAddress[];
};

export function useDeliveryAddresses() {
  const { data, error, mutate } = useSWR<DeliveryAddress[]>(
    "delivery-addresses",
    fetcher
  );
  return {
    addresses: data ?? [],
    isLoading: !error && !data,
    error,
    refetch: mutate,
  };
}

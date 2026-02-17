import useSWR from "swr";
import { getAddresses } from "@/actions/addresses";

export interface DeliveryAddress {
  id: string;
  profileId: string;
  label: string;
  address: string;
  schoolName: string | null;
  preferredTimeSlot: string | null;
  isDefault: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}

const fetcher = async () => {
  const data = await getAddresses();
  return data as unknown as DeliveryAddress[];
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

import useSWR from "swr";
import { getChildren } from "@/actions/children";

export interface Child {
  id: string;
  parentId: string;
  name: string;
  birthDate: string | null;
  schoolName: string | null;
  grade: string | null;
  allergyIds: string[] | null;
  avoidedFoods: string[] | null;
  specialNotes: string | null;
  profileImageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const fetcher = async () => {
  const data = await getChildren();
  return data as unknown as Child[];
};

export function useChildren() {
  const { data, error, mutate } = useSWR<Child[]>("children", fetcher);
  return {
    children: data ?? [],
    isLoading: !error && !data,
    error,
    refetch: mutate,
  };
}

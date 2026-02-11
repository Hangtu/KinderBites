import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";

export interface Child {
  id: string;
  parent_id: string;
  name: string;
  birth_date: string | null;
  school_name: string | null;
  grade: string | null;
  allergy_ids: string[];
  avoided_foods: string[];
  special_notes: string | null;
  profile_image_url: string | null;
  created_at: string;
  updated_at: string;
}

const fetcher = async () => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("children")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Child[];
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

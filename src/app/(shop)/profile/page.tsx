"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

const fetcher = async () => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  return { user, profile: data };
};

export default function ProfilePage() {
  const router = useRouter();
  const { data, error } = useSWR("profile", fetcher);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (error || !data?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500">Cargando...</p>
      </div>
    );
  }

  const { user, profile } = data;

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-[calc(5rem+env(safe-area-inset-bottom,0px))]">
      <header className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <Link href="/menu" className="text-sm text-primary hover:underline mb-2 inline-block">
          ← Volver
        </Link>
        <h1 className="text-2xl font-bold">Mi Perfil</h1>
      </header>

      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4 p-4 bg-white dark:bg-surface-dark rounded-xl shadow-sm">
          <div className="size-16 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-primary">person</span>
          </div>
          <div>
            <h2 className="font-bold text-lg">
              {profile?.full_name || user.email}
            </h2>
            <p className="text-sm text-slate-500">{user.email}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Link href="/profile/children">
            <div className="p-4 bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <span className="font-medium">Mis niños</span>
              <span className="material-symbols-outlined text-slate-400">chevron_right</span>
            </div>
          </Link>
          <Link href="/profile/addresses">
            <div className="p-4 bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <span className="font-medium">Direcciones de entrega</span>
              <span className="material-symbols-outlined text-slate-400">chevron_right</span>
            </div>
          </Link>
          <Link href="/admin/products">
            <div className="p-4 bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <span className="font-medium">Admin: Productos</span>
              <span className="material-symbols-outlined text-slate-400">chevron_right</span>
            </div>
          </Link>
        </div>

        <Button variant="outline" onClick={handleSignOut} className="w-full">
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}

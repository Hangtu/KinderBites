"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    await signOut(() => router.push("/"));
  };

  if (!isLoaded || !isSignedIn || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

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
          <div className="size-16 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
            {user.imageUrl ? (
              <img src={user.imageUrl} alt={user.fullName || "User"} className="w-full h-full object-cover" />
            ) : (
                <span className="material-symbols-outlined text-3xl text-primary">person</span>
            )}
          </div>
          <div>
            <h2 className="font-bold text-lg">
              {user.fullName || user.primaryEmailAddress?.emailAddress}
            </h2>
            <p className="text-sm text-slate-500">{user.primaryEmailAddress?.emailAddress}</p>
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

        <div className="pt-8 text-center">
          <p className="text-xs text-slate-400 dark:text-slate-600">
            KinderBites v1.0 — MVP
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">
            Desarrollado por <span className="font-medium">Hang Tu Wong Ley Franco</span>
          </p>
        </div>
      </div>
    </div>
  );
}

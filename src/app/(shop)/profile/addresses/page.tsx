"use client";

import Link from "next/link";
import { useDeliveryAddresses } from "@/hooks/use-delivery-addresses";
import { Button } from "@/components/ui/button";

const LABEL_MAP: Record<string, string> = {
  school: "Escuela",
  home: "Casa",
  office: "Oficina",
};

export default function ProfileAddressesPage() {
  const { addresses, isLoading, error } = useDeliveryAddresses();

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-[calc(5rem+env(safe-area-inset-bottom,0px))]">
      <header className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <Link href="/profile" className="text-sm text-primary hover:underline mb-2 inline-block">
          ← Volver al perfil
        </Link>
        <h1 className="text-2xl font-bold">Mis direcciones</h1>
      </header>

      <div className="p-6 space-y-4">
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        )}

        {error && (
          <p className="text-red-500 text-center">Error al cargar</p>
        )}

        {!isLoading && !error && addresses.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-500 mb-4">No tienes direcciones guardadas</p>
            <Button asChild>
              <Link href="/onboarding/address">Agregar dirección</Link>
            </Button>
          </div>
        )}

        {addresses.map((addr) => (
          <div
            key={addr.id}
            className="p-4 bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800"
          >
            <div className="flex items-start gap-4">
              <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary">location_on</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold">{LABEL_MAP[addr.label] || addr.label}</h3>
                <p className="text-sm text-slate-500 break-words">{addr.address}</p>
                {addr.school_name && (
                  <p className="text-sm text-slate-500 mt-1">{addr.school_name}</p>
                )}
                {addr.preferred_time_slot && (
                  <p className="text-xs text-slate-400 mt-1">
                    Horario: {addr.preferred_time_slot}
                  </p>
                )}
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/onboarding/address?edit=${addr.id}`}>Editar</Link>
              </Button>
            </div>
          </div>
        ))}

        {addresses.length > 0 && (
          <Button asChild className="w-full">
            <Link href="/onboarding/address">
              <span className="material-symbols-outlined mr-2">add</span>
              Agregar otra dirección
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

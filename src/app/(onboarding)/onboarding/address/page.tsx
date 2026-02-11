"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOnboardingStore } from "@/store/onboarding-store";

const ADDRESS_LABELS = [
  { id: "school", name: "Escuela", icon: "school" },
  { id: "home", name: "Casa", icon: "home" },
  { id: "office", name: "Oficina", icon: "work" },
] as const;

const DELIVERY_SLOTS = [
  { id: "morning", label: "Antes del almuerzo", sublabel: "Recomendado: 11:30 AM", icon: "wb_sunny" },
  { id: "evening", label: "Para la cena", sublabel: "Recomendado: 5:30 PM", icon: "bedtime" },
];

function OnboardingAddressPageInner() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const isEdit = !!editId;

  const [label, setLabel] = useState<"school" | "home" | "office">("school");
  const [schoolName, setSchoolName] = useState("");
  const [address, setAddress] = useState("");
  const [timeSlot, setTimeSlot] = useState("morning");
  const [loading, setLoading] = useState(false);
  const [loadingAddr, setLoadingAddr] = useState(!!editId);
  const router = useRouter();
  const supabase = createClient();
  const { address: storedAddress, setAddress: setStoredAddress } = useOnboardingStore();

  useEffect(() => {
    if (editId) {
      (async () => {
        const { data, error } = await supabase
          .from("delivery_addresses")
          .select("*")
          .eq("id", editId)
          .single();
        setLoadingAddr(false);
        if (error || !data) return;
        setLabel(data.label as "school" | "home" | "office");
        setSchoolName(data.school_name ?? "");
        setAddress(data.address ?? "");
        const slot = data.preferred_time_slot === "17:30" ? "evening" : "morning";
        setTimeSlot(slot);
      })();
    } else if (storedAddress) {
      // Prefill desde el store en modo invitado
      setLabel(storedAddress.label);
      setSchoolName(storedAddress.schoolName);
      setAddress(storedAddress.address);
      setTimeSlot(storedAddress.timeSlot);
      setLoadingAddr(false);
    } else {
      setLoadingAddr(false);
    }
  }, [editId, storedAddress, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const preferredSlot = timeSlot === "morning" ? "11:30" : "17:30";

    if (isEdit && editId) {
      // Edición siempre requiere usuario
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login?redirect=/profile/addresses");
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from("delivery_addresses")
        .update({
          label,
          address,
          school_name: label === "school" ? schoolName : null,
          preferred_time_slot: preferredSlot,
        })
        .eq("id", editId);

      setLoading(false);
      if (error) {
        console.error(error);
        return;
      }
      router.push("/profile/addresses");
      router.refresh();
      return;
    }

    // Modo invitado: guardar solo en el store y seguir flujo
    setAddress(address);
    setLabel(label);
    setSchoolName(schoolName);
    setTimeSlot(timeSlot as "morning" | "evening");

    setLoading(false);
    router.push("/menu");
  };

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-background-dark">
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-6 pt-12 pb-4 flex items-center border-b border-primary/10">
        <Link href={isEdit ? "/profile/addresses" : "/onboarding/child"}>
          <Button variant="ghost" size="icon" className="rounded-full bg-primary/10 text-primary">
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
          </Button>
        </Link>
        <h1 className="ml-4 text-xl font-bold tracking-tight">
          {isEdit ? "Editar dirección" : "Dirección y Horarios"}
        </h1>
      </header>

      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }} className="flex-grow p-6 space-y-8">
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-primary/80">
            Etiquetar como
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {ADDRESS_LABELS.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setLabel(l.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold shrink-0 transition-all ${
                  label === l.id
                    ? "bg-primary text-white shadow-md"
                    : "bg-primary/10 text-primary border border-primary/20"
                }`}
              >
                <span className="material-symbols-outlined text-lg">{l.icon}</span>
                <span className="text-sm">{l.name}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          {label === "school" && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 ml-1">
                Nombre de la Escuela/Guardería
              </label>
              <div className="relative">
                <Input
                  placeholder="Ej: Guardería Mis Primeros Pasos"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="h-14 pl-4 pr-12 bg-slate-50 dark:bg-slate-900"
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-primary/60">
                  business
                </span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 ml-1">
              Dirección de envío
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary">
                location_on
              </span>
              <Input
                placeholder="Buscar dirección..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="h-14 pl-12 pr-4 bg-slate-50 dark:bg-slate-900"
              />
            </div>
            <div className="mt-3 h-32 w-full rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-slate-400">
                map
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 ml-1">
              Horario de entrega preferido
            </label>
            <div className="grid grid-cols-1 gap-3">
              {DELIVERY_SLOTS.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setTimeSlot(slot.id)}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${
                    timeSlot === slot.id
                      ? "border-primary bg-primary/5"
                      : "border-slate-100 dark:border-slate-800 bg-transparent opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                        timeSlot === slot.id
                          ? "bg-primary/20 text-primary"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                      }`}
                    >
                      <span className="material-symbols-outlined">{slot.icon}</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white">
                        {slot.label}
                      </p>
                      <p className="text-xs text-slate-500">{slot.sublabel}</p>
                    </div>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      timeSlot === slot.id ? "bg-primary" : "border-2 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {timeSlot === slot.id && (
                      <span className="material-symbols-outlined text-white text-xs">
                        check
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <footer className="p-6 bg-white dark:bg-background-dark border-t border-slate-100 dark:border-slate-900">
          <Button
            type="submit"
            disabled={loading || loadingAddr || !address}
            className="w-full h-16 text-lg"
          >
          <span>{loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Guardar preferencias"}</span>
          <span className="material-symbols-outlined ml-2">task_alt</span>
        </Button>
          <p className="text-center text-slate-400 text-xs mt-4 px-8 leading-relaxed">
            Tus preferencias se guardarán para futuros pedidos. Puedes cambiarlas
            en cualquier momento.
          </p>
        </footer>
      </form>
    </div>
  );
}

export default function OnboardingAddressPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <OnboardingAddressPageInner />
    </Suspense>
  );
}

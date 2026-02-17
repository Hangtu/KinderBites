"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useOnboardingStore } from "@/store/onboarding-store";
import { getSchools } from "@/actions/schools";
import { getAddress, updateAddress, createAddress } from "@/actions/addresses";
import { createChild } from "@/actions/children";

const DELIVERY_SLOTS = [
  { id: "morning", label: "Antes del almuerzo", sublabel: "Recomendado: 11:30 AM", icon: "wb_sunny" },
  { id: "evening", label: "Para la cena", sublabel: "Recomendado: 5:30 PM", icon: "bedtime" },
];

type School = { id: string; name: string; address: string };

function OnboardingAddressPageInner() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const isEdit = !!editId;

  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("");
  const [schoolName, setSchoolName] = useState("");
  const [address, setAddress] = useState("");
  const [timeSlot, setTimeSlot] = useState("morning");
  const [loading, setLoading] = useState(false);
  const [loadingAddr, setLoadingAddr] = useState(!!editId);
  const router = useRouter();
  const { user } = useUser();
  const { child: storedChild, address: storedAddress, setAddress: setStoredAddress } = useOnboardingStore();

  useEffect(() => {
    getSchools().then((data) => setSchools(data));
  }, []);

  useEffect(() => {
    if (schools.length > 0 && storedAddress?.schoolName && !selectedSchoolId) {
      const match = schools.find(
        (s) => s.name === storedAddress.schoolName || s.address === storedAddress.address
      );
      if (match) setSelectedSchoolId(match.id);
    }
  }, [schools, storedAddress, selectedSchoolId]);

  useEffect(() => {
    if (editId) {
      (async () => {
        try {
          const data = await getAddress(editId);
          setLoadingAddr(false);
          if (!data) return;
          setSchoolName(data.schoolName ?? "");
          setAddress(data.address ?? "");
          if (data.schoolId) setSelectedSchoolId(data.schoolId);
          const slot = data.preferredTimeSlot === "17:30" ? "evening" : "morning";
          setTimeSlot(slot);
        } catch (err) {
          console.error(err);
          setLoadingAddr(false);
        }
      })();
    } else if (storedAddress) {
      setSchoolName(storedAddress.schoolName);
      setAddress(storedAddress.address);
      setTimeSlot(storedAddress.timeSlot);
      setLoadingAddr(false);
    } else {
      setLoadingAddr(false);
    }
  }, [editId, storedAddress]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const preferredSlot = timeSlot === "morning" ? "11:30" : "17:30";

    if (isEdit && editId) {
      if (!user) {
        router.push("/login?redirect=/profile/addresses");
        setLoading(false);
        return;
      }

      try {
        await updateAddress(editId, {
          label: "school",
          address,
          schoolId: selectedSchoolId || null,
          schoolName: schoolName || null,
          preferredTimeSlot: preferredSlot,
        });

        router.push("/profile/addresses");
        router.refresh();
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Guardar en el store
    const addressData = {
      label: "school" as const,
      schoolName,
      address,
      timeSlot: timeSlot as "morning" | "evening",
    };
    setStoredAddress(addressData);

    // Si el usuario está logueado, persistir niño + dirección en DB antes de ir al menú
    if (user && storedChild) {
      try {
        await createChild({
          name: storedChild.name,
          birthDate: storedChild.birthDate || null,
          schoolName: storedChild.schoolName ?? "",
          grade: storedChild.grade ?? "",
          allergyIds: storedChild.allergyIds ?? [],
          avoidedFoods: storedChild.avoidedFoods ?? [],
          specialNotes: storedChild.specialNotes ?? null,
        });

        await createAddress({
          label: "school",
          address,
          schoolId: selectedSchoolId || null,
          schoolName: schoolName || null,
          preferredTimeSlot: preferredSlot,
          isDefault: true,
        });
      } catch (err: any) {
        console.error("Error al persistir datos:", err);
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    router.push("/menu");
    router.refresh();
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
        <section className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 ml-1">
              Escuela (donde tenemos disponibilidad)
            </label>
              <div className="relative">
                <select
                  value={selectedSchoolId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedSchoolId(id);
                    const school = schools.find((s) => s.id === id);
                    if (school) {
                      setSchoolName(school.name);
                      setAddress(school.address);
                    }
                  }}
                  required
                  className="flex h-14 w-full rounded-2xl border border-gray-100 dark:border-gray-800 bg-slate-50 dark:bg-slate-900 px-4 pr-12 text-sm font-medium text-slate-800 dark:text-white focus:border-primary focus:outline-none focus:ring-0"
                >
                  <option value="">Selecciona una escuela</option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-primary/60">
                  school
                </span>
              </div>
            {selectedSchoolId && (
              <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <span className="material-symbols-outlined text-base">location_on</span>
                {address}
              </p>
            )}
          </div>

          <div className="mt-3 h-32 w-full rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-slate-400">
              map
            </span>
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
            disabled={loading || loadingAddr || !selectedSchoolId}
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

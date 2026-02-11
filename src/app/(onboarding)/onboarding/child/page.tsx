"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { insertChildSchema } from "@/schemas";
import { useOnboardingStore } from "@/store/onboarding-store";

const childFormSchema = insertChildSchema;

type ChildFormData = z.infer<typeof childFormSchema>;

const ALLERGIES = [
  { id: "gluten", name: "Gluten", icon: "grain" },
  { id: "dairy", name: "Lácteos", icon: "water_drop" },
  { id: "egg", name: "Huevo", icon: "egg" },
  { id: "peanut", name: "Maní", icon: "eco" },
  { id: "fish", name: "Pescado", icon: "set_meal" },
  { id: "soy", name: "Soja", icon: "category" },
];

function OnboardingChildPageInner() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const isEdit = !!editId;

  const [avoidedFoods, setAvoidedFoods] = useState<string[]>(["Brócoli", "Remolacha"]);
  const [newFood, setNewFood] = useState("");
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(["dairy"]);
  const [loading, setLoading] = useState(false);
  const [loadingChild, setLoadingChild] = useState(!!editId);
  const router = useRouter();
  const supabase = createClient();
  const { child, setChild } = useOnboardingStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<ChildFormData>({
    resolver: zodResolver(childFormSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      name: child?.name ?? "",
      birthDate: child?.birthDate ?? "",
      schoolName: child?.schoolName ?? "",
      grade: child?.grade ?? "",
      allergyIds: child?.allergyIds ?? ["dairy"],
      avoidedFoods: child?.avoidedFoods ?? ["Brócoli", "Remolacha"],
    },
  });

  useEffect(() => {
    if (!editId) return;
    (async () => {
      const { data, error } = await supabase
        .from("children")
        .select("*")
        .eq("id", editId)
        .single();
      setLoadingChild(false);
      if (error || !data) return;
      reset({
        name: data.name,
        birthDate: data.birth_date ?? "",
        schoolName: data.school_name ?? "",
        grade: data.grade ?? "",
      });
      setSelectedAllergies(data.allergy_ids ?? []);
      setAvoidedFoods(data.avoided_foods ?? []);
    })();
  }, [editId, reset, supabase]);

  const toggleAllergy = (id: string) => {
    setSelectedAllergies((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const removeAvoidedFood = (food: string) => {
    setAvoidedFoods((prev) => prev.filter((f) => f !== food));
  };

  const addAvoidedFood = () => {
    if (newFood.trim()) {
      setAvoidedFoods((prev) => [...prev, newFood.trim()]);
      setNewFood("");
    }
  };

  const onSubmit = async (data: ChildFormData) => {
    setLoading(true);

    // Modo edición: siempre requiere usuario (datos ya persistidos)
    if (isEdit && editId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login?redirect=/profile/children");
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from("children")
        .update({
          name: data.name,
          birth_date: data.birthDate || null,
          school_name: data.schoolName ?? "",
          grade: data.grade ?? "",
          allergy_ids: selectedAllergies,
          avoided_foods: avoidedFoods,
          special_notes: data.specialNotes ?? null,
        })
        .eq("id", editId);

      setLoading(false);
      if (error) {
        console.error(error);
        return;
      }
      router.push("/profile/children");
      router.refresh();
      return;
    }

    // Modo invitado: solo guardamos en el store y seguimos el onboarding
    setChild({
      name: data.name,
      birthDate: data.birthDate,
      schoolName: data.schoolName ?? "",
      grade: data.grade ?? "",
      allergyIds: selectedAllergies,
      avoidedFoods,
      specialNotes: data.specialNotes ?? null,
    });

    setLoading(false);
    router.push("/onboarding/address");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background-light dark:bg-background-dark">
      <header className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-6 pt-12 pb-6">
        <div className="flex items-center mb-6">
          <Link href={isEdit ? "/profile/children" : "/onboarding/welcome"}>
            <Button variant="ghost" size="icon">
              <span className="material-symbols-outlined">chevron_left</span>
            </Button>
          </Link>
          <div className="flex-1 text-center pr-10">
            <h1 className="text-lg font-bold">{isEdit ? "Editar niño" : "Perfil del Niño"}</h1>
          </div>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
          <div className="bg-primary h-full w-2/3 transition-all duration-500" />
        </div>
      </header>

      <main className="flex-1 px-6 pb-32 space-y-8 overflow-y-auto">
        <section>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            ¡Hola, mamá!
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Cuéntanos sobre tu pequeño para personalizar su menú saludable.
          </p>
        </section>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <section className="space-y-4">
            <label className="text-sm font-semibold ml-1 text-slate-600 dark:text-slate-400">
              Nombre del pequeño
            </label>
            <Input
              placeholder="Ej. Mateo"
              {...register("name")}
              className="bg-white dark:bg-slate-800"
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}

            <label className="text-sm font-semibold ml-1 text-slate-600 dark:text-slate-400">
              Fecha de nacimiento
            </label>
            <Input
              type="date"
              {...register("birthDate")}
              className="bg-white dark:bg-slate-800"
            />
            {errors.birthDate && (
              <p className="text-red-500 text-sm">{errors.birthDate.message}</p>
            )}
          </section>

          <section className="space-y-4">
            <div className="flex justify-between items-end">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Alergias comunes
              </h3>
              <span className="text-xs text-primary font-bold bg-primary/10 px-2 py-1 rounded">
                Opcional
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {ALLERGIES.map((allergy) => (
                <button
                  key={allergy.id}
                  type="button"
                  onClick={() => toggleAllergy(allergy.id)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all active:scale-95 ${
                    selectedAllergies.includes(allergy.id)
                      ? "bg-primary/10 dark:bg-primary/20 border-primary"
                      : "bg-white dark:bg-slate-800 border-transparent"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      selectedAllergies.includes(allergy.id)
                        ? "bg-primary"
                        : "bg-primary/10"
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined ${
                        selectedAllergies.includes(allergy.id)
                          ? "text-white"
                          : "text-primary"
                      }`}
                    >
                      {allergy.icon}
                    </span>
                  </div>
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider ${
                      selectedAllergies.includes(allergy.id)
                        ? "text-primary"
                        : ""
                    }`}
                  >
                    {allergy.name}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Alimentos evitados
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                ¿Alguna verdura o fruta que no le guste?
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
              <div className="flex flex-wrap gap-2 mb-3">
                {avoidedFoods.map((food) => (
                  <span
                    key={food}
                    className="bg-primary/20 dark:bg-primary/30 text-slate-900 dark:text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm font-medium"
                  >
                    {food}
                    <button
                      type="button"
                      onClick={() => removeAvoidedFood(food)}
                      className="opacity-60 hover:opacity-100"
                    >
                      <span className="material-symbols-outlined text-sm">
                        cancel
                      </span>
                    </button>
                  </span>
                ))}
              </div>
              <div className="relative flex gap-2">
                <Input
                  placeholder="Agregar alimento..."
                  value={newFood}
                  onChange={(e) => setNewFood(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAvoidedFood())}
                  className="border-b border-slate-100 dark:border-slate-700 rounded-none bg-transparent"
                />
                <Button
                  type="button"
                  size="icon"
                  onClick={addAvoidedFood}
                  className="shrink-0"
                >
                  <span className="material-symbols-outlined">add</span>
                </Button>
              </div>
            </div>
          </section>

          <section className="bg-primary/10 dark:bg-primary/5 p-4 rounded-xl border border-primary/20 flex gap-4">
            <div className="text-2xl">💡</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic">
              Utilizamos esta información para filtrar recetas y planes de comida
              que se ajusten perfectamente a las necesidades de tu bebé.
            </p>
          </section>

          {!isEdit && (
            <p className="text-center text-xs text-slate-400">
              ¿Probando la app?{" "}
              <button
                type="button"
                onClick={async () => {
                  const res = await fetch("/api/seed-demo", { method: "POST" });
                  if (res.ok) {
                    router.push("/menu");
                    router.refresh();
                  }
                }}
                className="text-primary hover:underline font-medium"
              >
                Cargar datos demo
              </button>
            </p>
          )}

          <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-6 bg-gradient-to-t from-background-light dark:from-background-dark via-background-light/95 dark:via-background-dark/95 to-transparent z-20">
            <Button
              type="submit"
              className="w-full"
              disabled={loading || loadingChild || !isValid}
            >
              {loading ? "Guardando..." : isEdit ? "GUARDAR CAMBIOS" : "GUARDAR Y CONTINUAR"}
              {!loading && (
                <span className="material-symbols-outlined ml-2">
                  {isEdit ? "check" : "arrow_forward"}
                </span>
              )}
            </Button>
          </footer>
        </form>
      </main>
    </div>
  );
}

export default function OnboardingChildPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <OnboardingChildPageInner />
    </Suspense>
  );
}

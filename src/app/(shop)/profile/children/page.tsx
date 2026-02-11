"use client";

import Link from "next/link";
import { useChildren } from "@/hooks/use-children";
import { Button } from "@/components/ui/button";

const ALLERGY_LABELS: Record<string, string> = {
  gluten: "Gluten",
  dairy: "Lácteos",
  egg: "Huevo",
  peanut: "Maní",
  fish: "Pescado",
  soy: "Soja",
};

export default function ProfileChildrenPage() {
  const { children, isLoading, error } = useChildren();

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-[calc(5rem+env(safe-area-inset-bottom,0px))]">
      <header className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <Link href="/profile" className="text-sm text-primary hover:underline mb-2 inline-block">
          ← Volver al perfil
        </Link>
        <h1 className="text-2xl font-bold">Mis niños</h1>
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

        {!isLoading && !error && children.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-500 mb-4">No tienes niños registrados</p>
            <Button asChild>
              <Link href="/onboarding/child">Agregar niño</Link>
            </Button>
          </div>
        )}

        {children.map((child) => (
          <div
            key={child.id}
            className="p-4 bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800"
          >
            <div className="flex items-start gap-4">
              <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary">child_care</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg">{child.name}</h3>
                {child.grade && (
                  <p className="text-sm text-slate-500">{child.grade}</p>
                )}
                {child.school_name && (
                  <p className="text-sm text-slate-500">{child.school_name}</p>
                )}
                {child.allergy_ids && child.allergy_ids.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {child.allergy_ids.map((aid) => (
                      <span
                        key={aid}
                        className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200"
                      >
                        {ALLERGY_LABELS[aid] || aid}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/onboarding/child?edit=${child.id}`}>Editar</Link>
              </Button>
            </div>
          </div>
        ))}

        {children.length > 0 && (
          <Button asChild className="w-full">
            <Link href="/onboarding/child">
              <span className="material-symbols-outlined mr-2">add</span>
              Agregar otro niño
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

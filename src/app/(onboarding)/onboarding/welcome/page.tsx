"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function OnboardingWelcomePage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden">
      {/* Top-right actions */}
      <div className="absolute top-0 left-0 z-20 flex w-full items-center justify-end p-6 pt-12">
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button
              variant="ghost"
              className="backdrop-blur-md bg-white/30 dark:bg-black/30 rounded-full px-4 py-1.5 text-sm font-bold"
            >
              Iniciar sesión
            </Button>
          </Link>
          <Link href="/menu">
          <Button
            variant="ghost"
            className="backdrop-blur-md bg-white/30 dark:bg-black/30 rounded-full px-4 py-1.5 text-sm font-bold"
          >
            Saltar
          </Button>
          </Link>
        </div>
      </div>

      {/* Hero Image Section */}
      <div className="relative h-[55vh] w-full shrink-0">
        <div
          className="w-full h-full bg-center bg-no-repeat bg-cover rounded-b-[2.5rem] relative overflow-hidden"
          style={{
            backgroundImage: `url("https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80")`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        </div>
        <div className="absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-peach/30 blur-3xl z-0" />
        <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-primary/10 blur-3xl z-0" />
      </div>

      {/* Content Body */}
      <div className="flex flex-1 flex-col items-center justify-between px-6 pt-10 pb-8 relative z-10">
        <div className="flex flex-col items-center space-y-4 text-center">
          <h1 className="text-[#0d1b0d] dark:text-white tracking-tight text-[32px] font-extrabold leading-[1.15]">
            Nutrición real para <br /> tu pequeño
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-normal leading-relaxed max-w-[280px]">
            Comidas saludables listas en minutos
          </p>
        </div>

        <div className="w-full flex flex-col items-center gap-8">
          {/* Page Indicators */}
          <div className="flex flex-row items-center justify-center gap-3">
            <div className="h-2.5 w-8 rounded-full bg-primary shadow-sm" />
            <div className="h-2.5 w-2.5 rounded-full bg-peach dark:bg-slate-700" />
            <div className="h-2.5 w-2.5 rounded-full bg-peach dark:bg-slate-700" />
          </div>

          <Button asChild className="w-full">
            <Link href="/onboarding/child" className="flex items-center justify-center gap-2">
              <span>Siguiente</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="h-2 w-full bg-transparent" />
    </div>
  );
}

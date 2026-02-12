"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const isLocalEnv = process.env.NEXT_PUBLIC_ENV === "local";
const devEmail = process.env.NEXT_PUBLIC_DEV_EMAIL;

const devPassword = process.env.NEXT_PUBLIC_DEV_PASSWORD;

export const dynamic = "force-dynamic";


function DevAutoLoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/";
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLocalEnv || !devEmail || !devPassword) {
      setError(
        "Dev auto-login requiere NEXT_PUBLIC_ENV=local, NEXT_PUBLIC_DEV_EMAIL y NEXT_PUBLIC_DEV_PASSWORD en .env.local"
      );
      return;
    }

    const supabase = createClient();

    supabase.auth.signInWithPassword({ email: devEmail, password: devPassword }).then(
      ({ data, error: signInError }) => {
        if (signInError) {
          setError(`Error al iniciar sesión: ${signInError.message}`);
          return;
        }
        if (data.session) {
          router.push(redirectTo);
          router.refresh();
        }
      }
    );
  }, [router, redirectTo]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <p className="text-center text-red-600">{error}</p>
        <a href="/login" className="text-primary underline">
          Ir a login manual
        </a>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <p className="text-muted-foreground">Iniciando sesión automática...</p>
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

import { Suspense } from "react";

export default function DevAutoLoginPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <DevAutoLoginPageContent />
    </Suspense>
  );
}

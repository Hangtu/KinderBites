"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/auth/callback?message=check-email");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background-light px-6 dark:bg-background-dark">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-text-main-light dark:text-text-main-dark">
            Lonchi
          </h1>
          <p className="mt-2 text-sm text-text-sec-light dark:text-text-sec-dark">
            Inicia sesión para continuar
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleLogin}>
          <Input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <div className="flex gap-3">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Cargando..." : "Iniciar sesión"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={loading}
              onClick={handleSignUp}
            >
              Registrarse
            </Button>
          </div>
        </form>

        <p className="text-center text-sm text-text-sec-light dark:text-text-sec-dark">
          <Link href="/" className="text-primary hover:underline">
            Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  );
}

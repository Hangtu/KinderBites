"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const PUBLIC_PATHS = ["/", "/login", "/dev-auto-login", "/auth", "/api"];
const ONBOARDING_PREFIX = "/onboarding";

function isProtectedPath(path: string) {
  if (PUBLIC_PATHS.some((p) => path === p || path.startsWith(p + "/"))) return false;
  if (path.startsWith(ONBOARDING_PREFIX)) return false;
  return true;
}

export function AuthSessionHandler() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" && !session && isProtectedPath(pathname)) {
        const loginPath =
          process.env.NEXT_PUBLIC_ENV === "local" ? "/dev-auto-login" : "/login";
        router.push(`${loginPath}?redirect=${encodeURIComponent(pathname)}`);
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  return null;
}

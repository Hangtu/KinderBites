import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginPath =
      process.env.NEXT_PUBLIC_ENV === "local" ? "/dev-auto-login" : "/login";
    redirect(`${loginPath}?redirect=/admin/products`);
  }

  return <>{children}</>;
}

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Footer } from "@/components/footer";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/menu");
  }

  const [{ count: childrenCount }, { count: addressesCount }] = await Promise.all([
    supabase.from("children").select("id", { count: "exact", head: true }).eq("parent_id", user.id),
    supabase.from("delivery_addresses").select("id", { count: "exact", head: true }).eq("profile_id", user.id),
  ]);

  if ((childrenCount ?? 0) === 0) {
    redirect("/onboarding/child");
  }
  if ((addressesCount ?? 0) === 0) {
    redirect("/onboarding/address");
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

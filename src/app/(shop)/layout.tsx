import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Footer } from "@/components/footer";
import { getProfileCounts } from "@/actions/profile";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login?redirect=/menu");
  }

  const { childrenCount, addressesCount } = await getProfileCounts();


  if (childrenCount === 0) {
    redirect("/onboarding/child");
  }
  if (addressesCount === 0) {
    redirect("/onboarding/address");
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

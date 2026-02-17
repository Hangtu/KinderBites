import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Footer } from "@/components/footer";
import { db } from "@/lib/db";
import { children as childrenTable, deliveryAddresses } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login?redirect=/menu");
  }

  const [childrenCountResult, addressesCountResult] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(childrenTable)
      .where(eq(childrenTable.parentId, userId)),
    db
      .select({ count: sql<number>`count(*)` })
      .from(deliveryAddresses)
      .where(eq(deliveryAddresses.profileId, userId)),
  ]);

  const childrenCount = Number(childrenCountResult[0]?.count ?? 0);
  const addressesCount = Number(addressesCountResult[0]?.count ?? 0);

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

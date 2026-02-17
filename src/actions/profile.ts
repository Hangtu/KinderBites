"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { children as childrenTable, deliveryAddresses } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function getProfileCounts() {
    const { userId } = await auth();
    if (!userId) return { childrenCount: 0, addressesCount: 0 };

    const [childrenResult, addressesResult] = await Promise.all([
        db
            .select({ count: sql<number>`count(*)` })
            .from(childrenTable)
            .where(eq(childrenTable.parentId, userId)),
        db
            .select({ count: sql<number>`count(*)` })
            .from(deliveryAddresses)
            .where(eq(deliveryAddresses.profileId, userId)),
    ]);

    return {
        childrenCount: Number(childrenResult[0]?.count ?? 0),
        addressesCount: Number(addressesResult[0]?.count ?? 0),
    };
}

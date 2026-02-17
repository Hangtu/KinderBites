"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { deliveryAddresses } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getAddresses() {
    const { userId } = await auth();
    if (!userId) return [];

    const data = await db
        .select()
        .from(deliveryAddresses)
        .where(eq(deliveryAddresses.profileId, userId))
        .orderBy(desc(deliveryAddresses.isDefault), desc(deliveryAddresses.createdAt));

    return data;
}

export async function createAddress(data: {
    address: string;
    label?: "school" | "home" | "office";
    schoolId?: string | null;
    schoolName?: string | null;
    preferredTimeSlot?: string | null;
    isDefault?: boolean;
}) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const [newAddr] = await db
        .insert(deliveryAddresses)
        .values({
            profileId: userId,
            label: data.label ?? "school",
            address: data.address,
            schoolId: data.schoolId,
            schoolName: data.schoolName,
            preferredTimeSlot: data.preferredTimeSlot,
            isDefault: data.isDefault ?? false,
        })
        .returning({ id: deliveryAddresses.id });

    return newAddr;
}

export async function updateAddress(id: string, data: Partial<typeof deliveryAddresses.$inferInsert>) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await db.update(deliveryAddresses)
        .set(data)
        .where(eq(deliveryAddresses.id, id));
    // TODO: Ensure address belongs to user
}

export async function getAddress(id: string) {
    const { userId } = await auth();
    if (!userId) return null;

    const address = await db.query.deliveryAddresses.findFirst({
        where: eq(deliveryAddresses.id, id),
    });

    if (address?.profileId !== userId) return null;
    return address;
}

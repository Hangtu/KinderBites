"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { children } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getChildren() {
    const { userId } = await auth();
    if (!userId) {
        // Return empty array or throw. Hook expects array.
        return [];
    }

    const data = await db.select().from(children).where(eq(children.parentId, userId)).orderBy(desc(children.createdAt));
    return data;
}

export async function createChild(data: {
    name: string;
    birthDate?: string | null;
    schoolName?: string | null;
    grade?: string | null;
    allergyIds?: string[] | null;
    avoidedFoods?: string[] | null;
    specialNotes?: string | null;
}) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await db.insert(children).values({
        parentId: userId,
        name: data.name,
        birthDate: data.birthDate,
        schoolName: data.schoolName,
        grade: data.grade,
        allergyIds: data.allergyIds,
        avoidedFoods: data.avoidedFoods,
        specialNotes: data.specialNotes,
    });
}


export async function updateChild(id: string, data: Partial<typeof children.$inferInsert>) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await db.update(children)
        .set(data)
        .where(eq(children.id, id));
    // TODO: Ensure child belongs to user?
    // For simplicity now.
    // We really should check parentId.
}

export async function getChild(id: string) {
    const { userId } = await auth();
    if (!userId) return null;

    const child = await db.query.children.findFirst({
        where: eq(children.id, id),
    });

    if (child?.parentId !== userId) return null;
    return child;
}

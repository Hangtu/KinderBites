"use server";

import { db } from "@/lib/db";
import { schools } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function getSchools() {
    const data = await db
        .select({
            id: schools.id,
            name: schools.name,
            address: schools.address,
        })
        .from(schools)
        .where(eq(schools.isAvailable, true))
        .orderBy(asc(schools.name));

    return data;
}

"use server";

import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function getProducts(category?: string) {
    let query = db
        .select()
        .from(products)
        .where(eq(products.isAvailable, true))
        .orderBy(asc(products.category), asc(products.name))
        .$dynamic();

    if (category) {
        query = query.where(eq(products.category, category as any));
    }

    const data = await query;
    return data;
}

export async function getProduct(id: string) {
    const data = await db
        .select()
        .from(products)
        .where(eq(products.id, id))
        .limit(1);

    return data[0] || null;
}

export async function getAdminProducts() {
    const data = await db
        .select()
        .from(products)
        .orderBy(asc(products.createdAt));
    return data;
}

export async function createProduct(data: typeof products.$inferInsert) {
    const [newProduct] = await db.insert(products).values(data).returning();
    return newProduct;
}

export async function updateProduct(id: string, data: Partial<typeof products.$inferInsert>) {
    const [updatedProduct] = await db
        .update(products)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(products.id, id))
        .returning();
    return updatedProduct;
}



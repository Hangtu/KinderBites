"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

interface CreateOrderData {
    deliveryAddressId: string;
    deliveryDate: string;
    deliveryTimeSlot: string;
    subtotal: number;
    shipping: number;
    subscriptionDiscount: number;
    totalAmount: number;
    isSubscription: boolean;
    items: {
        productId: string;
        childId: string;
        quantity: number;
        unitPrice: number; // or string if coming from frontend, but simpler to use number here
        specificNotes?: string | null;
    }[];
}

export async function createOrder(data: CreateOrderData) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // 1. Create Order
    const [newOrder] = await db
        .insert(orders)
        .values({
            parentId: userId,
            deliveryAddressId: data.deliveryAddressId,
            deliveryDate: data.deliveryDate,
            deliveryTimeSlot: data.deliveryTimeSlot,
            subtotal: data.subtotal.toString(),
            shipping: data.shipping.toString(),
            subscriptionDiscount: data.subscriptionDiscount.toString(),
            totalAmount: data.totalAmount.toString(),
            isSubscription: data.isSubscription,
            status: "pending",
        })
        .returning({ id: orders.id });

    if (!newOrder) throw new Error("Failed to create order");

    // 2. Create Order Items
    if (data.items.length > 0) {
        await db.insert(orderItems).values(
            data.items.map((item) => ({
                orderId: newOrder.id,
                productId: item.productId,
                childId: item.childId,
                quantity: item.quantity,
                unitPrice: item.unitPrice.toString(),
                specificNotes: item.specificNotes,
            }))
        );
    }

}

export async function getOrders() {

    const { userId } = await auth();
    if (!userId) return [];

    const data = await db.query.orders.findMany({
        where: eq(orders.parentId, userId),
        orderBy: desc(orders.createdAt),
        with: {
            orderItems: {
                with: {
                    product: true,
                }
            }
        }
    });

    return data;
}

export async function getOrder(id: string) {
    const { userId } = await auth();
    if (!userId) return null;

    const order = await db.query.orders.findFirst({
        where: eq(orders.id, id),
        with: {
            orderItems: {
                with: {
                    product: true,
                    child: true,
                }
            },
            deliveryAddress: true,
        }
    });

    if (order?.parentId !== userId) return null;

    return order;
}

export async function cancelOrder(id: string) {

    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const [order] = await db.select().from(orders).where(eq(orders.id, id));

    if (!order || order.parentId !== userId) throw new Error("Order not found");
    if (order.status !== "pending") throw new Error("Order cannot be cancelled");

    await db.update(orders).set({ status: "cancelled" }).where(eq(orders.id, id));
    return true;
}



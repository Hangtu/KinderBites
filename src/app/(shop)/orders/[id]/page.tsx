"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { getOrder, cancelOrder } from "@/actions/orders";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  paid: "Pagado",
  preparing: "Preparando",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [cancelling, setCancelling] = useState(false);
  const { data: order, error, mutate } = useSWR(
    id ? `order-${id}` : null,
    async () => {
      if (!id) return null;
      const data = await getOrder(id);
      return data;
    }
  );

  const handleCancel = async () => {
    if (!order || order.status !== "pending" || !confirm("¿Cancelar este pedido?")) return;
    setCancelling(true);
    try {
      await cancelOrder(id);
      await mutate();
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Error al cancelar pedido");
    } finally {
      setCancelling(false);
    }
  };

  if (error || (!order && id && !error && order === null)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-slate-500">Pedido no encontrado</p>
        <Button asChild>
          <Link href="/orders">Volver a pedidos</Link>
        </Button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-20">
      <header className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <Link href="/orders" className="text-sm text-primary hover:underline mb-2 inline-block">
          ← Volver a pedidos
        </Link>
        <h1 className="text-2xl font-bold">Pedido #{order.id.slice(0, 8)}</h1>
        <span
          className={`inline-block mt-2 text-xs font-semibold px-2 py-1 rounded ${
            order.status === "delivered"
              ? "bg-green-100 text-green-800"
              : order.status === "paid"
              ? "bg-blue-100 text-blue-800"
              : order.status === "cancelled"
              ? "bg-red-100 text-red-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {STATUS_LABELS[order.status] ?? order.status}
        </span>
        {order.status === "pending" && (
          <Button
            variant="outline"
            size="sm"
            className="mt-3 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
            onClick={handleCancel}
            disabled={cancelling}
          >
            {cancelling ? "Cancelando..." : "Cancelar pedido"}
          </Button>
        )}
      </header>

      <div className="p-6 space-y-6">
        <div className="space-y-2">
          {order.orderItems?.map((item: any) => (
            <div
              key={item.id}
              className="flex gap-4 p-4 bg-white dark:bg-surface-dark rounded-xl"
            >
              <div
                className="size-16 rounded-lg bg-gray-100 dark:bg-gray-800 shrink-0 bg-cover bg-center"
                style={
                  item.product?.imageUrl
                    ? { backgroundImage: `url(${item.product.imageUrl})` }
                    : {}
                }
              >
                {!item.product?.imageUrl && (
                  <div className="w-full h-full flex items-center justify-center text-2xl">
                    🍽️
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-bold">{item.product?.name}</p>
                <p className="text-sm text-slate-500">
                  {item.quantity} x ${Number(item.unitPrice).toFixed(2)} •{" "}
                  {item.child?.name}
                </p>
              </div>
              <p className="font-bold">
                ${(Number(item.unitPrice) * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-500">Subtotal</span>
            <span>${Number(order.subtotal).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-500">Envío</span>
            <span className="text-primary">${Number(order.shipping).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg mt-4">
            <span>Total</span>
            <span>${Number(order.totalAmount).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

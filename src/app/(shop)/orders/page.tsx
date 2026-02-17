"use client";

import Link from "next/link";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { getOrders } from "@/actions/orders";

const fetcher = async () => {
  const data = await getOrders();
  return data ?? [];
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  paid: "Pagado",
  preparing: "Preparando",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export default function OrdersPage() {
  const { data: orders, error, isLoading } = useSWR("orders", fetcher);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-20">
      <header className="sticky top-0 z-20 bg-background-light dark:bg-background-dark border-b border-gray-100 dark:border-gray-800 px-6 py-4">
        <Link href="/menu" className="text-sm text-primary hover:underline mb-2 inline-block">
          ← Volver
        </Link>
        <h1 className="text-2xl font-bold">Mis Pedidos</h1>
      </header>

      <div className="p-6 space-y-4">
        {error && (
          <p className="text-red-500">Error al cargar pedidos</p>
        )}

        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-4 bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 animate-pulse"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && orders?.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-6xl mb-4">📦</p>
            <p className="text-slate-500 text-center">No tienes pedidos aún</p>
            <Button asChild className="mt-4">
              <Link href="/menu">Explorar menú</Link>
            </Button>
          </div>
        )}

        {!isLoading && orders?.map((order: any) => (
          <Link key={order.id} href={`/orders/${order.id}`}>
            <div className="p-4 bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm text-slate-500">
                  {new Date(order.createdAt).toLocaleDateString("es", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded ${
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
              </div>
              <p className="font-bold text-lg">${Number(order.totalAmount).toFixed(2)}</p>
              <p className="text-sm text-slate-500">
                {order.orderItems?.length ?? 0} producto(s)
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

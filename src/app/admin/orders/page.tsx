"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { getAdminOrders, updateOrderStatus } from "@/actions/orders";

const STATUS_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  pending: { label: "Pendiente", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300", icon: "schedule" },
  paid: { label: "Pagado", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300", icon: "payments" },
  preparing: { label: "Preparando", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300", icon: "skillet" },
  delivered: { label: "Entregado", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300", icon: "check_circle" },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300", icon: "cancel" },
};

const TABS = [
  { key: "pending", label: "Pendientes" },
  { key: "delivered", label: "Completados" },
  { key: "all", label: "Todos" },
];

const fetcher = async () => {
  const data = await getAdminOrders();
  return data ?? [];
};

export default function AdminOrdersPage() {
  const { data: allOrders, error, mutate } = useSWR("admin-orders", fetcher);
  const [activeTab, setActiveTab] = useState("pending");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const orders = activeTab === "all"
    ? allOrders
    : allOrders?.filter((o: any) =>
        activeTab === "pending"
          ? ["pending", "paid", "preparing"].includes(o.status)
          : o.status === "delivered"
      );

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      mutate();
    } catch (err) {
      console.error("Error updating order:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleExport = () => {
    const today = new Date().toISOString().slice(0, 10);
    window.open(`/api/admin/orders/export?date=${today}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Pedidos</h1>
            <p className="text-sm text-slate-500 mt-1">
              {allOrders?.length ?? 0} pedidos totales
            </p>
          </div>
          <Button variant="outline" onClick={handleExport} className="flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>download</span>
            Exportar Excel
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? "bg-white dark:bg-surface-dark shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <p className="text-red-500 mb-4">Error al cargar pedidos</p>
        )}

        {/* Orders List */}
        <div className="space-y-4">
          {orders?.map((order: any) => {
            const statusInfo = STATUS_LABELS[order.status] || STATUS_LABELS.pending;
            return (
              <div
                key={order.id}
                className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden"
              >
                {/* Order Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${statusInfo.color}`}>
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{statusInfo.icon}</span>
                      {statusInfo.label}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      #{order.id.slice(0, 8)}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">${Number(order.totalAmount).toFixed(2)}</p>
                    <p className="text-xs text-slate-500">
                      {order.deliveryDate} • {order.deliveryTimeSlot === "morning" ? "11:30" : order.deliveryTimeSlot === "evening" ? "17:30" : order.deliveryTimeSlot}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-4 space-y-2">
                  {order.orderItems?.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.quantity}x</span>
                        <span>{item.product?.name || "Producto"}</span>
                        <span className="text-xs text-slate-400">
                          → {item.child?.name || "Niño"}
                        </span>
                      </div>
                      <span className="text-slate-500">${Number(item.unitPrice).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Delivery Info */}
                {order.deliveryAddress && (
                  <div className="px-4 pb-2 flex items-center gap-2 text-xs text-slate-500">
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>location_on</span>
                    <span>{order.deliveryAddress.schoolName || order.deliveryAddress.address}</span>
                  </div>
                )}

                {/* Actions */}
                {order.status !== "delivered" && order.status !== "cancelled" && (
                  <div className="flex gap-2 p-4 pt-2 border-t border-gray-50 dark:border-gray-800/50">
                    {order.status === "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={updatingId === order.id}
                        onClick={() => handleStatusChange(order.id, "preparing")}
                        className="flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>skillet</span>
                        Preparar
                      </Button>
                    )}
                    {(order.status === "pending" || order.status === "preparing") && (
                      <Button
                        size="sm"
                        disabled={updatingId === order.id}
                        onClick={() => handleStatusChange(order.id, "delivered")}
                        className="flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check_circle</span>
                        Marcar Entregado
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {orders?.length === 0 && !error && (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-5xl text-slate-300 mb-4" style={{ fontSize: 64 }}>
              receipt_long
            </span>
            <p className="text-slate-500 text-lg font-medium mt-4">No hay pedidos</p>
            <p className="text-slate-400 text-sm">Los pedidos aparecerán aquí cuando los clientes compren.</p>
          </div>
        )}
      </div>
    </div>
  );
}

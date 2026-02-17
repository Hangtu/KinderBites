import Link from "next/link";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const LABEL_MAP: Record<string, string> = {
  school: "Escuela",
  home: "Casa",
  office: "Oficina",
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const params = await searchParams;
  const orderId = params.orderId;

  let order: Awaited<ReturnType<typeof fetchOrder>> = undefined;
  if (orderId) {
    order = await fetchOrder(orderId);
  }

  return (
    <div className="flex min-h-screen flex-col items-center gap-6 px-6 py-12">
      <div className="size-24 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-5xl text-primary">check_circle</span>
      </div>
      <h1 className="text-2xl font-extrabold text-center">
        ¡Gracias por tu pedido!
      </h1>
      <p className="text-slate-500 text-center max-w-sm">
        Tu pedido ha sido confirmado.
        {orderId && (
          <span className="block mt-2 text-sm font-medium">Nº {orderId.slice(0, 8)}</span>
        )}
      </p>

      {order && (
        <div className="w-full max-w-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark p-4 space-y-4">
          <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200">Resumen</h3>
          {order.orderItems?.map((item: any) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.quantity}x {item.product?.name}
                {item.child?.name && (
                  <span className="text-slate-500"> ({item.child.name})</span>
                )}
              </span>
              <span className="font-medium">
                ${(Number(item.unitPrice) * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
          {order.deliveryAddress && (
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs text-slate-500 mb-1">Entregar en</p>
              <p className="text-sm font-medium">
                {LABEL_MAP[order.deliveryAddress.label] || order.deliveryAddress.label}:{" "}
                {order.deliveryAddress.address}
              </p>
              {order.deliveryAddress.schoolName && (
                <p className="text-xs text-slate-500">{order.deliveryAddress.schoolName}</p>
              )}
            </div>
          )}
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-between font-bold">
            <span>Total</span>
            <span>${Number(order.totalAmount).toFixed(2)}</span>
          </div>
        </div>
      )}

      <div className="flex gap-4 mt-2">
        <Button asChild variant="outline">
          <Link href="/orders">Ver pedidos</Link>
        </Button>
        <Button asChild>
          <Link href="/menu">Seguir comprando</Link>
        </Button>
      </div>
    </div>
  );
}

async function fetchOrder(orderId: string) {
  const data = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: {
      orderItems: {
        with: {
          product: true,
          child: true,
        },
      },
      deliveryAddress: true,
    },
  });
  return data;
}

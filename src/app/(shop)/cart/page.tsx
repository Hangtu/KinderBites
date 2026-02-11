"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    getSubtotal,
    getTotal,
    isSubscription,
    setIsSubscription,
  } = useCartStore();
  const router = useRouter();

  const subtotal = getSubtotal();
  const subscriptionDiscount = isSubscription ? subtotal * 0.15 : 0;
  const total = getTotal();

  const handleCheckout = () => {
    router.push("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6">
        <p className="text-6xl">🛒</p>
        <h2 className="text-xl font-bold text-center">Tu carrito está vacío</h2>
        <p className="text-slate-500 text-center">
          Agrega productos del menú para continuar
        </p>
        <Button asChild>
          <Link href="/menu">Explorar menú</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col max-w-md mx-auto bg-background-light dark:bg-background-dark pb-32">
      <header className="sticky top-0 z-20 flex items-center bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-4 py-4 justify-between border-b border-gray-100 dark:border-gray-800">
        <Link href="/menu">
          <button className="flex size-10 shrink-0 items-center justify-center rounded-full">
            <span className="material-symbols-outlined text-text-main-light dark:text-text-main-dark">
              arrow_back_ios_new
            </span>
          </button>
        </Link>
        <h2 className="text-lg font-bold leading-tight flex-1 text-center text-text-main-light dark:text-text-main-dark">
          Tu Carrito
        </h2>
        <div className="size-10 shrink-0" />
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm transition-all"
            >
              <div
                className="size-20 rounded-xl bg-gray-100 dark:bg-gray-800 shrink-0 bg-cover bg-center"
                style={
                  item.product.image_url
                    ? { backgroundImage: `url(${item.product.image_url})` }
                    : {}
                }
              >
                {!item.product.image_url && (
                  <div className="w-full h-full flex items-center justify-center text-3xl">
                    🍽️
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between py-0.5">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="text-base font-bold leading-tight text-text-main-light dark:text-text-main-dark">
                      {item.product.name}
                    </h3>
                    <p className="text-text-sec-light dark:text-text-sec-dark text-xs font-medium mt-1">
                      {item.product.net_weight_g
                        ? `${item.product.net_weight_g}g`
                        : ""}{" "}
                      {item.product.is_organic && "• Orgánico"}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors shrink-0 p-1"
                    aria-label="Eliminar"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                      delete
                    </span>
                  </button>
                </div>
                <div className="flex items-end justify-between mt-2">
                  <p className="text-lg font-bold leading-none text-text-main-light dark:text-text-main-dark">
                    ${Number(item.product.price).toFixed(2)}
                  </p>
                  <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-full px-1 py-1 border border-gray-100 dark:border-gray-700">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="size-7 flex items-center justify-center rounded-full bg-white dark:bg-gray-700 shadow-sm hover:text-primary"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                        remove
                      </span>
                    </button>
                    <span className="text-sm font-bold w-4 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="size-7 flex items-center justify-center rounded-full bg-primary text-[#052e05] shadow-sm"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                        add
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Subscription */}
        <div className="mt-4 rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-white to-[#f0fdf0] dark:from-surface-dark dark:to-[#0a1f0a] p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1.5 flex-1">
              <span className="flex h-6 w-fit items-center justify-center rounded-md bg-primary/20 px-2 text-[10px] font-bold uppercase tracking-wider text-[#052e05]">
                Recomendado
              </span>
              <p className="text-lg font-bold leading-tight text-text-main-light dark:text-text-main-dark">
                Suscríbete y ahorra 15%
              </p>
              <p className="text-text-sec-light dark:text-text-sec-dark text-sm leading-snug">
                Entregas semanales automáticas. Cancela cuando quieras.
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center shrink-0">
              <input
                type="checkbox"
                checked={isSubscription}
                onChange={(e) => setIsSubscription(e.target.checked)}
                className="peer sr-only"
              />
              <div className="h-8 w-14 rounded-full bg-gray-200 dark:bg-gray-700 after:absolute after:start-[4px] after:top-[4px] after:h-6 after:w-6 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-6 peer-focus:outline-none" />
            </label>
          </div>
        </div>

        {/* Price breakdown */}
        <div className="mt-4 rounded-xl bg-white dark:bg-surface-dark p-5 shadow-sm">
          <div className="flex justify-between items-center text-sm">
            <span className="text-text-sec-light dark:text-text-sec-dark">Subtotal</span>
            <span className="font-semibold text-text-main-light dark:text-text-main-dark">
              ${subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm mt-2">
            <span className="text-text-sec-light dark:text-text-sec-dark">Envío</span>
            <span className="font-bold text-primary">Gratis</span>
          </div>
          {isSubscription && (
            <div className="flex justify-between items-center text-sm mt-2">
              <div className="flex items-center gap-1.5">
                <span className="text-text-sec-light dark:text-text-sec-dark">
                  Descuento de suscripción
                </span>
                <span className="material-symbols-outlined text-primary text-[16px]">
                  verified
                </span>
              </div>
              <span className="font-semibold text-primary">
                -${subscriptionDiscount.toFixed(2)}
              </span>
            </div>
          )}
          <div className="my-3 h-px w-full bg-gray-100 dark:bg-gray-700" />
          <div className="flex justify-between items-end">
            <span className="text-base font-medium text-text-main-light dark:text-text-main-dark">
              Total
            </span>
            <span className="text-2xl font-extrabold text-text-main-light dark:text-text-main-dark tracking-tight">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-10 w-full max-w-md mx-auto bg-white/80 dark:bg-surface-dark/90 backdrop-blur-lg border-t border-gray-100 dark:border-gray-800 p-4 pb-safe-lg">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-center gap-1.5 text-xs text-text-sec-light dark:text-text-sec-dark opacity-80">
            <span className="material-symbols-outlined text-[14px]">lock</span>
            <span>Pagos 100% seguros y encriptados</span>
          </div>
          <Button onClick={handleCheckout} className="w-full">
            <span>Finalizar Compra</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

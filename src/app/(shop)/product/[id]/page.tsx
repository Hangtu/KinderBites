"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useProduct } from "@/hooks/use-products";
import { useChildren } from "@/hooks/use-children";
import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { product, isLoading, error } = useProduct(id);
  const { children } = useChildren();
  const { addItem, getItemCount } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const [selectedChild, setSelectedChild] = useState<(typeof children)[0] | null>(
    children[0] ?? null
  );

  const handleAddToCart = () => {
    if (!product || !selectedChild) return;
    addItem(
      {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
        category: product.category,
        ageRange: product.ageRange,
        rating: product.rating,
        netWeightG: product.netWeightG,
        preparation: product.preparation,
        isOrganic: product.isOrganic,
        isGlutenFree: product.isGlutenFree,
        isNew: product.isNew,
        isAvailable: product.isAvailable,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      },
      { id: selectedChild.id, name: selectedChild.name },
      quantity
    );
    router.push("/menu");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6">
        <p className="text-6xl mb-4">😕</p>
        <p className="text-slate-500 mb-6">Producto no encontrado</p>
        <Button asChild>
          <Link href="/menu">Volver al menú</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col pb-28 bg-background-light dark:bg-background-dark">
      {/* Top Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md p-4 pb-2">
        <button
          onClick={() => router.back()}
          className="flex size-10 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"
        >
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
        <h1 className="text-base font-bold opacity-0 sm:opacity-100">Detalle del Producto</h1>
        <Link href="/cart" className="relative flex size-10 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10">
          <span className="material-symbols-outlined text-2xl">shopping_cart</span>
          {getItemCount() > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-black border-2 border-background-light dark:border-background-dark">
              {getItemCount()}
            </span>
          )}
        </Link>
      </nav>

      {/* Hero Image */}
      <div className="w-full px-4 pt-2 pb-4">
        <div className="relative w-full overflow-hidden rounded-2xl shadow-sm aspect-[4/3]">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-8xl">
              🍽️
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-60" />
        </div>
      </div>

      {/* Product Info */}
      <div className="px-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white">
            {product.name}
          </h2>
          <div className="flex flex-col items-end">
            <span className="text-2xl font-bold text-primary">
              ${Number(product.price).toFixed(2)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              por frasco
            </span>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {product.ageRange && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-3 py-1.5 text-sm font-bold text-green-800 dark:text-green-200 border border-primary/20">
              <span className="material-symbols-outlined text-lg">child_care</span>
              {product.ageRange}
            </span>
          )}
          {product.isOrganic && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30 px-3 py-1.5 text-sm font-bold text-orange-800 dark:text-orange-200 border border-orange-200 dark:border-orange-800">
              <span className="material-symbols-outlined text-lg">eco</span>
              Orgánico
            </span>
          )}
          {product.isGlutenFree && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1.5 text-sm font-bold text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
              <span className="material-symbols-outlined text-lg">grain</span>
              Sin Gluten
            </span>
          )}
        </div>

        {product.description && (
          <p className="mt-2 text-base leading-relaxed text-slate-600 dark:text-slate-300">
            {product.description}
          </p>
        )}
      </div>

      {/* Child selector */}
      {children.length > 0 && (
        <div className="px-4 mt-6">
          <p className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3">
            ¿Para quién es?
          </p>
          <div className="flex flex-wrap gap-2">
            {children.map((child) => (
              <button
                key={child.id}
                type="button"
                onClick={() => setSelectedChild(child)}
                className={`px-4 py-3 rounded-xl border-2 transition-all ${
                  selectedChild?.id === child.id
                    ? "bg-primary/20 border-primary"
                    : "bg-white dark:bg-surface-dark border-gray-200 dark:border-gray-700"
                }`}
              >
                <span className="font-medium">{child.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 z-40 w-full border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#0d1b0d]/95 backdrop-blur-lg px-4 py-4 pb-safe-lg">
        <div className="mx-auto flex w-full max-w-md items-center justify-between gap-4">
          <div className="flex h-14 items-center rounded-xl bg-slate-100 dark:bg-slate-800 px-1">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex size-10 items-center justify-center rounded-lg text-slate-500 hover:bg-white dark:hover:bg-slate-700"
            >
              <span className="material-symbols-outlined">remove</span>
            </button>
            <span className="w-8 text-center text-lg font-bold">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="flex size-10 items-center justify-center rounded-lg text-slate-900 dark:text-white hover:bg-white dark:hover:bg-slate-700"
            >
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>
          <Button
            onClick={handleAddToCart}
            disabled={children.length === 0}
            className="flex-1 h-14"
          >
            <span>Añadir al carrito</span>
            <span className="h-1 w-1 rounded-full bg-black/40" />
            <span>${(Number(product.price) * quantity).toFixed(2)}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

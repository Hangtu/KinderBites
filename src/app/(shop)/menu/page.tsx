"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useProducts } from "@/hooks/use-products";
import { useCartStore } from "@/store/cart-store";
import { useChildren } from "@/hooks/use-children";
import { Button } from "@/components/ui/button";
import type { Product } from "@/hooks/use-products";

const CATEGORIES = [
  { key: "age_6_12", label: "6-12 meses", icon: "child_care" },
  { key: "age_1_2", label: "1-2 años", icon: "escalator_warning" },
  { key: "snack", label: "Snacks", icon: "cookie" },
  { key: "drink", label: "Bebidas", icon: "blender" },
] as const;

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>("age_6_12");
  const [search, setSearch] = useState("");
  const { products, isLoading, error } = useProducts(activeCategory ?? undefined);
  const { addItem, getItemCount } = useCartStore();
  const { children } = useChildren();

  const filteredProducts = search
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          (p.description?.toLowerCase().includes(search.toLowerCase()) ?? false)
      )
    : products;

  return (
    <div className="w-full max-w-md min-h-screen bg-background-light dark:bg-background-dark mx-auto flex flex-col pb-[calc(5rem+env(safe-area-inset-bottom,0px))]">
      {/* Header */}
      <header className="flex items-center justify-between p-5 pt-8 bg-background-light dark:bg-background-dark sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="relative size-10 rounded-full bg-gray-200 border-2 border-primary" />
          <div>
            <p className="text-xs font-medium text-text-sec-light dark:text-text-sec-dark">
              Bienvenida de nuevo
            </p>
            <h2 className="text-text-main-light dark:text-text-main-dark text-lg font-bold">
              Hola!
            </h2>
          </div>
        </div>
        <Link href="/cart">
          <Button variant="ghost" size="icon" className="relative">
            <span className="material-symbols-outlined">shopping_cart</span>
            {getItemCount() > 0 && (
              <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
              </span>
            )}
          </Button>
        </Link>
      </header>

      {/* Search */}
      <div className="px-5 pb-2">
        <label className="flex w-full items-center rounded-2xl h-12 bg-white dark:bg-surface-dark shadow-sm border border-gray-100 dark:border-gray-800">
          <span className="material-symbols-outlined pl-4 pr-2 text-text-sec-light dark:text-text-sec-dark">
            search
          </span>
          <input
            className="w-full bg-transparent border-none focus:ring-0 text-text-main-light dark:text-text-main-dark placeholder:text-gray-400 text-sm font-medium h-full rounded-r-2xl"
            placeholder="¿Qué busca tu bebé hoy?"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>

      {/* Categories */}
      <div className="flex gap-3 px-5 py-4 overflow-x-auto no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`flex h-10 shrink-0 items-center gap-x-2 rounded-full px-4 shadow-sm transition-transform active:scale-95 ${
              activeCategory === cat.key
                ? "bg-primary"
                : "bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800"
            }`}
          >
            <span
              className={`material-symbols-outlined ${
                activeCategory === cat.key ? "text-black" : "text-text-sec-light dark:text-text-sec-dark"
              }`}
              style={{ fontSize: 20 }}
            >
              {cat.icon}
            </span>
            <p
              className={`text-sm font-medium ${
                activeCategory === cat.key
                  ? "text-black font-bold"
                  : "text-text-main-light dark:text-text-main-dark"
              }`}
            >
              {cat.label}
            </p>
          </button>
        ))}
      </div>

      {/* Section Header */}
      <div className="px-5 pt-2 pb-2 flex items-end justify-between">
        <h3 className="text-text-main-light dark:text-text-main-dark text-xl font-bold">
          Platos del día
        </h3>
        <Link href="/menu" className="text-primary font-semibold text-sm hover:underline">
          Ver todo
        </Link>
      </div>

      {/* Product List */}
      <div className="flex flex-col gap-4 px-5 pb-6 overflow-y-auto flex-1">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        )}
        {error && (
          <p className="text-red-500 text-center py-4">Error al cargar productos</p>
        )}
        {!isLoading && !error && filteredProducts.length === 0 && (
          <p className="text-center text-text-sec-light py-8">No hay productos</p>
        )}
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            childrenList={children}
            onAdd={addItem}
          />
        ))}
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto w-full bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800 px-6 pt-3 pb-safe flex justify-between items-center z-30">
        <Link href="/menu" className="flex flex-col items-center gap-1 text-primary">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            home
          </span>
          <span className="text-[10px] font-bold">Inicio</span>
        </Link>
        <Link href="/menu" className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-500">
          <span className="material-symbols-outlined">search</span>
          <span className="text-[10px] font-medium">Buscar</span>
        </Link>
        <Link href="/orders" className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-500">
          <span className="material-symbols-outlined">receipt_long</span>
          <span className="text-[10px] font-medium">Pedidos</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-500">
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px] font-medium">Perfil</span>
        </Link>
      </nav>
    </div>
  );
}

function ProductCard({
  product,
  childrenList,
  onAdd,
}: {
  product: Product;
  childrenList: { id: string; name: string }[];
  onAdd: (product: Product, child: { id: string; name: string }, qty?: number) => void;
}) {
  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (childrenList.length === 0) return;
    onAdd(product, childrenList[0], 1);
  };

  const rating = product.rating ? (product.rating / 10).toFixed(1) : null;

  return (
    <Link href={`/product/${product.id}`}>
      <div className="group flex flex-col bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-all hover:shadow-md">
        <div className="w-full h-40 bg-gray-200 relative overflow-hidden">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 448px) 100vw, 448px"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              🍽️
            </div>
          )}
          {rating && (
            <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg">
              <span className="text-xs font-bold text-text-main-light dark:text-white">
                ⭐ {rating}
              </span>
            </div>
          )}
          {product.isNew && (
            <div className="absolute top-3 left-3 bg-primary text-black px-2 py-1 rounded-lg text-xs font-bold shadow-sm">
              Nuevo
            </div>
          )}
        </div>
        <div className="p-4 flex flex-col gap-2">
          <h4 className="text-text-main-light dark:text-text-main-dark text-lg font-bold leading-tight">
            {product.name}
          </h4>
          <p className="text-text-sec-light dark:text-text-sec-dark text-xs font-medium">
            {product.description || `${product.netWeightG || ""}g`}
          </p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-text-main-light dark:text-text-main-dark text-lg font-bold">
              ${Number(product.price).toFixed(2)}
            </p>
            <Button
              size="sm"
              variant={product.isNew ? "default" : "secondary"}
              className="flex items-center gap-1"
              disabled={childrenList.length === 0}
              onClick={handleAdd}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                add
              </span>
              <span className="text-sm">Agregar</span>
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}

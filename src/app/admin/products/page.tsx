"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { getAdminProducts } from "@/actions/products";

const fetcher = async () => {
  const data = await getAdminProducts();
  return data ?? [];
};

export default function AdminProductsPage() {
  const { data: products, error, mutate } = useSWR("admin-products", fetcher);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/menu" className="text-sm text-primary hover:underline mb-2 inline-block">
              ← Volver
            </Link>
            <h1 className="text-2xl font-bold">Productos</h1>
          </div>
          <Button asChild>
            <Link href="/admin/products/new">Nuevo producto</Link>
          </Button>
        </div>

        {error && (
          <p className="text-red-500 mb-4">Error al cargar productos</p>
        )}

        <div className="space-y-4">
          {products?.map((product: any) => (
            <div
              key={product.id}
              className="flex items-center gap-4 p-4 bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800"
            >
              <div
                className="size-16 rounded-lg bg-gray-100 dark:bg-gray-800 shrink-0 bg-cover bg-center"
                style={
                  product.imageUrl
                    ? { backgroundImage: `url(${product.imageUrl})` }
                    : {}
                }
              >
                {!product.imageUrl && (
                  <div className="w-full h-full flex items-center justify-center text-2xl">
                    🍽️
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold truncate">{product.name}</h3>
                <p className="text-sm text-slate-500">
                  ${Number(product.price).toFixed(2)} • {product.category}
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/products/${product.id}`}>Editar</Link>
              </Button>
            </div>
          ))}
        </div>

        {products?.length === 0 && !error && (
          <p className="text-center text-slate-500 py-12">No hay productos</p>
        )}
      </div>
    </div>
  );
}

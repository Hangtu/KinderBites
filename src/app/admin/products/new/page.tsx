"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createProduct } from "@/actions/products";
import { ImageUpload } from "@/components/ui/image-upload";

const schema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Precio debe ser positivo"),
  category: z.enum(["age_6_12", "age_1_2", "snack", "drink"]),
  imageUrl: z.string().optional(),
  ageRange: z.string().optional(),
  netWeightG: z.coerce.number().optional(),
  preparation: z.string().optional(),
  isOrganic: z.boolean().default(false),
  isGlutenFree: z.boolean().default(false),
  isNew: z.boolean().default(false),
});

type FormData = z.infer<typeof schema>;

export default function NewProductPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      category: "age_6_12",
      isOrganic: false,
      isGlutenFree: false,
      isNew: false,
    },
  });

  const imageUrl = watch("imageUrl");

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);

    try {
      await createProduct({
        name: data.name,
        description: data.description || null,
        price: data.price.toFixed(2),
        imageUrl: data.imageUrl || null,
        category: data.category,
        ageRange: data.ageRange || null,
        netWeightG: data.netWeightG ? data.netWeightG.toFixed(2) : null,
        preparation: data.preparation || null,
        isOrganic: data.isOrganic,
        isGlutenFree: data.isGlutenFree,
        isNew: data.isNew,
        isAvailable: true,
      });

      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
        console.error(err);
        setError(err.message || "Error al crear producto");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark p-6">
      <div className="max-w-xl mx-auto">
        <Link href="/admin/products" className="text-sm text-primary hover:underline mb-4 inline-block">
          ← Volver a productos
        </Link>
        <h1 className="text-2xl font-bold mb-6">Nuevo producto</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Imagen del Producto</label>
            <ImageUpload 
              value={imageUrl}
              onChange={(url) => setValue("imageUrl", url, { shouldValidate: true })} 
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Nombre</label>
            <Input {...register("name")} placeholder="Puré de Calabaza" />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Descripción</label>
            <textarea
              {...register("description")}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-surface-dark px-4 py-3 text-sm"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Precio</label>
            <Input type="number" step="0.01" {...register("price")} />
            {errors.price && (
              <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Categoría</label>
            <select
              {...register("category")}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-surface-dark px-4 py-3 text-sm"
            >
              <option value="age_6_12">6-12 meses</option>
              <option value="age_1_2">1-2 años</option>
              <option value="snack">Snacks</option>
              <option value="drink">Bebidas</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Edad mínima</label>
              <Input {...register("ageRange")} placeholder="6+ Meses" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Peso neto (g)</label>
              <Input type="number" {...register("netWeightG")} placeholder="120" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Preparación</label>
            <Input {...register("preparation")} placeholder="Listo para comer" />
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register("isOrganic")} className="rounded" />
              <span className="text-sm">Orgánico</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register("isGlutenFree")} className="rounded" />
              <span className="text-sm">Sin gluten</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register("isNew")} className="rounded" />
              <span className="text-sm">Nuevo</span>
            </label>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Guardando..." : "Crear producto"}
          </Button>
        </form>
      </div>
    </div>
  );
}

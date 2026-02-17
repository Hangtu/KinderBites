"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getProduct, updateProduct } from "@/actions/products";

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
  isAvailable: z.boolean().default(true),
});

type FormData = z.infer<typeof schema>;

export default function EditProductPage() {
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      category: "age_6_12",
      isOrganic: false,
      isGlutenFree: false,
      isNew: false,
      isAvailable: true,
    },
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProduct(id);
        setFetching(false);

        if (!data) {
          setFetchError("Producto no encontrado");
          return;
        }

        reset({
          name: data.name,
          description: data.description ?? "",
          price: Number(data.price),
          category: data.category as any, // Cast to enum
          imageUrl: data.imageUrl ?? "",
          ageRange: data.ageRange ?? "",
          netWeightG: data.netWeightG ? Number(data.netWeightG) : undefined,
          preparation: data.preparation ?? "",
          isOrganic: data.isOrganic ?? false,
          isGlutenFree: data.isGlutenFree ?? false,
          isNew: data.isNew ?? false,
          isAvailable: data.isAvailable ?? true,
        });
      } catch (err) {
        console.error(err);
        setFetching(false);
        setFetchError("Error al cargar producto");
      }
    };
    if (id) fetchProduct();
  }, [id, reset]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setSubmitError(null);

    try {
      await updateProduct(id, {
        name: data.name,
        description: data.description || null,
        price: data.price.toString(),
        imageUrl: data.imageUrl || null,
        category: data.category,
        ageRange: data.ageRange || null,
        netWeightG: data.netWeightG ? data.netWeightG.toString() : null,
        preparation: data.preparation || null,
        isOrganic: data.isOrganic,
        isGlutenFree: data.isGlutenFree,
        isNew: data.isNew,
        isAvailable: data.isAvailable,
      });

      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setLoading(false);
      setSubmitError(err.message || "Error al actualizar producto");
    }
  };

  if (fetching) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen p-6">
        <Link href="/admin/products" className="text-sm text-primary hover:underline mb-4 inline-block">
          ← Volver a productos
        </Link>
        <p className="text-red-500">{fetchError}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark p-6">
      <div className="max-w-xl mx-auto">
        <Link href="/admin/products" className="text-sm text-primary hover:underline mb-4 inline-block">
          ← Volver a productos
        </Link>
        <h1 className="text-2xl font-bold mb-6">Editar producto</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">URL de Imagen</label>
             <Input {...register("imageUrl")} placeholder="https://..." />
             <p className="text-xs text-slate-500 mt-1">Carga de archivos deshabilitada temporalmente por migración.</p>
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

          <div className="flex flex-wrap gap-6">
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
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register("isAvailable")} className="rounded" />
              <span className="text-sm">Disponible</span>
            </label>
          </div>

          {submitError && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20">
              <p className="text-red-600 dark:text-red-300 text-sm">{submitError}</p>
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Guardando..." : "Guardar cambios"}
          </Button>
        </form>
      </div>
    </div>
  );
}

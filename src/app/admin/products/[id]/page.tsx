"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const schema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Precio debe ser positivo"),
  category: z.enum(["age_6_12", "age_1_2", "snack", "drink"]),
  age_range: z.string().optional(),
  net_weight_g: z.coerce.number().optional(),
  preparation: z.string().optional(),
  is_organic: z.boolean().default(false),
  is_gluten_free: z.boolean().default(false),
  is_new: z.boolean().default(false),
  is_available: z.boolean().default(true),
});

type FormData = z.infer<typeof schema>;

export default function EditProductPage() {
  const params = useParams();
  const id = params.id as string;
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      category: "age_6_12",
      is_organic: false,
      is_gluten_free: false,
      is_new: false,
      is_available: true,
    },
  });

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error: fetchError } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      setFetching(false);
      if (fetchError || !data) {
        setFetchError("Producto no encontrado");
        return;
      }
      reset({
        name: data.name,
        description: data.description ?? "",
        price: Number(data.price),
        category: data.category,
        age_range: data.age_range ?? "",
        net_weight_g: data.net_weight_g ? Number(data.net_weight_g) : undefined,
        preparation: data.preparation ?? "",
        is_organic: data.is_organic ?? false,
        is_gluten_free: data.is_gluten_free ?? false,
        is_new: data.is_new ?? false,
        is_available: data.is_available ?? true,
      });
    };
    fetchProduct();
  }, [id, reset]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setSubmitError(null);
    let imageUrl: string | undefined;

    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const path = `products/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("lonchi-products")
        .upload(path, imageFile, { upsert: true });

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from("lonchi-products")
          .getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }
    }

    const updateData: Record<string, unknown> = {
      name: data.name,
      description: data.description || null,
      price: data.price,
      category: data.category,
      age_range: data.age_range || null,
      net_weight_g: data.net_weight_g ?? null,
      preparation: data.preparation || null,
      is_organic: data.is_organic,
      is_gluten_free: data.is_gluten_free,
      is_new: data.is_new,
      is_available: data.is_available,
    };
    if (imageUrl) updateData.image_url = imageUrl;

    const { error: updateError } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", id);

    setLoading(false);
    if (updateError) {
      setSubmitError(updateError.message);
      return;
    }
    router.push("/admin/products");
    router.refresh();
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
            <label className="block text-sm font-medium mb-2">Imagen (dejar vacío para mantener)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm"
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
              <Input {...register("age_range")} placeholder="6+ Meses" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Peso neto (g)</label>
              <Input type="number" {...register("net_weight_g")} placeholder="120" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Preparación</label>
            <Input {...register("preparation")} placeholder="Listo para comer" />
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register("is_organic")} className="rounded" />
              <span className="text-sm">Orgánico</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register("is_gluten_free")} className="rounded" />
              <span className="text-sm">Sin gluten</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register("is_new")} className="rounded" />
              <span className="text-sm">Nuevo</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register("is_available")} className="rounded" />
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

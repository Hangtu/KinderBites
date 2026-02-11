import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * POST /api/seed-demo
 * Crea datos de demo (1 niño + 1 dirección) para el usuario actual.
 * Útil para testing local sin completar onboarding manualmente.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { count: childrenCount } = await supabase
    .from("children")
    .select("id", { count: "exact", head: true })
    .eq("parent_id", user.id);

  if ((childrenCount ?? 0) === 0) {
    const { error: childError } = await supabase.from("children").insert({
      parent_id: user.id,
      name: "Mateo (demo)",
      school_name: "Guardería Mis Primeros Pasos",
      grade: "Kinder",
      allergy_ids: ["dairy"],
      avoided_foods: ["Brócoli"],
    });
    if (childError) {
      return NextResponse.json(
        { error: "Error al crear niño demo: " + childError.message },
        { status: 500 }
      );
    }
  }

  const { count: addrCount } = await supabase
    .from("delivery_addresses")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", user.id);

  if ((addrCount ?? 0) === 0) {
    const { error: addrError } = await supabase
      .from("delivery_addresses")
      .insert({
        profile_id: user.id,
        label: "school",
        address: "Av. Principal 123, Col. Centro",
        school_name: "Guardería Mis Primeros Pasos",
        preferred_time_slot: "11:30",
        is_default: true,
      });
    if (addrError) {
      return NextResponse.json(
        { error: "Error al crear dirección demo: " + addrError.message },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({
    ok: true,
    message: "Datos de demo creados (o ya existían)",
  });
}

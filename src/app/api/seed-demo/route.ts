import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createChild, getChildren } from "@/actions/children";
import { createAddress, getAddresses } from "@/actions/addresses";

/**
 * POST /api/seed-demo
 * Crea datos de demo (1 niño + 1 dirección) para el usuario actual.
 * Útil para testing local sin completar onboarding manualmente.
 */
export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const existingChildren = await getChildren();

  if (existingChildren.length === 0) {
    try {
      await createChild({
        name: "Mateo (demo)",
        schoolName: "Guardería Mis Primeros Pasos",
        grade: "Kinder",
        allergyIds: ["dairy"],
        avoidedFoods: ["Brócoli"],
      });
    } catch (e: any) {
      return NextResponse.json(
        { error: "Error al crear niño demo: " + e.message },
        { status: 500 }
      );
    }
  }

  const existingAddresses = await getAddresses();

  if (existingAddresses.length === 0) {
    try {
      await createAddress({
        label: "school",
        address: "Av. Principal 123, Col. Centro",
        schoolName: "Guardería Mis Primeros Pasos",
        preferredTimeSlot: "11:30",
        isDefault: true,
      });
    } catch (e: any) {
      return NextResponse.json(
        { error: "Error al crear dirección demo: " + e.message },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({
    ok: true,
    message: "Datos de demo creados (o ya existían)",
  });
}

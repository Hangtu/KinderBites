import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { businessInfo } from "@/lib/business-info";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const LABEL_MAP: Record<string, string> = {
  school: "Escuela",
  home: "Casa",
  office: "Oficina",
};

export async function POST(request: Request) {
  if (!resend) {
    return NextResponse.json(
      { error: "Email no configurado (RESEND_API_KEY)" },
      { status: 503 }
    );
  }

  const { orderId } = await request.json().catch(() => ({}));
  if (!orderId) {
    return NextResponse.json({ error: "orderId requerido" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { data: order } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (
        quantity,
        unit_price,
        products (name),
        children (name)
      ),
      delivery_addresses (label, address, school_name)
    `)
    .eq("id", orderId)
    .eq("parent_id", user.id)
    .single();

  if (!order) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }

  const itemsList = (order.order_items ?? [])
    .map(
      (item: any) =>
        `• ${item.quantity}x ${item.products?.name ?? "Producto"} - $${(Number(item.unit_price) * item.quantity).toFixed(2)}`
    )
    .join("\n");

  const address = order.delivery_addresses
    ? `${LABEL_MAP[order.delivery_addresses.label] || order.delivery_addresses.label}: ${order.delivery_addresses.address}${order.delivery_addresses.school_name ? ` (${order.delivery_addresses.school_name})` : ""}`
    : "Sin dirección";

  const fromEmail = process.env.RESEND_FROM_EMAIL ?? `onboarding@resend.dev`;
  const { error } = await resend.emails.send({
    from: `${businessInfo.name} <${fromEmail}>`,
    to: user.email,
    subject: `Pedido confirmado #${orderId.slice(0, 8)} - ${businessInfo.name}`,
    html: `
      <h2>¡Gracias por tu pedido!</h2>
      <p>Tu pedido #${orderId.slice(0, 8)} ha sido confirmado.</p>
      <h3>Resumen</h3>
      <pre style="font-family: sans-serif; white-space: pre-wrap;">${itemsList}</pre>
      <p><strong>Entregar en:</strong><br>${address}</p>
      <p><strong>Total:</strong> $${Number(order.total_amount).toFixed(2)}</p>
      <p>Si tienes dudas, contáctanos: ${businessInfo.phone} o ${businessInfo.email}</p>
    `,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

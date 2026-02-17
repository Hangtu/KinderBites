import { NextResponse } from "next/server";
import { Resend } from "resend";
import { businessInfo } from "@/lib/business-info";
import { getOrder } from "@/actions/orders";
import { currentUser } from "@clerk/nextjs/server";

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

  const user = await currentUser();
  const userEmail = user?.emailAddresses?.[0]?.emailAddress;

  if (!user || !userEmail) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const order = await getOrder(orderId);

  if (!order) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }

  if (order.parentId !== user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const itemsList = (order.orderItems ?? [])
    .map(
      (item: any) =>
        `• ${item.quantity}x ${item.product?.name ?? "Producto"} - $${(Number(item.unitPrice) * item.quantity).toFixed(2)}`
    )
    .join("\n");

  const address = order.deliveryAddress
    ? `${LABEL_MAP[order.deliveryAddress.label] || order.deliveryAddress.label}: ${order.deliveryAddress.address}${order.deliveryAddress.schoolName ? ` (${order.deliveryAddress.schoolName})` : ""}`
    : "Sin dirección";

  const fromEmail = process.env.RESEND_FROM_EMAIL ?? `onboarding@resend.dev`;
  const { error } = await resend.emails.send({
    from: `${businessInfo.name} <${fromEmail}>`,
    to: userEmail,
    subject: `Pedido confirmado #${orderId.slice(0, 8)} - ${businessInfo.name}`,
    html: `
      <h2>¡Gracias por tu pedido!</h2>
      <p>Tu pedido #${orderId.slice(0, 8)} ha sido confirmado.</p>
      <h3>Resumen</h3>
      <pre style="font-family: sans-serif; white-space: pre-wrap;">${itemsList}</pre>
      <p><strong>Entregar en:</strong><br>${address}</p>
      <p><strong>Total:</strong> $${Number(order.totalAmount).toFixed(2)}</p>
      <p>Si tienes dudas, contáctanos: ${businessInfo.phone} o ${businessInfo.email}</p>
    `,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

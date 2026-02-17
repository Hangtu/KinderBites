import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { orders, orderItems, products, children, deliveryAddresses } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import ExcelJS from "exceljs";

export async function GET(req: NextRequest) {
    // Auth check
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Admin check
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const role = (user.publicMetadata as { role?: string })?.role;
    if (role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get date param
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || new Date().toISOString().slice(0, 10);

    // Fetch orders with relations
    const allOrders = await db.query.orders.findMany({
        orderBy: desc(orders.createdAt),
        with: {
            orderItems: {
                with: {
                    product: true,
                    child: true,
                }
            },
            deliveryAddress: true,
        }
    });

    // Filter by date
    const filtered = allOrders.filter((o) => o.deliveryDate === date);

    // Build Excel
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "KinderBites";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet("Pedidos del Día");

    // Title row
    sheet.mergeCells("A1:G1");
    const titleCell = sheet.getCell("A1");
    titleCell.value = `Pedidos — ${date}`;
    titleCell.font = { size: 16, bold: true, color: { argb: "FF1A1A1A" } };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    sheet.getRow(1).height = 36;

    // Header row
    const headerRow = sheet.addRow([
        "Pedido", "Estado", "Alumno", "Producto", "Cantidad",
        "Escuela", "Horario", "Total Pedido", "Notas"
    ]);
    headerRow.eachCell((cell) => {
        cell.font = { bold: true, size: 11, color: { argb: "FFFFFFFF" } };
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF4CAF50" },
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
            bottom: { style: "thin", color: { argb: "FF388E3C" } },
        };
    });
    headerRow.height = 28;

    // Data rows
    for (const order of filtered) {
        const timeLabel = order.deliveryTimeSlot === "morning" ? "11:30 Mañana"
            : order.deliveryTimeSlot === "evening" ? "17:30 Tarde"
                : order.deliveryTimeSlot || "";

        const schoolName = order.deliveryAddress?.schoolName || order.deliveryAddress?.address || "";

        for (const item of order.orderItems) {
            const row = sheet.addRow([
                `#${order.id.slice(0, 8)}`,
                order.status,
                item.child?.name || "",
                item.product?.name || "",
                item.quantity,
                schoolName,
                timeLabel,
                `$${Number(order.totalAmount).toFixed(2)}`,
                item.specificNotes || "",
            ]);
            row.eachCell((cell) => {
                cell.alignment = { vertical: "middle" };
                cell.border = {
                    bottom: { style: "thin", color: { argb: "FFE0E0E0" } },
                };
            });
        }
    }

    // Auto-fit columns
    sheet.columns.forEach((column) => {
        let maxLength = 10;
        column.eachCell?.({ includeEmpty: true }, (cell) => {
            const cellLength = cell.value ? String(cell.value).length : 0;
            if (cellLength > maxLength) maxLength = cellLength;
        });
        column.width = Math.min(maxLength + 4, 40);
    });

    // Summary row
    sheet.addRow([]);
    const summaryRow = sheet.addRow([
        "", "", "", "",
        `Total pedidos: ${filtered.length}`, "", "",
        `$${filtered.reduce((sum, o) => sum + Number(o.totalAmount), 0).toFixed(2)}`,
    ]);
    summaryRow.eachCell((cell) => {
        cell.font = { bold: true, size: 11 };
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer as any, {
        headers: {
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": `attachment; filename="pedidos_${date}.xlsx"`,
        },
    });
}

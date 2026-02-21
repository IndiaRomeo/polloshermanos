// app/api/sales/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";
import { bogotaWeekStartUtc } from "@/app/lib/time";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { qty, unitPrice, note, date } = await req.json();

  const q = Math.trunc(Number(qty));
  const p = Math.trunc(Number(unitPrice));

  if (!Number.isFinite(q) || q <= 0) {
    return NextResponse.json({ error: "qty inválido" }, { status: 400 });
  }
  if (!Number.isFinite(p) || p <= 0) {
    return NextResponse.json({ error: "unitPrice inválido" }, { status: 400 });
  }

  const startDate = bogotaWeekStartUtc(date ? new Date(date) : new Date());

  // 1) Traer semana + recargas
  const week = await prisma.week.findUnique({
    where: { startDate },
    include: { adjustments: true },
  });

  // ✅ primero valida que exista
  if (!week) {
    return NextResponse.json(
      { error: "No existe semana activa. Define inventario inicial primero." },
      { status: 400 }
    );
  }

  // 2) Bloquear ventas si la semana está cerrada
  if (week.status === "CLOSED") {
    return NextResponse.json(
      { error: "Semana cerrada. No puedes registrar ventas." },
      { status: 400 }
    );
  }

  // 3) Calcular disponible total = inicial + recargas
  const totalRestocked = week.adjustments.reduce((a, r) => a + r.qty, 0);
  const available = week.initialQty + totalRestocked;

  // 4) Vendidos
  const agg = await prisma.sale.aggregate({
    where: { weekId: week.id },
    _sum: { qty: true },
  });

  const sold = agg._sum.qty ?? 0;
  const remaining = available - sold;

  if (remaining <= 0) {
    return NextResponse.json(
      { error: "Semana agotada. No hay pollos disponibles." },
      { status: 400 }
    );
  }

  if (q > remaining) {
    return NextResponse.json(
      { error: `No puedes vender ${q}. Solo quedan ${remaining} pollos.` },
      { status: 400 }
    );
  }

  // 5) Crear venta
  const sale = await prisma.sale.create({
    data: {
      weekId: week.id,
      date: date ? new Date(date) : new Date(),
      qty: q,
      unitPrice: p,
      note: note?.toString() || null,
    },
  });

  return NextResponse.json({ sale });
}
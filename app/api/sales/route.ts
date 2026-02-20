import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";
import { bogotaWeekStartUtc } from "@/app/lib/time";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { qty, unitPrice, note, date } = await req.json();

  const q = Number(qty);
  const p = Number(unitPrice);

  if (!Number.isFinite(q) || q <= 0) {
    return NextResponse.json({ error: "qty inválido" }, { status: 400 });
  }
  if (!Number.isFinite(p) || p <= 0) {
    return NextResponse.json({ error: "unitPrice inválido" }, { status: 400 });
  }

  // la venta se asocia a la semana activa (Bogotá)
  const startDate = bogotaWeekStartUtc(date ? new Date(date) : new Date());

  const week = await prisma.week.findUnique({ where: { startDate } });
  if (!week) {
    return NextResponse.json(
      { error: "No existe semana activa. Define inventario inicial primero." },
      { status: 400 }
    );
  }

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
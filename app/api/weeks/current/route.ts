// app/api/weeks/current/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";
import { bogotaWeekStartUtc } from "@/app/lib/time";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const startDate = bogotaWeekStartUtc();
  const week = await prisma.week.findUnique({
    where: { startDate },
    include: { sales: true },
  });

  return NextResponse.json({ startDate, week });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const body = await req.json();
  const initialQty = Number(body.initialQty);

  if (!Number.isFinite(initialQty) || initialQty < 0) {
    return NextResponse.json({ error: "initialQty inválido" }, { status: 400 });
  }

  const startDate = bogotaWeekStartUtc();

  // si ya existe, no permitir bajar por debajo de lo vendido
  const existing = await prisma.week.findUnique({ where: { startDate } });
  if (existing) {
    const agg = await prisma.sale.aggregate({
      where: { weekId: existing.id },
      _sum: { qty: true },
    });
    const sold = agg._sum.qty ?? 0;

    if (initialQty < sold) {
      return NextResponse.json(
        { error: `No puedes poner inventario ${initialQty}. Ya vendiste ${sold}.` },
        { status: 400 }
      );
    }
  }

  const week = await prisma.week.upsert({
    where: { startDate },
    update: { initialQty },
    create: { startDate, initialQty },
  });

  return NextResponse.json({ week });
}
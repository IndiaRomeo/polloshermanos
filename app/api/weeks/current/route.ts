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
    include: { 
      sales: true,
      adjustments: true, // ✅ si tu relación se llama así
    },
  });

  return NextResponse.json({ startDate, week });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const body = await req.json();
  const initialQty = Number(body.initialQty);

  if (!Number.isFinite(initialQty) || initialQty <= 0) {
    return NextResponse.json({ error: "initialQty inválido" }, { status: 400 });
  }

  const startDate = bogotaWeekStartUtc();

  const existing = await prisma.week.findUnique({ where: { startDate } });

  // SI YA EXISTE, BLOQUEAMOS EDICIÓN
  if (existing) {
    return NextResponse.json(
      { error: "El inventario inicial ya fue definido para esta semana. Usa Recarga si llegan más pollos." },
      { status: 400 }
    );
  }

  const week = await prisma.week.create({
    data: { startDate, initialQty },
  });

  return NextResponse.json({ week });
}
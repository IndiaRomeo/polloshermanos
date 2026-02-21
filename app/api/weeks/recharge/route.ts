import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";
import { bogotaWeekStartUtc } from "@/app/lib/time";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const body = await req.json();
  const qty = Number(body.qty);
  const note = body.note?.toString() || null;

  if (!Number.isFinite(qty) || qty <= 0) {
    return NextResponse.json({ error: "qty inválido (debe ser > 0)" }, { status: 400 });
  }

  const startDate = bogotaWeekStartUtc();
  const week = await prisma.week.findUnique({ where: { startDate } });

  if (!week) {
    return NextResponse.json({ error: "No existe semana activa." }, { status: 400 });
  }

  if (week.status === "CLOSED") {
    return NextResponse.json({ error: "Semana cerrada. No puedes recargar." }, { status: 400 });
  }

  const adj = await prisma.stockAdjustment.create({
    data: { weekId: week.id, qty: Math.trunc(qty), note },
  });

  return NextResponse.json({ adjustment: adj });
}
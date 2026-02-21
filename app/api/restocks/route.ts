import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";
import { bogotaWeekStartUtc } from "@/app/lib/time";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { qty, note } = await req.json();
  const q = Number(qty);

  if (!Number.isFinite(q) || q <= 0) {
    return NextResponse.json({ error: "qty inválido" }, { status: 400 });
  }

  const startDate = bogotaWeekStartUtc();
  const week = await prisma.week.findUnique({ where: { startDate } });

  if (!week) {
    return NextResponse.json({ error: "No existe semana activa. Define inventario inicial primero." }, { status: 400 });
  }

  const restock = await prisma.restock.create({
    data: {
      weekId: week.id,
      qty: q,
      note: note?.toString() || null,
    },
  });

  return NextResponse.json({ restock });
}
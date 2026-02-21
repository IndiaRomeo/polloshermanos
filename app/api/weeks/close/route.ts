// app/api/weeks/close/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";
import { bogotaWeekStartUtc } from "@/app/lib/time";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  // ✅ Solo ADMIN
  const role = (session.user as any)?.role;
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Solo ADMIN puede cerrar la semana." }, { status: 403 });
  }

  const startDate = bogotaWeekStartUtc();

  const week = await prisma.week.findUnique({ where: { startDate } });
  if (!week) {
    return NextResponse.json({ error: "No existe semana activa." }, { status: 400 });
  }

  if (week.status === "CLOSED") {
    return NextResponse.json({ error: "La semana ya está cerrada." }, { status: 400 });
  }

  const updated = await prisma.week.update({
    where: { id: week.id },
    data: { status: "CLOSED", closedAt: new Date() },
  });

  return NextResponse.json({ week: updated });
}
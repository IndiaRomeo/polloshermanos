import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const weeks = await prisma.week.findMany({
  orderBy: { startDate: "desc" },
  take: 20,
  include: { sales: true, restocks: true },
});

  const payload = weeks.map((w) => {
    const sold = w.sales.reduce((a, s) => a + s.qty, 0);
    const revenue = w.sales.reduce((a, s) => a + s.qty * s.unitPrice, 0);
    const restocked = w.restocks.reduce((a, r) => a + r.qty, 0);
    const capacity = w.initialQty + restocked;

    return {
        id: w.id,
        startDate: w.startDate,
        initialQty: w.initialQty,
        sold,
        remaining: Math.max(0, capacity - sold),
        revenue,
    };
  });
  return NextResponse.json({ weeks: payload });
}
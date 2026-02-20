import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth"; // <-- exporta authOptions en v4
import { Role } from "@prisma/client";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || (session as any).user?.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { username, password, role } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username,
      passwordHash: hash,
      role: role === "ADMIN" ? Role.ADMIN : Role.SELLER,
    },
    select: {
      id: true,
      username: true,
      role: true,
      createdAt: true,
    },
  });

  return NextResponse.json(user);
}
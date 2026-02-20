import { prisma } from "../app/lib/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

async function main() {
  const username = "admin";
  const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD!, 10);

  await prisma.user.upsert({
    where: { username },
    update: {}, // no lo toca si ya existe
    create: {
      username,
      passwordHash: hash,
      role: Role.ADMIN,
    },
  });

  console.log("Seed OK: admin listo (o ya existía)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
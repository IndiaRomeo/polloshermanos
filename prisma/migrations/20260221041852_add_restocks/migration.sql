-- CreateTable
CREATE TABLE "Restock" (
    "id" TEXT NOT NULL,
    "weekId" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Restock_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Restock" ADD CONSTRAINT "Restock_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "Week"("id") ON DELETE CASCADE ON UPDATE CASCADE;

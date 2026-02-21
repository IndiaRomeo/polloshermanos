/*
  Warnings:

  - You are about to drop the `Restock` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Restock" DROP CONSTRAINT "Restock_weekId_fkey";

-- DropTable
DROP TABLE "Restock";

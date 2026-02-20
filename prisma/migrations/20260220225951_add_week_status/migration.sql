-- CreateEnum
CREATE TYPE "WeekStatus" AS ENUM ('OPEN', 'CLOSED');

-- AlterTable
ALTER TABLE "Week" ADD COLUMN     "closedAt" TIMESTAMP(3),
ADD COLUMN     "status" "WeekStatus" NOT NULL DEFAULT 'OPEN';

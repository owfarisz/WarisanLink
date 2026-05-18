/*
  Warnings:

  - You are about to drop the column `contributorId` on the `Destination` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Destination` table. All the data in the column will be lost.
  - You are about to drop the column `verifiedAt` on the `Destination` table. All the data in the column will be lost.
  - You are about to drop the column `verifiedBy` on the `Destination` table. All the data in the column will be lost.
  - You are about to drop the `Contributor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `JourneyItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Contributor" DROP CONSTRAINT "Contributor_userId_fkey";

-- DropForeignKey
ALTER TABLE "Destination" DROP CONSTRAINT "Destination_contributorId_fkey";

-- DropForeignKey
ALTER TABLE "JourneyItem" DROP CONSTRAINT "JourneyItem_destinationId_fkey";

-- DropForeignKey
ALTER TABLE "JourneyItem" DROP CONSTRAINT "JourneyItem_userId_fkey";

-- DropIndex
DROP INDEX "Destination_status_idx";

-- AlterTable
ALTER TABLE "Destination" DROP COLUMN "contributorId",
DROP COLUMN "status",
DROP COLUMN "verifiedAt",
DROP COLUMN "verifiedBy";

-- DropTable
DROP TABLE "Contributor";

-- DropTable
DROP TABLE "JourneyItem";

-- DropTable
DROP TABLE "User";

-- DropEnum
DROP TYPE "DestinationStatus";

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "VisitHistory" (
    "id" SERIAL NOT NULL,
    "sessionId" VARCHAR(100) NOT NULL,
    "destinationId" INTEGER NOT NULL,
    "visitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisitHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VisitHistory_sessionId_idx" ON "VisitHistory"("sessionId");

-- CreateIndex
CREATE INDEX "VisitHistory_visitedAt_idx" ON "VisitHistory"("visitedAt");

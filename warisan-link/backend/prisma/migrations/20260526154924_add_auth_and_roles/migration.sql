-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPERADMIN', 'KONTRIBUTOR', 'TURIS');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'ACTIVE', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "DestinationStatus" AS ENUM ('PENDING', 'PUBLISHED', 'REJECTED');

-- AlterTable
ALTER TABLE "Destination" ADD COLUMN     "creatorId" TEXT,
ADD COLUMN     "destStatus" "DestinationStatus" NOT NULL DEFAULT 'PUBLISHED';

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'TURIS',
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
    "organization" VARCHAR(200),
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JourneyItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "destinationId" INTEGER NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JourneyItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "JourneyItem_userId_idx" ON "JourneyItem"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "JourneyItem_userId_destinationId_key" ON "JourneyItem"("userId", "destinationId");

-- CreateIndex
CREATE INDEX "Destination_destStatus_idx" ON "Destination"("destStatus");

-- AddForeignKey
ALTER TABLE "JourneyItem" ADD CONSTRAINT "JourneyItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyItem" ADD CONSTRAINT "JourneyItem_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Destination" ADD CONSTRAINT "Destination_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

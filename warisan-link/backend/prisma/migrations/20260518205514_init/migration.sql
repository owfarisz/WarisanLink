-- CreateEnum
CREATE TYPE "Role" AS ENUM ('GUEST', 'TRAVELER', 'CONTRIBUTOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "DestinationStatus" AS ENUM ('DRAFT', 'PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AccessLevel" AS ENUM ('EASY', 'MODERATE', 'REMOTE');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'TRAVELER',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifyToken" VARCHAR(255),
    "resetToken" VARCHAR(255),
    "resetExpiry" TIMESTAMP(3),
    "avatarUrl" VARCHAR(500),
    "country" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contributor" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "bio" TEXT,
    "region" VARCHAR(150),
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "badge" VARCHAR(100),
    "totalApproved" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contributor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "iconName" VARCHAR(50),
    "colorHex" VARCHAR(7),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Destination" (
    "id" SERIAL NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "province" VARCHAR(100) NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "shortDesc" VARCHAR(500) NOT NULL,
    "culturalMeaning" TEXT NOT NULL,
    "localHistory" TEXT NOT NULL,
    "malaysiaConnection" TEXT NOT NULL,
    "localEtiquette" TEXT,
    "coverImageUrl" VARCHAR(500),
    "galleryUrls" JSONB,
    "status" "DestinationStatus" NOT NULL DEFAULT 'DRAFT',
    "contributorId" INTEGER,
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" INTEGER,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Destination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessCompass" (
    "id" SERIAL NOT NULL,
    "destinationId" INTEGER NOT NULL,
    "nearestGateway" VARCHAR(200) NOT NULL,
    "entryPoint" VARCHAR(300),
    "distanceKm" DOUBLE PRECISION,
    "accessLevel" "AccessLevel" NOT NULL DEFAULT 'MODERATE',
    "weatherSummary" VARCHAR(500),
    "bestTimeToVisit" VARCHAR(300),
    "travelNotes" TEXT,
    "safetyNotes" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccessCompass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JourneyItem" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "destinationId" INTEGER NOT NULL,
    "note" VARCHAR(500),
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JourneyItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Contributor_userId_key" ON "Contributor"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Destination_slug_key" ON "Destination"("slug");

-- CreateIndex
CREATE INDEX "Destination_status_idx" ON "Destination"("status");

-- CreateIndex
CREATE INDEX "Destination_categoryId_idx" ON "Destination"("categoryId");

-- CreateIndex
CREATE INDEX "Destination_province_idx" ON "Destination"("province");

-- CreateIndex
CREATE UNIQUE INDEX "AccessCompass_destinationId_key" ON "AccessCompass"("destinationId");

-- CreateIndex
CREATE INDEX "JourneyItem_userId_idx" ON "JourneyItem"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "JourneyItem_userId_destinationId_key" ON "JourneyItem"("userId", "destinationId");

-- AddForeignKey
ALTER TABLE "Contributor" ADD CONSTRAINT "Contributor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Destination" ADD CONSTRAINT "Destination_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Destination" ADD CONSTRAINT "Destination_contributorId_fkey" FOREIGN KEY ("contributorId") REFERENCES "Contributor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessCompass" ADD CONSTRAINT "AccessCompass_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyItem" ADD CONSTRAINT "JourneyItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyItem" ADD CONSTRAINT "JourneyItem_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

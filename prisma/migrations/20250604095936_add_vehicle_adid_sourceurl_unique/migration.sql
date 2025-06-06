/*
  Warnings:

  - A unique constraint covering the columns `[adId]` on the table `Vehicle` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sourceUrl]` on the table `Vehicle` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "adId" TEXT,
ADD COLUMN     "sourceUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_adId_key" ON "Vehicle"("adId");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_sourceUrl_key" ON "Vehicle"("sourceUrl");

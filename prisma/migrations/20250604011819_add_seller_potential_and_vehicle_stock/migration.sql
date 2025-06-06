-- AlterEnum
ALTER TYPE "VehicleStatus" ADD VALUE 'IN_STOCK';

-- AlterTable
ALTER TABLE "Seller" ADD COLUMN     "isPotential" BOOLEAN NOT NULL DEFAULT true;

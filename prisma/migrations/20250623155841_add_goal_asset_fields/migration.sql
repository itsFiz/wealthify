-- AlterTable
ALTER TABLE "goals" ADD COLUMN     "depreciationRate" DECIMAL(65,30),
ADD COLUMN     "downPaymentRatio" DECIMAL(65,30),
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "initialAssetPrice" DECIMAL(65,30),
ADD COLUMN     "isAssetGoal" BOOLEAN DEFAULT false,
ADD COLUMN     "projectedPrice" DECIMAL(65,30);

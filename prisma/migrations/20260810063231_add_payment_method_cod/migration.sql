-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('COD', 'VIETQR');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "isPaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'VIETQR',
ADD COLUMN     "trackingNote" TEXT;

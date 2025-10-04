-- CreateEnum
CREATE TYPE "public"."TransactionType" AS ENUM ('INCOME', 'EXPENSE');

-- AlterTable
ALTER TABLE "public"."Record" ADD COLUMN     "type" "public"."TransactionType" NOT NULL DEFAULT 'EXPENSE';

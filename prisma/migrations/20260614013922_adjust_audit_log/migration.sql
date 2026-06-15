/*
  Warnings:

  - You are about to drop the column `taskId` on the `audit_logs` table. All the data in the column will be lost.
  - Added the required column `action` to the `audit_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entityId` to the `audit_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entityType` to the `audit_logs` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_taskId_fkey";

-- DropIndex
DROP INDEX "audit_logs_actorId_idx";

-- DropIndex
DROP INDEX "audit_logs_createdAt_idx";

-- DropIndex
DROP INDEX "audit_logs_taskId_idx";

-- AlterTable
ALTER TABLE "audit_logs" DROP COLUMN "taskId",
ADD COLUMN     "action" TEXT NOT NULL,
ADD COLUMN     "entityId" TEXT NOT NULL,
ADD COLUMN     "entityType" TEXT NOT NULL,
ADD COLUMN     "newValue" JSONB,
ADD COLUMN     "oldValue" JSONB,
ALTER COLUMN "fromStatus" DROP NOT NULL,
ALTER COLUMN "toStatus" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "audit_logs_entityId_createdAt_idx" ON "audit_logs"("entityId", "createdAt");

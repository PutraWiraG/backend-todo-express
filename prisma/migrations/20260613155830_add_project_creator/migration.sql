/*
  Warnings:

  - Added the required column `createdById` to the `projects` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "createdById" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "projects_createdById_idx" ON "projects"("createdById");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

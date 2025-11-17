/*
  Warnings:

  - A unique constraint covering the columns `[presentable_id]` on the table `chapter_member` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "chapter_member" ADD COLUMN     "presentable_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "chapter_member_presentable_id_key" ON "chapter_member"("presentable_id");

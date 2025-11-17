/*
  Warnings:

  - A unique constraint covering the columns `[presentable_id]` on the table `rsvp` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "rsvp" ADD COLUMN     "presentable_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "rsvp_presentable_id_key" ON "rsvp"("presentable_id");

/*
  Warnings:

  - A unique constraint covering the columns `[presentable_id]` on the table `event` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `presentable_id` to the `event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "event" ADD COLUMN     "presentable_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "event_presentable_id_key" ON "event"("presentable_id");

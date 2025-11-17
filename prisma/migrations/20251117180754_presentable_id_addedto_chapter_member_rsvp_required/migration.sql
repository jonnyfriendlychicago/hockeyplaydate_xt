/*
  Warnings:

  - Made the column `presentable_id` on table `chapter_member` required. This step will fail if there are existing NULL values in that column.
  - Made the column `presentable_id` on table `rsvp` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "chapter_member" ALTER COLUMN "presentable_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "rsvp" ALTER COLUMN "presentable_id" SET NOT NULL;

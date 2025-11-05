/*
  Warnings:

  - Added the required column `created_by` to the `rsvp` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_by` to the `rsvp` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "rsvp" ADD COLUMN     "created_by" INTEGER NOT NULL,
ADD COLUMN     "players_adult" INTEGER DEFAULT 0,
ADD COLUMN     "players_youth" INTEGER DEFAULT 0,
ADD COLUMN     "spectators_adult" INTEGER DEFAULT 0,
ADD COLUMN     "spectators_youth" INTEGER DEFAULT 0,
ADD COLUMN     "updated_by" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "rsvp" ADD CONSTRAINT "rsvp_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user_profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rsvp" ADD CONSTRAINT "rsvp_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "user_profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

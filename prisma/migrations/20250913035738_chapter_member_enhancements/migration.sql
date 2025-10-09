-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "MemberRole" ADD VALUE 'APPLICANT';
ALTER TYPE "MemberRole" ADD VALUE 'REMOVED';

-- AlterTable
ALTER TABLE "chapter_member" ADD COLUMN     "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3),
ADD COLUMN     "updated_by" INTEGER;

-- AddForeignKey
ALTER TABLE "chapter_member" ADD CONSTRAINT "chapter_member_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "user_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

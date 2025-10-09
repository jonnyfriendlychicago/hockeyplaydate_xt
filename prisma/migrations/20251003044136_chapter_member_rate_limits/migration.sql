-- AlterTable
ALTER TABLE "chapter_member" ADD COLUMN     "join_request_count" INTEGER DEFAULT 0,
ADD COLUMN     "last_join_request_at" TIMESTAMP(3);

-- DropIndex
DROP INDEX "auth_user_auth0_id_key";

-- AlterTable
ALTER TABLE "auth_user" ADD COLUMN     "duplicateof_id" INTEGER;

-- AddForeignKey
ALTER TABLE "auth_user" ADD CONSTRAINT "auth_user_duplicateof_id_fkey" FOREIGN KEY ("duplicateof_id") REFERENCES "auth_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

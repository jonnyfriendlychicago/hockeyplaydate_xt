/*
  Warnings:

  - A unique constraint covering the columns `[auth0_id]` on the table `auth_user` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "auth_user_email_key";

-- CreateIndex
CREATE UNIQUE INDEX "auth_user_auth0_id_key" ON "auth_user"("auth0_id");

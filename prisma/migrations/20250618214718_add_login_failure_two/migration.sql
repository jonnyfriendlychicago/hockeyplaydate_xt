-- CreateTable
CREATE TABLE "login_error" (
    "id" SERIAL NOT NULL,
    "presentable_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "error_code" TEXT,
    "email" TEXT,
    "auth0_id" TEXT,

    CONSTRAINT "login_error_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "login_error_presentable_id_key" ON "login_error"("presentable_id");

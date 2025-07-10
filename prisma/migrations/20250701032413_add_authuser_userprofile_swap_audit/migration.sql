-- CreateTable
CREATE TABLE "authuser_userprofile_swap_audit" (
    "id" SERIAL NOT NULL,
    "promoted_auth_user_email" INTEGER,
    "demoted_auth_user_email" INTEGER,
    "promoted_auth_user_auth0_id" TEXT,
    "demoted_auth_user_auth0_id" TEXT,
    "promoted_auth_user_id" INTEGER,
    "promoted_auth_user_duplicateof_id_initial" INTEGER,
    "promoted_auth_user_duplicateof_id_post" INTEGER,
    "demoted_auth_user_id" INTEGER,
    "demoted_auth_user_duplicateof_id_initial" INTEGER,
    "demoted_auth_user_duplicateof_id_post" INTEGER,
    "maintained_user_profile_id" INTEGER,
    "maintained_user_profile_user_id_initial" INTEGER,
    "maintained_user_profile_user_id_post" INTEGER,
    "precluded_user_profile_id" INTEGER,
    "precluded_user_profile_userid_initial" INTEGER,
    "precluded_user_profile_userid_post" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "authuser_userprofile_swap_audit_pkey" PRIMARY KEY ("id")
);

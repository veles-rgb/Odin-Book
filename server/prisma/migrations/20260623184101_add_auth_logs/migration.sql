-- CreateEnum
CREATE TYPE "AuthAction" AS ENUM ('LOGIN', 'REGISTER');

-- CreateTable
CREATE TABLE "AuthLog" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "ip_address" TEXT NOT NULL,
    "action" "AuthAction" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuthLog_user_id_idx" ON "AuthLog"("user_id");

-- CreateIndex
CREATE INDEX "AuthLog_ip_address_idx" ON "AuthLog"("ip_address");

-- CreateIndex
CREATE INDEX "AuthLog_action_idx" ON "AuthLog"("action");

-- CreateIndex
CREATE INDEX "AuthLog_created_at_idx" ON "AuthLog"("created_at");

-- AddForeignKey
ALTER TABLE "AuthLog" ADD CONSTRAINT "AuthLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

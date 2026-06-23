-- AlterTable
ALTER TABLE "User" ADD COLUMN     "is_banned" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "IpBan" (
    "id" UUID NOT NULL,
    "ip_address" TEXT NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IpBan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IpBan_ip_address_key" ON "IpBan"("ip_address");

-- CreateIndex
CREATE INDEX "IpBan_ip_address_idx" ON "IpBan"("ip_address");

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "first_name" VARCHAR(20) NOT NULL,
    "last_name" VARCHAR(40) NOT NULL,
    "username" TEXT NOT NULL,
    "hashed_password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "profile_picture_url" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

ALTER TABLE "User" 
ADD CONSTRAINT "username_format_check" 
CHECK ("username" ~ '^[a-zA-Z0-9._]+$');
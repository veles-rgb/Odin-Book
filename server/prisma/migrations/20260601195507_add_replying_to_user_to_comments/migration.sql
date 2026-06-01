-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "replying_to_user_id" UUID;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_replying_to_user_id_fkey" FOREIGN KEY ("replying_to_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

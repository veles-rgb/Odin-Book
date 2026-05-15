/*
  Warnings:

  - A unique constraint covering the columns `[user_id,comment_id]` on the table `commentLike` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "commentLike_user_id_comment_id_key" ON "commentLike"("user_id", "comment_id");

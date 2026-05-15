-- CreateTable
CREATE TABLE "commentLike" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "comment_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commentLike_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "commentLike" ADD CONSTRAINT "commentLike_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commentLike" ADD CONSTRAINT "commentLike_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

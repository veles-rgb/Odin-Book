const { prisma } = require('../../lib/prisma.mjs');
const { validate: isUUID } = require("uuid");

async function createComment(req, res, next) {
    try {
        const user = req.user;
        const { id } = req.params;
        const { content } = req.body;

        const trimmedContent = content.trim();
        if (!isUUID(id)) return res.status(400).json({ error: "Invalid Post ID." });
        if (!trimmedContent) return res.status(400).json({ error: "Comment cannot be blank." });

        const post = await prisma.post.findFirst({
            where: {
                id
            }
        });

        if (!post) return res.status(404).json({ error: "The post you're trying to comment on either doesn't exist or was removed." });

        const comment = await prisma.comment.create({
            data: {
                user_id: user.id,
                post_id: id,
                content: trimmedContent,
            },
            select: {
                id: true,
                user_id: true,
                post_id: true,
                created_at: true,
                content: true,
                user: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        username: true,
                        profile_picture_url: true
                    },
                },
            },
        });

        return res.status(201).json({ comment });

    } catch (error) {
        return next(error);
    }
}

async function editComment(req, res, next) {
    try {
        const user = req.user;
        const { id } = req.params;
        const { content } = req.body;

        if (!isUUID(id)) {
            return res.status(400).json({
                error: "Invalid Comment ID.",
            });
        }

        if (!content) {
            return res.status(400).json({
                error: "Comment cannot be blank.",
            });
        }

        const trimmedContent = content.trim();

        if (!trimmedContent) {
            return res.status(400).json({
                error: "Comment cannot be blank.",
            });
        }

        const comment = await prisma.comment.findFirst({
            where: {
                id,
            },
        });

        if (!comment) {
            return res.status(404).json({
                error: "Comment does not exist.",
            });
        }

        if (comment.user_id !== user.id) {
            return res.sendStatus(403);
        }

        if (comment.content === trimmedContent) {
            return res.status(400).json({
                error: "No changes were made.",
            });
        }

        const updatedComment = await prisma.comment.update({
            where: {
                id,
            },
            data: {
                content: trimmedContent,
            },
            select: {
                id: true,
                parent_id: true,
                post_id: true,
                user_id: true,
                content: true,
                created_at: true,
                user: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        username: true,
                        profile_picture_url: true,
                    },
                },
            },
        });

        return res.status(200).json({ updatedComment });

    } catch (error) {
        return next(error);
    }
}

async function deleteComment(req, res, next) {
    try {
        const user = req.user;
        const { id } = req.params;

        if (!isUUID(id)) return res.status(400).json({ error: "Invalid comment ID." });

        const comment = await prisma.comment.findFirst({
            where: {
                id,
                user_id: user.id,
            },
        });

        if (!comment) return res.status(404).json({ error: "Comment not found." });

        const deletedComment = await prisma.comment.delete({
            where: {
                id,
            },
        });

        return res.status(200).json({ deletedComment });
    } catch (error) {
        return next(error);
    }
}

async function createReplyComment(req, res, next) {
    try {
        const user = req.user;
        const { id } = req.params;
        const { content } = req.body;

        if (!isUUID(id)) {
            return res.status(400).json({ error: "Invalid comment ID." });
        }

        if (typeof content !== "string" || !content.trim()) {
            return res.status(400).json({ error: "Reply comment cannot be blank." });
        }

        const trimmedContent = content.trim();

        const parentComment = await prisma.comment.findFirst({
            where: {
                id,
            },
        });

        if (!parentComment) {
            return res.status(404).json({
                error: "The comment you're trying to reply to either doesn't exist or was removed.",
            });
        }

        const topLevelParentId = parentComment.parent_id || parentComment.id;

        const comment = await prisma.comment.create({
            data: {
                content: trimmedContent,
                parent_id: topLevelParentId,
                post_id: parentComment.post_id,
                user_id: user.id,
                replying_to_user_id: parentComment.user_id,
            },
            select: {
                id: true,
                post_id: true,
                parent_id: true,
                user_id: true,
                replying_to_user_id: true,
                content: true,
                created_at: true,
                updated_at: true,

                user: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        username: true,
                        profile_picture_url: true,
                    },
                },

                replyingToUser: {
                    select: {
                        id: true,
                        username: true,
                    },
                },

                _count: {
                    select: {
                        commentLikes: true,
                    },
                },

                commentLikes: {
                    where: {
                        user_id: user.id,
                    },
                    select: {
                        id: true,
                    },
                },
            },
        });

        const formattedReply = {
            id: comment.id,
            post_id: comment.post_id,
            parent_id: comment.parent_id,
            user_id: comment.user_id,
            replying_to_user_id: comment.replying_to_user_id,
            content: comment.content,
            created_at: comment.created_at,
            updated_at: comment.updated_at,
            user: comment.user,
            replyingToUser: comment.replyingToUser,
            likeCount: comment._count.commentLikes,
            likedByMe: comment.commentLikes.length > 0,
        };

        return res.status(201).json({ comment: formattedReply });

    } catch (error) {
        return next(error);
    }
}

async function getCommentById(req, res, next) {
    try {
        const user = req.user;
        const { id } = req.params;

        if (!isUUID(id)) {
            return res.status(400).json({ error: "Invalid comment ID." });
        }

        const comment = await prisma.comment.findFirst({
            where: {
                id,
            },
            select: {
                id: true,
                parent_id: true,
                post_id: true,
                user_id: true,
                replying_to_user_id: true,
                content: true,
                created_at: true,
                updated_at: true,

                user: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        username: true,
                        profile_picture_url: true,
                    },
                },

                replyingToUser: {
                    select: {
                        id: true,
                        username: true,
                    },
                },

                _count: {
                    select: {
                        commentLikes: true,
                        comments: true,
                    },
                },

                commentLikes: {
                    where: {
                        user_id: user.id,
                    },
                    select: {
                        id: true,
                    },
                },
            },
        });

        if (!comment) {
            return res.status(404).json({ error: "Comment not found." });
        }

        const formattedComment = {
            id: comment.id,
            post_id: comment.post_id,
            parent_id: comment.parent_id,
            user_id: comment.user_id,
            replying_to_user_id: comment.replying_to_user_id,
            content: comment.content,
            created_at: comment.created_at,
            updated_at: comment.updated_at,
            user: comment.user,
            replyingToUser: comment.replyingToUser,
            likeCount: comment._count.commentLikes,
            likedByMe: comment.commentLikes.length > 0,
            replyCount: comment._count.comments,
        };

        return res.status(200).json({ comment: formattedComment });

    } catch (error) {
        return next(error);
    }
}

async function getPostComments(req, res, next) {
    try {
        const user = req.user;
        const { id } = req.params;

        if (!isUUID(id)) {
            return res.status(400).json({ error: "Invalid post ID." });
        }

        const post = await prisma.post.findFirst({
            where: {
                id,
            },
        });

        if (!post) {
            return res.status(404).json({ error: "Post not found." });
        }

        const comments = await prisma.comment.findMany({
            where: {
                post_id: id,
                parent_id: null,
            },
            orderBy: {
                created_at: "asc",
            },
            select: {
                id: true,
                post_id: true,
                parent_id: true,
                user_id: true,
                replying_to_user_id: true,
                content: true,
                created_at: true,
                updated_at: true,

                user: {
                    select: {
                        id: true,
                        username: true,
                        first_name: true,
                        last_name: true,
                        profile_picture_url: true,
                    },
                },

                replyingToUser: {
                    select: {
                        id: true,
                        username: true,
                    },
                },

                _count: {
                    select: {
                        commentLikes: true,
                        comments: true,
                    },
                },

                commentLikes: {
                    where: {
                        user_id: user.id,
                    },
                    select: {
                        id: true,
                    },
                },
            },
        });

        const formattedComments = comments.map((comment) => ({
            id: comment.id,
            post_id: comment.post_id,
            parent_id: comment.parent_id,
            user_id: comment.user_id,
            replying_to_user_id: comment.replying_to_user_id,
            content: comment.content,
            created_at: comment.created_at,
            updated_at: comment.updated_at,
            user: comment.user,
            replyingToUser: comment.replyingToUser,
            likeCount: comment._count.commentLikes,
            likedByMe: comment.commentLikes.length > 0,
            replyCount: comment._count.comments,
        }));

        return res.status(200).json({
            comments: formattedComments,
        });

    } catch (error) {
        return next(error);
    }
}

async function getCommentReplies(req, res, next) {
    try {
        const user = req.user;
        const { id } = req.params;

        if (!isUUID(id)) {
            return res.status(400).json({
                error: "Invalid comment ID.",
            });
        }

        const comment = await prisma.comment.findFirst({
            where: {
                id,
            },
        });

        if (!comment) {
            return res.status(404).json({
                error: "Comment not found.",
            });
        }

        const replies = await prisma.comment.findMany({
            where: {
                parent_id: id,
            },
            orderBy: {
                created_at: "asc",
            },
            select: {
                id: true,
                post_id: true,
                parent_id: true,
                user_id: true,
                replying_to_user_id: true,
                content: true,
                created_at: true,
                updated_at: true,

                user: {
                    select: {
                        id: true,
                        username: true,
                        first_name: true,
                        last_name: true,
                        profile_picture_url: true,
                    },
                },

                replyingToUser: {
                    select: {
                        id: true,
                        username: true,
                    },
                },

                _count: {
                    select: {
                        commentLikes: true,
                    },
                },

                commentLikes: {
                    where: {
                        user_id: user.id,
                    },
                    select: {
                        id: true,
                    },
                },
            },
        });

        const formattedReplies = replies.map((reply) => ({
            id: reply.id,
            post_id: reply.post_id,
            parent_id: reply.parent_id,
            user_id: reply.user_id,
            replying_to_user_id: reply.replying_to_user_id,
            content: reply.content,
            created_at: reply.created_at,
            updated_at: reply.updated_at,
            user: reply.user,
            replyingToUser: reply.replyingToUser,
            likeCount: reply._count.commentLikes,
            likedByMe: reply.commentLikes.length > 0,
        }));

        return res.status(200).json({
            replies: formattedReplies,
        });

    } catch (error) {
        return next(error);
    }
}

module.exports = {
    createComment,
    editComment,
    deleteComment,
    createReplyComment,
    getCommentById,
    getPostComments,
    getCommentReplies,
};
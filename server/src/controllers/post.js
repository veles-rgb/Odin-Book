const { prisma } = require('../../lib/prisma.mjs');
const { validate: isUUID } = require("uuid");

async function createPost(req, res, next) {
    try {
        const user = req.user;
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ error: "Post content is required" });
        }

        const trimmedContent = content.trim();

        if (!trimmedContent) {
            return res.status(400).json({ error: "Post content is required" });
        }

        const post = await prisma.post.create({
            data: {
                user_id: user.id,
                content: trimmedContent,
            },
        });

        return res.status(201).json({ post });
    } catch (error) {
        return next(error);
    }
}

async function editPost(req, res, next) {
    try {
        const { id } = req.params;
        const user = req.user;
        const { content } = req.body;

        if (!isUUID(id)) return res.status(400).json({ error: "Invalid Post ID" });
        if (!id) return res.status(400).json({ error: "Post ID is required" });
        if (!content) return res.status(400).json({ error: "Content is required" });

        const trimmedContent = content.trim();

        if (!trimmedContent) return res.status(400).json({ error: "Content is required" });

        const post = await prisma.post.findFirst({
            where: {
                id,
                user_id: user.id,
            },
            select: {
                id: true,
                content: true,
                created_at: true,
                user: {
                    select: {
                        id: true,
                        username: true,
                        first_name: true,
                        last_name: true,
                        created_at: true,
                        profile_picture_url: true,
                    },
                },
            },
        });

        if (!post) return res.status(404).json({ error: "Post not found" });
        if (post.content === trimmedContent) return res.status(400).json({ error: "No changes were made" });

        const updatedPost = await prisma.post.update({
            where: {
                id: post.id,
            },
            data: {
                content: trimmedContent
            }
        });

        return res.status(200).json({ updatedPost });
    } catch (error) {
        return next(error);
    }
}

async function deletePost(req, res, next) {
    try {
        const user = req.user;
        const { id } = req.params;

        if (!isUUID(id)) return res.status(400).json({ error: "Invalid Post ID" });

        const post = await prisma.post.findFirst({
            where: {
                id,
                user_id: user.id
            }
        });

        if (!post) return res.status(404).json({ error: "Post not found" });

        const deletedPost = await prisma.post.delete({
            where: {
                id,
            },
        });

        return res.status(200).json({ deletedPost });
    } catch (error) {
        return next(error);
    }
}

async function getPostById(req, res, next) {
    try {
        const { id } = req.params;
        const user = req.user;

        if (!isUUID(id)) {
            return res.status(400).json({ error: "Invalid Post ID" });
        }

        const post = await prisma.post.findFirst({
            where: {
                id,
            },
            select: {
                id: true,
                user_id: true,
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

                _count: {
                    select: {
                        postLikes: true,
                        comments: true,
                    },
                },

                postLikes: {
                    where: {
                        user_id: user.id,
                    },
                    select: {
                        id: true,
                    },
                },

                comments: {
                    where: {
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

                        comments: {
                            orderBy: {
                                created_at: "asc",
                            },
                            select: {
                                id: true,
                                post_id: true,
                                parent_id: true,
                                user_id: true,
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
                        },
                    },
                },
            },
        });

        if (!post) {
            return res.status(404).json({
                error: "Post not found. It either does not exist or was removed.",
            });
        }

        const formattedComments = post.comments.map((comment) => {
            const formattedReplies = comment.comments.map((reply) => ({
                id: reply.id,
                post_id: reply.post_id,
                parent_id: reply.parent_id,
                user_id: reply.user_id,
                content: reply.content,
                created_at: reply.created_at,
                updated_at: reply.updated_at,
                user: reply.user,
                likeCount: reply._count.commentLikes,
                likedByMe: reply.commentLikes.length > 0,
            }));

            return {
                id: comment.id,
                post_id: comment.post_id,
                parent_id: comment.parent_id,
                user_id: comment.user_id,
                content: comment.content,
                created_at: comment.created_at,
                updated_at: comment.updated_at,
                user: comment.user,
                likeCount: comment._count.commentLikes,
                likedByMe: comment.commentLikes.length > 0,
                replyCount: comment._count.comments,
                replies: formattedReplies,
            };
        });

        const formattedPost = {
            id: post.id,
            user_id: post.user_id,
            content: post.content,
            created_at: post.created_at,
            updated_at: post.updated_at,
            user: post.user,
            likeCount: post._count.postLikes,
            likedByMe: post.postLikes.length > 0,
            commentCount: post._count.comments,
            comments: formattedComments,
        };

        return res.status(200).json({ post: formattedPost });
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    createPost,
    editPost,
    deletePost,
    getPostById,
};
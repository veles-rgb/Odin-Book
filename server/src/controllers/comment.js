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
        const { id } = req.params; // comment id
        const { content } = req.body;

        const trimmedContent = content.trim();
        if (!isUUID(id)) return res.status(400).json({ error: "Invalid post ID." });
        if (!trimmedContent) return res.status(400).json({ error: "Reply comment cannot be blank." });

        const parentComment = await prisma.comment.findFirst({
            where: {
                id,
            },
        });
        if (!parentComment) return res.status(404).json({ error: "The comment you're trying to reply to either doesn't exist or was removed." });

        const comment = await prisma.comment.create({
            data: {
                content: trimmedContent,
                parent_id: parentComment.id,
                post_id: parentComment.post_id,
                user_id: user.id,
            },
            select: {
                id: true,
                post_id: true,
                parent_id: true,
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

module.exports = {
    createComment,
    editComment,
    deleteComment,
    createReplyComment,
};
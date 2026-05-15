const { prisma } = require('../../lib/prisma.mjs');
const { validate: isUUID } = require("uuid");

// Posts
async function createPostLike(req, res, next) {
    try {
        const { id } = req.params;
        const user = req.user;

        if (!isUUID(id)) return res.status(400).json({ error: "Invalid post ID." });

        const post = await prisma.post.findFirst({
            where: {
                id,
            },
        });

        if (!post) return res.status(404).json({ error: "Post not found." });

        const alreadyLiked = await prisma.postLike.findFirst({
            where: {
                post_id: post.id,
                user_id: user.id,
            },
        });

        if (alreadyLiked) return res.status(400).json({ error: "You already liked this post." });

        const postLike = await prisma.postLike.create({
            data: {
                post_id: post.id,
                user_id: user.id,
            },
        });

        return res.status(201).json({ postLike });
    } catch (error) {
        return next(error);
    }
}

async function deletePostLike(req, res, next) {
    try {
        const user = req.user;
        const { id } = req.params;

        if (!isUUID(id)) return res.status(400).json({ error: "Invalid post ID." });

        const post = await prisma.post.findFirst({
            where: {
                id,
            },
        });

        if (!post) return res.status(404).json({ error: "Post not found." });

        const like = await prisma.postLike.findFirst({
            where: {
                post_id: post.id,
                user_id: user.id,
            },
        });

        if (!like) return res.status(404).json({ error: "You have not liked this post." });

        const deletedLike = await prisma.postLike.delete({
            where: {
                user_id_post_id: {
                    user_id: user.id,
                    post_id: post.id,
                },
            },
        });

        return res.status(200).json({ deletedLike });
    } catch (error) {
        return next(error);
    }
}

async function createCommentLike(req, res, next) {
    try {
        const { id } = req.params; //Comment ID
        const user = req.user;

        if (!isUUID(id)) return res.status(400).json({ error: "Invalid comment ID." });

        const comment = await prisma.comment.findFirst({
            where: {
                id,
            },
        });

        if (!comment) res.status(404).json({ error: "Comment not found." });

        const alreadyLiked = await prisma.commentLike.findFirst({
            where: {
                comment_id: comment.id,
                user_id: user.id,
            },
        });

        if (alreadyLiked) return res.status(400).json({ error: "You already liked this comment." });

        const commentLike = await prisma.commentLike.create({
            data: {
                comment_id: comment.id,
                user_id: user.id,
            },
        });

        return res.status(201).json({ commentLike });
    } catch (error) {
        return next(error);
    }
}

async function deleteCommentLike(req, res, next) {
    try {
        const user = req.user;
        const { id } = req.params;

        if (!isUUID(id)) return res.status(400).json({ error: "Invalid comment ID." });

        const comment = await prisma.comment.findFirst({
            where: {
                id,
            },
        });

        if (!comment) return res.status(404).json({ error: "Comment not found." });

        const like = await prisma.commentLike.findFirst({
            where: {
                comment_id: comment.id,
                user_id: user.id,
            },
        });

        if (!like) return res.status(404).json({ error: "You have not liked this comment." });

        const deletedLike = await prisma.commentLike.delete({
            where: {
                user_id_comment_id: {
                    user_id: user.id,
                    comment_id: comment.id,
                },
            },
        });

        return res.status(200).json({ deletedLike });
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    createPostLike,
    deletePostLike,
    createCommentLike,
    deleteCommentLike,
};
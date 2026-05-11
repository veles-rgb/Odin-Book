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
                    },
                },
            },
        });

        if (!post) return res.status(404).json({ error: "Post not found" });
        if (post.content === trimmedContent) return res.status(400).json({ error: "No changes were made" });

        const updatedPost = await prisma.post.update({
            where: {
                id: post.id,
                user_id: user.id,
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

module.exports = {
    createPost,
    editPost,
};
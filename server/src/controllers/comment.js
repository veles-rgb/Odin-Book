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

module.exports = {
    createComment,

};
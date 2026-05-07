const { prisma } = require('../../lib/prisma.mjs');
const { validate: isUUID } = require("uuid");

async function getUser(req, res, next) {
    try {
        const { identifier } = req.params;

        let user;

        if (isUUID(identifier)) {
            user = await prisma.user.findUnique({
                where: {
                    id: identifier,
                },
                select: {
                    id: true,
                    username: true,
                    first_name: true,
                    last_name: true,
                    profile_picture_url: true,
                    created_at: true,
                }
            });
        } else {
            user = await prisma.user.findUnique({
                where: {
                    username: identifier
                },
                select: {
                    id: true,
                    username: true,
                    first_name: true,
                    last_name: true,
                    profile_picture_url: true,
                    created_at: true,
                }
            });
        }

        if (!user) {
            return res.status(404).json({
                error: "User not found",
            });
        }

        res.status(200).json({ user });

    } catch (error) {
        return next(error);
    }
}

module.exports = {
    getUser,
};
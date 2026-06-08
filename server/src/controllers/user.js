const { prisma } = require('../../lib/prisma.mjs');
const { validate: isUUID } = require("uuid");

async function getUser(req, res, next) {
    try {
        const user = req.user;
        const { identifier } = req.params;
        let profileUser;

        const userSelect = {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
            profile_picture_url: true,
            created_at: true,

            _count: {
                select: {
                    followers: true,
                    following: true,
                },
            },
        };

        if (isUUID(identifier)) {
            profileUser = await prisma.user.findUnique({
                where: {
                    id: identifier,
                },
                select: userSelect,
            });
        } else {
            profileUser = await prisma.user.findUnique({
                where: {
                    username: identifier,
                },
                select: userSelect,
            });
        }

        if (!profileUser) {
            return res.status(404).json({
                error: "User not found",
            });
        }

        const [follows, followRequests] = await prisma.$transaction([
            prisma.follow.findMany({
                where: {
                    OR: [
                        {
                            follower_id: user.id,
                            following_id: profileUser.id,
                        },
                        {
                            follower_id: profileUser.id,
                            following_id: user.id,
                        },
                    ],
                },
            }),

            prisma.followRequest.findMany({
                where: {
                    OR: [
                        {
                            requester_id: user.id,
                            receiver_id: profileUser.id,
                        },
                        {
                            requester_id: profileUser.id,
                            receiver_id: user.id,
                        },
                    ],
                },
            }),
        ]);

        const isFollowing = follows.some(
            (follow) =>
                follow.follower_id === user.id &&
                follow.following_id === profileUser.id
        );

        const isFollowedBy = follows.some(
            (follow) =>
                follow.follower_id === profileUser.id &&
                follow.following_id === user.id
        );

        const outgoingRequestPending = followRequests.some(
            (request) =>
                request.requester_id === user.id &&
                request.receiver_id === profileUser.id
        );

        const incomingRequestPending = followRequests.some(
            (request) =>
                request.requester_id === profileUser.id &&
                request.receiver_id === user.id
        );

        const formattedProfileUser = {
            id: profileUser.id,
            username: profileUser.username,
            first_name: profileUser.first_name,
            last_name: profileUser.last_name,
            profile_picture_url: profileUser.profile_picture_url,
            created_at: profileUser.created_at,
            followerCount: profileUser._count.followers,
            followingCount: profileUser._count.following,
        };

        const relationship = {
            isFollowing,
            isFollowedBy,
            outgoingRequestPending,
            incomingRequestPending,
        };

        return res.status(200).json({
            profileUser: formattedProfileUser,
            relationship,
        });
    } catch (error) {
        return next(error);
    }
}

async function searchUser(req, res, next) {
    try {
        const search = req.query.search?.trim();

        if (!search) return res.status(400).json({ error: "Search is required" });

        const parts = search.split(/\s+/);

        const users = await prisma.user.findMany({
            where: {
                OR: [
                    {
                        username: {
                            contains: search,
                            mode: 'insensitive'
                        },
                    },
                    {
                        first_name: {
                            contains: search,
                            mode: 'insensitive'
                        },
                    },
                    {
                        last_name: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                    ...(parts.length >= 2
                        ? [
                            {
                                AND: [
                                    {
                                        first_name: {
                                            contains: parts[0],
                                            mode: 'insensitive',
                                        },
                                    },
                                    {
                                        last_name: {
                                            contains: parts.slice(1).join(" "),
                                            mode: 'insensitive',
                                        },
                                    },
                                ],
                            },
                        ]
                        : []),
                ],
            },
            select: {
                id: true,
                username: true,
                first_name: true,
                last_name: true,
                profile_picture_url: true
            },
            take: 20
        });

        return res.status(200).json({ users });
    } catch (error) {
        return next(error);
    }
}

async function updateUser(req, res, next) {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const {
            first_name,
            last_name,
            username,
            profile_picture_url,
        } = req.body;

        if (id !== userId) {
            return res.sendStatus(403);
        }

        const data = {};

        if (first_name !== undefined) {
            const trimmed = first_name.trim();

            if (!trimmed) {
                return res.status(400).json({
                    error: "First name cannot be empty",
                });
            }

            data.first_name = trimmed;
        }

        if (last_name !== undefined) {
            const trimmed = last_name.trim();

            if (!trimmed) {
                return res.status(400).json({
                    error: "Last name cannot be empty",
                });
            }

            data.last_name = trimmed;
        }

        if (username !== undefined) {
            const trimmed = username.trim();

            if (!trimmed) {
                return res.status(400).json({
                    error: "Username cannot be empty",
                });
            }

            data.username = trimmed;
        }

        if (profile_picture_url !== undefined) {
            data.profile_picture_url = profile_picture_url;
        }

        if (Object.keys(data).length === 0) {
            return res.status(400).json({
                error: "No changes were made",
            });
        }

        const updatedUser = await prisma.user.update({
            where: {
                id,
            },
            data,
            select: {
                id: true,
                username: true,
                first_name: true,
                last_name: true,
                profile_picture_url: true,
                created_at: true,
            },
        });

        return res.status(200).json({
            message: "Profile updated",
            user: updatedUser,
        });

    } catch (error) {
        if (error.code === "P2002") {
            return res.status(409).json({
                error: "Username already taken",
            });
        }

        return next(error);
    }
}

module.exports = {
    getUser,
    searchUser,
    updateUser
};
const { prisma } = require('../../lib/prisma.mjs');
const { validate: isUUID } = require("uuid");

async function sendFollowRequest(req, res, next) {
    try {
        const user = req.user;
        const { id } = req.params;

        if (!isUUID(id)) return res.status(400).json({ error: "Invalid user ID." });

        const requestedUser = await prisma.user.findFirst({
            where: {
                id,
            },
        });

        if (!requestedUser) return res.status(404).json({ error: "That user does not exist." });

        if (requestedUser.id === user.id) return res.status(400).json({ error: "You cannot follow yourself." });

        // Check if already requested or following
        const checkAlreadyFollowing = await prisma.follow.findFirst({
            where: {
                follower_id: user.id,
                following_id: requestedUser.id,
            },
        });

        if (checkAlreadyFollowing) return res.status(409).json({ error: "You already follow this user." });

        const checkAlreadyRequested = await prisma.followRequest.findFirst({
            where: {
                requester_id: user.id,
                receiver_id: requestedUser.id,
            },
        });

        if (checkAlreadyRequested) return res.status(409).json({ error: "You already requested to follow this user." });

        const followRequest = await prisma.followRequest.create({
            data: {
                requester_id: user.id,
                receiver_id: requestedUser.id,
            },
        });

        return res.status(201).json({ follow_request: followRequest });
    } catch (error) {
        if (error.code === "P2002") {
            return res.status(409).json({
                error: "You already requested to follow this user.",
            });
        }

        return next(error);
    }
}

async function cancelFollowRequest(req, res, next) {
    try {
        const user = req.user;
        const { id } = req.params;

        if (!isUUID(id)) {
            return res.status(400).json({
                error: "Invalid user ID.",
            });
        }

        const followRequest = await prisma.followRequest.findFirst({
            where: {
                requester_id: user.id,
                receiver_id: id,
            },
        });

        if (!followRequest) {
            return res.status(404).json({
                error: "That follow request does not exist.",
            });
        }

        await prisma.followRequest.delete({
            where: {
                id: followRequest.id,
            },
        });

        return res.status(200).json({
            message: "Follow request cancelled.",
        });

    } catch (error) {
        return next(error);
    }
}

async function acceptFollowRequest(req, res, next) {
    try {
        const user = req.user;
        const { id } = req.params;

        if (!isUUID(id)) {
            return res.status(400).json({
                error: "Invalid follow request ID.",
            });
        }

        const followRequest = await prisma.followRequest.findFirst({
            where: {
                id,
                receiver_id: user.id,
            },
        });

        if (!followRequest) {
            return res.status(404).json({
                error: "That follow request does not exist.",
            });
        }

        await prisma.$transaction([
            prisma.follow.create({
                data: {
                    follower_id: followRequest.requester_id,
                    following_id: user.id,
                },
            }),

            prisma.followRequest.delete({
                where: {
                    id: followRequest.id,
                },
            }),
        ]);

        return res.status(200).json({
            message: "Follow request accepted.",
        });

    } catch (error) {
        if (error.code === "P2002") {
            return res.status(409).json({
                error: "You already follow this user.",
            });
        }

        return next(error);
    }
}

async function rejectFollowRequest(req, res, next) {
    try {
        const user = req.user;
        const { id } = req.params;

        if (!isUUID(id)) {
            return res.status(400).json({
                error: "Invalid follow request ID.",
            });
        }

        const followRequest = await prisma.followRequest.findFirst({
            where: {
                id,
                receiver_id: user.id,
            },
        });

        if (!followRequest) {
            return res.status(404).json({
                error: "That follow request does not exist.",
            });
        }

        await prisma.followRequest.delete({
            where: {
                id: followRequest.id,
            },
        });

        return res.status(200).json({
            message: "Follow request rejected.",
        });

    } catch (error) {
        return next(error);
    }
}

async function getReceivedFollowRequests(req, res, next) {
    try {
        const user = req.user;

        const receivedFollowRequests = await prisma.followRequest.findMany({
            where: {
                receiver_id: user.id,
            },

            orderBy: {
                created_at: "desc",
            },

            select: {
                id: true,
                created_at: true,

                requester: {
                    select: {
                        id: true,
                        username: true,
                        first_name: true,
                        last_name: true,
                        profile_picture_url: true,
                    },
                },
            },
        });

        return res.status(200).json({
            received_follow_requests: receivedFollowRequests,
        });

    } catch (error) {
        return next(error);
    }
}

async function getSentFollowRequests(req, res, next) {
    try {
        const user = req.user;

        const sentFollowRequests = await prisma.followRequest.findMany({
            where: {
                requester_id: user.id,
            },

            orderBy: {
                created_at: "desc",
            },

            select: {
                id: true,
                created_at: true,

                receiver: {
                    select: {
                        id: true,
                        username: true,
                        first_name: true,
                        last_name: true,
                        profile_picture_url: true,
                    },
                },
            },
        });

        return res.status(200).json({
            sent_follow_requests: sentFollowRequests,
        });

    } catch (error) {
        return next(error);
    }
}

async function unfollowUser(req, res, next) {
    try {
        const user = req.user;
        const { id } = req.params;

        if (!isUUID(id)) {
            return res.status(400).json({ error: "Invalid user ID." });
        }

        const follow = await prisma.follow.findFirst({
            where: {
                follower_id: user.id,
                following_id: id,
            },
        });

        if (!follow) {
            return res.status(404).json({ error: "You are not following this user." });
        }

        await prisma.follow.delete({
            where: {
                id: follow.id,
            },
        });

        return res.status(200).json({ message: "Unfollowed successfully." });
    } catch (error) {
        return next(error);
    }
}

async function removeFollower(req, res, next) {
    try {
        const user = req.user;
        const { id } = req.params;

        if (!isUUID(id)) {
            return res.status(400).json({ error: "Invalid user ID." });
        }

        const follow = await prisma.follow.findFirst({
            where: {
                following_id: user.id,
                follower_id: id,
            },
        });

        if (!follow) {
            return res.status(404).json({ message: "That user is not following you." });
        }

        await prisma.follow.delete({
            where: {
                id: follow.id,
            },
        });

        return res.status(200).json({ message: "Removed follower." });
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    sendFollowRequest,
    cancelFollowRequest,

    acceptFollowRequest,
    rejectFollowRequest,

    getReceivedFollowRequests,
    getSentFollowRequests,

    unfollowUser,
    removeFollower,
};
const { prisma } = require('../../lib/prisma.mjs');
const { validate: isUUID } = require('uuid');

async function findUserByIdentifier(identifier) {
    if (isUUID(identifier)) {
        return prisma.user.findUnique({
            where: {
                id: identifier,
            },
        });
    }

    return prisma.user.findUnique({
        where: {
            username: identifier,
        },
    });
}

async function findIncomingFollowRequest(identifier, currentUserId) {
    if (isUUID(identifier)) {
        const requestById = await prisma.followRequest.findFirst({
            where: {
                id: identifier,
                receiver_id: currentUserId,
            },
        });

        if (requestById) {
            return requestById;
        }
    }

    const requester = await findUserByIdentifier(identifier);

    if (!requester) {
        return null;
    }

    return prisma.followRequest.findFirst({
        where: {
            requester_id: requester.id,
            receiver_id: currentUserId,
        },
    });
}

async function sendFollowRequest(req, res, next) {
    try {
        const user = req.user;
        const { id } = req.params;

        const requestedUser = await findUserByIdentifier(id);

        if (!requestedUser) {
            return res.status(404).json({ error: 'That user does not exist.' });
        }

        if (requestedUser.id === user.id) {
            return res.status(400).json({ error: 'You cannot follow yourself.' });
        }

        const checkAlreadyFollowing = await prisma.follow.findFirst({
            where: {
                follower_id: user.id,
                following_id: requestedUser.id,
            },
        });

        if (checkAlreadyFollowing) {
            return res.status(409).json({ error: 'You already follow this user.' });
        }

        const checkAlreadyRequested = await prisma.followRequest.findFirst({
            where: {
                requester_id: user.id,
                receiver_id: requestedUser.id,
            },
        });

        if (checkAlreadyRequested) {
            return res.status(409).json({
                error: 'You already requested to follow this user.',
            });
        }

        const followRequest = await prisma.followRequest.create({
            data: {
                requester_id: user.id,
                receiver_id: requestedUser.id,
            },
        });

        return res.status(201).json({ follow_request: followRequest });
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({
                error: 'You already requested to follow this user.',
            });
        }

        return next(error);
    }
}

async function cancelFollowRequest(req, res, next) {
    try {
        const user = req.user;
        const { id } = req.params;

        const requestedUser = await findUserByIdentifier(id);

        if (!requestedUser) {
            return res.status(404).json({ error: 'That user does not exist.' });
        }

        const followRequest = await prisma.followRequest.findFirst({
            where: {
                requester_id: user.id,
                receiver_id: requestedUser.id,
            },
        });

        if (!followRequest) {
            return res.status(404).json({
                error: 'That follow request does not exist.',
            });
        }

        await prisma.followRequest.delete({
            where: {
                id: followRequest.id,
            },
        });

        return res.status(200).json({
            message: 'Follow request cancelled.',
        });
    } catch (error) {
        return next(error);
    }
}

async function acceptFollowRequest(req, res, next) {
    try {
        const user = req.user;
        const { id } = req.params;

        const followRequest = await findIncomingFollowRequest(id, user.id);

        if (!followRequest) {
            return res.status(404).json({
                error: 'That follow request does not exist.',
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
            message: 'Follow request accepted.',
        });
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({
                error: 'You already follow this user.',
            });
        }

        return next(error);
    }
}

async function rejectFollowRequest(req, res, next) {
    try {
        const user = req.user;
        const { id } = req.params;

        const followRequest = await findIncomingFollowRequest(id, user.id);

        if (!followRequest) {
            return res.status(404).json({
                error: 'That follow request does not exist.',
            });
        }

        await prisma.followRequest.delete({
            where: {
                id: followRequest.id,
            },
        });

        return res.status(200).json({
            message: 'Follow request rejected.',
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
                created_at: 'desc',
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
                created_at: 'desc',
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

        const userToUnfollow = await findUserByIdentifier(id);

        if (!userToUnfollow) {
            return res.status(404).json({ error: 'That user does not exist.' });
        }

        const follow = await prisma.follow.findFirst({
            where: {
                follower_id: user.id,
                following_id: userToUnfollow.id,
            },
        });

        if (!follow) {
            return res.status(404).json({
                error: 'You are not following this user.',
            });
        }

        await prisma.follow.delete({
            where: {
                id: follow.id,
            },
        });

        return res.status(200).json({ message: 'Unfollowed successfully.' });
    } catch (error) {
        return next(error);
    }
}

async function removeFollower(req, res, next) {
    try {
        const user = req.user;
        const { id } = req.params;

        const followerToRemove = await findUserByIdentifier(id);

        if (!followerToRemove) {
            return res.status(404).json({ error: 'That user does not exist.' });
        }

        const follow = await prisma.follow.findFirst({
            where: {
                following_id: user.id,
                follower_id: followerToRemove.id,
            },
        });

        if (!follow) {
            return res.status(404).json({
                error: 'That user is not following you.',
            });
        }

        await prisma.follow.delete({
            where: {
                id: follow.id,
            },
        });

        return res.status(200).json({ message: 'Removed follower.' });
    } catch (error) {
        return next(error);
    }
}

async function getFollowers(req, res, next) {
    try {
        const currentUser = req.user;
        const { id } = req.params;

        const profileUser = await findUserByIdentifier(id);

        if (!profileUser) {
            return res.status(404).json({ error: 'That user does not exist.' });
        }

        const followers = await prisma.follow.findMany({
            where: {
                following_id: profileUser.id,
            },
            orderBy: {
                created_at: 'desc',
            },
            select: {
                follower: {
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

        const followerIds = followers.map((follow) => follow.follower.id);

        const [currentUserFollowing, outgoingRequests] = await prisma.$transaction([
            prisma.follow.findMany({
                where: {
                    follower_id: currentUser.id,
                    following_id: {
                        in: followerIds,
                    },
                },
                select: {
                    following_id: true,
                },
            }),

            prisma.followRequest.findMany({
                where: {
                    requester_id: currentUser.id,
                    receiver_id: {
                        in: followerIds,
                    },
                },
                select: {
                    receiver_id: true,
                },
            }),
        ]);

        const followingIds = new Set(
            currentUserFollowing.map((follow) => follow.following_id)
        );

        const requestedIds = new Set(
            outgoingRequests.map((request) => request.receiver_id)
        );

        const formattedFollowers = followers.map((follow) => ({
            id: follow.follower.id,
            username: follow.follower.username,
            first_name: follow.follower.first_name,
            last_name: follow.follower.last_name,
            profile_picture_url: follow.follower.profile_picture_url,
            isCurrentUser: follow.follower.id === currentUser.id,
            isFollowing: followingIds.has(follow.follower.id),
            outgoingRequestPending: requestedIds.has(follow.follower.id),
        }));

        return res.status(200).json({
            followers: formattedFollowers,
        });
    } catch (error) {
        return next(error);
    }
}

async function getFollowing(req, res, next) {
    try {
        const currentUser = req.user;
        const { id } = req.params;

        const profileUser = await findUserByIdentifier(id);

        if (!profileUser) {
            return res.status(404).json({ error: 'That user does not exist.' });
        }

        const following = await prisma.follow.findMany({
            where: {
                follower_id: profileUser.id,
            },
            orderBy: {
                created_at: 'desc',
            },
            select: {
                following: {
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

        const followingUserIds = following.map((follow) => follow.following.id);

        const [currentUserFollowing, outgoingRequests] = await prisma.$transaction([
            prisma.follow.findMany({
                where: {
                    follower_id: currentUser.id,
                    following_id: {
                        in: followingUserIds,
                    },
                },
                select: {
                    following_id: true,
                },
            }),

            prisma.followRequest.findMany({
                where: {
                    requester_id: currentUser.id,
                    receiver_id: {
                        in: followingUserIds,
                    },
                },
                select: {
                    receiver_id: true,
                },
            }),
        ]);

        const currentUserFollowingIds = new Set(
            currentUserFollowing.map((follow) => follow.following_id)
        );

        const requestedIds = new Set(
            outgoingRequests.map((request) => request.receiver_id)
        );

        const formattedFollowing = following.map((follow) => ({
            id: follow.following.id,
            username: follow.following.username,
            first_name: follow.following.first_name,
            last_name: follow.following.last_name,
            profile_picture_url: follow.following.profile_picture_url,
            isCurrentUser: follow.following.id === currentUser.id,
            isFollowing: currentUserFollowingIds.has(follow.following.id),
            outgoingRequestPending: requestedIds.has(follow.following.id),
        }));

        return res.status(200).json({
            following: formattedFollowing,
        });
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

    getFollowers,
    getFollowing,
};
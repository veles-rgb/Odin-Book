const { prisma } = require('../../lib/prisma.mjs');
const { validate: isUUID } = require('uuid');
const cloudinary = require('../config/cloudinary');

async function createPost(req, res, next) {
    try {
        const user = req.user;
        const { content, media_url, media_public_id } = req.body;

        const trimmedContent = content.trim();

        const post = await prisma.post.create({
            data: {
                user_id: user.id,
                content: trimmedContent,
                media_url: media_url || null,
                media_public_id: media_public_id || null,
            },
            select: {
                id: true,
                content: true,
                media_url: true,
                media_public_id: true,
                created_at: true,
                updated_at: true,
                user_id: true,

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
            },
        });

        const formattedPost = {
            id: post.id,
            user_id: post.user_id,
            content: post.content,
            media_url: post.media_url,
            media_public_id: post.media_public_id,
            created_at: post.created_at,
            updated_at: post.updated_at,
            user: post.user,

            likeCount: post._count.postLikes,
            likedByMe: false,

            commentCount: post._count.comments,
        };

        return res.status(201).json({
            post: formattedPost,
        });
    } catch (error) {
        return next(error);
    }
}

async function editPost(req, res, next) {
    try {
        const { id } = req.params;
        const user = req.user;

        const {
            content,
            media_url,
            media_public_id,
        } = req.body;

        if (!isUUID(id)) {
            return res.status(400).json({ error: 'Invalid Post ID' });
        }

        const trimmedContent = content.trim();

        const post = await prisma.post.findFirst({
            where: {
                id,
                user_id: user.id,
            },
            select: {
                id: true,
                content: true,
                media_url: true,
                media_public_id: true,
            },
        });

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const data = {
            content: trimmedContent,
        };

        if (media_url !== undefined) {
            data.media_url = media_url || null;
        }

        if (media_public_id !== undefined) {
            data.media_public_id = media_public_id || null;
        }

        const noContentChange = post.content === trimmedContent;
        const noMediaUrlChange = post.media_url === data.media_url;
        const noMediaPublicIdChange =
            post.media_public_id === data.media_public_id;

        if (noContentChange && noMediaUrlChange && noMediaPublicIdChange) {
            return res.status(400).json({ error: 'No changes were made' });
        }

        const updatedPost = await prisma.post.update({
            where: {
                id: post.id,
            },
            data,
            select: {
                id: true,
                content: true,
                media_url: true,
                media_public_id: true,
                created_at: true,
                updated_at: true,
                user_id: true,

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
            },
        });

        if (
            media_public_id !== undefined &&
            post.media_public_id &&
            post.media_public_id !== media_public_id
        ) {
            await cloudinary.uploader.destroy(post.media_public_id);
        }

        const formattedPost = {
            id: updatedPost.id,
            user_id: updatedPost.user_id,
            content: updatedPost.content,
            media_url: updatedPost.media_url,
            media_public_id: updatedPost.media_public_id,
            created_at: updatedPost.created_at,
            updated_at: updatedPost.updated_at,
            user: updatedPost.user,
            likeCount: updatedPost._count.postLikes,
            likedByMe: updatedPost.postLikes.length > 0,
            commentCount: updatedPost._count.comments,
        };

        return res.status(200).json({
            post: formattedPost,
        });
    } catch (error) {
        return next(error);
    }
}

async function deletePost(req, res, next) {
    try {
        const user = req.user;
        const { id } = req.params;

        if (!isUUID(id)) {
            return res.status(400).json({ error: 'Invalid Post ID' });
        }

        const post = await prisma.post.findFirst({
            where: {
                id,
                user_id: user.id,
            },
            select: {
                id: true,
                media_public_id: true,
            },
        });

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post.media_public_id) {
            await cloudinary.uploader.destroy(post.media_public_id);
        }

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
            return res.status(400).json({ error: 'Invalid Post ID' });
        }

        const post = await prisma.post.findFirst({
            where: {
                id,
            },
            select: {
                id: true,
                user_id: true,
                content: true,
                media_url: true,
                media_public_id: true,
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
            },
        });

        if (!post) {
            return res.status(404).json({
                error: 'Post not found. It either does not exist or was removed.',
            });
        }

        const formattedPost = {
            id: post.id,
            user_id: post.user_id,
            content: post.content,
            media_url: post.media_url,
            media_public_id: post.media_public_id,
            created_at: post.created_at,
            updated_at: post.updated_at,
            user: post.user,
            likeCount: post._count.postLikes,
            likedByMe: post.postLikes.length > 0,
            commentCount: post._count.comments,
        };

        return res.status(200).json({ post: formattedPost });
    } catch (error) {
        return next(error);
    }
}

async function getHomePosts(req, res, next) {
    try {
        const user = req.user;

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        const [posts, totalPosts] = await prisma.$transaction([
            prisma.post.findMany({
                skip,
                take: limit,
                orderBy: {
                    created_at: 'desc',
                },
                select: {
                    id: true,
                    content: true,
                    media_url: true,
                    media_public_id: true,
                    created_at: true,
                    updated_at: true,
                    user_id: true,

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
                },
            }),

            prisma.post.count(),
        ]);

        const hasNextPage = page * limit < totalPosts;

        const formattedPosts = posts.map((post) => ({
            id: post.id,
            user_id: post.user_id,
            content: post.content,
            media_url: post.media_url,
            media_public_id: post.media_public_id,
            created_at: post.created_at,
            updated_at: post.updated_at,

            user: post.user,

            likeCount: post._count.postLikes,
            likedByMe: post.postLikes.length > 0,

            commentCount: post._count.comments,
        }));

        return res.status(200).json({
            posts: formattedPosts,
            hasNextPage,
        });
    } catch (error) {
        return next(error);
    }
}

async function getFeedPosts(req, res, next) {
    try {
        const user = req.user;

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        const following = await prisma.follow.findMany({
            where: {
                follower_id: user.id,
            },
            select: {
                following_id: true,
            },
        });

        const followingIds = following.map((follow) => follow.following_id);

        const feedUserIds = [user.id, ...followingIds];

        const [posts, totalPosts] = await prisma.$transaction([
            prisma.post.findMany({
                where: {
                    user_id: {
                        in: feedUserIds,
                    },
                },
                skip,
                take: limit,
                orderBy: {
                    created_at: 'desc',
                },
                select: {
                    id: true,
                    content: true,
                    media_url: true,
                    media_public_id: true,
                    created_at: true,
                    updated_at: true,
                    user_id: true,

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
                },
            }),

            prisma.post.count({
                where: {
                    user_id: {
                        in: feedUserIds,
                    },
                },
            }),
        ]);

        const hasNextPage = page * limit < totalPosts;

        const formattedPosts = posts.map((post) => ({
            id: post.id,
            user_id: post.user_id,
            content: post.content,
            media_url: post.media_url,
            media_public_id: post.media_public_id,
            created_at: post.created_at,
            updated_at: post.updated_at,

            user: post.user,

            likeCount: post._count.postLikes,
            likedByMe: post.postLikes.length > 0,

            commentCount: post._count.comments,
        }));

        return res.status(200).json({
            posts: formattedPosts,
            hasNextPage,
        });
    } catch (error) {
        return next(error);
    }
}

const getUserPosts = async (req, res, next) => {
    try {
        const user = req.user;
        const { identifier } = req.params;

        let profileUser;

        if (isUUID(identifier)) {
            profileUser = await prisma.user.findUnique({
                where: {
                    id: identifier,
                },
                select: {
                    id: true,
                },
            });
        } else {
            profileUser = await prisma.user.findUnique({
                where: {
                    username: identifier,
                },
                select: {
                    id: true,
                },
            });
        }

        if (!profileUser) {
            return res.status(404).json({
                error: 'User not found.',
            });
        }

        const posts = await prisma.post.findMany({
            where: {
                user_id: profileUser.id,
            },
            orderBy: {
                created_at: 'desc',
            },
            select: {
                id: true,
                content: true,
                media_url: true,
                media_public_id: true,
                created_at: true,
                updated_at: true,
                user_id: true,

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
            },
        });

        const formattedPosts = posts.map((post) => ({
            id: post.id,
            user_id: post.user_id,
            content: post.content,
            media_url: post.media_url,
            media_public_id: post.media_public_id,
            created_at: post.created_at,
            updated_at: post.updated_at,

            user: post.user,

            likeCount: post._count.postLikes,
            likedByMe: post.postLikes.length > 0,

            commentCount: post._count.comments,
        }));

        return res.status(200).json({
            posts: formattedPosts,
        });
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    createPost,
    editPost,
    deletePost,
    getPostById,
    getHomePosts,
    getUserPosts,
    getFeedPosts,
};
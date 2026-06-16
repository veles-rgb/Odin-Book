require('dotenv/config');

const { PrismaClient } = require('../generated/prisma');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
    adapter,
});

const makeSafeUsernamePart = (value) => {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
};

async function main() {
    console.log('Seeding database...');

    const users = [];

    for (let i = 0; i < 25; i++) {
        const hashedPassword = await bcrypt.hash('Pooass123!', 10);
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();

        const safeFirstName = makeSafeUsernamePart(firstName);
        const safeLastName = makeSafeUsernamePart(lastName);

        const user = await prisma.user.create({
            data: {
                first_name: firstName,
                last_name: lastName,
                username: `${safeFirstName}${safeLastName}${i}`,
                hashed_password: hashedPassword,
                profile_picture_url: faker.image.avatar(),
            },
        });

        users.push(user);
    }

    const posts = [];

    for (let i = 0; i < 100; i++) {
        const randomUser =
            users[Math.floor(Math.random() * users.length)];

        const includeImage = Math.random() < 0.25;

        const post = await prisma.post.create({
            data: {
                user_id: randomUser.id,

                content: faker.helpers.arrayElement([
                    faker.lorem.paragraph(),
                    faker.lorem.sentences(2),
                    faker.lorem.sentences(3),
                    faker.lorem.paragraphs(2),
                ]),

                media_url: includeImage
                    ? `https://picsum.photos/seed/${i}/800/600`
                    : null,

                media_public_id: null,
            },
        });

        posts.push(post);
    }

    const comments = [];

    for (let i = 0; i < 300; i++) {
        const randomUser =
            users[Math.floor(Math.random() * users.length)];

        const randomPost =
            posts[Math.floor(Math.random() * posts.length)];

        const comment = await prisma.comment.create({
            data: {
                user_id: randomUser.id,
                post_id: randomPost.id,

                content: faker.helpers.arrayElement([
                    faker.lorem.sentence(),
                    faker.lorem.sentences(2),
                    faker.lorem.paragraph(),
                ]),
            },
        });

        comments.push(comment);
    }

    for (let i = 0; i < 150; i++) {
        const randomUser =
            users[Math.floor(Math.random() * users.length)];

        const parentComment =
            comments[Math.floor(Math.random() * comments.length)];

        await prisma.comment.create({
            data: {
                user_id: randomUser.id,
                post_id: parentComment.post_id,
                parent_id: parentComment.id,

                content: faker.helpers.arrayElement([
                    'I agree.',
                    'Exactly.',
                    'Good point.',
                    'Haha true.',
                    faker.lorem.sentence(),
                ]),
            },
        });
    }

    for (const post of posts) {
        const likeCount = faker.number.int({
            min: 0,
            max: 15,
        });

        const shuffledUsers = faker.helpers.shuffle([...users]);

        for (const user of shuffledUsers.slice(0, likeCount)) {
            await prisma.postLike.create({
                data: {
                    user_id: user.id,
                    post_id: post.id,
                },
            });
        }
    }

    for (const comment of comments) {
        const likeCount = faker.number.int({
            min: 0,
            max: 8,
        });

        const shuffledUsers = faker.helpers.shuffle([...users]);

        for (const user of shuffledUsers.slice(0, likeCount)) {
            await prisma.commentLike.create({
                data: {
                    user_id: user.id,
                    comment_id: comment.id,
                },
            });
        }
    }

    const dolyaUserId = '1f9e5f08-f353-4838-85e7-5da7ef3863c4';

    for (const user of users) {
        const followCount = faker.number.int({
            min: 2,
            max: 12,
        });

        const possibleUsers = users.filter(
            (u) => u.id !== user.id,
        );

        const usersToFollow = faker.helpers.arrayElements(
            possibleUsers,
            followCount,
        );

        for (const targetUser of usersToFollow) {
            try {
                await prisma.follow.create({
                    data: {
                        follower_id: user.id,
                        following_id: targetUser.id,
                    },
                });
            } catch {
                // ignore duplicates
            }
        }
    }

    for (const user of users) {
        if (user.id === dolyaUserId) continue;

        try {
            await prisma.follow.create({
                data: {
                    follower_id: user.id,
                    following_id: dolyaUserId,
                },
            });
        } catch { }
    }
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (error) => {
        console.error(error);
        await prisma.$disconnect();
        process.exit(1);
    });

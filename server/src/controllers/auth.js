const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { prisma } = require('../../lib/prisma.mjs');

async function registerUser(req, res, next) {
    try {
        const { first_name, last_name, username, password } = req.body;

        const trimmedFirst = first_name?.trim();
        const trimmedLast = last_name?.trim();
        const trimmedUsername = username?.trim();

        if (!trimmedFirst || !trimmedLast || !trimmedUsername || !password) {
            return res.status(400).json({ error: 'All fields are required to register' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                first_name: trimmedFirst,
                last_name: trimmedLast,
                username: trimmedUsername,
                hashed_password: hashedPassword,
            }
        });

        return res.status(201).json({ message: 'Registration successful' });
    } catch (error) {
        if (error.code === "P2002") {
            return res.status(409).json({ error: 'Username already taken' });
        }
        return next(error);
    }
}

async function loginUser(req, res, next) {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required to login' });
        }

        const user = await prisma.user.findUnique({
            where: { username },
        });

        if (!user) return res.status(401).json({ error: "Invalid credentials" });

        const ok = await bcrypt.compare(password, user.hashed_password);

        if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

        const accessToken = jwt.sign(
            {
                sub: user.id,
                username: user.username,
                firstName: user.first_name,
                lastName: user.last_name
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' }
        );

        return res.json({ accessToken: accessToken });

    } catch (error) {
        return next(error);
    }
}

module.exports = {
    registerUser,
    loginUser,
};
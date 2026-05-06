const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { prisma } = require('../../lib/prisma.mjs');

function generateAccessToken(user) {
    return jwt.sign(
        {
            sub: user.id,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15s' }
    );
}

function generateRefreshToken(user) {
    return jwt.sign(
        { sub: user.id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
    );
}

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

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await prisma.refreshToken.create({
            data: {
                token_hash: hashedRefreshToken,
                user_id: user.id,
                expires_at: expiresAt
            }
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/api/auth",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({ accessToken: accessToken });

    } catch (error) {
        return next(error);
    }
}

async function createAccessToken(req, res, next) {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) return res.status(401).json({ error: 'Refresh token required' });

        // 1. verify refresh token
        const payload = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        // 2. check it against DB
        const storedToken = await prisma.refreshToken.findMany({
            where: {
                user_id: payload.sub
            }
        });

        if (!storedToken) return res.status(403).json({ error: "Invalid refresh token" });

        let validToken = null;

        for (const token of storedToken) {
            const match = await bcrypt.compare(
                refreshToken,
                token.token_hash
            );

            if (match) {
                validToken = token;
                break;
            }
        }

        if (!validToken) {
            return res.status(403).json({ error: "Invalid refresh token" });
        }

        // 3. create new access token
        const accessToken = jwt.sign(
            { sub: payload.sub },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15s' }
        );

        return res.json({ accessToken });
    } catch (error) {
        return res.status(403).json({ error: 'Invalid refresh token' });
    }
}

module.exports = {
    registerUser,
    loginUser,
    createAccessToken
};
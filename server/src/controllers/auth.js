const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { prisma } = require('../../lib/prisma.mjs');

function generateAccessToken(user) {
    return jwt.sign(
        {
            sub: user.id,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
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
            },
        });

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await prisma.refreshToken.create({
            data: {
                token_hash: hashedRefreshToken,
                user_id: user.id,
                expires_at: expiresAt,
            },
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/api/auth",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(201).json({
            accessToken,
            user: {
                id: user.id,
                username: user.username,
                first_name: user.first_name,
                last_name: user.last_name,
                profile_picture_url: user.profile_picture_url
            }
        });

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
                expires_at: expiresAt,
            },
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/api/auth",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.json({
            accessToken,
            user: {
                id: user.id,
                username: user.username,
                first_name: user.first_name,
                last_name: user.last_name,
                profile_picture_url: user.profile_picture_url
            }
        });

    } catch (error) {
        return next(error);
    }
}

async function createAccessToken(req, res, next) {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) return res.status(401).json({ error: 'Refresh token required' });

        const payload = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const storedTokens = await prisma.refreshToken.findMany({
            where: {
                user_id: payload.sub,
            },
        });

        if (storedTokens.length === 0) {
            return res.status(403).json({ error: "Invalid refresh token" });
        }

        let validToken = null;

        for (const token of storedTokens) {
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

        const accessToken = jwt.sign(
            { sub: payload.sub },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' }
        );

        return res.json({ accessToken });
    } catch (error) {
        return res.status(403).json({ error: 'Invalid refresh token' });
    }
}

module.exports = {
    registerUser,
    loginUser,
    createAccessToken,
};
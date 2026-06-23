const { prisma } = require('../../lib/prisma.mjs');

function getClientIp(req) {
    return req.ip?.replace(/^::ffff:/, '') || null;
}

async function checkIpBan(req, res, next) {
    try {
        const ip = getClientIp(req);

        if (!ip) {
            return next();
        }

        const bannedIp = await prisma.ipBan.findUnique({
            where: { ip_address: ip },
        });

        if (bannedIp) {
            return res.status(403).json({
                error: 'Access denied.',
            });
        }

        return next();
    } catch (error) {
        return next(error);
    }
}

module.exports = checkIpBan;
const router = require("express").Router();
const { authenticateToken } = require('../middleware/authenticateToken');

// Routers
const authRouter = require('./auth');

router.get('/health', async (req, res) => {
    const healthCheck = {
        uptime: process.uptime(),
        message: 'OK',
        timestamp: new Date().toISOString()
    };

    try {
        res.status(200).json(healthCheck);
    } catch (error) {
        healthCheck.message = error.message;
        res.status(503).json(healthCheck);
    }
});

router.get('/check', authenticateToken, (req, res) => {
    res.status(200).json({ message: "You are auth'd" });
});

router.use('/auth', authRouter);

module.exports = router;
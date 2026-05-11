const router = require("express").Router();
const { authenticateToken } = require('../middleware/authenticateToken');

// Routers
const authRouter = require('./auth');
const userRouter = require('./user');
const postRouter = require('./post');

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

router.use('/auth', authRouter);

router.use('/user', authenticateToken, userRouter);

router.use('/post', authenticateToken, postRouter);

module.exports = router;
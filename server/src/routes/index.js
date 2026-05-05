const router = require("express").Router();

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

module.exports = router;
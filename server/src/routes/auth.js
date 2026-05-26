const router = require("express").Router();
const controller = require('../controllers/auth');

// get /verify (requireAuth)
router.post('/register', controller.registerUser);
router.post('/login', controller.loginUser);
router.post('/token', controller.createAccessToken);
router.post('/logout', controller.logoutUser);

module.exports = router;
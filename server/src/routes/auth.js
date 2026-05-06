const router = require("express").Router();
const controller = require('../controllers/auth');

// get /verify (requireAuth)
router.post('/register', controller.registerUser);
router.post('/login', controller.loginUser);

module.exports = router;
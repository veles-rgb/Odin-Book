const router = require("express").Router();
const controller = require('../controllers/auth');

const {
    registerValidation,
    loginValidation,
} = require('../validators/authValidator');

const validate = require('../middleware/validate');

// get /verify (requireAuth)
router.post('/register', registerValidation, validate, controller.registerUser);
router.post('/login', loginValidation, validate, controller.loginUser);
router.post('/token', controller.createAccessToken);
router.post('/logout', controller.logoutUser);

module.exports = router;
const router = require('express').Router();
const controller = require('../controllers/auth');

const { authenticateToken } = require('../middleware/authenticateToken');

const {
    registerValidation,
    loginValidation,
    changePasswordValidation,
} = require('../validators/authValidator');

const validate = require('../middleware/validate');

router.post('/register', registerValidation, validate, controller.registerUser);
router.post('/login', loginValidation, validate, controller.loginUser);
router.post('/token', controller.createAccessToken);
router.post('/logout', controller.logoutUser);
router.post('/guest-login', controller.guestLogin);

router.patch(
    '/password',
    authenticateToken,
    changePasswordValidation,
    validate,
    controller.changePassword
);

module.exports = router;
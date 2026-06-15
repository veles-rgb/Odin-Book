const router = require("express").Router();
const controller = require('../controllers/user');

const { updateUserValidation } = require('../validators/userValidator');
const validate = require('../middleware/validate');

router.get('/', controller.searchUser);
router.get('/:identifier', controller.getUser);
router.patch('/update/:id', updateUserValidation,
    validate, controller.updateUser);

module.exports = router;
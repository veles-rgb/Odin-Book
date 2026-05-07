const router = require("express").Router();
const controller = require('../controllers/user');

router.get('/', controller.searchUser);
router.get('/:identifier', controller.getUser);
router.patch('/update/:id', controller.updateUser);

module.exports = router;
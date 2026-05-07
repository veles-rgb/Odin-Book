const router = require("express").Router();
const controller = require('../controllers/user');

router.use('/:identifier', controller.getUser);

module.exports = router;
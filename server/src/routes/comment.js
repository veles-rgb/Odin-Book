const router = require('express').Router();
const controller = require('../controllers/comment');

router.post('/create/:id', controller.createComment);

module.exports = router;
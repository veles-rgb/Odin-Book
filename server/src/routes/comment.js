const router = require('express').Router();
const controller = require('../controllers/comment');

router.post('/create/:id', controller.createComment);
router.patch('/edit/:id', controller.editComment);
router.delete('/delete/:id', controller.deleteComment);
router.post('/reply/:id', controller.createReplyComment);

module.exports = router;
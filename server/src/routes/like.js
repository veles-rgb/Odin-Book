const router = require('express').Router();
const controller = require('../controllers/like');

router.post('/post/:id', controller.createPostLike);
router.post('/comment/:id', controller.createCommentLike);
router.delete('/post/:id', controller.deletePostLike);
router.delete('/comment/:id', controller.deleteCommentLike);


module.exports = router;
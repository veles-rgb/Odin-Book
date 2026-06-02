const router = require('express').Router();
const controller = require('../controllers/post');
const commentController = require('../controllers/comment');

router.get('/feed', controller.getFeedPosts);
router.get('/:id', controller.getPostById);
router.get('/:id/comments', commentController.getPostComments);
router.post('/create', controller.createPost);
router.patch('/edit/:id', controller.editPost);
router.delete("/delete/:id", controller.deletePost);

module.exports = router;
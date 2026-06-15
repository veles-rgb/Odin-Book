const router = require('express').Router();
const controller = require('../controllers/post');
const commentController = require('../controllers/comment');

const {
    createPostValidation,
    editPostValidation,
} = require('../validators/postValidator');

const validate = require('../middleware/validate');

router.get('/home', controller.getHomePosts);
router.get('/feed', controller.getFeedPosts);
router.get('/:id', controller.getPostById);
router.get("/:identifier/posts", controller.getUserPosts);
router.get('/:id/comments', commentController.getPostComments);
router.post('/create', createPostValidation,
    validate, controller.createPost);
router.patch('/edit/:id',
    editPostValidation,
    validate, controller.editPost);
router.delete("/delete/:id", controller.deletePost);

module.exports = router;
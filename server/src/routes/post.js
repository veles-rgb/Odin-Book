const router = require('express').Router();
const controller = require('../controllers/post');

router.get('/:id', controller.getPostById);
router.post('/create', controller.createPost);
router.patch('/edit/:id', controller.editPost);
router.delete("/delete/:id", controller.deletePost);

module.exports = router;
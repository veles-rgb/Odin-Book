const router = require('express').Router();
const controller = require('../controllers/like');

router.post('/post/:id', controller.createPostLike);
router.delete('/post/:id', controller.deletePostLike);

module.exports = router;
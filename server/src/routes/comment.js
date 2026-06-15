const router = require('express').Router();
const controller = require('../controllers/comment');

const {
    createCommentValidation,
    replyCommentValidation,
    editCommentValidation,
} = require('../validators/commentValidator');

const validate = require('../middleware/validate');

router.get('/:id', controller.getCommentById);
router.get('/:id/replies', controller.getCommentReplies);
router.post('/create/:id', createCommentValidation,
    validate, controller.createComment);
router.patch('/edit/:id', replyCommentValidation,
    validate, controller.editComment);
router.delete('/delete/:id', controller.deleteComment);
router.post('/reply/:id', replyCommentValidation,
    validate, controller.createReplyComment);

module.exports = router;
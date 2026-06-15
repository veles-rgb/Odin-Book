const { body, param } = require('express-validator');

const commentContentValidation = body('content')
    .trim()
    .notEmpty()
    .withMessage('Comment cannot be blank.')
    .isLength({ max: 1000 })
    .withMessage('Comment cannot exceed 1000 characters.');

const createCommentValidation = [
    param('id').isUUID().withMessage('Invalid post ID.'),
    commentContentValidation,
];

const replyCommentValidation = [
    param('id').isUUID().withMessage('Invalid comment ID.'),
    commentContentValidation,
];

const editCommentValidation = [
    param('id').isUUID().withMessage('Invalid comment ID.'),
    commentContentValidation,
];

module.exports = {
    createCommentValidation,
    replyCommentValidation,
    editCommentValidation,
};
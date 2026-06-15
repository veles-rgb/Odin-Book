const { body, param } = require('express-validator');

const createPostValidation = [
    body('content')
        .trim()
        .notEmpty()
        .withMessage('Post content cannot be blank.')
        .isLength({ max: 2000 })
        .withMessage('Post cannot exceed 2000 characters.'),
];

const editPostValidation = [
    param('id').isUUID().withMessage('Invalid post ID.'),

    body('content')
        .trim()
        .notEmpty()
        .withMessage('Post content cannot be blank.')
        .isLength({ max: 2000 })
        .withMessage('Post cannot exceed 2000 characters.'),
];

module.exports = {
    createPostValidation,
    editPostValidation,
};
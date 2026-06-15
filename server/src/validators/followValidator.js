const { param } = require('express-validator');

const userIdValidation = [
    param('id').isUUID().withMessage('Invalid user ID.'),
];

const userIdentifierValidation = [
    param('id')
        .trim()
        .notEmpty()
        .withMessage('User identifier is required.')
        .isLength({ max: 50 })
        .withMessage('User identifier is too long.')
        .matches(/^[a-zA-Z0-9._-]+$/)
        .withMessage('Invalid user identifier.'),
];

const followRequestIdValidation = [
    param('id').isUUID().withMessage('Invalid follow request ID.'),
];

module.exports = {
    userIdValidation,
    userIdentifierValidation,
    followRequestIdValidation,
};
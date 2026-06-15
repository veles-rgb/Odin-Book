const { body, param } = require('express-validator');

const updateUserValidation = [
    param('id')
        .isUUID()
        .withMessage('Invalid user ID.'),

    body('first_name')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('First name cannot be blank.')
        .isLength({ max: 20 })
        .withMessage('First name cannot exceed 20 characters.'),

    body('last_name')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Last name cannot be blank.')
        .isLength({ max: 40 })
        .withMessage('Last name cannot exceed 40 characters.'),

    body('username')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Username cannot be blank.')
        .isLength({ min: 3, max: 20 })
        .withMessage('Username must be between 3 and 20 characters.')
        .matches(/^[a-zA-Z0-9._]+$/)
        .withMessage(
            'Username can only contain letters, numbers, periods, and underscores.',
        ),

    body('profile_picture_url')
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isURL()
        .withMessage('Profile picture must be a valid URL.'),
];

module.exports = {
    updateUserValidation,
};
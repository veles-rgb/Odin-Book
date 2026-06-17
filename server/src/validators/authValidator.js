const { body } = require('express-validator');

const registerValidation = [
    body('first_name')
        .trim()
        .notEmpty()
        .withMessage('First name is required.')
        .isLength({ max: 20 })
        .withMessage('First name cannot exceed 20 characters.'),

    body('last_name')
        .trim()
        .notEmpty()
        .withMessage('Last name is required.')
        .isLength({ max: 40 })
        .withMessage('Last name cannot exceed 40 characters.'),

    body('username')
        .trim()
        .notEmpty()
        .withMessage('Username is required.')
        .isLength({ min: 3, max: 20 })
        .withMessage('Username must be between 3 and 20 characters.')
        .matches(/^[a-zA-Z0-9._]+$/)
        .withMessage('Username can only contain letters, numbers, periods, and underscores.'),

    body('password')
        .notEmpty()
        .withMessage('Password is required.')
        .isLength({ min: 8, max: 128 })
        .withMessage('Password must be between 8 and 128 characters.')
        .matches(/[a-z]/)
        .withMessage('Password must contain a lowercase letter.')
        .matches(/[A-Z]/)
        .withMessage('Password must contain an uppercase letter.')
        .matches(/[0-9]/)
        .withMessage('Password must contain a number.'),

    body('profile_picture_url')
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isURL()
        .withMessage('Profile picture must be a valid URL.'),

    body('profile_picture_public_id')
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isLength({ max: 255 })
        .withMessage('Profile picture public ID is too long.'),
];

const loginValidation = [
    body('username')
        .trim()
        .notEmpty()
        .withMessage('Username is required.'),

    body('password')
        .notEmpty()
        .withMessage('Password is required.'),
];

const changePasswordValidation = [
    body('currentPassword')
        .trim()
        .notEmpty()
        .withMessage('Current password is required.'),

    body('newPassword')
        .isString()
        .withMessage('New password must be a string.')
        .notEmpty()
        .withMessage('New password is required.')
        .isLength({ min: 8, max: 128 })
        .withMessage('New password must be between 8 and 128 characters long.')
        .matches(/[a-z]/)
        .withMessage('New password must contain a lowercase letter.')
        .matches(/[A-Z]/)
        .withMessage('New password must contain an uppercase letter.')
        .matches(/[0-9]/)
        .withMessage('New password must contain a number.'),
];

module.exports = {
    registerValidation,
    loginValidation,
    changePasswordValidation,
};
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

module.exports = {
    registerValidation,
    loginValidation,
};
const db = require('../db/queries');
const {body, validationResult } = require('express-validator');
const bcryptjs = require('bcryptjs')

const lengthErr = 'must be between 1 and 255 characters.';
const emailErr = 'Double check that your email is correct.'

const validateUser = [
    body('username').trim()
        .isLength({min:1, max:255}).withMessage(`Username ${lengthErr}`)
        .custom(async value => {
            const checkUser = await db.getUsername(value);
            if (checkUser) {
                body('username').withMessage('Username already in use');
            }
        }),
    body('password').trim()
        .isLength({min:1, max:255}).withMessage(`Password ${lengthErr}`),
    
    body('confirmPassword').trim()
        .isLength({min:1, max:255}).withMessage(`Password ${lengthErr}`)
        .custom((value, { req }) => {
            return value === req.body.password;
        }).withMessage('Passwords do not match'),

    body('email').trim()
        .isEmail().withMessage(`${emailErr}`)
        .isLength({min:1, max:255}).withMessage(`Email ${lengthErr}`)
];

const joinPost = [
    validateUser, async function(req, res) {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            console.log(errors)
            return res.status(errors)
        }
        const hashedPass = await bcryptjs.hash(req.body.password, 10);
        const {username, email} = req.body;
        await db.createUser(username, hashedPass, email)
        res.redirect('/')
    }
]


module.exports = {joinPost}
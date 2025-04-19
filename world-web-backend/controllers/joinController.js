const db = require('../db/queries');
const model = require('../db/model')
const {body, validationResult } = require('express-validator');
const bcryptjs = require('bcryptjs')

const lengthErr = 'must be between 1 and 255 characters.';
const emailErr = 'Double check that your email is correct.'

const validateUser = [
    body('username').trim()
        .isLength({min:1, max:255}).withMessage(`Username ${lengthErr}`)
        .custom(async(value) => {
            const checkUser = await db.getUsername(value);
            if (checkUser) {
                throw new Error('Username already in use');
              }
              return true;
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
        .custom(async(value) => {
            const checkEmail = await db.getEmail(value);
            if (checkEmail) {
                throw new Error('Email already in use');
              }
              return true;
            }),
        
];

const joinPost = [
    validateUser, async function(req, res) {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            console.log(errors)
            return res.status(500).json({errors:errors.array()})
        }
        const hashedPass = await bcryptjs.hash(req.body.password, 10);
        const {username, email} = req.body;
        const access_level = 'user'
        await db.createUser(username, hashedPass, email)
        const user = await db.getUsername(username)
        req.login(user, (err) => {
            if (err) {
              return res.status(500).json({ error: "Login after signup failed" });
            }
          
            return res.status(200).json({ loggedIn: true, user: user });
          });
    }
]


module.exports = {joinPost}